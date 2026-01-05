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

export function getSocket() {
  return sock;
}

export function getQr() {
  return qr;
}

export function getStatus() {
  if (!sock) return "disconnected";
  // Rough approximation
  return qr ? "connecting" : "connected";
}

export function getUser() {
  return sock?.user ? { id: sock.user.id, name: sock.user.name } : undefined;
}

export async function initWhatsapp(socketIO: SocketIOServer) {
  io = socketIO;
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

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr: qrCode } = update;
    
    if (qrCode) {
      qr = qrCode;
      io?.emit("qr", { qr });
      io?.emit("status", { status: "connecting" });
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      
      io?.emit("status", { status: "disconnected" });
      qr = undefined;
      
      if (shouldReconnect) {
        initWhatsapp(socketIO);
      }
    } else if (connection === "open") {
      io?.emit("status", {
        status: "connected",
        user: {
          id: sock?.user?.id || "unknown",
          name: sock?.user?.name || "WhatsApp User",
        },
      });
      qr = undefined;
    }
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

        // Save chat if not exists
        await storage.createOrUpdateChat({
          jid,
          name: msg.pushName || jid,
          lastMessageTimestamp: new Date((msg.messageTimestamp as number) * 1000),
          unreadCount: 0,
        });

        // Save message
        const message = await storage.createMessage({
          id: msg.key.id!,
          chatJid: jid,
          senderJid: msg.key.participant || msg.key.remoteJid!,
          senderName: msg.pushName,
          content,
          timestamp: new Date((msg.messageTimestamp as number) * 1000),
          fromMe: msg.key.fromMe || false,
        });

        io?.emit("message_upsert", message);

        // Auto-reply logic
        if (!msg.key.fromMe) {
          const s = await storage.getSettings();
          if (s.autoReplyEnabled) {
             // Avoid loop: don't reply if the message is exactly the auto-reply message
             if (content !== s.autoReplyMessage) {
               // Add a small delay to simulate typing
               setTimeout(async () => {
                 await sendMessage(jid, s.autoReplyMessage);
               }, 1000);
             }
          }
        }
      }
    }
  });
}

export async function sendMessage(jid: string, content: string) {
  if (sock) {
    const sent = await sock.sendMessage(jid, { text: content });
    
    // Manually save sent message to ensure it appears in UI immediately
    if (sent) {
      const message = await storage.createMessage({
        id: sent.key.id!,
        chatJid: jid,
        senderJid: sock.user?.id || "me",
        senderName: "Me",
        content,
        timestamp: new Date(),
        fromMe: true,
      });
      
      // Update chat timestamp
      await storage.createOrUpdateChat({
        jid,
        lastMessageTimestamp: new Date(),
      });
      
      io?.emit("message_upsert", message);
    }
    return sent;
  }
  throw new Error("WhatsApp not connected");
}
