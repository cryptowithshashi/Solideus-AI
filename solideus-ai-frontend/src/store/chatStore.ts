import { create } from 'zustand';
import { Chat, Message, ProjectFile } from '@/types';

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  messages: Message[];
  projectFiles: ProjectFile[];
  isLoading: boolean;
  
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  setActiveChat: (chatId: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setProjectFiles: (files: ProjectFile[]) => void;
  updateProjectFile: (fileName: string, updates: Partial<ProjectFile>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  projectFiles: [],
  isLoading: false,
  
  setChats: (chats) => set({ chats }),
  
  addChat: (chat) => set((state) => ({
    chats: [chat, ...state.chats]
  })),
  
  updateChat: (chatId, updates) => set((state) => ({
    chats: state.chats.map(chat => 
      chat.chatId === chatId ? { ...chat, ...updates } : chat
    )
  })),
  
  deleteChat: (chatId) => set((state) => ({
    chats: state.chats.filter(chat => chat.chatId !== chatId),
    activeChat: state.activeChat === chatId ? null : state.activeChat,
    messages: state.activeChat === chatId ? [] : state.messages,
    projectFiles: state.activeChat === chatId ? [] : state.projectFiles,
  })),
  
  setActiveChat: (chatId) => set({ activeChat: chatId }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setProjectFiles: (projectFiles) => set({ projectFiles }),
  
  updateProjectFile: (fileName, updates) => set((state) => ({
    projectFiles: state.projectFiles.map(file => 
      file.fileName === fileName ? { ...file, ...updates } : file
    )
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  reset: () => set({
    chats: [],
    activeChat: null,
    messages: [],
    projectFiles: [],
    isLoading: false,
  }),
}));