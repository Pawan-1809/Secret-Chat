import { apiRequest } from "./queryClient";
import type { InsertRoom, PublicRoomSummary, RoomWithParticipants } from "@shared/schema";

export const api = {
  // Get public rooms
  getPublicRooms: async (): Promise<PublicRoomSummary[]> => {
    const res = await apiRequest("GET", "/api/rooms/public");
    return res.json();
  },

  // Get room details
  getRoom: async (id: string): Promise<RoomWithParticipants> => {
    const res = await apiRequest("GET", `/api/rooms/${id}`);
    return res.json();
  },

  // Create room
  createRoom: async (room: InsertRoom) => {
    const res = await apiRequest("POST", "/api/rooms", room);
    return res.json();
  },

  // Join room
  joinRoom: async (roomId: string, password?: string) => {
    const res = await apiRequest("POST", `/api/rooms/${roomId}/join`, { password });
    return res.json();
  },
};
