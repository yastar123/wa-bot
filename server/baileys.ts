import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  type WASocket,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import { storage } from "./storage";
import type { Server as SocketIOServer } from "socket.io";
import { promises as fs } from "fs";

let sock: WASocket | undefined;
let io: SocketIOServer | undefined;
let qr: string | undefined;

// Add global variable to track initialization
let isInitializing = false;
let reconnectTimeout: NodeJS.Timeout | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Add global variable to track connection state
let connectionState: 'disconnected' | 'connecting' | 'connected' | 'open' | 'close' = 'disconnected';

export function getSocket() {
  return sock;
}

export function getQr() {
  return qr;
}

export function getStatus() {
  if (!sock) return { status: "disconnected" };
  return { 
    status: connectionState === 'connected' ? 'connected' : 
           connectionState === 'connecting' ? 'connecting' : 'disconnected',
    user: sock?.user ? {
      id: sock.user.id,
      name: sock.user.name
    } : undefined
  };
}

export function getUser() {
  return sock?.user ? { id: sock.user.id, name: sock.user.name } : undefined;
}

// Load existing chats from WhatsApp
async function loadExistingChats() {
  if (!sock) return;
  
  try {
    console.log('Loading existing chats from WhatsApp...');
    
    // Since fetchChats and fetchMessages are not available in this version,
    // we'll wait for messages to come in naturally
    // The existing chats will be populated as messages arrive
    
    console.log('Chat loading will happen naturally as messages are received');
    
  } catch (error) {
    console.error('Error loading existing chats:', error);
  }
}

