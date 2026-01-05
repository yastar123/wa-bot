import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { Server as SocketIOServer } from "socket.io";
import { initWhatsapp, getQr, getStatus, getUser, sendMessage } from "./baileys";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Initialize WhatsApp
  initWhatsapp(io);

  io.on("connection", (socket) => {
    console.log("Client connected");
    
    // Send current status on connection
    const status = getStatus();
    const qr = getQr();
    const user = getUser();
    
    if (status === "connecting" && qr) {
      socket.emit("qr", { qr });
    }
    
    socket.emit("status", { status, user });
  });

  // API Routes
  app.get(api.status.get.path, (req, res) => {
    const status = getStatus();
    const qr = getQr();
    const user = getUser();
    res.json({ status, user, qr });
  });

  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input);
      res.json(settings);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json(err.errors);
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.chats.list.path, async (req, res) => {
    const chats = await storage.getChats();
    res.json(chats);
  });

  app.get(api.chats.getMessages.path, async (req, res) => {
    const { jid } = req.params;
    const messages = await storage.getMessages(jid);
    res.json(messages);
  });

  app.post(api.messages.send.path, async (req, res) => {
    try {
      const { jid, content } = api.messages.send.input.parse(req.body);
      await sendMessage(jid, content);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  return httpServer;
}
