const Chat = require('../models/Chat');
const { nanoid } = require('nanoid');
const logger = require('../utils/logger');

class ChatService {
    static async getChats(walletAddress) {
        try {
            const chats = await Chat.find({ walletAddress })
                .select('chatId title createdAt updatedAt messages')
                .sort({ updatedAt: -1 })
                .limit(50);

            return chats.map(chat => {
                const lastMessage = chat.messages[chat.messages.length - 1];
                return {
                    chatId: chat.chatId,
                    title: chat.title,
                    messageCount: chat.messages.length,
                    lastMessage: lastMessage?.content?.substring(0, 100),
                    lastMessageTime: lastMessage?.timestamp,
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt
                };
            });
        } catch (error) {
            logger.error('Get chats error:', error);
            throw new Error('Failed to fetch chats');
        }
    }

    static async createChat(walletAddress) {
        try {
            const chatId = nanoid(16);
            const chat = new Chat({
                chatId,
                walletAddress,
                title: 'New Chat'
            });

            await chat.save();
            
            logger.info('New chat created:', { chatId, walletAddress });
            
            return { chatId, title: chat.title };
        } catch (error) {
            logger.error('Create chat error:', error);
            throw new Error('Failed to create chat');
        }
    }

    static async updateChatTitle(chatId, walletAddress, title) {
        try {
            const chat = await Chat.findOneAndUpdate(
                { chatId, walletAddress },
                { title: title.trim(), updatedAt: new Date() },
                { new: true }
            );

            if (!chat) {
                throw new Error('Chat not found');
            }

            return { success: true, title: chat.title };
        } catch (error) {
            logger.error('Update chat error:', error);
            throw new Error('Failed to update chat');
        }
    }

    static async deleteChat(chatId, walletAddress) {
        try {
            const result = await Chat.deleteOne({ chatId, walletAddress });

            if (result.deletedCount === 0) {
                throw new Error('Chat not found');
            }

            logger.info('Chat deleted:', { chatId, walletAddress });
            
            return { success: true };
        } catch (error) {
            logger.error('Delete chat error:', error);
            throw new Error('Failed to delete chat');
        }
    }

    static async getChatMessages(chatId, walletAddress) {
        try {
            const chat = await Chat.findOne({ chatId, walletAddress });

            if (!chat) {
                throw new Error('Chat not found');
            }

            return {
                messages: chat.messages,
                projectFiles: chat.projectFiles.map(file => ({
                    fileName: file.fileName,
                    fileType: file.fileType,
                    hash: file.hash,
                    scanStatus: file.scanStatus,
                    createdAt: file.createdAt
                })),
                title: chat.title
            };
        } catch (error) {
            logger.error('Get messages error:', error);
            throw new Error('Failed to fetch messages');
        }
    }
}

module.exports = ChatService;
