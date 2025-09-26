'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { useChats } from '@/hooks/useChats';
import { useSocket } from '@/hooks/useSocket';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ProjectPanel } from '@/components/project/ProjectPanel';
import { WelcomeScreen } from '@/components/common/WelcomeScreen';
import { OnboardingModal } from '@/components/wallet/OnboardingModal';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, needsOnboarding, user, isConnecting } = useWallet();
  const { activeChat, chats } = useChats();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // Initialize socket connection
  useSocket();

  // Wait before checking authentication
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasCheckedAuth(true);
    }, 3000); // Give 3 seconds for wallet connection

    return () => clearTimeout(timer);
  }, []);

  // Redirect if not authenticated after checking
  useEffect(() => {
    if (hasCheckedAuth && !isAuthenticated && !isConnecting) {
      router.push('/');
    }
  }, [hasCheckedAuth, isAuthenticated, isConnecting, router]);

  // Show loading state while checking authentication
  if (!hasCheckedAuth || (!isAuthenticated && isConnecting)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-4 border-solideus-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to wallet...</p>
        </div>
      </div>
    );
  }

  // Show connect wallet screen if not authenticated
  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your Web3 wallet to access Solideus AI
            </p>
            {/* The ConnectButton in the navbar will handle this */}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <div className="flex h-screen bg-background">
          <div className="w-80 border-r bg-muted/30">
            <ChatSidebar />
          </div>
          <div className="flex-1 flex">
            <div className="flex-1 flex flex-col">
              {activeChat ? <ChatWindow /> : <WelcomeScreen />}
            </div>
            {activeChat && (
              <div className="w-96 border-l bg-muted/10">
                <ProjectPanel />
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
      {needsOnboarding && <OnboardingModal />}
    </>
  );
}