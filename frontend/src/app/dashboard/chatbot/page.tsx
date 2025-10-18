'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import apiClient from '@/lib/api/client';
import { useI18n } from '@/lib/i18n/i18n-provider';
import VoiceRecorder from '@/components/voice-recorder';

type Locale = 'en' | 'ta' | 'hi';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isReasoning?: boolean;
}

export default function ChatbotPage() {
  const { locale } = useI18n();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your SCAP AI assistant. How can I help you with compliance or certification questions today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Locale>(locale as Locale);
  const [useReasoning, setUseReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const res = await apiClient.post('/api/chat/message', {
        message: messageText,
        language,
        use_reasoning: useReasoning,
        chat_history: messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.content }))
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: res.data.response,
        sender: 'bot',
        timestamp: new Date(),
        isReasoning: useReasoning,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleVoiceTranscription = async (text: string) => {
    setInput(text);
    // Optionally auto-send after transcription
    // await sendMessage(text);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label htmlFor="language" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Language:
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Locale)}
                className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-1 pl-2 pr-8 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Reasoning Toggle */}
        <div className="flex items-center space-x-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-2">
          <input
            type="checkbox"
            id="reasoning"
            checked={useReasoning}
            onChange={(e) => setUseReasoning(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="reasoning" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Use Complex Reasoning (DeepSeek-R1)
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {useReasoning ? '🧠 Detailed analysis mode' : '⚡ Fast response mode'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg bg-white dark:bg-gray-800 p-4 shadow">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-blue-100 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700">
                  <div className="relative h-full w-full">
                    <Image 
                      src="/branding/mascot/linky-avatar.png" 
                      alt="Linky the SCAP Assistant"
                      fill
                      sizes="32px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.sender === 'user' 
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 rounded-tr-none' 
                    : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100 rounded-tl-none'
                } ${
                  message.sender === 'user'
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : message.isReasoning
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-gray-900 dark:text-white border-2 border-purple-300 dark:border-purple-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {message.isReasoning && (
                  <div className="mb-2 flex items-center text-xs text-purple-600 dark:text-purple-400">
                    <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    DeepSeek Reasoning
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`mt-1 text-right text-xs ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
                useReasoning 
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-700' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 dark:bg-gray-400"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 dark:bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-500 dark:bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  {useReasoning && (
                    <span className="text-xs text-purple-600 dark:text-purple-400">Analyzing deeply...</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="mt-4">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Type your message in ${language === 'en' ? 'English' : language === 'ta' ? 'Tamil' : 'Hindi'}...`}
                className="flex-1 rounded-l-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="inline-flex items-center rounded-r-md border border-transparent bg-blue-600 dark:bg-blue-700 px-4 py-2 text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 dark:disabled:bg-blue-900"
                disabled={isLoading || !input.trim()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Voice Recorder */}
          <VoiceRecorder
            onTranscription={handleVoiceTranscription}
            language={language}
            disabled={isLoading}
          />
        </div>
        
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 Tip: Click the microphone to record your question, or type it above. 
          {useReasoning && ' Complex reasoning mode will provide detailed analysis.'}
        </p>
      </form>
    </div>
  );
}