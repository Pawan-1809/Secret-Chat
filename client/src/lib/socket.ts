import { io, Socket } from "socket.io-client";
import type { Message, Room, Participant } from "@shared/schema";

export class SocketService {
  private socket: Socket | null = null;
  private callbacks: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const url = import.meta.env.DEV ? "http://localhost:5000" : window.location.origin;
    this.socket = io(url);

    // Set up event listeners
    this.socket.on("connect", () => {
      console.log("Connected to server");
      this.emit("connected");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from server");
      this.emit("disconnected");
    });

    this.socket.on("room-joined", (data: { room: Room; participant: Participant }) => {
      this.emit("room-joined", data);
    });

    this.socket.on("new-message", (message: Message) => {
      this.emit("new-message", message);
    });

    this.socket.on("user-joined", (data: { username: string; participantCount: number }) => {
      this.emit("user-joined", data);
    });

    this.socket.on("user-left", (data: { username: string; participantCount: number }) => {
      this.emit("user-left", data);
    });

    this.socket.on("user-typing", (data: { username: string; isTyping: boolean }) => {
      this.emit("user-typing", data);
    });

    this.socket.on("error", (error: { message: string }) => {
      this.emit("error", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomId: string, username: string) {
    this.socket?.emit("join-room", { roomId, username });
  }

  sendMessage(roomId: string, username: string, content: string, type: string = "text") {
    this.socket?.emit("send-message", { roomId, username, content, type });
  }

  sendTyping(roomId: string, username: string, isTyping: boolean) {
    this.socket?.emit("typing", { roomId, username, isTyping });
  }

  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const callbacks = this.callbacks.get(event) || [];
    callbacks.forEach(callback => callback(data));
  }
}

export const socketService = new SocketService();