export async function initWhatsapp(socketIO: SocketIOServer) {
  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (isInitializing) {
    console.log('WhatsApp already initializing, skipping...');
    return;
  }
  
  // Check if we've exceeded max reconnect attempts
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log(`Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection.`);
    connectionState = 'disconnected';
    isInitializing = false;
    io?.emit("status", { status: "disconnected" });
    return;
  }
  
  isInitializing = true;
  connectionState = 'connecting';
  console.log(`Initializing WhatsApp... (attempt ${reconnectAttempts + 1})`);
  io = socketIO;
  
  try {
    // Clear any existing socket reference
    if (sock) {
      try {
        sock.ws?.close();
        sock.ev.removeAllListeners("connection.update");
        sock.ev.removeAllListeners("messages.upsert");
        sock.ev.removeAllListeners("creds.update");
      } catch (error) {
        console.log('Error clearing existing socket:', error);
      }
      sock = undefined;
    }
    
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
      },
      logger: pino({ level: "fatal" }) as any,
      generateHighQualityLinkPreview: true,
      browser: ["WhatsApp Bot Dashboard", "Chrome", "1.0.0"],
    });

    console.log('WhatsApp socket created, setting up event listeners...');

    sock.ev.on("creds.update", saveCreds);

    // Load existing chats and messages on connection
    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr: qrCode } = update;
      
      if (connection) {
        connectionState = connection;
      }
      console.log('Connection update:', { connection, hasQR: !!qrCode });
      
      if (qrCode) {
        qr = qrCode;
        console.log('QR Code generated, emitting to clients...');
        io?.emit("qr", { qr });
        io?.emit("status", { status: "connecting", qr });
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;
        
        connectionState = 'disconnected';
        console.log('WhatsApp connection closed, should reconnect:', shouldReconnect);
        io?.emit("status", { status: "disconnected" });
        qr = undefined;
        isInitializing = false;
        
        // Only reconnect if not logged out and socket exists
        if (shouldReconnect && sock) {
          // Increment reconnect attempts
          reconnectAttempts++;
          
          // Clear any existing timeout
          if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
          }
          
          // Add delay before reconnect to allow UI to update
          const delay = Math.min(5000 * reconnectAttempts, 30000); // Exponential backoff, max 30 seconds
          reconnectTimeout = setTimeout(() => {
            console.log(`Attempting to reconnect... (attempt ${reconnectAttempts})`);
            initWhatsapp(socketIO);
          }, delay);
        } else {
          // Reset reconnect attempts if not reconnecting
          reconnectAttempts = 0;
        }
      } else if (connection === "open") {
        connectionState = 'connected';
        console.log('WhatsApp connection opened');
        io?.emit("status", {
          status: "connected",
          user: {
            id: sock?.user?.id || "unknown",
            name: sock?.user?.name || "WhatsApp User",
          },
        });
        qr = undefined;
        isInitializing = false;
        
        // Clear any reconnect timeout when successfully connected
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
        
        // Reset reconnect attempts on successful connection
        reconnectAttempts = 0;
        
        // Load existing chats when connection opens
        await loadExistingChats();
      }
    });

    // Sync History & Contacts
    sock.ev.on("messaging-history.set", async ({ chats: initialChats, messages: initialMessages, contacts, isLatest }) => {
      console.log(`Syncing history: ${initialChats.length} chats, ${initialMessages.length} messages, ${contacts.length} contacts`);
      
      const existingChats = await storage.getChats();

      for (const contact of contacts) {
        const existingChat = existingChats.find(c => c.jid === contact.id);
        await storage.createOrUpdateChat({
          jid: contact.id || "unknown",
          name: contact.name || contact.notify || contact.verifiedName || existingChat?.name || contact.id || "Unknown Contact",
          unreadCount: 0,
          lastMessageTimestamp: new Date(),
          isGroup: contact.id?.endsWith('@g.us') || false,
        });
      }

      for (const chat of initialChats) {
        if (!chat.id) continue;
        const existingChat = existingChats.find(c => c.jid === chat.id);
        await storage.createOrUpdateChat({
          jid: chat.id,
          name: chat.name || existingChat?.name || chat.id,
          unreadCount: chat.unreadCount || 0,
          lastMessageTimestamp: new Date(chat.conversationTimestamp ? (Number(chat.conversationTimestamp) * 1000) : Date.now()),
          isGroup: chat.id?.endsWith('@g.us') || false,
        });
      }

      for (const msg of initialMessages) {
        if (!msg.message) continue;
        const jid = msg.key.remoteJid;
        if (!jid) continue;

        const content = msg.message.conversation || 
                        msg.message.extendedTextMessage?.text || 
                        msg.message.imageMessage?.caption || "";
        
        let contentType = "text";
        let fileUrl = null;
        let fileName = null;

        if (msg.message.imageMessage) {
          contentType = "image";
          fileName = "image.jpg";
        } else if (msg.message.documentMessage) {
          contentType = "document";
          fileName = msg.message.documentMessage.fileName || "document";
        }

        const existingChat = await storage.getChat(jid);

        await storage.createMessage({
          id: msg.key.id!,
          chatJid: jid,
          senderJid: msg.key.participant || msg.key.remoteJid!,
          senderName: msg.pushName || existingChat?.name || null,
          content,
          contentType,
          fileUrl,
          fileName,
          timestamp: new Date((msg.messageTimestamp as number) * 1000),
          fromMe: msg.key.fromMe || false,
          status: msg.status === 4 ? "read" : msg.status === 3 ? "delivered" : "sent"
        });
      }
      
      io?.emit("chat_update");
    });

    sock.ev.on("contacts.upsert", async (contacts) => {
      const existingChats = await storage.getChats();
      for (const contact of contacts) {
        const existingChat = existingChats.find(c => c.jid === contact.id);
        await storage.createOrUpdateChat({
          jid: contact.id || "unknown",
          name: contact.name || contact.notify || contact.verifiedName || existingChat?.name || contact.id || "Unknown Contact",
          unreadCount: 0,
          lastMessageTimestamp: new Date(),
          isGroup: (contact.id || "").endsWith('@g.us'),
        });
      }
      io?.emit("chat_update");
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type === "notify" || type === "append") {
        for (const msg of messages) {
          if (!msg.message) continue;
          
          const jid = msg.key.remoteJid;
          if (!jid || jid === "status@broadcast") continue;

          const content = msg.message.conversation || 
                          msg.message.extendedTextMessage?.text || 
                          msg.message.imageMessage?.caption || "";
          
          let contentType = "text";
          let fileUrl = null;
          let fileName = null;

          if (msg.message.imageMessage) {
            contentType = "image";
            fileName = "image.jpg";
          } else if (msg.message.documentMessage) {
            contentType = "document";
            fileName = msg.message.documentMessage.fileName || "document";
          }

          const existingChat = await storage.getChat(jid);

          // Save message
          const message = await storage.createMessage({
            id: msg.key.id!,
            chatJid: jid,
            senderJid: msg.key.participant || msg.key.remoteJid!,
            senderName: msg.pushName || existingChat?.name || jid,
            content: msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || "",
            contentType: msg.message.imageMessage ? "image" : msg.message.documentMessage ? "document" : "text",
            fileUrl: null,
            fileName: msg.message.documentMessage?.fileName || (msg.message.imageMessage ? "image.jpg" : null),
            timestamp: new Date((msg.messageTimestamp as number) * 1000),
            fromMe: msg.key.fromMe || false,
            status: msg.status === 4 ? "read" : msg.status === 3 ? "delivered" : "sent"
          });

          io?.emit("message_upsert", message);
          io?.emit("chat_update"); // Notify client to refresh chat list
          
          // Auto-reply logic
          if (!msg.key.fromMe) {
            const s = await storage.getSettings();
            if (s.autoReplyEnabled) {
               // Avoid loop: don't reply if the message is exactly the auto-reply message
               if (content !== s.autoReplyMessage) {
                 // Add a small delay to simulate typing
                 setTimeout(async () => {
                   try {
                     console.log("=== AI AUTO-REPLY START ===");
                     console.log("Calling OpenRouter with persona:", s.botPersona);
                     console.log("User message:", content);
                     console.log("API Key exists:", !!process.env.OPENROUTER_API_KEY);
                     console.log("API Key length:", process.env.OPENROUTER_API_KEY?.length || 0);
                     
                     if (!process.env.OPENROUTER_API_KEY) {
                       throw new Error("OPENROUTER_API_KEY not configured");
                     }
                     
                     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                       method: "POST",
                       headers: {
                         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                         "Content-Type": "application/json",
                         "HTTP-Referer": "https://replit.com",
                         "X-Title": "WhatsApp Bot Dashboard"
                       },
                       body: JSON.stringify({
                        "model": "deepseek/deepseek-r1-0528:free",
                        "max_tokens": 500,
                        "messages": [
                          {
                            "role": "system",
                            "content": s.botPersona || "You are a helpful assistant."
                          },
                          {
                            "role": "user",
                            "content": content
                          }
                        ]
                      })
                     });
                     
                     console.log("OpenRouter API Status:", response.status);
                     console.log("OpenRouter Headers:", Object.fromEntries(response.headers.entries()));
                     
                     if (!response.ok) {
                       const errorText = await response.text();
                       console.error("OpenRouter API Error Response:", errorText);
                       throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
                     }
                     
                     const data = await response.json();
                     console.log("OpenRouter Full Response:", JSON.stringify(data, null, 2));
                     
                     const reply = data.choices?.[0]?.message?.content;
                     console.log("Extracted reply:", reply);
                     console.log("Reply length:", reply?.length || 0);
                     
                     if (reply && reply.trim().length > 0) {
                       console.log("✅ AI Reply successful - sending:", reply.substring(0, 100) + "...");
                       await sendMessage(jid, reply);
                     } else {
                       console.warn("⚠️ No content in AI response, falling back to default message");
                       console.log("Default message:", s.autoReplyMessage);
                       await sendMessage(jid, s.autoReplyMessage);
                     }
                     console.log("=== AI AUTO-REPLY END ===");
                   } catch (error) {
                     console.error("❌ Auto-reply Error:", error);
                     console.log("Falling back to default message due to error");
                     console.log("Default message:", s.autoReplyMessage);
                     await sendMessage(jid, s.autoReplyMessage);
                     console.log("=== AI AUTO-REPLY END (WITH ERROR) ===");
                   }
                 }, 1000);
               }
            }
          }
        }
      }
    });

    sock.ev.on("messages.update", async (updates) => {
      for (const { key, update } of updates) {
        if (update.status) {
          const status = update.status === 4 ? "read" : update.status === 3 ? "delivered" : "sent";
          // Update message status in storage
          const messages = await storage.getMessages(key.remoteJid!);
          const msg = messages.find(m => m.id === key.id);
          if (msg) {
            await storage.createMessage({ ...msg, status });
            io?.emit("message_update", { id: key.id, status });
          }
        }
      }
    });

    sock.ev.on("presence.update", async ({ id, presences }) => {
      const jid = id;
      const presence = Object.values(presences)[0];
      const isOnline = presence.lastKnownPresence === "available";
      const isTyping = presence.lastKnownPresence === "composing";
      
      const existingChat = await storage.getChat(jid);
      if (existingChat) {
        await storage.createOrUpdateChat({
          ...existingChat,
          isOnline,
          isTyping,
          lastSeen: isOnline ? new Date() : existingChat.lastSeen
        });
        io?.emit("chat_update");
      }
    });

    console.log('WhatsApp initialization complete');
    connectionState = 'connected';
  } catch (error) {
    console.error('Error initializing WhatsApp:', error);
    isInitializing = false;
    connectionState = 'disconnected';
    io?.emit("status", { status: "disconnected" });
  }
}

