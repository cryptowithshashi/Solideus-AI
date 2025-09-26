const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const ChatService = require('../services/chatService');
const { isAuthenticated } = require('../middleware/auth');
const logger = require('../utils/logger');

// Apply auth middleware to all routes
router.use(isAuthenticated);

const fetchChat = async (req, res, next) => {
    try {
        const chat = await Chat.findOne({
            chatId: req.params.chatId,
            walletAddress: req.session.walletAddress
        });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        req.chat = chat;
        next();
    } catch (error) {
        logger.error('Get chat error:', error);
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
};

// Get user chats
router.get('/', async (req, res, next) => {
    try {
        const chats = await ChatService.getChats(req.session.walletAddress);
        res.json({ chats });
    } catch (error) {
        next(error);
    }
});

// Create new chat
router.post('/', async (req, res, next) => {
    try {
        const chat = await ChatService.createChat(req.session.walletAddress);
        res.json(chat);
    } catch (error) {
        next(error);
    }
});

// Update chat title
router.put('/:chatId/title', 
    [
        param('chatId').notEmpty().withMessage('Chat ID is required'),
        body('title').notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
    ],
    fetchChat,
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title } = req.body;
        const result = await ChatService.updateChatTitle(req.params.chatId, req.session.walletAddress, title);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Delete chat
router.delete('/:chatId', 
    [param('chatId').notEmpty().withMessage('Chat ID is required')],
    fetchChat,
    async (req, res, next) => {
    try {
        const result = await ChatService.deleteChat(req.params.chatId, req.session.walletAddress);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get chat messages and files
router.get('/:chatId/messages', 
    [param('chatId').notEmpty().withMessage('Chat ID is required')],
    fetchChat,
    async (req, res, next) => {
    try {
        const messages = await ChatService.getChatMessages(req.params.chatId, req.session.walletAddress);
        res.json(messages);
    } catch (error) {
        next(error);
    }
});

module.exports = router;