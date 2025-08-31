import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Users, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateRoomModal } from "@/components/create-room-modal";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { api } from "@/lib/api";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function PublicRooms() {
  const [, setLocation] = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["/api/rooms/public"],
    queryFn: api.getPublicRooms,
  });

  const handleJoinRoom = (roomId: string) => {
    setLocation(`/chat/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-bold">Public Chat Rooms</h2>
              <p className="text-sm text-muted-foreground">Join any active conversation instantly</p>
            </div>
          </div>
          <ThemeSwitcher />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-64 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Active Rooms List */}
        {rooms && (
          <div className="space-y-4 mb-8">
            {rooms.map((room) => (
              <Card key={room.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{room.name}</h3>
                        <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-1"></span>
                          <Users size={12} className="mr-1" />
                          {room.participantCount} online
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock size={12} className="mr-1" />
                        <span>Last activity: {formatDistanceToNow(new Date(room.lastActivity))} ago</span>
                      </div>
                    </div>
                    <Button onClick={() => handleJoinRoom(room.id)}>
                      Join Room
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {rooms.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">No public rooms available</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2" size={16} /> Create First Room
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Create New Room Button */}
        {rooms && rooms.length > 0 && (
          <div className="text-center">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2" size={16} /> Create New Public Room
            </Button>
          </div>
        )}
      </div>

      <CreateRoomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        type="public"
      />
    </div>
  );
}