// Add function to get current connection state
export function getConnectionState() {
  return connectionState;
}

// Add disconnect function
export function disconnectSocket() {
  console.log('Disconnecting WhatsApp...');
  if (sock) {
    try {
      // Force close the socket connection
      sock.ws?.close();
      sock.ev.removeAllListeners("connection.update");
      sock.ev.removeAllListeners("messages.upsert");
      sock.ev.removeAllListeners("creds.update");
    } catch (error) {
      console.error('Error removing listeners:', error);
    }
    sock = undefined;
    qr = undefined;
  }
  isInitializing = false;
  connectionState = 'disconnected';
  
  // Emit disconnected status to all clients
  if (io) {
    io.emit("status", { status: "disconnected" });
  }
  console.log('WhatsApp disconnected');
}

// Add function to force clear all state
export function forceClearState() {
  console.log('Force clearing all WhatsApp state...');
  
  // Clear reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  // Reset reconnect attempts
  reconnectAttempts = 0;
  
  if (sock) {
    try {
      sock.ws?.close();
      sock.ev.removeAllListeners("connection.update");
      sock.ev.removeAllListeners("messages.upsert");
      sock.ev.removeAllListeners("creds.update");
    } catch (error) {
      console.error('Error removing listeners:', error);
    }
    sock = undefined;
  }
  qr = undefined;
  isInitializing = false;
  connectionState = 'disconnected';
  
  // IMPORTANT: Delete auth info folder to force QR generation on next init
  fs.rm('auth_info_baileys', { recursive: true, force: true }).then(() => {
    console.log('Auth info folder deleted - will require QR scan on next login');
  }).catch((error: any) => {
    console.log('Auth info folder not found or already cleared:', error.message);
  });
  
  // Emit disconnected status to all clients
  if (io) {
    io.emit("status", { status: "disconnected" });
  }
  console.log('All WhatsApp state cleared');
}

