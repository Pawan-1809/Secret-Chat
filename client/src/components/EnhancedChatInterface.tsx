import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Settings, BarChart3, Bot, Moon, Sun, Image as ImageIcon, File as FileIcon, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { FilePreview } from './FileUpload';
import { VoiceRecorder, VoiceMessage } from './VoiceRecorder';
import { RoomAnalytics } from './RoomAnalytics';
import { BotManager } from './BotManager';
import { useTheme } from '../contexts/ThemeContext';

interface Message {
  id: string;
  username: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  isEncrypted?: boolean;
  timestamp: Date;
}

interface EnhancedChatInterfaceProps {
  roomId: string;
  username: string;
  messages: Message[];
  onSendMessage: (message: any) => void;
  participants: any[];
  typingUsers: string[];
}

export function EnhancedChatInterface({
  roomId,
  username,
  messages,
  onSendMessage,
  participants,
  typingUsers
}: EnhancedChatInterfaceProps) {
  const { theme, toggleTheme } = useTheme();
  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMediaMenu, setShowMediaMenu] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (uploadedFile?: any) => {
    const fileObj = uploadedFile || selectedFile;
    if (!messageInput.trim() && !fileObj) return;

    let messageContent = messageInput;
    let messageType: Message['type'] = 'text';
    let fileData: any = null;

    if (fileObj) {
      messageType = fileObj.isImage ? 'image' : 'file';
      fileData = {
        fileUrl: fileObj.url,
        fileName: fileObj.originalName,
        fileSize: fileObj.size,
        mimeType: fileObj.mimetype
      };
      if (!messageInput.trim()) {
        messageContent = fileObj.originalName;
      }
    }

    const message = {
      roomId,
      username,
      content: messageContent,
      type: messageType,
      isEncrypted: false,
      ...fileData
    };

    onSendMessage(message);
    setMessageInput('');
    setSelectedFile(null);
  };

  const handleVoiceRecording = async (audioBlob: Blob, duration: number) => {
    // Upload voice blob so others can access it
  const formData = new FormData();
  // Provide explicit filename with .webm extension
  formData.append('file', new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' }));
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) {
        let msg = 'Voice upload failed';
        try { msg = (await res.json()).message || msg; } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      const file = data.file;
      const message = {
        roomId,
        username,
        content: `Voice message (${Math.floor(duration)}s)`,
        type: 'voice',
        fileUrl: file.url,
        fileName: file.originalName || file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        duration,
      } as any;
      onSendMessage(message);
    } catch (e) {
      console.error(e);
      alert('Failed to upload voice message');
    } finally {
      setShowVoiceRecorder(false);
    }
  };

  const renderMessage = (message: Message) => {
  const displayContent = message.content;

    const isOwnMessage = message.username === username;
    const messageClass = `flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`;
    const bubbleClass = `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
      isOwnMessage 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
    }`;

    return (
      <div key={message.id} className={messageClass}>
        <div className={bubbleClass}>
          {message.type === 'system' && (
            <p className="text-sm italic text-center text-gray-500">{displayContent}</p>
          )}
          
          {message.type === 'text' && (
            <div>
              <p className="text-sm font-medium mb-1">{message.username}</p>
              <p>{displayContent}</p>
            </div>
          )}
          
          {message.type === 'image' && (
            <div>
              <p className="text-sm font-medium mb-2">{message.username}</p>
              <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                <img 
                  src={message.fileUrl} 
                  alt={message.fileName}
                  className="max-w-full h-auto rounded cursor-pointer hover:opacity-90 transition"
                  loading="lazy"
                />
              </a>
              <p className="text-xs mt-1 opacity-75">{message.fileName}</p>
            </div>
          )}
          
          {message.type === 'file' && (
            <div>
              <p className="text-sm font-medium mb-2">{message.username}</p>
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                download={message.fileName}
              >
                <FilePreview 
                  file={{
                    originalName: message.fileName || '',
                    filename: message.fileName || '',
                    mimetype: message.mimeType || '',
                    size: message.fileSize || 0,
                    url: message.fileUrl || '',
                    isImage: false
                  }}
                />
              </a>
            </div>
          )}
          
          {message.type === 'voice' && (
            <div>
              <p className="text-sm font-medium mb-2">{message.username}</p>
              <VoiceMessage
                audioUrl={message.fileUrl || ''}
                duration={(message as any).duration || 0}
                username={message.username}
                timestamp={message.timestamp}
              />
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline mt-1 inline-block opacity-75"
                download={message.fileName}
              >Download voice</a>
            </div>
          )}
          
          <p className="text-xs mt-1 opacity-75">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Room {roomId}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {participants.length} participants
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Dark Mode Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          
          {/* Room Analytics Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" title="Room analytics">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Room analytics</SheetTitle>
                <SheetDescription>View room statistics and usage data</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <RoomAnalytics roomId={roomId} />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Bot Manager Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" title="Bot manager">
                <Bot className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Bot manager</SheetTitle>
                <SheetDescription>Manage automated bot responses</SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <BotManager />
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Settings Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" title="Settings">
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
                <SheetDescription>Manage room settings and features</SheetDescription>
              </SheetHeader>
              <Tabs defaultValue="analytics" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="analytics">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="bot">
                    <Bot className="w-4 h-4 mr-2" />
                    Bot
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="analytics" className="mt-4">
                  <RoomAnalytics roomId={roomId} />
                </TabsContent>
                <TabsContent value="bot" className="mt-4">
                  <BotManager />
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(renderMessage)}
        
        {typingUsers.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {typingUsers.join(', ')} typing...
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Input / Attachments Area */}
      <div className="sticky bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
        {selectedFile && (
          <FilePreview
            file={selectedFile}
            onRemove={() => setSelectedFile(null)}
          />
        )}
        {showVoiceRecorder && (
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
          />
        )}
        <div className="flex items-center space-x-2">
          {/* Hidden inputs for image & file */}
          <input
            ref={imageInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setShowMediaMenu(false);
              setIsUploading(true);
              const formData = new FormData();
              formData.append('file', file);
              try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                setSelectedFile(data.file);
                if (!messageInput.trim()) {
                  handleSendMessage(data.file);
                }
              } catch (err) {
                console.error('Upload error:', err);
                alert('Upload failed. Please try again.');
              } finally {
                setIsUploading(false);
                if (imageInputRef.current) imageInputRef.current.value = '';
              }
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xls,.xlsx"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setShowMediaMenu(false);
              setIsUploading(true);
              const formData = new FormData();
              formData.append('file', file);
              try {
                const res = await fetch('/api/upload', { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                setSelectedFile(data.file);
                if (!messageInput.trim()) {
                  handleSendMessage(data.file);
                }
              } catch (err) {
                console.error('Upload error:', err);
                alert('Upload failed. Please try again.');
              } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMediaMenu(v => !v)}
              disabled={isUploading}
              title="Add media"
            >
              {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Paperclip className="w-4 h-4 mr-1" />}
              Media
            </Button>
            {showMediaMenu && !isUploading && (
              <div
                className="absolute z-30 bottom-full mb-2 w-44 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1 animate-in fade-in slide-in-from-bottom-1"
              >
                <button
                  className="flex w-full items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => { setShowMediaMenu(false); imageInputRef.current?.click(); }}
                >
                  <ImageIcon className="w-4 h-4" /> Image
                </button>
                <button
                  className="flex w-full items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => { setShowMediaMenu(false); fileInputRef.current?.click(); }}
                >
                  <FileIcon className="w-4 h-4" /> File
                </button>
              </div>
            )}
          </div>
          
          {/* Voice Recording Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
            className={showVoiceRecorder ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : ''}
            title={showVoiceRecorder ? 'Stop recording' : 'Start voice recording'}
          >
            <Mic className="w-4 h-4" />
          </Button>
          
          {/* Message Input */}
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={'Type a message'}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          
          {/* Send Message Button */}
          <Button 
            onClick={handleSendMessage} 
            disabled={!messageInput.trim() && !selectedFile}
            title={'Send message'}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Feature Status Bar */}
  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Paperclip className="w-3 h-3 mr-1" /> Media
            </span>
            <span className="flex items-center">
              <Mic className="w-3 h-3 mr-1" /> Voice
            </span>
          </div>
          <div className="text-right">
            {selectedFile && (
              <span className="text-blue-600 dark:text-blue-400">
                File selected: {selectedFile.originalName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
