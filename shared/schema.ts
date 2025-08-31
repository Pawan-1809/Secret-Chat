import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["public", "private"] }).notNull(),
  password: text("password"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  participantCount: integer("participant_count").default(0).notNull(),
  lastActivity: timestamp("last_activity").default(sql`now()`).notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey(),
  roomId: varchar("room_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["text", "image", "file", "voice", "system"] }).default("text").notNull(),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  isEncrypted: boolean("is_encrypted").default(false),
  timestamp: timestamp("timestamp").default(sql`now()`).notNull(),
});

export const participants = pgTable("participants", {
  id: varchar("id").primaryKey(),
  roomId: varchar("room_id").notNull(),
  username: text("username").notNull(),
  socketId: text("socket_id").notNull(),
  joinedAt: timestamp("joined_at").default(sql`now()`).notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
  participantCount: true,
  lastActivity: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
}).extend({
  type: z.enum(["text", "image", "file", "voice", "system"]).default("text"),
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  joinedAt: true,
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

// Additional types for API responses
export type RoomWithParticipants = Room & {
  participants: Participant[];
  messages: Message[];
};

export type PublicRoomSummary = Pick<Room, 'id' | 'name' | 'participantCount' | 'lastActivity'>;

// Additional schemas for new features
export const roomAnalytics = pgTable("room_analytics", {
  id: varchar("id").primaryKey(),
  roomId: varchar("room_id").notNull(),
  messageCount: integer("message_count").default(0),
  participantCount: integer("participant_count").default(0),
  activeUsers: integer("active_users").default(0),
  date: timestamp("date").default(sql`now()`).notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export const botResponses = pgTable("bot_responses", {
  id: varchar("id").primaryKey(),
  trigger: text("trigger").notNull(),
  response: text("response").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});

export type RoomAnalytics = typeof roomAnalytics.$inferSelect;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type BotResponse = typeof botResponses.$inferSelect;
