import { useEffect, useRef, useCallback } from 'react';
import { socketClient } from '@/lib/socket';
import { JobUpdate } from '@/types';
import { toast } from 'sonner';
import { useChatStore } from '@/store/chatStore';

export function useSocket() {
  const isConnected = useRef(false);
  const { updateProjectFile, activeChat } = useChatStore();

  useEffect(() => {
    // Connect to socket
    socketClient.connect();
    isConnected.current = true;

    // Listen for job updates
    const unsubscribeJobs = socketClient.onJobUpdate((update: JobUpdate) => {
      handleJobUpdate(update);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeJobs();
      socketClient.disconnect();
      isConnected.current = false;
    };
  }, []);

  const handleJobUpdate = useCallback((update: JobUpdate) => {
    console.log('Job update received:', update);
    
    switch (update.jobType) {
      case 'fee-verification':
        if (update.status === 'completed') {
          toast.success('Payment verified! ✅');
        } else if (update.status === 'failed') {
          toast.error('Payment verification failed');
        }
        break;
        
      case 'code-analysis':
        if (update.status === 'completed' && update.result) {
          const { fileName, analysisResults } = update.result;
          if (fileName && analysisResults) {
            updateProjectFile(fileName, {
              scanStatus: analysisResults.score > 70 ? 'safe' : 'issues',
              slitherResults: analysisResults
            });
            
            const score = analysisResults.score;
            if (score > 85) {
              toast.success(`Code analysis completed! Security score: ${score}/100 ✅`);
            } else if (score > 70) {
              toast.warning(`Code analysis completed! Security score: ${score}/100 ⚠️`);
            } else {
              toast.error(`Code analysis found issues! Security score: ${score}/100 🚨`);
            }
          }
        } else if (update.status === 'failed') {
          toast.error('Code analysis failed');
        }
        break;
        
      case 'deployment':
        if (update.status === 'completed') {
          toast.success('Contract deployed successfully! 🚀');
        } else if (update.status === 'failed') {
          toast.error('Contract deployment failed');
        }
        break;
    }
  }, [updateProjectFile]);

  const subscribeToChat = useCallback((chatId: string, callback: (data: any) => void) => {
    return socketClient.onChatUpdate(chatId, callback);
  }, []);

  return {
    isConnected: isConnected.current,
    subscribeToChat,
    sendMessageStream: socketClient.sendMessageStream.bind(socketClient),
  };
}