import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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
  type: text("type", { enum: ["text", "image", "file", "system"] }).default("text").notNull(),
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
  type: z.enum(["text", "image", "file", "system"]).default("text"),
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
