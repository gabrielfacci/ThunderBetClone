import type { Express } from "express";
import { createServer, type Server } from "http";
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

  // Create deposit transaction
  app.post("/api/transactions/deposit", async (req, res) => {
    try {
      const { userId, amount } = req.body;
      
      // Mock deposit creation
      const transaction = {
        id: Date.now(),
        userId,
        type: "deposit",
        amount,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create withdrawal transaction
  app.post("/api/transactions/withdrawal", async (req, res) => {
    try {
      const { userId, amount, pixKey } = req.body;
      
      // Mock withdrawal creation
      const transaction = {
        id: Date.now(),
        userId,
        type: "withdrawal",
        amount,
        pixKey,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      
      res.json(transaction);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
