import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { supabase, storeTransactionInSupabase, getAllTransactionsFromSupabase, getUserTransactionsFromSupabase } from "./supabaseClient";
import { formatDateBrazil, getNowBrazilISO } from "../shared/timezone";

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

  // Get user transactions - handle both integer IDs and UUIDs
  app.get("/api/user/:id/transactions", async (req, res) => {
    try {
      const userIdParam = req.params.id;
      
      // Check if it's a UUID (contains hyphens) or numeric ID
      if (userIdParam.includes('-')) {
        // It's a UUID, get transactions from Supabase by user metadata
        const transactions = await getUserTransactionsFromSupabase(userIdParam);
        res.json(transactions);
      } else {
        // It's a numeric ID, use regular storage
        const userId = parseInt(userIdParam);
        if (isNaN(userId)) {
          return res.status(400).json({ error: "Invalid user ID format" });
        }
        const transactions = await storage.getUserTransactions(userId);
        res.json(transactions);
      }
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
      
      // Get or create user by email if userId is a Supabase UUID
      let user;
      let numericUserId;
      
      if (userEmail) {
        user = await storage.getUserByEmail(userEmail);
        if (!user && userEmail) {
          // Create user record for Supabase user
          user = await storage.createUser({
            username: userEmail.split('@')[0],
            email: userEmail,
            password: 'supabase_auth',
            fullName: userEmail.split('@')[0],
            phone: '',
            cpf: '',
            accountMode: 'nacional',
            balance: '0.00'
          });
        }
        numericUserId = user!.id;
      } else {
        numericUserId = parseInt(userId.toString());
        user = await storage.getUser(numericUserId);
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentBalance = parseFloat(user.balance.toString());
      const depositAmount = parseFloat(amount);

      console.log(`📝 Creating Supabase transaction for user ${numericUserId} (${userEmail || 'N/A'}) - Amount: R$ ${depositAmount.toFixed(2)}`);

      const transaction = await storage.createTransaction({
        userId: numericUserId,
        type: 'deposit',
        amount: depositAmount,
        status: 'pending',
        description: `Depósito PIX via ZyonPay - R$ ${depositAmount.toFixed(2)}`,
        balanceBefore: currentBalance,
        balanceAfter: currentBalance,
        zyonPayTransactionId: zyonPayTransactionId.toString(),
        zyonPaySecureId,
        zyonPaySecureUrl,
        zyonPayPixQrCode,
        zyonPayPixUrl,
        zyonPayPixExpiration: zyonPayPixExpiration ? new Date(zyonPayPixExpiration) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        zyonPayStatus,
        metadata: metadata || JSON.stringify({
          userEmail,
          supabaseUserId: userId,
          transactionDate: new Date().toISOString()
        })
      });

      console.log(`✅ Transaction saved to Supabase:`, {
        id: transaction.id,
        userId: numericUserId,
        email: userEmail,
        amount: depositAmount,
        zyonPayId: zyonPayTransactionId,
        status: 'pending'
      });
      
      res.json(transaction);
    } catch (error) {
      console.error('Error creating ZyonPay transaction:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Store PIX transaction directly in Supabase (new endpoint)
  app.post("/api/supabase/store-transaction", async (req, res) => {
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
      
      const depositAmount = parseFloat(amount);
      console.log(`Storing PIX transaction in Supabase for ${userEmail} - R$ ${depositAmount.toFixed(2)}`);

      const transaction = await storeTransactionInSupabase({
        userId: userId,
        userEmail: userEmail,
        amount: depositAmount,
        zyonPayTransactionId: zyonPayTransactionId.toString(),
        zyonPaySecureId,
        zyonPaySecureUrl,
        zyonPayPixQrCode,
        zyonPayPixUrl,
        zyonPayPixExpiration: zyonPayPixExpiration || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        zyonPayStatus,
        metadata: metadata || JSON.stringify({
          userEmail,
          supabaseUserId: userId,
          transactionDate: new Date().toISOString()
        })
      });

      console.log(`Transaction ${transaction.id} stored in Supabase for user ${userEmail}`);
      res.json(transaction);
    } catch (error) {
      console.error('Error storing transaction in Supabase:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all transactions from Supabase (debug endpoint)
  app.get("/api/transactions/all", async (req, res) => {
    try {
      const transactions = await getAllTransactionsFromSupabase();
      console.log(`Found ${transactions.length} total transactions in Supabase`);
      res.json({
        count: transactions.length,
        transactions: transactions
      });
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user transactions from Supabase
  app.get("/api/supabase/user/:userId/transactions", async (req, res) => {
    try {
      const { userId } = req.params;
      const transactions = await getUserTransactionsFromSupabase(userId);
      console.log(`Found ${transactions.length} transactions for user ${userId}`);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
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

  // Fast PIX endpoint - get QR code directly from ZyonPay API
  app.post("/api/zyonpay/fast-pix", async (req, res) => {
    try {
      const { amount, userEmail, userName, userPhone, userId } = req.body;
      
      if (!amount || !userEmail || !userName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Generate CPF and phone if needed
      const generateValidCPF = () => {
        // Simple CPF generator for testing
        const digits = [];
        for (let i = 0; i < 9; i++) {
          digits.push(Math.floor(Math.random() * 10));
        }
        
        // Calculate verification digits
        let sum = 0;
        for (let i = 0; i < 9; i++) {
          sum += digits[i] * (10 - i);
        }
        let firstDigit = 11 - (sum % 11);
        if (firstDigit >= 10) firstDigit = 0;
        digits.push(firstDigit);
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
          sum += digits[i] * (11 - i);
        }
        let secondDigit = 11 - (sum % 11);
        if (secondDigit >= 10) secondDigit = 0;
        digits.push(secondDigit);
        
        return digits.join('');
      };

      const generatePhone = () => {
        const areaCodes = ['11', '21', '31', '41', '51', '61', '71', '81', '85', '91'];
        const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
        const number = '9' + Math.floor(Math.random() * 90000000 + 10000000).toString();
        return `${areaCode}${number}`;
      };

      const amountInCentavos = Math.round(amount * 100);
      const cpf = generateValidCPF();
      const phone = userPhone || generatePhone();

      const transactionData = {
        paymentMethod: "pix",
        amount: amountInCentavos,
        splits: [
          {
            recipientId: 106198,
            amount: amountInCentavos
          }
        ],
        customer: {
          name: userName,
          email: userEmail,
          document: {
            number: cpf,
            type: "cpf"
          },
          phone: phone,
          address: {
            street: "Rua Fictícia",
            streetNumber: "123",
            zipCode: "40000000",
            neighborhood: "Centro",
            city: "Salvador",
            state: "BA",
            country: "BR"
          }
        },
        items: [
          {
            title: 'Crédito Appflix',
            unitPrice: amountInCentavos,
            quantity: 1,
            tangible: false
          }
        ]
      };

      // Call ZyonPay API directly
      const secretKey = 'sk_live_v2UNcCWtzQAKrVaQZ8mvJKzQGr8fwvebUyCrCLCdAG';
      const authString = `${secretKey}:x`;
      const authHeader = 'Basic ' + Buffer.from(authString).toString('base64');

      const response = await fetch('https://api.zyonpay.com/v1/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('ZyonPay API Error:', response.status, errorData);
        return res.status(500).json({ error: "Failed to create PIX transaction" });
      }

      const result = await response.json();
      console.log(`🚀 Fast PIX created - Transaction ${result.id} for ${userEmail}`);

      // Store in database
      try {
        const storeResponse = await fetch(`${req.protocol}://${req.get('host')}/api/supabase/store-transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zyonPayId: result.id,
            amount: amount,
            userEmail: userEmail,
            userId: userId
          })
        });
        
        if (storeResponse.ok) {
          console.log(`💾 Fast PIX transaction ${result.id} stored in database`);
        }
      } catch (dbError) {
        console.error('Database storage error:', dbError);
      }

      // Return transaction with immediate PIX code (if available)
      res.json({
        id: result.id,
        pixCode: result.pix?.qrcode || null,
        qrCodeUrl: result.pix?.qrcode ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.pix.qrcode)}` : null,
        status: result.status,
        amount: result.amount,
        secureUrl: result.secureUrl
      });

    } catch (error) {
      console.error('Fast PIX error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Simple in-memory storage for webhook data
  const webhookTransactions = new Map<string, any>();

  // ZyonPay webhook endpoint for payment confirmations
  app.post("/api/webhook/zyonpay", async (req, res) => {
    try {
      const webhookData = req.body;
      const timestamp = formatDateBrazil(new Date());
      console.log(`🔔 [${timestamp}] ZyonPay webhook received:`, JSON.stringify(webhookData, null, 2));
      
      const transactionData = webhookData.data;
      const transactionId = transactionData.id.toString();
      const pixCode = transactionData.pix?.qrcode;
      const paymentStatus = transactionData.status;
      
      // Store webhook data for immediate PIX code access
      webhookTransactions.set(transactionId, {
        id: transactionId,
        pixCode: pixCode,
        status: paymentStatus,
        amount: transactionData.amount,
        createdAt: new Date()
      });

      console.log(`📦 [${formatDateBrazil(new Date())}] Stored PIX code for transaction ${transactionId}:`, pixCode);

      // Process payment if status is "paid"
      if (paymentStatus === 'paid') {
        console.log(`💰 [${formatDateBrazil(new Date())}] Processing payment for transaction ${transactionId}`);
        
        // Find transaction in Supabase by ZyonPay ID
        const { data: transactions, error: findError } = await supabase
          .from('transactions')
          .select('*')
          .eq('zyonpay_transaction_id', transactionId)
          .limit(1);

        if (findError) {
          console.error('❌ Error finding transaction:', findError);
        } else if (transactions && transactions.length > 0) {
          const transaction = transactions[0];
          const depositAmount = parseFloat(transactionData.amount) / 100; // Convert centavos to reais
          
          // Extract Supabase UUID from metadata if available
          let supabaseUserId = null;
          try {
            const metadata = transaction.metadata;
            if (metadata && typeof metadata === 'object' && metadata.supabaseUserId) {
              supabaseUserId = metadata.supabaseUserId;
            }
          } catch (e) {
            console.log('📝 No metadata found, searching by email');
          }

          // If no UUID in metadata, find user by email
          if (!supabaseUserId && transactionData.customer?.email) {
            const { data: userByEmail } = await supabase
              .from('users')
              .select('id')
              .eq('email', transactionData.customer.email)
              .single();
            
            if (userByEmail) {
              supabaseUserId = userByEmail.id;
            }
          }

          if (!supabaseUserId) {
            console.error('❌ Could not find Supabase user ID');
            return;
          }
          
          console.log(`🔍 Found transaction: ID=${transaction.id}, Supabase User=${supabaseUserId}, Amount=R$${depositAmount}`);

          // Get current user balance
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('balance')
            .eq('id', supabaseUserId)
            .single();

          if (userError) {
            console.error('❌ Error getting user:', userError);
          } else if (user) {
            const currentBalance = parseFloat(user.balance || '0');
            const newBalance = currentBalance + depositAmount;

            console.log(`📊 Balance update: ${currentBalance} + ${depositAmount} = ${newBalance}`);

            // Update user balance
            const { error: balanceError } = await supabase
              .from('users')
              .update({ balance: newBalance })
              .eq('id', supabaseUserId);

            if (balanceError) {
              console.error('❌ Error updating balance:', balanceError);
            } else {
              console.log(`✅ Balance updated successfully for user ${supabaseUserId}`);

              // Update transaction status
              const { error: txError } = await supabase
                .from('transactions')
                .update({ 
                  status: 'completed',
                  balance_after: newBalance,
                  updated_at: getNowBrazilISO()
                })
                .eq('id', transaction.id);

              if (txError) {
                console.error('❌ Error updating transaction:', txError);
              } else {
                console.log(`✅ Transaction ${transaction.id} marked as completed`);
              }
            }
          }
        } else {
          console.log(`⚠️ Transaction ${transactionId} not found in database`);
        }
      }

      res.status(200).json({ received: true, processed: paymentStatus === 'paid' });
    } catch (error) {
      console.error('❌ Error processing ZyonPay webhook:', error);
      res.status(200).json({ received: true }); 
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

  // Process Supabase withdrawal request (Real implementation)
  app.post("/api/withdrawal/request", async (req, res) => {
    console.log('🚀 WITHDRAWAL ROUTE HIT - Request body:', req.body);
    try {
      const { userId, amount, pixKey, pixKeyType } = req.body;
      
      console.log('🔍 Withdrawal request:', { userId, amount, pixKey, pixKeyType });
      
      if (!userId || !amount || !pixKey || !pixKeyType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const withdrawalAmount = parseFloat(amount.replace(/[^\d.,]/g, '').replace(',', '.'));
      
      // Minimum withdrawal check (R$ 50)
      if (withdrawalAmount < 50) {
        return res.status(400).json({ error: "Minimum withdrawal amount is R$ 50.00" });
      }

      console.log('💰 Looking for user:', userId, 'withdrawal amount:', withdrawalAmount);

      // Direct SQL query to get user data and avoid RLS issues
      const { data: userData, error: sqlError } = await supabase
        .from('users')
        .select('balance, email, full_name')
        .eq('id', userId);

      console.log('👤 SQL query result:', { userData, sqlError });

      if (sqlError) {
        console.error('❌ SQL Error:', sqlError);
        return res.status(500).json({ error: "Database error" });
      }

      if (!userData || userData.length === 0) {
        console.error('❌ No user found with ID:', userId);
        return res.status(404).json({ error: "User not found" });
      }

      const userProfile = userData[0];
      console.log('✅ Found user:', userProfile);

      const currentBalance = parseFloat(userProfile.balance);
      
      // Check sufficient balance
      if (currentBalance < withdrawalAmount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const newBalance = currentBalance - withdrawalAmount;

      // Update user balance in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating balance:', updateError);
        return res.status(500).json({ error: "Failed to process withdrawal" });
      }

      // Create withdrawal record in Supabase
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: userId,
          amount: withdrawalAmount,
          pix_key: pixKey,
          pix_key_type: pixKeyType,
          status: 'pending',
          balance_before: currentBalance,
          balance_after: newBalance
        })
        .select()
        .single();

      if (withdrawalError) {
        console.error('Error creating withdrawal:', withdrawalError);
        // Rollback balance update
        await supabase
          .from('users')
          .update({ balance: currentBalance })
          .eq('id', userId);
        return res.status(500).json({ error: "Failed to create withdrawal record" });
      }

      console.log(`✅ Withdrawal processed: R$ ${withdrawalAmount} for user ${userId}`);
      
      res.json({
        success: true,
        withdrawal,
        newBalance
      });

    } catch (error) {
      console.error('Error processing withdrawal:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user withdrawals from Supabase
  app.get("/api/user/:userId/withdrawals", async (req, res) => {
    try {
      const userId = req.params.userId;

      const { data: withdrawals, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching withdrawals:', error);
        return res.status(500).json({ error: "Failed to fetch withdrawals" });
      }

      res.json(withdrawals || []);
    } catch (error) {
      console.error('Error fetching user withdrawals:', error);
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
