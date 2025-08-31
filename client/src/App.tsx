import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "@/pages/home";
import PublicRooms from "@/pages/public-rooms";
import PrivateRoom from "@/pages/private-room";
import ChatRoom from "@/pages/chat-room";
import NotFound from "@/pages/not-found";
// i18n removed

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/public-rooms" component={PublicRooms} />
      <Route path="/private-room" component={PrivateRoom} />
      <Route path="/chat/:roomId" component={ChatRoom} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Push notifications removed

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