export async function deleteMessage(jid: string, messageId: string) {
  if (sock) {
    const key = {
      remoteJid: jid,
      fromMe: true,
      id: messageId
    };
    const sent = await sock.sendMessage(jid, { delete: key });
    
    // In a real database we'd delete the record. In this MemStorage, we'll mark as deleted or remove.
    // For now, let's keep it simple and just rely on the UI update if we were using a real storage.
    // However, our storage is memory-based. Let's update it.
    const messages = await storage.getMessages(jid);
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex >= 0) {
      messages.splice(msgIndex, 1);
    }
    
    io?.emit("chat_update");
    return sent;
  }
  throw new Error("WhatsApp not connected");
}

export async function forwardMessage(jid: string, message: any) {
  if (sock) {
    const sent = await sock.sendMessage(jid, { forward: message });
    return sent;
  }
  throw new Error("WhatsApp not connected");
}

export async function sendMessage(jid: string, content: string, options: { contentType?: string, fileUrl?: string, fileName?: string } = {}) {
  if (sock) {
    let sent;
    if (options.contentType === 'image' && options.fileUrl) {
       sent = await sock.sendMessage(jid, { image: { url: options.fileUrl }, caption: content });
    } else if (options.contentType === 'document' && options.fileUrl) {
       sent = await sock.sendMessage(jid, { 
         document: { url: options.fileUrl }, 
         mimetype: 'application/octet-stream',
         fileName: options.fileName || 'file', 
         caption: content 
       });
    } else {
       sent = await sock.sendMessage(jid, { text: content });
    }
    
    // Manually save sent message to ensure it appears in UI immediately
    if (sent) {
      // Get existing chat to preserve the correct name
      const existingChat = await storage.getChat(jid);
      const chatName = existingChat?.name || "Unknown";
      
      const message = await storage.createMessage({
        id: sent.key.id!,
        chatJid: jid,
        senderJid: sock.user?.id || "me",
        senderName: chatName, // Use chat name instead of "Me"
        content,
        contentType: options.contentType || "text",
        fileUrl: options.fileUrl || null,
        fileName: options.fileName || null,
        timestamp: new Date(),
        fromMe: true,
      });
      
      // Update chat timestamp but preserve existing name
      await storage.createOrUpdateChat({
        jid,
        name: chatName, // Preserve existing name
        lastMessageTimestamp: new Date(),
        lastMessageFromMe: true,
      });
      
      io?.emit("message_upsert", message);
      io?.emit("chat_update"); // Notify client to refresh chat list
    }
    return sent;
  }
  throw new Error("WhatsApp not connected");
}
