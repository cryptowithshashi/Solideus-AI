'use client';

import { useState } from 'react';
import { useChats } from '@/hooks/useChats';
import { useFees } from '@/hooks/useFees';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FeeModal } from '@/components/wallet/FeeModal';
import { PROJECT_TEMPLATES } from '@/lib/constants';
import { Send, Loader2, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const { sendMessage, isSendingMessage } = useChats();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    // Store the message and show fee modal
    setPendingMessage(message.trim());
    setShowFeeModal(true);
  };

  const handleFeeConfirmed = (transactionHash: string) => {
    if (pendingMessage) {
      sendMessage(pendingMessage, transactionHash);
      setMessage('');
      setPendingMessage('');
    }
    setShowFeeModal(false);
  };

  const handleFeeCancel = () => {
    setPendingMessage('');
    setShowFeeModal(false);
  };

  const insertTemplate = (template: typeof PROJECT_TEMPLATES[0]) => {
    setMessage(template.prompt);
  };

  const isDisabled = isSendingMessage || !message.trim();

  return (
    <>
      <div className="p-4">
        {/* Template Suggestions */}
        {!message && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Quick templates:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {PROJECT_TEMPLATES.slice(0, 3).map((template) => (
                <Button
                  key={template.id}
                  size="sm"
                  variant="outline"
                  onClick={() => insertTemplate(template)}
                  className="flex-shrink-0 text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {template.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the smart contract you want to create..."
              disabled={isSendingMessage}
              className="resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={isDisabled}
            variant="solideus"
            className="px-4"
          >
            {isSendingMessage ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </form>

        {/* Fee Info */}
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>~0.001 ETH per message</span>
          </div>
          <span>Sepolia testnet</span>
        </div>
      </div>

      {/* Fee Confirmation Modal */}
      <FeeModal
        isOpen={showFeeModal}
        onClose={handleFeeCancel}
        onConfirmed={handleFeeConfirmed}
        message={pendingMessage}
      />
    </>
  );
}
