import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { insertRoomSchema, insertMessageSchema, insertParticipantSchema } from "@shared/schema";
import { z } from "zod";

function generateUsername(): string {
  const adjectives = ["Anonymous", "Coding", "Random", "Silent", "Quick", "Clever", "Smart", "Cool"];
  const nouns = ["Coder", "User", "Dev", "Hacker", "Programmer", "Ninja", "Master", "Guru"];
  const number = Math.floor(Math.random() * 1000);
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}_${noun}_${number}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // REST API Routes
  
  // Get public rooms
  app.get("/api/rooms/public", async (req, res) => {
    try {
      const rooms = await storage.getPublicRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch public rooms" });
    }
  });

  // Get room details
  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoomWithParticipants(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch room" });
    }
  });

  // Create room
  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      
      // Generate a username for the creator and return join info
      const username = generateUsername();
      res.status(201).json({ 
        room, 
        username,
        isCreator: true 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid room data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create room" });
    }
  });

  // Join room (validate password if private)
  app.post("/api/rooms/:id/join", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const { password, isCreator } = req.body;
      
      // Skip password check if user is the creator joining for the first time
      if (room.type === "private" && room.password && !isCreator) {
        if (password !== room.password) {
          return res.status(401).json({ message: "Invalid password" });
        }
      }

      const username = generateUsername();
      res.json({ success: true, username });
    } catch (error) {
      res.status(500).json({ message: "Failed to join room" });
    }
  });

  // Socket.IO for real-time communication
  io.on("connection", (socket) => {
    console.log("✅ Socket.IO: User connected:", socket.id);

    socket.on("join-room", async (data) => {
      try {
        const { roomId, username } = data;
        
        // Join socket room
        socket.join(roomId);
        
        // Add participant to storage
        const participant = await storage.addParticipant({
          roomId,
          username,
          socketId: socket.id
        });

        // Get updated room info
        const room = await storage.getRoomWithParticipants(roomId);
        
        // Notify room about new participant
        socket.to(roomId).emit("user-joined", {
          username,
          participantCount: room?.participantCount || 0
        });

        // Send room data to user
        socket.emit("room-joined", {
          room,
          participant
        });

        // Send system message
        const systemMessage = await storage.addMessage({
          roomId,
          username: "System",
          content: `${username} joined the room`,
          type: "system"
        });

        io.to(roomId).emit("new-message", systemMessage);

      } catch (error) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("send-message", async (data) => {
      try {
        const messageData = insertMessageSchema.parse(data);
        const message = await storage.addMessage(messageData);
        
        // Broadcast message to room
        io.to(messageData.roomId).emit("new-message", message);
        
      } catch (error) {
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("user-typing", {
        username: data.username,
        isTyping: data.isTyping
      });
    });

    socket.on("disconnect", async () => {
      console.log("❌ Socket.IO: User disconnected:", socket.id);
      
      try {
        // Remove participant and notify room
        const participant = await storage.removeParticipantBySocket(socket.id);
        
        if (participant) {
          const room = await storage.getRoomWithParticipants(participant.roomId);
          
          // Notify room about user leaving
          socket.to(participant.roomId).emit("user-left", {
            username: participant.username,
            participantCount: room?.participantCount || 0
          });

          // Send system message
          const systemMessage = await storage.addMessage({
            roomId: participant.roomId,
            username: "System",
            content: `${participant.username} left the room`,
            type: "system"
          });

          socket.to(participant.roomId).emit("new-message", systemMessage);
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

  return httpServer;
}
