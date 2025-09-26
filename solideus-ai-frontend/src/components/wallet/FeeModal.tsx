'use client';

import { useState } from 'react';
import { useSendTransaction, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { useFees } from '@/hooks/useFees';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Zap, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: (transactionHash: string) => void;
  message: string;
}

export function FeeModal({ isOpen, onClose, onConfirmed, message }: FeeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { address } = useAccount();
  const { feeInfo, isLoadingFeeInfo } = useFees();
  const { sendTransaction } = useSendTransaction();

  const handleConfirmPayment = async () => {
    if (!feeInfo || !address) {
      toast.error('Fee information not available');
      return;
    }

    setIsProcessing(true);
    try {
      // Send transaction
      const hash = await sendTransaction({
        to: feeInfo.treasuryAddress as `0x${string}`,
        value: parseEther(feeInfo.feeAmount),
      });

      if (hash) {
        toast.success('Payment sent! Processing your request...');
        onConfirmed(hash);
      }
    } catch (error: any) {
      console.error('Payment failed:', error);
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingFeeInfo) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading fee information...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-solideus-primary" />
            Confirm Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Message Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Your message:</p>
            <p className="text-sm font-medium line-clamp-3">{message}</p>
          </div>

          {/* Fee Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">AI Generation Fee:</span>
              <span className="font-medium">{feeInfo?.feeAmount || '0.001'} ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Network:</span>
              <span className="font-medium">Sepolia Testnet</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Treasury Address:</span>
              <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                {feeInfo?.treasuryAddress?.slice(0, 6)}...
                {feeInfo?.treasuryAddress?.slice(-4)}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium mb-1">Important:</p>
              <p>This payment will be processed on Sepolia testnet. Make sure you have sufficient testnet ETH.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            variant="solideus"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Pay & Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}