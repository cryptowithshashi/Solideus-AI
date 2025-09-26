'use client';

import { useState } from 'react';
import { useChats } from '@/hooks/useChats';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatRelativeTime } from '@/lib/utils';
import { 
  Plus, 
  MessageSquare, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

export function ChatSidebar() {
  const { user } = useWallet();
  const { 
    chats, 
    activeChat, 
    createNewChat, 
    selectChat, 
    renameChat, 
    removeChat,
    isCreatingChat 
  } = useChats();
  
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditStart = (chat: any) => {
    setEditingChatId(chat.chatId);
    setEditingTitle(chat.title);
  };

  const handleEditSave = async (chatId: string) => {
    if (!editingTitle.trim()) {
      toast.error('Chat title cannot be empty');
      return;
    }
    
    try {
      await renameChat(chatId, editingTitle.trim());
      setEditingChatId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleDelete = async (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await removeChat(chatId);
        toast.success('Chat deleted');
      } catch (error) {
        console.error('Failed to delete chat:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Chats</h2>
            <p className="text-xs text-muted-foreground">
              {user?.name || 'Anonymous User'}
            </p>
          </div>
          <Button
            size="sm"
            onClick={createNewChat}
            disabled={isCreatingChat}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery ? 'No chats match your search' : 'No chats yet. Create your first chat!'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.chatId}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
                  activeChat === chat.chatId ? 'bg-accent' : ''
                }`}
                onClick={() => selectChat(chat.chatId)}
              >
                {/* Chat Content */}
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingChatId === chat.chatId ? (
                      // Edit Mode
                      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="h-6 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditSave(chat.chatId);
                            } else if (e.key === 'Escape') {
                              handleEditCancel();
                            }
                          }}
                        />
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            onClick={() => handleEditSave(chat.chatId)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Normal Mode
                      <>
                        <h3 className="text-sm font-medium truncate">{chat.title}</h3>
                        {chat.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(chat.updatedAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {chat.messageCount} messages
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {editingChatId !== chat.chatId && (
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(chat);
                        }}
                        className="h-6 w-6 p-0 hover:bg-background"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(chat.chatId);
                        }}
                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-background/50">
        <Button
          variant="outline"
          size="sm"
          onClick={createNewChat}
          disabled={isCreatingChat}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreatingChat ? 'Creating...' : 'New Chat'}
        </Button>
      </div>
    </div>
  );
}