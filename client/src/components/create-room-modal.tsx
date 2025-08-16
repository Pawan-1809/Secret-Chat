import { useState } from "react";
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
  const [roomType, setRoomType] = useState(type);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRoomMutation = useMutation({
    mutationFn: (room: InsertRoom) => api.createRoom(room),
    onSuccess: (room) => {
      toast({
        title: "Room created successfully!",
        description: `Room "${room.name}" has been created.`,
      });
      
      // Invalidate public rooms cache
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/public"] });
      
      // Navigate to the new room
      setLocation(`/chat/${room.id}`);
      onOpenChange(false);
      
      // Reset form
      setRoomName("");
      setPassword("");
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
    
    if (!roomName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room name",
        variant: "destructive",
      });
      return;
    }

    createRoomMutation.mutate({
      name: roomName.trim(),
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
            <Label htmlFor="roomName" className="text-sm font-medium text-gray-700">
              Room Name
            </Label>
            <Input
              id="roomName"
              type="text"
              placeholder="Enter room name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="mt-2"
              required
            />
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
