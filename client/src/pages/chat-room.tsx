import { useEffect, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Copy, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { EnhancedChatInterface } from "@/components/EnhancedChatInterface";

export default function ChatRoom() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/chat/:roomId");
  const roomId = params?.roomId;

  const [username, setUsername] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
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
    sendMessageFull,
    sendTyping,
    leaveRoom,
  } = useSocket();

  // Scrolling is handled inside EnhancedChatInterface

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

  const handleSendMessage = (message: any) => {
    if (message.fileUrl || message.type !== 'text') {
      sendMessageFull({
        content: message.content,
        type: message.type,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileSize: message.fileSize,
        mimeType: message.mimeType,
        isEncrypted: message.isEncrypted,
      });
    } else {
      sendMessage(message.content, message.type);
    }
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

  if (!match || !roomId || !hasJoined || !username) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Joining room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header with Leave Button */}
  <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveRoom}
            className="text-gray-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft size={20} />
            <span className="ml-2 hidden sm:inline">Leave</span>
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-slate-700 dark:text-gray-200">
              {currentRoom?.name || `Room ${roomId}`}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
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
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              <Copy size={16} className="mr-1" />
              Copy ID
            </Button>
          )}
        </div>
      </header>

      {/* Enhanced Chat Interface */}
      <div className="flex-1">
        <EnhancedChatInterface
          roomId={roomId}
          username={username}
          messages={messages.map(msg => ({
            ...msg,
            id: msg.id || `${msg.timestamp}-${msg.username}`,
            timestamp: new Date(msg.timestamp),
            fileUrl: msg.fileUrl ?? undefined,
            fileName: msg.fileName ?? undefined,
            fileSize: msg.fileSize ?? undefined,
            mimeType: msg.mimeType ?? undefined,
            isEncrypted: msg.isEncrypted ?? undefined,
          }))}
          onSendMessage={handleSendMessage}
          participants={[{ username, id: username }]}
          typingUsers={typingUsers}
        />
      </div>
    </div>
  );
}
