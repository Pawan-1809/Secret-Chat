import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateRoomModal } from "@/components/create-room-modal";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function PrivateRoom() {
  const [, setLocation] = useLocation();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room ID",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      await api.joinRoom(roomId, password || undefined);
      setLocation(`/chat/${roomId}`);
    } catch (error: any) {
      toast({
        title: "Failed to join room",
        description: error.message || "Please check the room ID and password",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-slate-700 mr-4">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-700">Join Private Room</h2>
          </div>
        </div>

        {/* Join Room Form */}
        <Card className="shadow-lg border-gray-100">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Room ID Input */}
              <div>
                <Label htmlFor="roomId" className="text-sm font-medium text-gray-700">
                  Room ID
                </Label>
                <Input
                  id="roomId"
                  type="text"
                  placeholder="Enter room ID..."
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="mt-2"
                />
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="roomPassword" className="text-sm font-medium text-gray-700">
                  Password (if required)
                </Label>
                <Input
                  id="roomPassword"
                  type="password"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="mt-2"
                />
              </div>

              {/* Join Button */}
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleJoinRoom}
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join Room"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Or Create New Room */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Don't have a room ID?</p>
          <Button
            variant="link"
            className="text-blue-500 hover:text-blue-600"
            onClick={() => setShowCreateModal(true)}
          >
            Create New Private Room
          </Button>
        </div>
      </div>

      <CreateRoomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        type="private"
      />
    </div>
  );
}
