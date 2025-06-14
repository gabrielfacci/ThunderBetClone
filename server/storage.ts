import { 
  users, 
  games,
  transactions,
  gameSessions,
  bonuses,
  userPreferences,
  auditLogs,
  type User, 
  type InsertUser,
  type Game,
  type InsertGame,
  type Transaction,
  type InsertTransaction,
  type GameSession,
  type InsertGameSession,
  type Bonus,
  type InsertBonus,
  type UserPreferences,
  type InsertUserPreferences,
  type AuditLog,
  type InsertAuditLog
} from "@shared/schema";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Core user operations for the platform
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Transaction operations for deposits/withdrawals
  createTransaction(transaction: any): Promise<any>;
  getUserTransactions(userId: number): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      fullName: insertUser.fullName,
      phone: insertUser.phone,
      accountMode: insertUser.accountMode || 'national',
      balance: insertUser.balance || 0,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
}

// PostgreSQL Storage implementation for Supabase
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    // Create postgres client with connection options instead of URL parsing
    const sql = postgres({
      host: 'aws-0-sa-east-1.pooler.supabase.com',
      port: 6543,
      database: 'postgres',
      username: 'postgres.kgpmvqfehzkeyrtexdkb',
      password: 'Jo#83321666',
      ssl: 'require',
      max: 1,
    });
    this.db = drizzle(sql);
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const result = await this.db.update(users).set({
        ...updates,
        updatedAt: new Date()
      }).where(eq(users.id, id)).returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createTransaction(transaction: any): Promise<any> {
    try {
      const result = await this.db.insert(transactions).values({
        ...transaction,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getUserTransactions(userId: number): Promise<any[]> {
    try {
      const result = await this.db.select().from(transactions).where(eq(transactions.userId, userId));
      return result;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }
}

// Use PostgreSQL storage when DATABASE_URL is available, fallback to memory storage
export const storage = process.env.DATABASE_URL ? new PostgresStorage() : new MemStorage();
