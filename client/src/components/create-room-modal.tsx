import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { InsertRoom } from "@shared/schema";

interface CreateRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "public" | "private";
}

export function CreateRoomModal({ open, onOpenChange, type = "public" }: CreateRoomModalProps) {
  const [, setLocation] = useLocation();
  const [roomName, setRoomName] = useState("");
  const [useCustomName, setUseCustomName] = useState(false);
  const [roomType, setRoomType] = useState(type);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Auto-generate room name
  const generateRoomName = () => {
    const adjectives = ["Awesome", "Cool", "Fun", "Epic", "Great", "Super", "Amazing", "Brilliant"];
    const nouns = ["Chat", "Room", "Space", "Hub", "Lounge", "Corner", "Zone", "Place"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 100);
    return `${randomAdj} ${randomNoun} ${randomNum}`;
  };

  // Set auto-generated name when modal opens
  useEffect(() => {
    if (open && !useCustomName) {
      setRoomName(generateRoomName());
    }
  }, [open, useCustomName]);

  const createRoomMutation = useMutation({
    mutationFn: (room: InsertRoom) => api.createRoom(room),
    onSuccess: (result) => {
      toast({
        title: "Room created successfully!",
        description: `Room "${result.room.name}" has been created.`,
      });
      
      // Invalidate public rooms cache
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/public"] });
      
      // Navigate to the new room with creator flag
      setLocation(`/chat/${result.room.id}?creator=true&username=${result.username}`);
      onOpenChange(false);
      
      // Reset form
      setRoomName("");
      setPassword("");
      setUseCustomName(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create room",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalRoomName = useCustomName ? roomName.trim() : (roomName || generateRoomName());
    
    if (!finalRoomName) {
      toast({
        title: "Error",
        description: "Room name is required",
        variant: "destructive",
      });
      return;
    }

    createRoomMutation.mutate({
      name: finalRoomName,
      type: roomType,
      password: roomType === "private" && password ? password : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-700">
            Create New Room
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium text-gray-700">
                Room Name
              </Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useCustomName"
                  checked={useCustomName}
                  onChange={(e) => {
                    setUseCustomName(e.target.checked);
                    if (!e.target.checked) {
                      setRoomName(generateRoomName());
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor="useCustomName" className="text-xs text-gray-600">
                  Custom name
                </Label>
              </div>
            </div>
            <Input
              id="roomName"
              type="text"
              placeholder={useCustomName ? "Enter custom room name..." : "Auto-generated"}
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={!useCustomName}
              className={`mt-1 ${!useCustomName ? 'bg-gray-50 text-gray-600' : ''}`}
            />
            {!useCustomName && (
              <p className="text-xs text-gray-500 mt-1">
                A unique room name will be auto-generated
              </p>
            )}
          </div>

          {/* Room Type */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Room Type</Label>
            <RadioGroup
              value={roomType}
              onValueChange={(value: "public" | "private") => setRoomType(value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="text-gray-700">Public Room</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="text-gray-700">Private Room</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Password (for private rooms) */}
          {roomType === "private" && (
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password (Optional)
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
              />
            </div>
          )}

          {/* Create Button */}
          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={createRoomMutation.isPending}
          >
            {createRoomMutation.isPending ? "Creating..." : "Create Room"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
