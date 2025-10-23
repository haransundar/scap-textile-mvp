'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import apiClient from '@/lib/api/client';
import { Send, Mic, Plus } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m Linky, your SCAP AI assistant. How can I help you with compliance or certification questions today?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useComplexReasoning, setUseComplexReasoning] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/chat', {
        message: userMessage.content,
        conversation_id: 'default',
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I\'m sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Image 
              src="/linky-full.png" 
              alt="Linky AI Assistant" 
              width={64} 
              height={64}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Linky - AI Compliance Assistant</h1>
              <p className="text-sm text-muted-foreground mt-1">Your friendly AI helper for compliance questions</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={useComplexReasoning}
              onChange={(e) => setUseComplexReasoning(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label className="text-sm text-muted-foreground">
              Use Complex Reasoning (DeepSeek-R1)
            </label>
            <span className="text-xs text-primary ml-2 cursor-pointer hover:underline">
              + fast response mode
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
          {/* Messages */}
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 flex-shrink-0">
                    <Image 
                      src="/linky-avatar.png" 
                      alt="Linky" 
                      width={32} 
                      height={32}
                      className="rounded-full"
                    />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className="text-xs mt-2 opacity-60">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary-foreground text-sm font-medium">U</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8">
                  <Image 
                    src="/linky-avatar.png" 
                    alt="Linky" 
                    width={32} 
                    height={32}
                    className="rounded-full animate-pulse"
                  />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="mt-4 flex items-center gap-2 bg-card rounded-lg border border-border p-2">
          <button className="p-2 text-muted-foreground hover:text-foreground transition">
            <Plus className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message in English..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground px-2"
          />
          <button 
            className="p-2 text-muted-foreground hover:text-foreground transition"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition">
            <Mic className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-3">
          Tip: Click the microphone to record your question, or type it above.
        </p>
      </div>
    </div>
  );
}
