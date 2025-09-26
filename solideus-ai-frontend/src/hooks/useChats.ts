import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '@/store/chatStore';
import { apiClient } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import { Chat, Message, ProjectFile } from '@/types';
import { toast } from 'sonner';
import { useCallback } from 'react';

export function useChats() {
  const queryClient = useQueryClient();
  const { 
    chats, 
    activeChat, 
    messages, 
    projectFiles,
    setChats, 
    addChat, 
    updateChat, 
    deleteChat,
    setActiveChat,
    setMessages,
    setProjectFiles,
    addMessage
  } = useChatStore();

  // Fetch all chats
  const { isLoading: isLoadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.CHATS);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data.chats;
    },
    onSuccess: (data) => {
      setChats(data);
    },
  });

  // Fetch messages for active chat
  const { isLoading: isLoadingMessages } = useQuery({
    queryKey: ['chat-messages', activeChat],
    queryFn: async () => {
      if (!activeChat) return null;
      
      const response = await apiClient.get(API_ENDPOINTS.CHAT_MESSAGES(activeChat));
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!activeChat,
    onSuccess: (data) => {
      if (data) {
        setMessages(data.messages || []);
        setProjectFiles(data.projectFiles || []);
      }
    },
  });

  // Create new chat
  const createChatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(API_ENDPOINTS.CHATS);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      const newChat: Chat = {
        chatId: data.chatId,
        title: data.title,
        messageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addChat(newChat);
      setActiveChat(data.chatId);
      toast.success('New chat created!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create chat');
    },
  });

  // Update chat title
  const updateChatMutation = useMutation({
    mutationFn: async ({ chatId, title }: { chatId: string; title: string }) => {
      const response = await apiClient.put(`${API_ENDPOINTS.CHATS}/${chatId}/title`, { title });
      if (!response.success) {
        throw new Error(response.error);
      }
      return { chatId, title: response.data.title };
    },
    onSuccess: ({ chatId, title }) => {
      updateChat(chatId, { title });
      toast.success('Chat renamed!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to rename chat');
    },
  });

  // Delete chat
  const deleteChatMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await apiClient.delete(`${API_ENDPOINTS.CHATS}/${chatId}`);
      if (!response.success) {
        throw new Error(response.error);
      }
      return chatId;
    },
    onSuccess: (chatId) => {
      deleteChat(chatId);
      toast.success('Chat deleted!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete chat');
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      chatId, 
      message, 
      transactionHash 
    }: { 
      chatId: string; 
      message: string; 
      transactionHash: string;
    }) => {
      const response = await apiClient.post(API_ENDPOINTS.SEND_MESSAGE(chatId), {
        message,
        transactionHash
      });
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Add the AI response
      if (data.message) {
        addMessage(data.message);
      }
      
      // Update project files if generated
      if (data.projectFiles) {
        setProjectFiles(data.projectFiles);
      }
      
      // Update chat title if changed
      const chat = chats.find(c => c.chatId === activeChat);
      if (chat && data.title && data.title !== chat.title) {
        updateChat(activeChat!, { title: data.title });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  // Helper functions
  const createNewChat = useCallback(() => {
    createChatMutation.mutate();
  }, [createChatMutation]);

  const renameChat = useCallback((chatId: string, title: string) => {
    updateChatMutation.mutate({ chatId, title });
  }, [updateChatMutation]);

  const removeChatById = useCallback((chatId: string) => {
    deleteChatMutation.mutate(chatId);
  }, [deleteChatMutation]);

  const sendMessage = useCallback((message: string, transactionHash: string) => {
    if (!activeChat) return;
    
    // Add user message immediately (optimistic update)
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      transactionHash,
    };
    addMessage(userMessage);
    
    // Send to backend
    sendMessageMutation.mutate({
      chatId: activeChat,
      message,
      transactionHash
    });
  }, [activeChat, addMessage, sendMessageMutation]);

  const selectChat = useCallback((chatId: string) => {
    setActiveChat(chatId);
  }, [setActiveChat]);

  return {
    // State
    chats,
    activeChat,
    messages,
    projectFiles,
    
    // Loading states
    isLoadingChats,
    isLoadingMessages,
    isSendingMessage: sendMessageMutation.isPending,
    isCreatingChat: createChatMutation.isPending,
    
    // Actions
    createNewChat,
    selectChat,
    renameChat,
    removeChat: removeChatById,
    sendMessage,
    
    // Raw mutations (for advanced usage)
    createChatMutation,
    updateChatMutation,
    deleteChatMutation,
    sendMessageMutation,
  };
}
