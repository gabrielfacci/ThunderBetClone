import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table - expanded for multi-user platform
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  cpf: text("cpf").unique(), // Brazilian tax ID
  dateOfBirth: timestamp("date_of_birth"),
  accountMode: text("account_mode").notNull().default("national"), // 'national' or 'international'
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  isVerified: boolean("is_verified").notNull().default(false),
  verificationCode: text("verification_code"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Games table - with detailed game information
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  gameId: text("game_id").notNull().unique(), // External game identifier
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  minBet: decimal("min_bet", { precision: 10, scale: 2 }).notNull().default("0.01"),
  maxBet: decimal("max_bet", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  rtp: decimal("rtp", { precision: 5, scale: 2 }), // Return to Player percentage
  volatility: text("volatility"), // 'low', 'medium', 'high'
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game categories table
export const gameCategories = pgTable("game_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

// Transactions table - expanded for all financial operations
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'bet', 'win', 'bonus'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'completed', 'failed', 'cancelled'
  description: text("description"),
  pixKey: text("pix_key"),
  pixTxId: text("pix_tx_id"), // PIX transaction ID
  gameId: integer("game_id"), // Reference to game if transaction is game-related
  sessionId: text("session_id"), // Game session ID
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }),
  metadata: text("metadata"), // JSON string for additional data
  // ZyonPay specific fields
  zyonPayTransactionId: text("zyonpay_transaction_id"), // ZyonPay transaction ID
  zyonPaySecureId: text("zyonpay_secure_id"), // ZyonPay secure ID
  zyonPaySecureUrl: text("zyonpay_secure_url"), // ZyonPay secure URL
  zyonPayPixQrCode: text("zyonpay_pix_qrcode"), // PIX QR Code from ZyonPay
  zyonPayPixUrl: text("zyonpay_pix_url"), // PIX copy-paste code from ZyonPay
  zyonPayPixExpiration: timestamp("zyonpay_pix_expiration"), // PIX expiration date
  zyonPayStatus: text("zyonpay_status"), // ZyonPay specific status
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game sessions table - track user gaming sessions
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  gameId: integer("game_id").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  totalBets: decimal("total_bets", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalWins: decimal("total_wins", { precision: 10, scale: 2 }).notNull().default("0.00"),
  netResult: decimal("net_result", { precision: 10, scale: 2 }).notNull().default("0.00"),
  roundsPlayed: integer("rounds_played").notNull().default(0),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'abandoned'
});

// Bonuses table - manage user bonuses and promotions
export const bonuses = pgTable("bonuses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'welcome', 'deposit', 'cashback', 'free_spins'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  wageringRequirement: decimal("wagering_requirement", { precision: 10, scale: 2 }).notNull().default("0.00"),
  wageringCompleted: decimal("wagering_completed", { precision: 10, scale: 2 }).notNull().default("0.00"),
  status: text("status").notNull().default("active"), // 'active', 'completed', 'expired', 'cancelled'
  expiresAt: timestamp("expires_at"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User preferences table
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  language: text("language").notNull().default("pt"),
  currency: text("currency").notNull().default("BRL"),
  timezone: text("timezone").notNull().default("America/Sao_Paulo"),
  notifications: boolean("notifications").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  smsNotifications: boolean("sms_notifications").notNull().default(false),
  maxDailyDeposit: decimal("max_daily_deposit", { precision: 10, scale: 2 }),
  maxDailyLoss: decimal("max_daily_loss", { precision: 10, scale: 2 }),
  sessionTimeLimit: integer("session_time_limit"), // in minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User verification documents
export const userDocuments = pgTable("user_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'id', 'address_proof', 'selfie'
  documentUrl: text("document_url").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by"), // Admin user ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'pix', 'credit_card', 'bank_transfer'
  name: text("name").notNull(), // User-defined name
  details: text("details").notNull(), // JSON string with payment details
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Promotions table
export const promotions = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'bonus', 'free_spins', 'cashback'
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minDeposit: decimal("min_deposit", { precision: 10, scale: 2 }),
  wageringRequirement: decimal("wagering_requirement", { precision: 10, scale: 2 }).notNull().default("0.00"),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  terms: text("terms"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User promotion claims
export const userPromotions = pgTable("user_promotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  promotionId: integer("promotion_id").notNull(),
  status: text("status").notNull().default("claimed"), // 'claimed', 'active', 'completed', 'expired'
  claimedAt: timestamp("claimed_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Audit log for tracking important user actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(), // 'login', 'deposit', 'withdrawal', 'game_play', etc.
  details: text("details"), // JSON string with action details
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat support tables
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default("active"), // 'active', 'closed'
  agentId: text("agent_id"),
  agentName: text("agent_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  message: text("message").notNull(),
  isFromSupport: boolean("is_from_support").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Define relations between tables
export const userRelations = relations(users, ({ many, one }) => ({
  transactions: many(transactions),
  gameSessions: many(gameSessions),
  bonuses: many(bonuses),
  preferences: one(userPreferences),
  documents: many(userDocuments),
  paymentMethods: many(paymentMethods),
  promotions: many(userPromotions),
  auditLogs: many(auditLogs),
}));

export const gameRelations = relations(games, ({ many }) => ({
  sessions: many(gameSessions),
  transactions: many(transactions),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [transactions.gameId],
    references: [games.id],
  }),
}));

// Insert schemas for all tables
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameCategorySchema = createInsertSchema(gameCategories).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
});

export const insertBonusSchema = createInsertSchema(bonuses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserDocumentSchema = createInsertSchema(userDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPromotionSchema = createInsertSchema(userPromotions).omit({
  id: true,
  claimedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Type definitions for all tables
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

export type InsertGameCategory = z.infer<typeof insertGameCategorySchema>;
export type GameCategory = typeof gameCategories.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

export type InsertBonus = z.infer<typeof insertBonusSchema>;
export type Bonus = typeof bonuses.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

export type InsertUserDocument = z.infer<typeof insertUserDocumentSchema>;
export type UserDocument = typeof userDocuments.$inferSelect;

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

export type InsertUserPromotion = z.infer<typeof insertUserPromotionSchema>;
export type UserPromotion = typeof userPromotions.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
