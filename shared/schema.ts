import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  autoReplyEnabled: boolean("auto_reply_enabled").default(true).notNull(),
  autoReplyMessage: text("auto_reply_message").default("Hello! This is an automated message.").notNull(),
  botPersona: text("bot_persona").default("You are a helpful assistant.").notNull(),
});

export const chats = pgTable("chats", {
  jid: text("jid").primaryKey(), // WhatsApp ID (e.g., 123456@s.whatsapp.net)
  name: text("name"),
  unreadCount: integer("unread_count").default(0),
  lastMessageTimestamp: timestamp("last_message_timestamp"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
  isTyping: boolean("is_typing").default(false),
});

export const messages = pgTable("messages", {
  id: text("id").primaryKey(), // WhatsApp Message ID
  chatJid: text("chat_jid").notNull(), // Foreign key to chats (logical)
  senderJid: text("sender_jid").notNull(),
  senderName: text("sender_name"),
  content: text("content"),
  contentType: text("content_type").default("text").notNull(), // text, image, document
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  timestamp: timestamp("timestamp").defaultNow(),
  fromMe: boolean("from_me").default(false),
  status: text("status").default("sent").notNull(), // sent, delivered, read
  isStarred: boolean("is_starred").default(false).notNull(),
});

// === SCHEMAS ===

export const insertSettingsSchema = createInsertSchema(settings);
export const insertChatSchema = createInsertSchema(chats);
export const insertMessageSchema = createInsertSchema(messages);

// === TYPES ===

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type UpdateSettings = Partial<InsertSettings>;

export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type SendMessageRequest = {
  jid: string;
  content: string;
  contentType?: "text" | "image" | "document";
  fileUrl?: string;
  fileName?: string;
};
