import { Link } from "wouter";
import { MessageCircle, Lock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateRoomModal } from "@/components/create-room-modal";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useState } from "react";
import { AIChatWidget } from "@/components/AIChatWidget";

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<"public" | "private">("public");

  const handleCreateRoom = (type: "public" | "private") => {
    setCreateType(type);
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-end mb-4">
          <ThemeSwitcher />
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <MessageCircle className="inline-block mr-3 text-primary" size={48} />
            Code Bhej
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Anonymous, instant chat rooms. No signup required. Share code, ideas, or just chat away.
          </p>
        </div>

        {/* Main Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Public Chat Option */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/10">
                <MessageCircle className="text-2xl text-primary" size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Public Chat Rooms</h3>
              <p className="text-muted-foreground mb-6">Join active public conversations instantly. See what others are discussing.</p>
              <Link href="/public-rooms">
                <Button className="w-full">Browse Public Rooms</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Private Chat Option */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary/10">
                <Lock className="text-2xl text-primary" size={32} />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Private Chat Rooms</h3>
              <p className="text-muted-foreground mb-6">Create or join private rooms with unique IDs. Password protection available.</p>
              <Link href="/private-room">
                <Button className="w-full">Join Private Room</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Create Room */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4">
            <Button variant="outline" onClick={() => handleCreateRoom("public")}>
              <Plus className="mr-2" size={16} /> Create Public Room
            </Button>
            <span className="text-gray-400">or</span>
            <Button variant="outline" onClick={() => handleCreateRoom("private")}>
              <Plus className="mr-2" size={16} /> Create Private Room
            </Button>
          </div>
        </div>
      </div>

        {/* AI Chatbot floating widget (landing page only) */}
        <AIChatWidget />

      <CreateRoomModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        type={createType}
      />
    </div>
  );
}
