const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const MessageService = require('../services/messageService');
const { isAuthenticated } = require('../middleware/auth');
const logger = require('../utils/logger');

// Apply auth middleware
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

// Send message to chat
router.post('/:chatId', 
    [
        param('chatId').notEmpty().withMessage('Chat ID is required'),
        body('message').notEmpty().withMessage('Message is required'),
        body('transactionHash').isHexadecimal().withMessage('Invalid transaction hash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash length'),
    ],
    fetchChat,
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { message, transactionHash } = req.body;
        const result = await MessageService.sendMessage(req.chat, req.session.walletAddress, message, transactionHash);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
