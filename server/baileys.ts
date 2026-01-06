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

let sock: WASocket | undefined;
let io: SocketIOServer | undefined;
let qr: string | undefined;

// Add global variable to track initialization
let isInitializing = false;

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
  if (isInitializing) {
    console.log('WhatsApp already initializing, skipping...');
    return;
  }
  
  isInitializing = true;
  connectionState = 'connecting';
  console.log('Initializing WhatsApp...');
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
          // Add delay before reconnect to allow UI to update
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            initWhatsapp(socketIO);
          }, 2000);
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
        
        // Load existing chats when connection opens
        await loadExistingChats();
      }
    });

    // Sync History & Contacts
    sock.ev.on("messaging-history.set", async ({ chats: initialChats, messages: initialMessages, contacts, isLatest }) => {
      console.log(`Syncing history: ${initialChats.length} chats, ${initialMessages.length} messages, ${contacts.length} contacts`);
      
      for (const contact of contacts) {
        await storage.createOrUpdateChat({
          jid: contact.id || "unknown",
          name: contact.name || contact.notify || contact.verifiedName || contact.id || "Unknown Contact",
          unreadCount: 0,
          lastMessageTimestamp: new Date(),
        });
      }

      for (const chat of initialChats) {
        await storage.createOrUpdateChat({
          jid: chat.id,
          name: chat.name || chat.id,
          unreadCount: chat.unreadCount || 0,
          lastMessageTimestamp: new Date(chat.conversationTimestamp ? (Number(chat.conversationTimestamp) * 1000) : Date.now()),
        });
      }

      for (const msg of initialMessages) {
        if (!msg.message) continue;
        const jid = msg.key.remoteJid;
        if (!jid) continue;

        const content = msg.message.conversation || 
                        msg.message.extendedTextMessage?.text || 
                        msg.message.imageMessage?.caption || "";

        await storage.createMessage({
          id: msg.key.id!,
          chatJid: jid,
          senderJid: msg.key.participant || msg.key.remoteJid!,
          senderName: msg.pushName || null,
          content,
          timestamp: new Date((msg.messageTimestamp as number) * 1000),
          fromMe: msg.key.fromMe || false,
        });
      }
      
      io?.emit("chat_update");
    });

    sock.ev.on("contacts.upsert", async (contacts) => {
      for (const contact of contacts) {
        await storage.createOrUpdateChat({
          jid: contact.id || "unknown",
          name: contact.name || contact.notify || contact.verifiedName || contact.id || "Unknown Contact",
          unreadCount: 0,
          lastMessageTimestamp: new Date(),
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

          const content =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";

          if (!content) continue;

          // Get existing chat to preserve name
          const existingChat = await storage.getChat(jid);
          const chatName = msg.pushName || existingChat?.name || jid;

          // Save chat if not exists
          await storage.createOrUpdateChat({
            jid,
            name: chatName,
            lastMessageTimestamp: new Date((msg.messageTimestamp as number) * 1000),
            unreadCount: 0,
          });

          // Save message
          const message = await storage.createMessage({
            id: msg.key.id!,
            chatJid: jid,
            senderJid: msg.key.participant || msg.key.remoteJid!,
            senderName: msg.pushName || existingChat?.name || jid,
            content,
            timestamp: new Date((msg.messageTimestamp as number) * 1000),
            fromMe: msg.key.fromMe || false,
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
                     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                       method: "POST",
                       headers: {
                         "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                         "Content-Type": "application/json"
                       },
                       body: JSON.stringify({
                         "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                         "messages": [
                           {
                             "role": "user",
                             "content": content
                           }
                         ]
                       })
                     });
                     const data = await response.json();
                     const reply = data.choices?.[0]?.message?.content || s.autoReplyMessage;
                     await sendMessage(jid, reply);
                   } catch (error) {
                     console.error("OpenRouter Error:", error);
                     await sendMessage(jid, s.autoReplyMessage);
                   }
                 }, 1000);
               }
            }
          }
        }
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
  
  // Emit disconnected status to all clients
  if (io) {
    io.emit("status", { status: "disconnected" });
  }
  console.log('All WhatsApp state cleared');
}

export async function sendMessage(jid: string, content: string) {
  if (sock) {
    const sent = await sock.sendMessage(jid, { text: content });
    
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
        timestamp: new Date(),
        fromMe: true,
      });
      
      // Update chat timestamp but preserve existing name
      await storage.createOrUpdateChat({
        jid,
        name: chatName, // Preserve existing name
        lastMessageTimestamp: new Date(),
      });
      
      io?.emit("message_upsert", message);
      io?.emit("chat_update"); // Notify client to refresh chat list
    }
    return sent;
  }
  throw new Error("WhatsApp not connected");
}
