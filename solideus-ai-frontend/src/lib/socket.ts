import { io, Socket } from 'socket.io-client';
import { JobUpdate } from '@/types';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to job updates
  onJobUpdate(callback: (update: JobUpdate) => void): () => void {
    const socket = this.connect();
    socket.on('job-update', callback);
    
    // Return unsubscribe function
    return () => {
      socket.off('job-update', callback);
    };
  }

  // Subscribe to chat updates
  onChatUpdate(chatId: string, callback: (data: any) => void): () => void {
    const socket = this.connect();
    socket.emit('join-chat', chatId);
    socket.on(`chat-${chatId}`, callback);
    
    return () => {
      socket.emit('leave-chat', chatId);
      socket.off(`chat-${chatId}`, callback);
    };
  }

  // Send chat message with streaming
  sendMessageStream(chatId: string, message: string): void {
    const socket = this.connect();
    socket.emit('send-message', { chatId, message });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketClient = new SocketClient();