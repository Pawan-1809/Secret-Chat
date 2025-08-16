import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Copy, LogOut, Send, Paperclip, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export default function ChatRoom() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/chat/:roomId");
  const roomId = params?.roomId;

  const [messageText, setMessageText] = useState("");
  const [username, setUsername] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const {
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
  } = useSocket();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join room on component mount
  useEffect(() => {
    if (!roomId || !match || hasJoined) return;

    const initializeRoom = async () => {
      try {
        // Check URL params
        const urlParams = new URLSearchParams(window.location.search);
        const isCreator = urlParams.get('creator') === 'true';
        const urlUsername = urlParams.get('username');
        
        if (isCreator && urlUsername) {
          // Creator joining their own room - no API call needed
          console.log('Creator joining room directly:', roomId, urlUsername);
          setUsername(decodeURIComponent(urlUsername));
          joinRoom(roomId, decodeURIComponent(urlUsername));
          setHasJoined(true);
          // Clean up URL
          window.history.replaceState({}, '', `/chat/${roomId}`);
        } else if (urlUsername) {
          // User already authenticated via private room page
          console.log('Pre-authenticated user joining room:', roomId, urlUsername);
          setUsername(decodeURIComponent(urlUsername));
          joinRoom(roomId, decodeURIComponent(urlUsername));
          setHasJoined(true);
          // Clean up URL
          window.history.replaceState({}, '', `/chat/${roomId}`);
        } else {
          // Regular join flow for public rooms - make API call
          console.log('Regular user joining room:', roomId);
          const response = await api.joinRoom(roomId);
          setUsername(response.username);
          joinRoom(roomId, response.username);
          setHasJoined(true);
        }
      } catch (error: any) {
        console.error('Failed to join room:', error);
        toast({
          title: "Failed to join room",
          description: error.message,
          variant: "destructive",
        });
        setLocation("/");
      }
    };

    initializeRoom();
  }, [roomId, match, hasJoined, joinRoom]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    sendMessage(messageText.trim());
    setMessageText("");
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(false);
    }, 1000);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setLocation("/");
  };

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast({
        title: "Room ID copied",
        description: "Share this ID with others to invite them",
      });
    }
  };

  const renderMessage = (message: any, index: number) => {
    if (message.type === "system") {
      return (
        <div key={index} className="text-center my-2">
          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      );
    }

    const isOwnMessage = message.username === participant?.username;
    const avatarColor = isOwnMessage ? "bg-blue-500" : "bg-emerald-500";
    const avatar = message.username.charAt(0).toUpperCase();

    return (
      <div key={index} className="flex space-x-3">
        <div className={`w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 text-sm">{message.username}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(message.timestamp))} ago
            </span>
          </div>
          <Card className="bg-white p-3 shadow-sm border-gray-100">
            <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
          </Card>
        </div>
      </div>
    );
  };

  if (!match || !roomId) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="text-gray-500 hover:text-slate-700 md:hidden"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-slate-700">
              {currentRoom?.name || "Loading..."}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <Users size={12} className="mr-1" />
                {participantCount} online
              </span>
              <span>{currentRoom?.type === "private" ? "Private Room" : "Public Room"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {currentRoom?.type === "private" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyRoomId}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <Copy size={16} className="mr-1" />
              Copy ID
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLeaveRoom}
            className="hidden md:flex bg-red-100 hover:bg-red-200 text-red-700"
          >
            <LogOut size={16} className="mr-1" />
            Leave
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message, index) => renderMessage(message, index))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message Input */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-blue-500 p-2"
              onClick={() => toast({ title: "File upload coming soon!" })}
            >
              <Paperclip size={20} />
            </Button>

            <div className="flex-1 relative">
              <Textarea
                placeholder="Type your message..."
                value={messageText}
                onChange={handleMessageChange}
                onKeyPress={handleKeyPress}
                rows={1}
                className="resize-none min-h-[44px] max-h-32"
              />
            </div>

            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white p-3"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send size={16} />
            </Button>
          </div>

          {/* Typing Indicator */}
          <div className="mt-2 h-4">
            {typingUsers.length > 0 && (
              <p className="text-xs text-gray-500">
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
