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

// In-memory fallback storage
const fallbackStorage = {
  chats: [] as Chat[],
  messages: [] as Message[],
  contacts: [] as Contact[],
  settings: {
    id: 1,
    autoReplyEnabled: true,
    autoReplyMessage: "Hello! This is an automated message.",
    botPersona: "You are a helpful assistant."
  } as Settings
};

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
  async getSettings(): Promise<Settings> {
    if (!db) {
      console.log("Using fallback storage for getSettings");
      return fallbackStorage.settings;
    }
    
    try {
      const result = await db.select().from(settings).limit(1);
      if (result.length === 0) {
        // Create default settings if none exist
        const defaultSettings = {
          autoReplyEnabled: true,
          autoReplyMessage: "Hello! This is an automated message.",
          botPersona: "You are a helpful assistant."
        };
        const [newSettings] = await db.insert(settings).values(defaultSettings).returning();
        return newSettings;
      }
      return result[0];
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      return fallbackStorage.settings;
    }
  }

  async updateSettings(updates: UpdateSettings): Promise<Settings> {
    if (!db) {
      console.log("Using fallback storage for updateSettings");
      fallbackStorage.settings = { ...fallbackStorage.settings, ...updates };
      return fallbackStorage.settings;
    }
    
    try {
      const [result] = await db.update(settings).set(updates).returning();
      return result;
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      fallbackStorage.settings = { ...fallbackStorage.settings, ...updates };
      return fallbackStorage.settings;
    }
  }

  async getChats(): Promise<Chat[]> {
    if (!db) {
      console.log("Using fallback storage for getChats");
      return fallbackStorage.chats;
    }
    
    try {
      return await db.select().from(chats).orderBy(desc(chats.lastMessageTimestamp));
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      return fallbackStorage.chats;
    }
  }

  async getChat(jid: string): Promise<Chat | undefined> {
    if (!db) {
      console.log("Using fallback storage for getChat");
      return fallbackStorage.chats.find(c => c.jid === jid);
    }
    
    try {
      const result = await db.select().from(chats).where(eq(chats.jid, jid)).limit(1);
      return result[0];
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      return fallbackStorage.chats.find(c => c.jid === jid);
    }
  }

  async createOrUpdateChat(chat: InsertChat): Promise<Chat> {
    const existing = await this.getChat(chat.jid);
    
    if (!db) {
      console.log("Using fallback storage for createOrUpdateChat");
      const chatName = chat.name || existing?.name || 'Unknown';
      const newChat = {
        jid: chat.jid,
        name: chatName,
        unreadCount: chat.unreadCount || 0,
        lastMessageTimestamp: chat.lastMessageTimestamp || new Date(),
        isOnline: chat.isOnline || existing?.isOnline || false,
        lastSeen: chat.lastSeen || existing?.lastSeen || null,
        isTyping: chat.isTyping || existing?.isTyping || false,
        isMarkedUnread: chat.isMarkedUnread || existing?.isMarkedUnread || false,
        isPinned: chat.isPinned || existing?.isPinned || false,
        isGroup: chat.isGroup || existing?.isGroup || false,
        groupDescription: chat.groupDescription || existing?.groupDescription || null,
        lastMessageFromMe: chat.lastMessageFromMe || existing?.lastMessageFromMe || false,
      };
      
      const existingIndex = fallbackStorage.chats.findIndex(c => c.jid === chat.jid);
      if (existingIndex >= 0) {
        fallbackStorage.chats[existingIndex] = newChat;
      } else {
        fallbackStorage.chats.push(newChat);
      }
      return newChat;
    }
    
    try {
      if (existing) {
        const chatName = chat.name || existing.name || 'Unknown';
        const [updated] = await db
          .update(chats)
          .set({
            name: chatName,
            unreadCount: chat.unreadCount ?? existing.unreadCount,
            lastMessageTimestamp: chat.lastMessageTimestamp || existing.lastMessageTimestamp,
            isOnline: chat.isOnline ?? existing.isOnline,
            lastSeen: chat.lastSeen || existing.lastSeen,
            isTyping: chat.isTyping ?? existing.isTyping,
            isMarkedUnread: chat.isMarkedUnread ?? existing.isMarkedUnread,
            isPinned: chat.isPinned ?? existing.isPinned,
            isGroup: chat.isGroup ?? existing.isGroup,
            groupDescription: chat.groupDescription || existing.groupDescription,
            lastMessageFromMe: chat.lastMessageFromMe ?? existing.lastMessageFromMe,
          })
          .where(eq(chats.jid, chat.jid))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(chats).values({
          jid: chat.jid,
          name: chat.name || 'Unknown',
          unreadCount: chat.unreadCount || 0,
          lastMessageTimestamp: chat.lastMessageTimestamp || new Date(),
          isOnline: chat.isOnline || false,
          lastSeen: chat.lastSeen || null,
          isTyping: chat.isTyping || false,
          isMarkedUnread: chat.isMarkedUnread || false,
          isPinned: chat.isPinned || false,
          isGroup: chat.isGroup || false,
          groupDescription: chat.groupDescription || null,
          lastMessageFromMe: chat.lastMessageFromMe || false,
        }).returning();
        return created;
      }
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      // Fallback logic (same as above)
      const chatName = chat.name || existing?.name || 'Unknown';
      const newChat = {
        jid: chat.jid,
        name: chatName,
        unreadCount: chat.unreadCount || 0,
        lastMessageTimestamp: chat.lastMessageTimestamp || new Date(),
        isOnline: chat.isOnline || existing?.isOnline || false,
        lastSeen: chat.lastSeen || existing?.lastSeen || null,
        isTyping: chat.isTyping || existing?.isTyping || false,
        isMarkedUnread: chat.isMarkedUnread || existing?.isMarkedUnread || false,
        isPinned: chat.isPinned || existing?.isPinned || false,
        isGroup: chat.isGroup || existing?.isGroup || false,
        groupDescription: chat.groupDescription || existing?.groupDescription || null,
        lastMessageFromMe: chat.lastMessageFromMe || existing?.lastMessageFromMe || false,
      };
      
      const existingIndex = fallbackStorage.chats.findIndex(c => c.jid === chat.jid);
      if (existingIndex >= 0) {
        fallbackStorage.chats[existingIndex] = newChat;
      } else {
        fallbackStorage.chats.push(newChat);
      }
      return newChat;
    }
  }

  async getMessages(chatJid: string): Promise<Message[]> {
    if (!db) {
      console.log("Using fallback storage for getMessages");
      return fallbackStorage.messages.filter(m => m.chatJid === chatJid);
    }
    
    try {
      return await db
        .select()
        .from(messages)
        .where(eq(messages.chatJid, chatJid))
        .orderBy(desc(messages.timestamp));
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      return fallbackStorage.messages.filter(m => m.chatJid === chatJid);
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    if (!db) {
      console.log("Using fallback storage for createMessage");
      const chat = fallbackStorage.chats.find(c => c.jid === message.chatJid);
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
      
      const existingIndex = fallbackStorage.messages.findIndex(m => m.id === newMessage.id);
      if (existingIndex >= 0) {
        newMessage.isStarred = message.isStarred ?? fallbackStorage.messages[existingIndex].isStarred;
        fallbackStorage.messages[existingIndex] = newMessage;
        return newMessage;
      }
      
      fallbackStorage.messages.push(newMessage);
      return newMessage;
    }
    
    try {
      const chat = await this.getChat(message.chatJid);
      const [created] = await db.insert(messages).values({
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
      }).returning();
      return created;
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      // Fallback logic (same as above)
      const chat = fallbackStorage.chats.find(c => c.jid === message.chatJid);
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
      
      const existingIndex = fallbackStorage.messages.findIndex(m => m.id === newMessage.id);
      if (existingIndex >= 0) {
        newMessage.isStarred = message.isStarred ?? fallbackStorage.messages[existingIndex].isStarred;
        fallbackStorage.messages[existingIndex] = newMessage;
        return newMessage;
      }
      
      fallbackStorage.messages.push(newMessage);
      return newMessage;
    }
  }

  async toggleStarMessage(messageId: string, star: boolean): Promise<boolean> {
    if (!db) {
      console.log("Using fallback storage for toggleStarMessage");
      const message = fallbackStorage.messages.find(m => m.id === messageId);
      if (message) {
        message.isStarred = star;
        return true;
      }
      return false;
    }
    
    try {
      const result = await db
        .update(messages)
        .set({ isStarred: star })
        .where(eq(messages.id, messageId))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      const message = fallbackStorage.messages.find(m => m.id === messageId);
      if (message) {
        message.isStarred = star;
        return true;
      }
      return false;
    }
  }

  async getContacts(): Promise<Contact[]> {
    if (!db) {
      console.log("Using fallback storage for getContacts");
      return fallbackStorage.contacts;
    }
    
    try {
      return await db.select().from(contacts);
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      return fallbackStorage.contacts;
    }
  }

  async getContact(jid: string): Promise<Contact | undefined> {
    if (!db) {
      console.log("Using fallback storage for getContact");
      return fallbackStorage.contacts.find(c => c.jid === jid);
    }
    
    try {
      const result = await db.select().from(contacts).where(eq(contacts.jid, jid)).limit(1);
      return result[0];
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      return fallbackStorage.contacts.find(c => c.jid === jid);
    }
  }

  async createOrUpdateContact(contact: InsertContact): Promise<Contact> {
    const existing = await this.getContact(contact.jid);

    if (!db) {
      console.log("Using fallback storage for createOrUpdateContact");
      const newContact = {
        jid: contact.jid,
        name: contact.name || existing?.name || null,
        pushName: contact.pushName || existing?.pushName || null,
        verifiedName: contact.verifiedName || existing?.verifiedName || null,
        profilePictureUrl: contact.profilePictureUrl || existing?.profilePictureUrl || null,
        status: contact.status || existing?.status || null,
      };

      const existingIndex = fallbackStorage.contacts.findIndex(c => c.jid === contact.jid);
      if (existingIndex >= 0) {
        fallbackStorage.contacts[existingIndex] = newContact;
      } else {
        fallbackStorage.contacts.push(newContact);
      }

      return newContact;
    }
    
    try {
      if (existing) {
        const [updated] = await db
          .update(contacts)
          .set({
            name: contact.name || existing.name,
            pushName: contact.pushName || existing.pushName,
            verifiedName: contact.verifiedName || existing.verifiedName,
            profilePictureUrl: contact.profilePictureUrl || existing.profilePictureUrl,
            status: contact.status || existing.status,
          })
          .where(eq(contacts.jid, contact.jid))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(contacts).values({
          jid: contact.jid,
          name: contact.name || null,
          pushName: contact.pushName || null,
          verifiedName: contact.verifiedName || null,
          profilePictureUrl: contact.profilePictureUrl || null,
          status: contact.status || null,
        }).returning();
        return created;
      }
    } catch (error) {
      console.warn("Database error, using fallback storage:", error);
      // Fallback logic (same as above)
      const newContact = {
        jid: contact.jid,
        name: contact.name || existing?.name || null,
        pushName: contact.pushName || existing?.pushName || null,
        verifiedName: contact.verifiedName || existing?.verifiedName || null,
        profilePictureUrl: contact.profilePictureUrl || existing?.profilePictureUrl || null,
        status: contact.status || existing?.status || null,
      };

      const existingIndex = fallbackStorage.contacts.findIndex(c => c.jid === contact.jid);
      if (existingIndex >= 0) {
        fallbackStorage.contacts[existingIndex] = newContact;
      } else {
        fallbackStorage.contacts.push(newContact);
      }

      return newContact;
    }
  }
}

export const storage = new DatabaseStorage();
