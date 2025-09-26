const Chat = require('../models/Chat');
const FeeTransaction = require('../models/FeeTransaction');
const BlockchainService = require('./blockchainService');
const AIService = require('./aiService');
const { enqueueFeeVerification, enqueueCodeAnalysis } = require('./queueService');
const { FEE_AMOUNT_WEI } = require('../config/blockchain');
const logger = require('../utils/logger');

class MessageService {
    static async sendMessage(chat, walletAddress, message, transactionHash) {
        try {
            // Check for replay attacks
            const isUsed = await BlockchainService.isTransactionUsed(transactionHash);
            if (isUsed) {
                throw new Error('Transaction already used');
            }

            // Create fee transaction record
            const feeTransaction = new FeeTransaction({
                walletAddress,
                chatId: chat.chatId,
                transactionHash,
                amount: FEE_AMOUNT_WEI.toString(),
                status: 'pending'
            });
            await feeTransaction.save();

            // Enqueue background fee verification
            await enqueueFeeVerification({
                transactionHash,
                expectedAmount: FEE_AMOUNT_WEI.toString(),
                senderAddress: walletAddress,
                feeTransactionId: feeTransaction._id
            });

            // Add user message immediately (optimistic)
            chat.messages.push({
                role: 'user',
                content: message,
                gasFeePaid: FEE_AMOUNT_WEI.toString(), // Store as string (wei)
                transactionHash
            });

            try {
                // Generate AI response
                const aiResult = await AIService.generateSolidityProject(message);

                // Store project files if generated
                if (aiResult.projectFiles) {
                    chat.projectFiles = aiResult.projectFiles;
                    
                    // Enqueue code analysis for generated files
                    await enqueueCodeAnalysis({
                        chatId: chat.chatId,
                        projectFiles: ai.projectFiles
                    });
                }

                // Add AI response
                chat.messages.push({
                    role: 'assistant',
                    content: aiResult.responseContent
                });

                // Update chat title if it's still "New Chat"
                if (chat.title === 'New Chat' && chat.messages.length <= 2) {
                    const title = message.length > 50 ? 
                        message.substring(0, 50) + '...' : 
                        message;
                    chat.title = title;
                }

                chat.updatedAt = new Date();
                await chat.save();

                logger.info('Message processed successfully:', {
                    chatId: chat.chatId,
                    walletAddress,
                    hasProjectFiles: !!aiResult.projectFiles
                });

                return {
                    success: true, 
                    message: {
                        role: 'assistant',
                        content: aiResult.responseContent,
                        timestamp: new Date()
                    },
                    projectFiles: aiResult.projectFiles,
                    feeTransactionId: feeTransaction._id
                };

            } catch (aiError) {
                logger.error('AI generation failed:', aiError);
                
                // Add error message to chat
                chat.messages.push({
                    role: 'assistant',
                    content: 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your message.'
                });
                
                await chat.save();
                
                throw new Error('AI service temporarily unavailable');
            }

        } catch (error) {
            logger.error('Send message error:', error);
            throw new Error(error.message || 'Failed to send message');
        }
    }
}

module.exports = MessageService;
