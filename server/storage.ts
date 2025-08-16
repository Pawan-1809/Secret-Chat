import { type Room, type InsertRoom, type Message, type InsertMessage, type Participant, type InsertParticipant, type RoomWithParticipants, type PublicRoomSummary } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Room methods
  createRoom(room: InsertRoom): Promise<Room>;
  getRoom(id: string): Promise<Room | undefined>;
  getRoomWithParticipants(id: string): Promise<RoomWithParticipants | undefined>;
  getPublicRooms(): Promise<PublicRoomSummary[]>;
  updateRoomActivity(id: string): Promise<void>;
  updateParticipantCount(roomId: string, count: number): Promise<void>;
  deleteRoom(id: string): Promise<void>;
  
  // Message methods
  addMessage(message: InsertMessage): Promise<Message>;
  getRoomMessages(roomId: string, limit?: number): Promise<Message[]>;
  
  // Participant methods
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  removeParticipant(id: string): Promise<void>;
  removeParticipantBySocket(socketId: string): Promise<void>;
  getRoomParticipants(roomId: string): Promise<Participant[]>;
  updateParticipantSocket(participantId: string, socketId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, Room>;
  private messages: Map<string, Message[]>;
  private participants: Map<string, Participant>;
  private roomParticipants: Map<string, Set<string>>; // roomId -> participantIds

  constructor() {
    this.rooms = new Map();
    this.messages = new Map();
    this.participants = new Map();
    this.roomParticipants = new Map();
    
    // Initialize with some default public rooms
    this.initializeDefaultRooms();
  }

  private async initializeDefaultRooms() {
    const defaultRooms = [
      { name: "General Discussion", type: "public" as const, password: null },
      { name: "Code Help", type: "public" as const, password: null },
      { name: "Random Chat", type: "public" as const, password: null }
    ];

    for (const roomData of defaultRooms) {
      await this.createRoom(roomData);
    }
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID().slice(0, 8); // Short ID for easy sharing
    const room: Room = {
      ...insertRoom,
      id,
      createdAt: new Date(),
      participantCount: 0,
      lastActivity: new Date(),
    };
    
    this.rooms.set(id, room);
    this.messages.set(id, []);
    this.roomParticipants.set(id, new Set());
    
    return room;
  }

  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomWithParticipants(id: string): Promise<RoomWithParticipants | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const participantIds = this.roomParticipants.get(id) || new Set();
    const participants = Array.from(participantIds)
      .map(pid => this.participants.get(pid))
      .filter(Boolean) as Participant[];
    
    const messages = this.messages.get(id) || [];

    return {
      ...room,
      participants,
      messages: messages.slice(-50), // Return last 50 messages
    };
  }

  async getPublicRooms(): Promise<PublicRoomSummary[]> {
    return Array.from(this.rooms.values())
      .filter(room => room.type === "public")
      .map(room => ({
        id: room.id,
        name: room.name,
        participantCount: room.participantCount,
        lastActivity: room.lastActivity,
      }))
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  async updateRoomActivity(id: string): Promise<void> {
    const room = this.rooms.get(id);
    if (room) {
      room.lastActivity = new Date();
    }
  }

  async updateParticipantCount(roomId: string, count: number): Promise<void> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participantCount = count;
    }
  }

  async deleteRoom(id: string): Promise<void> {
    this.rooms.delete(id);
    this.messages.delete(id);
    this.roomParticipants.delete(id);
  }

  async addMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };

    const roomMessages = this.messages.get(insertMessage.roomId) || [];
    roomMessages.push(message);
    this.messages.set(insertMessage.roomId, roomMessages);

    // Update room activity
    await this.updateRoomActivity(insertMessage.roomId);

    return message;
  }

  async getRoomMessages(roomId: string, limit = 50): Promise<Message[]> {
    const messages = this.messages.get(roomId) || [];
    return messages.slice(-limit);
  }

  async addParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = randomUUID();
    const participant: Participant = {
      ...insertParticipant,
      id,
      joinedAt: new Date(),
    };

    this.participants.set(id, participant);
    
    const roomParticipants = this.roomParticipants.get(insertParticipant.roomId) || new Set();
    roomParticipants.add(id);
    this.roomParticipants.set(insertParticipant.roomId, roomParticipants);

    // Update participant count
    await this.updateParticipantCount(insertParticipant.roomId, roomParticipants.size);

    return participant;
  }

  async removeParticipant(id: string): Promise<void> {
    const participant = this.participants.get(id);
    if (!participant) return;

    this.participants.delete(id);
    
    const roomParticipants = this.roomParticipants.get(participant.roomId);
    if (roomParticipants) {
      roomParticipants.delete(id);
      await this.updateParticipantCount(participant.roomId, roomParticipants.size);
    }
  }

  async removeParticipantBySocket(socketId: string): Promise<void> {
    const participant = Array.from(this.participants.values())
      .find(p => p.socketId === socketId);
    
    if (participant) {
      await this.removeParticipant(participant.id);
    }
  }

  async getRoomParticipants(roomId: string): Promise<Participant[]> {
    const participantIds = this.roomParticipants.get(roomId) || new Set();
    return Array.from(participantIds)
      .map(id => this.participants.get(id))
      .filter(Boolean) as Participant[];
  }

  async updateParticipantSocket(participantId: string, socketId: string): Promise<void> {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.socketId = socketId;
    }
  }
}

export const storage = new MemStorage();
