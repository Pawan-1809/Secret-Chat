import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatTurn { role: 'user' | 'assistant'; content: string }

export const AIChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([{
    role: 'assistant',
    content: 'Hi! I\'m your AI assistant (Gemini). Ask me anything.'
  }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [history, open]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg: ChatTurn = { role: 'user', content: input.trim() };
    setHistory(h => [...h, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, userMsg].map(m => ({ role: m.role, content: m.content })) })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({message:'error'}));
        throw new Error(err.message || 'AI request failed');
      }
      const data = await res.json();
      const assistant: ChatTurn = { role: 'assistant', content: data.reply };
      setHistory(h => [...h, assistant]);
    } catch (e:any) {
      setHistory(h => [...h, { role: 'assistant', content: 'Error: ' + (e.message || 'failed') }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={()=>setOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 transition text-white flex items-center justify-center"
          title="Open AI Assistant"
        >
          <Sparkles className="h-7 w-7 animate-pulse" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[460px] rounded-2xl border border-border bg-background/95 backdrop-blur shadow-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="px-4 py-3 border-b flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-pink-500/10">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-indigo-500" /> AI Assistant</div>
            <button onClick={()=>setOpen(false)} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {history.map((m,i)=> (
              <div key={i} className={`flex ${m.role==='user' ? 'justify-end' : 'justify-start'}`}>                
                <div className={`${m.role==='user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'} rounded-2xl px-3 py-2 max-w-[75%] whitespace-pre-wrap break-words shadow-sm text-[13px]`}>{m.content}</div>
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground">Thinking...</div>}
          </div>
          <div className="p-3 border-t space-y-2">
            <div className="flex items-center gap-2">
              <Input
                value={input}
                placeholder={loading ? 'Waiting...' : 'Ask anything'}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); sendMessage(); } }}
                disabled={loading}
              />
              <Button size="sm" onClick={sendMessage} disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug">Powered by Gemini. Avoid sharing sensitive personal data.</p>
          </div>
        </div>
      )}
    </>
  );
};
