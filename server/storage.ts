import { db } from "./db";
import {
  settings,
  chats,
  messages,
  contacts,
  type Settings,
  type InsertSettings,
  type UpdateSettings,
  type Chat,
  type InsertChat,
  type Message,
  type InsertMessage,
  type Contact,
  type InsertContact,
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

  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(jid: string): Promise<Contact | undefined>;
  createOrUpdateContact(contact: InsertContact): Promise<Contact>;
}

export class DatabaseStorage implements IStorage {
  private chats: Chat[] = [];
  private messages: Message[] = [];
  private contacts: Contact[] = [];
  private settings: Settings = {
    id: 1,
    autoReplyEnabled: true,
    autoReplyMessage: "Hello! This is an automated message.",
    botPersona: "You are a helpful assistant."
  };

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: UpdateSettings): Promise<Settings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }

  async getChats(): Promise<Chat[]> {
    return this.chats;
  }

  async getChat(jid: string): Promise<Chat | undefined> {
    return this.chats.find(c => c.jid === jid);
  }

  async createOrUpdateChat(chat: InsertChat): Promise<Chat> {
    const existingIndex = this.chats.findIndex(c => c.jid === chat.jid);
    const existingChat = this.chats[existingIndex];
    
    const chatName = chat.name || existingChat?.name || 'Unknown';
    
    const newChat = {
      jid: chat.jid,
      name: chatName,
      unreadCount: chat.unreadCount || 0,
      lastMessageTimestamp: chat.lastMessageTimestamp || new Date(),
      isOnline: chat.isOnline || existingChat?.isOnline || false,
      lastSeen: chat.lastSeen || existingChat?.lastSeen || null,
      isTyping: chat.isTyping || existingChat?.isTyping || false,
      isMarkedUnread: chat.isMarkedUnread || existingChat?.isMarkedUnread || false,
      isPinned: chat.isPinned || existingChat?.isPinned || false,
      isGroup: chat.isGroup || existingChat?.isGroup || false,
      groupDescription: chat.groupDescription || existingChat?.groupDescription || null,
      lastMessageFromMe: chat.lastMessageFromMe || existingChat?.lastMessageFromMe || false,
    };
    
    if (existingIndex >= 0) {
      this.chats[existingIndex] = newChat;
    } else {
      this.chats.push(newChat);
    }
    
    return newChat;
  }

  async getMessages(chatJid: string): Promise<Message[]> {
    return this.messages.filter(m => m.chatJid === chatJid);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const chat = this.chats.find(c => c.jid === message.chatJid);
    const newMessage = {
      id: message.id,
      chatJid: message.chatJid,
      senderJid: message.senderJid,
      senderName: message.senderName || chat?.name || null,
      content: message.content || null,
      contentType: message.contentType || "text",
      fileUrl: message.fileUrl || null,
      fileName: message.fileName || null,
      timestamp: message.timestamp || new Date(),
      fromMe: message.fromMe || false,
      status: message.status || "sent",
      isStarred: message.isStarred || false
    };
    
    const existingIndex = this.messages.findIndex(m => m.id === newMessage.id);
    if (existingIndex >= 0) {
      newMessage.isStarred = message.isStarred ?? this.messages[existingIndex].isStarred;
      this.messages[existingIndex] = newMessage;
      return newMessage;
    }
    
    this.messages.push(newMessage);
    return newMessage;
  }

  async toggleStarMessage(messageId: string, star: boolean): Promise<boolean> {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.isStarred = star;
      return true;
    }
    return false;
  }

  async getContacts(): Promise<Contact[]> {
    return this.contacts;
  }

  async getContact(jid: string): Promise<Contact | undefined> {
    return this.contacts.find(c => c.jid === jid);
  }

  async createOrUpdateContact(contact: InsertContact): Promise<Contact> {
    const existingIndex = this.contacts.findIndex(c => c.jid === contact.jid);
    const existingContact = this.contacts[existingIndex];

    const newContact = {
      jid: contact.jid,
      name: contact.name || existingContact?.name || null,
      pushName: contact.pushName || existingContact?.pushName || null,
      verifiedName: contact.verifiedName || existingContact?.verifiedName || null,
      profilePictureUrl: contact.profilePictureUrl || existingContact?.profilePictureUrl || null,
      status: contact.status || existingContact?.status || null,
    };

    if (existingIndex >= 0) {
      this.contacts[existingIndex] = newContact;
    } else {
      this.contacts.push(newContact);
    }

    return newContact;
  }
}

export const storage = new DatabaseStorage();
