import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, BarChart3, Bot, Moon, Sun, Image as ImageIcon, File as FileIcon, Loader2, Bell, BellOff, AtSign, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// Removed Sheet components after replacing Bot & Settings panels with dialogs
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { FilePreview } from './FileUpload';
import { VoiceRecorder, VoiceMessage } from './VoiceRecorder';
import { RoomAnalytics } from './RoomAnalytics';
import { BotManager } from './BotManager';
import { useTheme } from '../contexts/ThemeContext';
import { PushNotifications, registerServiceWorker, triggerLocalNotification } from './PushNotifications';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './ui/dropdown-menu';

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
  onDeleteMessage?: (id: string) => void; // optional delete handler provided by parent
}

export function EnhancedChatInterface({
  roomId,
  username,
  messages,
  onSendMessage,
  participants,
  typingUsers,
  onDeleteMessage
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false); // default muted
  const [swRegistered, setSwRegistered] = useState(false);
  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!swRegistered) {
      registerServiceWorker()?.finally(() => setSwRegistered(true));
    }
  }, [swRegistered]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fire a notification for new incoming messages if enabled and tab not focused
  useEffect(() => {
    if (!notificationsEnabled) return;
    if (!messages.length) return;
    const last = messages[messages.length - 1];
    if (last.username === username) return; // don't notify own messages
    if (document.visibilityState === 'visible' && document.hasFocus()) return; // only when not actively viewing
    // Basic mention prioritization
    const isMention = new RegExp(`@${username.replace(/[-/\\^$*+?.()|[\]{}]/g, '')}\\b`, 'i').test(last.content || '');
    const title = isMention ? `Mentioned by ${last.username}` : `New message in room ${roomId}`;
    const body = last.type === 'text' ? last.content : last.type === 'image' ? `${last.username} sent an image` : last.type === 'voice' ? `${last.username} sent a voice message` : `${last.username} sent a file`;
    triggerLocalNotification(title, body);
  }, [messages, notificationsEnabled, roomId, username]);

  // Mention helpers
  const filteredMentions = () => {
    if (!showMentions) return [] as string[];
    const names = participants.map((p:any)=>p.username).filter((n:string)=> n && n !== username);
    return names.filter((n:string)=> n.toLowerCase().startsWith(mentionQuery.toLowerCase()));
  };

  const detectMention = (value: string, cursor: number) => {
    const slice = value.slice(0, cursor);
    const atPos = slice.lastIndexOf('@');
    if (atPos === -1) { setShowMentions(false); return; }
    const between = slice.slice(atPos + 1);
    if (/\s/.test(between)) { setShowMentions(false); return; }
    if (atPos > 0 && !/\s/.test(slice[atPos-1])) { setShowMentions(false); return; }
    setMentionQuery(between);
    setShowMentions(true);
    setMentionIndex(0);
  };

  const insertMention = (name: string) => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    const cursor = el.selectionStart || 0;
    const value = messageInput;
    const slice = value.slice(0, cursor);
    const atPos = slice.lastIndexOf('@');
    if (atPos === -1) return;
    const before = value.slice(0, atPos);
    const after = value.slice(cursor);
    const insertion = `@${name} `;
    const newVal = before + insertion + after;
    setMessageInput(newVal);
    setShowMentions(false);
    requestAnimationFrame(()=>{
      const pos = before.length + insertion.length;
      el.focus();
      el.setSelectionRange(pos,pos);
    });
  };

  const handleSendMessage = (uploadedFile?: any) => {
    // If a React/DOM event was passed accidentally (from onClick), ignore it
    if (uploadedFile && (uploadedFile.nativeEvent || uploadedFile.target)) {
      uploadedFile = undefined;
    }
    if (showMentions) {
      const list = filteredMentions();
      if (list.length) {
        insertMention(list[mentionIndex]);
        return;
      }
    }
    const fileObj = uploadedFile || selectedFile;
    // Only send if there's text or a real file
    if (!messageInput.trim() && !fileObj) return;

    if (fileObj) {
      // Send file or image message
      const messageType: Message['type'] = fileObj.isImage ? 'image' : 'file';
      const fileData = {
        fileUrl: fileObj.url,
        fileName: fileObj.originalName,
        fileSize: fileObj.size,
        mimeType: fileObj.mimetype
      };
      const message = {
        roomId,
        username,
        content: messageInput.trim() ? messageInput : '',
        type: messageType,
        isEncrypted: false,
        ...fileData
      };
      onSendMessage(message);
      setMessageInput('');
      setSelectedFile(null);
      return;
    }

    // Send text message only
    if (messageInput.trim()) {
      const message = {
        roomId,
        username,
        content: messageInput,
        type: 'text',
        isEncrypted: false
      };
      onSendMessage(message);
      setMessageInput('');
    }
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

  const renderMessage = (message: Message, index: number) => {
  const mentionRegex = new RegExp(`@${username.replace(/[-/\\^$*+?.()|[\]{}]/g, '')}\\b`, 'i');
  const isMention = mentionRegex.test(message.content || '');
  const displayContent = (message.content || '').replace(mentionRegex, (m) => `<span class="text-primary font-semibold">${m}</span>`);

    const isOwnMessage = message.username === username;
    const previous = index > 0 ? messages[index - 1] : null;
    const previousSameUser = previous && previous.username === message.username;
    const previousRecent = previous && Math.abs(new Date(message.timestamp).getTime() - new Date(previous.timestamp).getTime()) < 5 * 60 * 1000; // 5 min window
    const isGroupStart = !(previousSameUser && previousRecent);
    const showUsername = !isOwnMessage && isGroupStart;
  const messageClass = `w-full flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isGroupStart ? 'mt-4' : 'mt-0.5'}`;
    const bubbleBase = 'relative group rounded-2xl px-3 py-2 shadow-sm max-w-[78%] break-words text-sm';
    const bubblePalette = isOwnMessage
      ? 'bg-primary text-primary-foreground rounded-tr-sm'
      : isMention
        ? 'bg-accent text-foreground ring-2 ring-primary/50 rounded-tl-sm'
        : 'bg-muted text-foreground rounded-tl-sm';
    const bubbleGrouped = !isGroupStart && !isOwnMessage ? 'rounded-tl-xl' : '';
    const bubbleGroupedSelf = !isGroupStart && isOwnMessage ? 'rounded-tr-xl' : '';
    const bubbleClass = `${bubbleBase} ${bubblePalette} ${bubbleGrouped} ${bubbleGroupedSelf}`;
    const time = new Date(message.timestamp);
    const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div key={message.id} className={messageClass}>
        {/* Avatar / spacer */}
        {!isOwnMessage && (
          <div className="mr-2 w-8 flex justify-center flex-shrink-0">
            {showUsername ? (
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-semibold select-none">
                {message.username.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="h-8 w-8" />
            )}
          </div>
        )}
        <div className={bubbleClass + ' group relative'}>
          {/* Options menu (all users) */}
          <div className={`absolute top-1 ${isOwnMessage ? 'right-1' : 'right-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1 rounded-md hover:bg-background/30 focus:outline-none focus:ring-1 focus:ring-ring text-xs"
                  aria-label="Message options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'} className="w-40 text-xs">
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(message.content || message.fileUrl || '')}
                >Copy {message.type === 'text' ? 'text' : 'link'}</DropdownMenuItem>
                {message.type === 'text' && (
                  <DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(message, null, 2))}>Copy JSON</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Message body */}
          {message.type === 'system' && (
            <p className="text-xs italic text-center opacity-70">{displayContent}</p>
          )}
          {message.type === 'text' && (
            <div>
              {showUsername && <p className="text-[11px] font-semibold mb-0.5 opacity-80 tracking-wide">{message.username}</p>}
              <pre
                className="leading-relaxed whitespace-pre-wrap break-words font-mono text-[13px]"
                style={{ margin: 0, background: 'none', border: 'none', padding: 0 }}
                dangerouslySetInnerHTML={{ __html: displayContent.replace(/\n/g, '<br/>') }}
              />
            </div>
          )}
          {message.type === 'image' && (
            <div className="space-y-1">
              {showUsername && <p className="text-[11px] font-semibold opacity-80 tracking-wide">{message.username}</p>}
              <div className="relative overflow-hidden rounded-lg group/image">
                <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={message.fileUrl}
                    alt={message.fileName}
                    className="max-h-72 rounded-md object-cover hover:brightness-95 transition"
                    loading="lazy"
                  />
                </a>
                <span className="absolute bottom-1 right-2 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white opacity-90">
                  {timeStr}
                </span>
              </div>
              {message.fileName && <p className="text-[10px] opacity-60">{message.fileName}</p>}
            </div>
          )}
          {message.type === 'file' && (
            <div className="space-y-1">
              {showUsername && <p className="text-[11px] font-semibold opacity-80 tracking-wide">{message.username}</p>}
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
            <div className="space-y-1">
              {showUsername && <p className="text-[11px] font-semibold opacity-80 tracking-wide">{message.username}</p>}
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
                className="text-[11px] underline inline-block opacity-70"
                download={message.fileName}
              >Download voice</a>
            </div>
          )}
          {message.type !== 'image' && (
            <span className="block text-[10px] mt-1 text-right opacity-60 leading-none select-none">{timeStr}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <PushNotifications roomId={roomId} username={username} enabled={notificationsEnabled} />
      {/* Header */}
  <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">
            Room {roomId}
          </h2>
          <span className="text-sm text-muted-foreground">
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

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsEnabled(v => !v)}
            title={notificationsEnabled ? 'Mute notifications' : 'Enable notifications'}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4" />}
          </Button>
          
          {/* Room Analytics Modal */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Room analytics (popup)">
                <BarChart3 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-full p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-2 border-b">
                <DialogTitle>Room analytics</DialogTitle>
                <DialogDescription>Overview of current room activity</DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-6 pt-4 max-h-[70vh] overflow-y-auto">
                <RoomAnalytics roomId={roomId} />
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Bot Manager Modal (converted to dialog like analytics) */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" title="Bot manager (popup)">
                <Bot className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-full p-0 overflow-hidden">
              <DialogHeader className="px-6 pt-6 pb-2 border-b">
                <DialogTitle>Bot manager</DialogTitle>
                <DialogDescription>Manage automated bot responses</DialogDescription>
              </DialogHeader>
              <div className="px-6 pb-6 pt-4 max-h-[70vh] overflow-y-auto">
                <BotManager />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 space-y-2">
  {messages.map((m,i) => renderMessage(m,i))}
        
        {typingUsers.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="bg-muted px-4 py-2 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {typingUsers.join(', ')} typing...
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Input / Attachments Area */}
  <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border p-4 space-y-3">
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
          
          {/* Message Input with @mention autocomplete */}
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={messageInput}
              placeholder={'Type a message (Shift+Enter for new line)'}
              onChange={(e) => {
                setMessageInput(e.target.value);
                const el = e.target as HTMLTextAreaElement;
                detectMention(e.target.value, el.selectionStart || 0);
                // auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={(e) => {
                if (showMentions) {
                  if (e.key === 'ArrowDown') { e.preventDefault(); const list = filteredMentions(); if (list.length) setMentionIndex(i => (i + 1) % list.length); }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); const list = filteredMentions(); if (list.length) setMentionIndex(i => (i - 1 + list.length) % list.length); }
                  else if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') { e.preventDefault(); const list = filteredMentions(); if (list.length) insertMention(list[mentionIndex]); }
                  else if (e.key === 'Escape') { setShowMentions(false); }
                  return;
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              className="pr-2 w-full resize-none bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:cursor-not-allowed disabled:opacity-50 max-h-[200px]"
              style={{ lineHeight: '1.3' }}
            />
            {showMentions && (
              <div className="absolute bottom-full mb-2 left-0 w-56 max-h-56 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md z-40 animate-in fade-in zoom-in-95">
                {filteredMentions().length ? filteredMentions().map((name, idx) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => insertMention(name)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${idx === mentionIndex ? 'bg-accent text-accent-foreground' : ''}`}
                  >
                    {name}
                  </button>
                )) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No matches</div>
                )}
              </div>
            )}
          </div>
          
          {/* Send Message Button */}
          <Button 
            onClick={() => handleSendMessage()} 
            disabled={!messageInput.trim() && !selectedFile}
            title={'Send message'}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Feature Status Bar */}
  <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><Paperclip className="w-3 h-3 mr-1" /> Media</span>
            <span className="flex items-center"><Mic className="w-3 h-3 mr-1" /> Voice</span>
            <span className="flex items-center"><AtSign className="w-3 h-3 mr-1" /> Mention</span>
          </div>
          <div className="text-right">
            {selectedFile && (
              <span className="text-primary">
                File selected: {selectedFile.originalName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
