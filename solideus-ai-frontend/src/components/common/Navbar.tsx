'use client';

import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { UserMenu } from '@/components/wallet/UserMenu';
import { Code, Home } from 'lucide-react';

export function Navbar() {
  const { isAuthenticated } = useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-solideus-primary rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Solideus AI</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </header>
  );
}