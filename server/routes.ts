import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { Server as SocketIOServer } from "socket.io";
import { initWhatsapp, getQr, getStatus, getUser, sendMessage, getSocket, disconnectSocket, forceClearState } from "./baileys";

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
    const statusObj = getStatus();
    const qr = getQr();
    
    if (statusObj.status === "connecting" && qr) {
      socket.emit("qr", { qr });
    }
    
    socket.emit("status", { status: statusObj.status, user: statusObj.user });
  });

  // API Routes
  app.get(api.status.get.path, (req, res) => {
    const statusObj = getStatus();
    const qr = getQr();
    res.json({ status: statusObj.status, user: statusObj.user, qr });
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
      const { jid, content, contentType, fileUrl, fileName } = api.messages.send.input.parse(req.body);
      await sendMessage(jid, content, { contentType, fileUrl, fileName });
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Disconnect endpoint
  app.post('/api/disconnect', async (req, res) => {
    try {
      forceClearState();
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to disconnect" });
    }
  });

  // Reconnect endpoint
  app.post('/api/reconnect', async (req, res) => {
    try {
      console.log('Manual reconnect requested...');
      
      // Clear auth info to force QR generation
      const fs = await import('fs/promises');
      try {
        await fs.rm('auth_info_baileys', { recursive: true, force: true });
        console.log('Auth info cleared, forcing QR generation');
      } catch (error) {
        console.log('Auth info folder not found or already cleared');
      }
      
      // Force clear all state
      forceClearState();
      
      // Wait a bit then reconnect
      setTimeout(() => {
        if (io) {
          console.log('Starting new WhatsApp initialization...');
          initWhatsapp(io);
        }
      }, 3000);
      
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to reconnect" });
    }
  });

  return httpServer;
}
