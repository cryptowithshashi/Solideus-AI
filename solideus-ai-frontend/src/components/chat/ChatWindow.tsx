'use client';

import { useEffect, useRef } from 'react';
import { useChats } from '@/hooks/useChats';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Loader2 } from 'lucide-react';

export function ChatWindow() {
  const { messages, activeChat, isLoadingMessages } = useChats();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChat) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex-shrink-0 border-b bg-background/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Chat</h2>
            <p className="text-sm text-muted-foreground">
              Generate smart contracts with AI
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-center">
            <div>
              <p className="text-muted-foreground mb-2">No messages yet.</p>
              <p className="text-sm text-muted-foreground">
                Start by describing what kind of smart contract you'd like to create.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t bg-background/50">
        <MessageInput />
      </div>
    </div>
  );
}
