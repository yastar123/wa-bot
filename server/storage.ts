import { db } from "./db";
import {
  settings,
  chats,
  messages,
  type Settings,
  type InsertSettings,
  type UpdateSettings,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: UpdateSettings): Promise<Settings>;

  // Chats
  getChats(): Promise<Chat[]>;
  getChat(jid: string): Promise<Chat | undefined>;
  createOrUpdateChat(chat: InsertChat): Promise<Chat>;

  // Messages
  getMessages(chatJid: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings).limit(1);
    if (existing) return existing;

    // Create default settings if not exists
    const [created] = await db.insert(settings).values({}).returning();
    return created;
  }

  async updateSettings(updates: UpdateSettings): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db
      .update(settings)
      .set(updates)
      .where(eq(settings.id, current.id))
      .returning();
    return updated;
  }

  async getChats(): Promise<Chat[]> {
    return await db.select().from(chats).orderBy(desc(chats.lastMessageTimestamp));
  }

  async getChat(jid: string): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.jid, jid));
    return chat;
  }

  async createOrUpdateChat(chat: InsertChat): Promise<Chat> {
    const [existing] = await db.insert(chats)
      .values(chat)
      .onConflictDoUpdate({
        target: chats.jid,
        set: chat,
      })
      .returning();
    return existing;
  }

  async getMessages(chatJid: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatJid, chatJid))
      .orderBy(messages.timestamp);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(message).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
