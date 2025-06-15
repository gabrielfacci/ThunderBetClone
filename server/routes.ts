import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock API endpoints for ThunderBet functionality
  
  // Get user profile
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update user profile
  app.patch("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { fullName, email, phone, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Create new user with default values
      const newUser = await storage.createUser({
        username: email.split('@')[0], // Use email prefix as username
        email,
        password, // In production, hash this password
        fullName,
        phone,
        accountMode: 'national',
        balance: '0.00'
      });
      
      res.json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha inválidos" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });
      
      res.json(user);
    } catch (error) {
      console.error('Error authenticating user:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user transactions
  app.get("/api/user/:id/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error('Error getting user transactions:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get Supabase user data by email for transaction linking
  app.get("/api/supabase/user/:identifier", async (req, res) => {
    try {
      const { identifier } = req.params;
      
      // Try to find user by email first
      let user = await storage.getUserByEmail(identifier);
      
      // If not found by email, try by Supabase ID
      if (!user && identifier.length > 10) {
        // This looks like a Supabase UUID, create a database record if needed
        user = {
          id: parseInt(Date.now().toString().slice(-8)), // Generate numeric ID for our system
          email: identifier,
          fullName: 'Supabase User',
          username: identifier.split('@')[0] || 'user',
          phone: '',
          cpf: '',
          balance: '0.00',
          accountMode: 'nacional'
        };
      }
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error getting Supabase user:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create ZyonPay PIX transaction with Supabase user integration
  app.post("/api/zyonpay/create-transaction", async (req, res) => {
    try {
      const { 
        userId, 
        userEmail,
        amount, 
        zyonPayTransactionId, 
        zyonPaySecureId, 
        zyonPaySecureUrl,
        zyonPayPixQrCode,
        zyonPayPixUrl,
        zyonPayPixExpiration,
        zyonPayStatus,
        metadata
      } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentBalance = parseFloat(user.balance.toString());
      const depositAmount = parseFloat(amount);

      const transaction = await storage.createTransaction({
        userId,
        type: 'deposit',
        amount: depositAmount,
        status: 'pending',
        description: `Depósito PIX via ZyonPay`,
        balanceBefore: currentBalance,
        balanceAfter: currentBalance, // Will be updated when payment is confirmed
        zyonPayTransactionId: zyonPayTransactionId.toString(),
        zyonPaySecureId,
        zyonPaySecureUrl,
        zyonPayPixQrCode,
        zyonPayPixUrl,
        zyonPayPixExpiration: new Date(zyonPayPixExpiration),
        zyonPayStatus
      });
      
      res.json(transaction);
    } catch (error) {
      console.error('Error creating ZyonPay transaction:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ZyonPay postback endpoint
  app.post("/api/zyonpay/postback", async (req, res) => {
    try {
      const { data } = req.body;
      
      if (!data || !data.id) {
        return res.status(400).json({ error: "Invalid postback data" });
      }

      // Find transaction by ZyonPay ID
      const transactions = await storage.getAllTransactions();
      const transaction = transactions.find(t => 
        t.zyonPayTransactionId === data.id.toString()
      );

      if (!transaction) {
        console.error(`Transaction not found for ZyonPay ID: ${data.id}`);
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Update transaction status
      const updatedTransaction = await storage.updateTransaction(transaction.id, {
        zyonPayStatus: data.status,
        status: data.status === 'paid' ? 'completed' : 'pending'
      });

      // If payment is confirmed, update user balance
      if (data.status === 'paid') {
        const user = await storage.getUser(transaction.userId);
        if (user) {
          const currentBalance = parseFloat(user.balance.toString());
          const depositAmount = parseFloat(transaction.amount.toString());
          const newBalance = currentBalance + depositAmount;

          await storage.updateUser(transaction.userId, { 
            balance: newBalance.toString() 
          });

          // Update transaction with new balance
          await storage.updateTransaction(transaction.id, {
            balanceAfter: newBalance,
            status: 'completed'
          });
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error processing ZyonPay postback:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Simple in-memory storage for webhook data
  const webhookTransactions = new Map<string, any>();

  // ZyonPay webhook endpoint for payment confirmations
  app.post("/api/webhook/zyonpay", async (req, res) => {
    try {
      const webhookData = req.body;
      console.log('ZyonPay webhook received:', JSON.stringify(webhookData, null, 2));
      
      const transactionData = webhookData.data;
      const transactionId = transactionData.id.toString();
      const pixCode = transactionData.pix?.qrcode;
      
      // Store webhook data directly for immediate access
      webhookTransactions.set(transactionId, {
        id: transactionId,
        pixCode: pixCode,
        status: transactionData.status,
        amount: transactionData.amount,
        createdAt: new Date()
      });

      console.log(`Stored PIX code for transaction ${transactionId}:`, pixCode);

      // Always respond with 200 to acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Error processing ZyonPay webhook:', error);
      res.status(200).json({ received: true }); // Still acknowledge to prevent retries
    }
  });

  // Test endpoint to simulate payment completion
  app.post("/api/zyonpay/test-payment/:zyonPayId", async (req, res) => {
    try {
      const { zyonPayId } = req.params;
      
      // Update the webhook data to simulate payment completion
      const webhookData = webhookTransactions.get(zyonPayId.toString());
      if (webhookData) {
        webhookData.status = "paid";
        webhookTransactions.set(zyonPayId.toString(), webhookData);
        console.log(`Test: Updated transaction ${zyonPayId} status to "paid"`);
        return res.json({ success: true, status: "paid" });
      }
      
      res.status(404).json({ error: "Transaction not found" });
    } catch (error) {
      console.error('Error in test payment:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Check ZyonPay transaction status
  app.get("/api/zyonpay/transaction/:zyonPayId", async (req, res) => {
    try {
      const { zyonPayId } = req.params;
      
      // Check webhook data first
      const webhookData = webhookTransactions.get(zyonPayId.toString());
      if (webhookData) {
        return res.json({
          id: webhookData.id,
          pixCode: webhookData.pixCode,
          status: webhookData.status,
          amount: webhookData.amount
        });
      }

      return res.status(404).json({ error: "Transaction not found" });
    } catch (error) {
      console.error('Error getting ZyonPay transaction:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create withdrawal transaction
  app.post("/api/transactions/withdrawal", async (req, res) => {
    try {
      const { userId, amount, pixKey } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentBalance = parseFloat(user.balance.toString());
      const withdrawalAmount = parseFloat(amount);

      if (currentBalance < withdrawalAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const newBalance = currentBalance - withdrawalAmount;

      const transaction = await storage.createTransaction({
        userId,
        type: 'withdrawal',
        amount: -withdrawalAmount,
        status: 'pending',
        description: `Saque via PIX para chave: ${pixKey}`,
        pixKey,
        balanceBefore: currentBalance,
        balanceAfter: newBalance
      });

      await storage.updateUser(userId, { balance: newBalance.toString() });
      
      res.json(transaction);
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get transaction history
  app.get("/api/transactions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Mock transaction history
      const transactions = [
        {
          id: 1,
          userId,
          type: "deposit",
          amount: 5000, // R$ 50.00
          status: "completed",
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 2,
          userId,
          type: "withdrawal",
          amount: 2500, // R$ 25.00
          status: "completed",
          createdAt: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
        }
      ];
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get games list
  app.get("/api/games", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      // Mock games data
      const games = [
        {
          id: 1,
          name: "Mega Test",
          provider: "Evolution",
          category: "evolution",
          imageUrl: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7",
          isActive: true
        },
        {
          id: 2,
          name: "Bigger Bass Splash",
          provider: "Pragmatic Play",
          category: "pragmatic",
          imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
          isActive: true
        }
      ];
      
      res.json(games);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat support API endpoints
  app.post("/api/chat/conversation", async (req, res) => {
    try {
      const { userId, userName } = req.body;
      
      const conversation = await storage.createChatConversation({
        userId,
        status: 'active'
      });

      // Get existing messages for this conversation
      const messages = await storage.getChatMessages(conversation.id);

      res.json({
        conversationId: conversation.id,
        messages
      });
    } catch (error) {
      console.error('Error creating chat conversation:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const { conversationId, senderId, senderName, message, isFromSupport } = req.body;
      
      const chatMessage = await storage.createChatMessage({
        conversationId,
        senderId,
        senderName,
        message,
        isFromSupport: isFromSupport || false
      });

      res.json(chatMessage);
    } catch (error) {
      console.error('Error creating chat message:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/messages/:conversationId", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.conversationId);
      const messages = await storage.getChatMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Error getting chat messages:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connectedClients = new Map<string, { ws: WebSocket, conversationId: number, userId: string }>();

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'join') {
          // User joining a conversation
          const clientId = `${message.userId}_${message.conversationId}`;
          connectedClients.set(clientId, {
            ws,
            conversationId: message.conversationId,
            userId: message.userId
          });
          
          console.log(`Client ${message.userId} joined conversation ${message.conversationId}`);
          
        } else if (message.type === 'message') {
          // Broadcasting message to all clients in the same conversation
          const { conversationId, senderId, senderName, message: messageText, isFromSupport } = message;
          
          // Save message to database
          const chatMessage = await storage.createChatMessage({
            conversationId,
            senderId,
            senderName,
            message: messageText,
            isFromSupport
          });

          // Broadcast to all clients in this conversation
          connectedClients.forEach((client, clientId) => {
            if (client.conversationId === conversationId && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(JSON.stringify({
                type: 'message',
                message: chatMessage
              }));
            }
          });

          // Auto-reply from support (simulated)
          if (!isFromSupport) {
            setTimeout(async () => {
              const supportMessage = await storage.createChatMessage({
                conversationId,
                senderId: 'support',
                senderName: 'Support Agent',
                message: 'Thank you for contacting us! A support agent will be with you shortly.',
                isFromSupport: true
              });

              connectedClients.forEach((client, clientId) => {
                if (client.conversationId === conversationId && client.ws.readyState === WebSocket.OPEN) {
                  client.ws.send(JSON.stringify({
                    type: 'message',
                    message: supportMessage
                  }));
                }
              });
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from connected clients
      connectedClients.forEach((client, clientId) => {
        if (client.ws === ws) {
          connectedClients.delete(clientId);
          console.log(`Client ${clientId} disconnected`);
        }
      });
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
