import { useAccount, useConnect, useDisconnect, useSignMessage, useBalance } from 'wagmi';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';
import { useCallback, useEffect, useRef } from 'react';

export function useWallet() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { data: balance } = useBalance({ address });
  
  const { user, setUser, setLoading, logout } = useAuthStore();
  const didMount = useRef(false);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (didMount.current) {
      if (isConnected && address && !user) {
        handleAuthentication();
      }
    } else {
      didMount.current = true;
    }
  }, [isConnected, address, user]);

  const handleAuthentication = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Step 1: Get nonce
      const nonceResponse = await apiClient.post(API_ENDPOINTS.AUTH_NONCE, {
        walletAddress: address
      });
      
      if (!nonceResponse.success) {
        throw new Error(nonceResponse.error || 'Failed to get nonce');
      }
      
      const { nonce, message } = nonceResponse.data;
      
      // Step 2: Sign message
      const signature = await signMessageAsync({ message });
      
      // Step 3: Verify signature and authenticate
      const authResponse = await apiClient.post(API_ENDPOINTS.AUTH_CONNECT, {
        walletAddress: address,
        signature,
        nonce
      });
      
      if (!authResponse.success) {
        throw new Error(authResponse.error || 'Authentication failed');
      }
      
      const { user: authenticatedUser } = authResponse.data;
      setUser(authenticatedUser);
      
      if (authenticatedUser.needsOnboarding) {
        toast.info('Welcome! Please complete your profile setup.');
      } else {
        toast.success('Successfully authenticated!');
      }
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
      await handleDisconnect();
    } finally {
      setLoading(false);
    }
  }, [address, signMessageAsync, setUser, setLoading]);

  const handleConnect = useCallback(async (connectorId?: string) => {
    try {
      const connector = connectorId 
        ? connectors.find(c => c.id === connectorId)
        : connectors[0]; // Default to first available connector
      
      if (connector) {
        await connect({ connector });
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    }
  }, [connect, connectors]);

  const handleDisconnect = useCallback(async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
      logout();
      disconnect();
      toast.success('Disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      // Still disconnect locally even if API call fails
      logout();
      disconnect();
    }
  }, [disconnect, logout]);

  const handleOnboarding = useCallback(async (data: {
    name: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    projectType?: string;
  }) => {
    try {
      setLoading(true);
      
      const response = await apiClient.post('/api/auth/onboarding', data);
      
      if (!response.success) {
        throw new Error(response.error || 'Onboarding failed');
      }
      
      const { user: updatedUser } = response.data;
      setUser(updatedUser);
      toast.success('Profile setup completed!');
      
      return true;
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  return {
    // Wallet state
    address,
    isConnected: isConnected && !!user,
    chainId,
    balance: balance?.formatted,
    isConnecting,
    
    // Auth state
    user,
    isAuthenticated: !!user,
    needsOnboarding: user?.needsOnboarding || false,
    
    // Actions
    connect: handleConnect,
    disconnect: handleDisconnect,
    authenticate: handleAuthentication,
    completeOnboarding: handleOnboarding,
    
    // Available connectors
    connectors,
  };
}
