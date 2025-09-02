import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui/button';

interface ChatTurn { role: 'user' | 'assistant'; content: string }

export const AIChatFloating: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatTurn[]>([{
    role: 'assistant',
    content: "Hi! I'm your AI helper (Gemini). Ask me anything."
  }]);
  const [full, setFull] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [open, history]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatTurn = { role: 'user', content: input.trim() };
    setHistory(h=>[...h, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.concat(userMsg) }) });
      if (!res.ok) {
        let extra = '';
        try {
          const body = await res.json();
          extra = body?.message ? ` (${body.message}${body.status ? ' '+body.status : ''})` : '';
        } catch {}
        // If 503 maybe not configured
        if (res.status === 503) {
          const statusRes = await fetch('/api/ai/status').then(r=>r.json()).catch(()=>({configured:false}));
          if (!statusRes.configured) extra += ' - API key not configured on server';
        }
        throw new Error('AI request failed'+extra);
      }
      const data = await res.json();
      setHistory(h=>[...h, { role: 'assistant', content: data.reply || 'No reply' }]);
    } catch (e:any) {
      setHistory(h=>[...h, { role: 'assistant', content: 'Error: '+ e.message }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {!open && (
        <button
          onClick={()=>setOpen(true)}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg shadow-primary/30 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
      {open && (
        <div
          className={
            full
              ? "fixed inset-0 w-screen h-screen flex flex-col bg-background border-t border-border md:rounded-none z-[60]"
              : "fixed bottom-6 right-6 w-80 max-w-[90vw] h-96 flex flex-col rounded-xl border border-border bg-background shadow-xl overflow-hidden animate-in fade-in zoom-in-95 z-[60]"
          }
        >
          <div
            className={
              "flex items-center justify-between px-4 py-2 border-b bg-muted/50 select-none" +
              (full ? " cursor-default" : "")
            }
            onDoubleClick={()=>setFull(f=>!f)}
          >
            <span className="font-medium text-sm">AI Assistant</span>
            <div className="flex items-center gap-1">
              <button
                onClick={()=>setFull(f=>!f)}
                className="p-1 hover:bg-muted rounded-md"
                aria-label={full ? 'Exit full screen' : 'Full screen'}
                title={full ? 'Exit full screen' : 'Full screen'}
              >
                {full ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={()=>{setOpen(false); setFull(false);}} className="p-1 hover:bg-muted rounded-md" aria-label="Close" title="Close"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm">
            {history.map((m,i)=>(
              <div key={i} className={m.role==='user' ? 'text-right' : 'text-left'}>
                <div className={m.role==='user' ? 'inline-block bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap' : 'inline-block bg-muted rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap'}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground">Thinking...</div>}
          </div>
          <form onSubmit={e=>{e.preventDefault(); send();}} className="p-3 border-t bg-background flex gap-2">
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-1 text-sm px-3 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm" disabled={loading || !input.trim()} className="gap-1">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};
