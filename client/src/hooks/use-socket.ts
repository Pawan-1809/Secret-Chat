import { useEffect, useRef, useState } from "react";
import { socketService } from "@/lib/socket";
import type { Message, Room, Participant, RoomWithParticipants } from "@shared/schema";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    socketService.connect();

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    
    const handleRoomJoined = (data: { room: RoomWithParticipants; participant: Participant }) => {
      setCurrentRoom(data.room);
      setParticipant(data.participant);
      setMessages(data.room.messages || []);
      setParticipantCount(data.room.participantCount);
    };

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserJoined = (data: { username: string; participantCount: number }) => {
      setParticipantCount(data.participantCount);
    };

    const handleUserLeft = (data: { username: string; participantCount: number }) => {
      setParticipantCount(data.participantCount);
    };

    const handleUserTyping = (data: { username: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.username), data.username]);
        
        // Clear existing timeout for this user
        const existingTimeout = typingTimeouts.current.get(data.username);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }
        
        // Set new timeout
        const timeout = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.username));
          typingTimeouts.current.delete(data.username);
        }, 3000);
        
        typingTimeouts.current.set(data.username, timeout);
      } else {
        setTypingUsers(prev => prev.filter(u => u !== data.username));
        const timeout = typingTimeouts.current.get(data.username);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeouts.current.delete(data.username);
        }
      }
    };

    socketService.on("connected", handleConnected);
    socketService.on("disconnected", handleDisconnected);
    socketService.on("room-joined", handleRoomJoined);
    socketService.on("new-message", handleNewMessage);
    socketService.on("user-joined", handleUserJoined);
    socketService.on("user-left", handleUserLeft);
    socketService.on("user-typing", handleUserTyping);

    return () => {
      socketService.off("connected", handleConnected);
      socketService.off("disconnected", handleDisconnected);
      socketService.off("room-joined", handleRoomJoined);
      socketService.off("new-message", handleNewMessage);
      socketService.off("user-joined", handleUserJoined);
      socketService.off("user-left", handleUserLeft);
      socketService.off("user-typing", handleUserTyping);
      
      // Clear all typing timeouts
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, []);

  const joinRoom = (roomId: string, username: string) => {
    socketService.joinRoom(roomId, username);
  };

  const sendMessage = (content: string, type: string = "text") => {
    if (currentRoom && participant) {
      socketService.sendMessage(currentRoom.id, participant.username, content, type);
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (currentRoom && participant) {
      socketService.sendTyping(currentRoom.id, participant.username, isTyping);
    }
  };

  const leaveRoom = () => {
    socketService.disconnect();
    setCurrentRoom(null);
    setParticipant(null);
    setMessages([]);
    setParticipantCount(0);
    setTypingUsers([]);
  };

  return {
    isConnected,
    currentRoom,
    participant,
    messages,
    participantCount,
    typingUsers,
    joinRoom,
    sendMessage,
    sendTyping,
    leaveRoom,
  };
}
