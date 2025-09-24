"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchWithAuth, useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/use-toast';
import { ChatMessage } from '@/types/chat';
import { MessageSquare } from 'lucide-react';

interface LoadChatProps {
  loadId: string;
  disabled?: boolean; // disable input when chat closed
  className?: string;
}

export const LoadChat: React.FC<LoadChatProps> = ({ loadId, disabled = false, className }) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [since, setSince] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  };

  const fetchMessages = useCallback(async () => {
    if (!loadId) return;
    try {
      setLoading(true);
      const url = since ? `/api/loads/${loadId}/chat?since=${encodeURIComponent(since)}` : `/api/loads/${loadId}/chat`;
      const res = await fetchWithAuth(url);
      if (!res.ok) {
        if (res.status === 400) {
          // Chat might be closed
          return;
        }
        throw new Error('Failed to fetch messages');
      }
      const data = await res.json();
      if (data.messages?.length) {
        setMessages(prev => [...prev, ...data.messages!]);
        const last = data.messages[data.messages.length - 1];
        setSince(last.createdAt);
        scrollToBottom();
      } else if (!since) {
        // initial load with empty
        setMessages([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loadId, since]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const res = await fetchWithAuth(`/api/loads/${loadId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send');
      }
      const data = await res.json();
      if (data.messages?.length) {
        setMessages(prev => [...prev, ...data.messages]);
        const last = data.messages[data.messages.length - 1];
        setSince(last.createdAt);
        scrollToBottom();
      }
      setInput('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to send';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="py-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Load Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64 overflow-y-auto border rounded-md p-3 bg-muted/30 space-y-3">
          {messages.length === 0 && !loading && (
            <div className="text-center text-xs text-gray-500">No messages yet</div>
          )}
          {messages.map(m => {
            const isMine = m.senderId === user?._id;
            return (
              <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm shadow ${isMine ? 'bg-primary text-primary-foreground' : 'bg-white border'}`}>
                  <div className="whitespace-pre-wrap break-words">{m.message}</div>
                  <div className="mt-1 text-[10px] opacity-70 text-right">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder={disabled ? 'Chat closed' : 'Type a message...'}
            value={input}
            disabled={disabled || sending}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <Button onClick={handleSend} disabled={disabled || sending || !input.trim()}>
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadChat;
