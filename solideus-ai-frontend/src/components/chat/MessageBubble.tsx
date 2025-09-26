'use client';

import { useState } from 'react';
import { Message } from '@/types';
import { Button } from '@/components/ui/button';
import { formatRelativeTime, copyToClipboard } from '@/lib/utils';
import { 
  User, 
  Bot, 
  Copy, 
  Check, 
  ExternalLink,
  AlertTriangle,
  Code2
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async (text: string) => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const openEtherscan = (txHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${txHash}`, '_blank');
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-solideus-primary rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-2xl ${isUser ? 'order-first' : ''}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'Solideus AI'}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(message.timestamp)}
          </span>
          {message.gasFeePaid && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle className="w-3 h-3" />
              <span>{parseFloat(message.gasFeePaid).toFixed(6)} ETH</span>
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-solideus-primary text-white'
              : 'bg-muted border'
          }`}
        >
          {isUser ? (
            // User message - plain text
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            // AI message - markdown with syntax highlighting
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    if (!inline && language) {
                      return (
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground font-mono">
                              {language}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(String(children))}
                              className="h-6 px-2"
                            >
                              {copied ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={language}
                            PreTag="div"
                            className="rounded-md text-sm"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    
                    return (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Transaction Link */}
        {message.transactionHash && (
          <div className="mt-2 flex items-center justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openEtherscan(message.transactionHash!)}
              className="h-6 px-2 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Transaction
            </Button>
          </div>
        )}

        {/* Action Buttons for AI Messages */}
        {!isUser && (
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(message.content)}
              className="h-6 px-2 text-xs"
            >
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              Copy
            </Button>
            {message.content.includes('contract') && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
              >
                <Code2 className="w-3 h-3 mr-1" />
                View Files
              </Button>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}