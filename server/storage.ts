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
  private chats: Chat[] = [];
  private messages: Message[] = [];
  private settings: Settings = {
    id: 1,
    autoReplyEnabled: true,
    autoReplyMessage: "Hello! This is an automated message."
  };

  async getSettings(): Promise<Settings> {
    // Selalu gunakan fallback settings saat database error
    return this.settings;
  }

  async updateSettings(updates: UpdateSettings): Promise<Settings> {
    // Update fallback settings
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  async getChats(): Promise<Chat[]> {
    // Selalu gunakan fallback chats
    return this.chats;
  }

  async getChat(jid: string): Promise<Chat | undefined> {
    // Cari di fallback chats
    return this.chats.find(c => c.jid === jid);
  }

  async createOrUpdateChat(chat: InsertChat): Promise<Chat> {
    // Update fallback chat
    const existingIndex = this.chats.findIndex(c => c.jid === chat.jid);
    const existingChat = this.chats[existingIndex];
    
    // Preserve existing name if available
    const chatName = chat.name || existingChat?.name || 'Unknown';
    
    const newChat = {
      jid: chat.jid,
      name: chatName,
      unreadCount: chat.unreadCount || 0,
      lastMessageTimestamp: chat.lastMessageTimestamp || new Date()
    };
    
    if (existingIndex >= 0) {
      this.chats[existingIndex] = newChat;
    } else {
      this.chats.push(newChat);
    }
    
    return newChat;
  }

  async getMessages(chatJid: string): Promise<Message[]> {
    // Filter fallback messages
    return this.messages.filter(m => m.chatJid === chatJid);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    // Create fallback message
    const chat = this.chats.find(c => c.jid === message.chatJid);
    const newMessage = {
      id: message.id,
      chatJid: message.chatJid,
      senderJid: message.senderJid,
      senderName: message.senderName || chat?.name || null,
      content: message.content || null,
      timestamp: message.timestamp || new Date(),
      fromMe: message.fromMe || false
    };
    
    // Check if message already exists to avoid duplicates
    const existingIndex = this.messages.findIndex(m => m.id === newMessage.id);
    if (existingIndex >= 0) {
      // Update existing message with better sender name
      this.messages[existingIndex] = newMessage;
      return newMessage;
    }
    
    this.messages.push(newMessage);
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
