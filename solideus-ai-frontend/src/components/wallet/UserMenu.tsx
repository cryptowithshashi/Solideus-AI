'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useFees } from '@/hooks/useFees';
import { Button } from '@/components/ui/button';
import { formatAddress, formatEthAmount } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Wallet, 
  History, 
  Settings, 
  LogOut,
  ChevronDown,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';

export function UserMenu() {
  const { user, address, balance, disconnect } = useWallet();
  const { feeInfo } = useFees();

  const handleCopyAddress = async () => {
    if (address) {
      await copyToClipboard(address);
      toast.success('Address copied!');
    }
  };

  const handleViewOnEtherscan = () => {
    if (address) {
      window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 pr-2">
          <div className="w-6 h-6 bg-solideus-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-medium">
              {user?.name || 'Anonymous'}
            </div>
            <div className="text-xs text-muted-foreground">
              {address && formatAddress(address)}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-solideus-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{user?.name || 'Anonymous User'}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {user?.experience || 'beginner'} level
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-mono">
                {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0.0000 ETH'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Address:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-xs">
                  {address && formatAddress(address, 4)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyAddress}
                  className="h-4 w-4 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <DropdownMenuItem onClick={handleCopyAddress}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleViewOnEtherscan}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Etherscan
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <History className="w-4 h-4 mr-2" />
          Transaction History
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}