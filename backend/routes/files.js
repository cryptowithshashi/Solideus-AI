const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const FileService = require('../services/fileService');
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

// Get file preview
router.get('/:chatId/:fileName', 
    [
        param('chatId').notEmpty().withMessage('Chat ID is required'),
        param('fileName').notEmpty().withMessage('File name is required'),
    ],
    fetchChat,
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const file = await FileService.getFile(req.chat, req.params.fileName);
        res.json(file);
    } catch (error) {
        next(error);
    }
});

// Get all files for a chat
router.get('/:chatId', 
    [param('chatId').notEmpty().withMessage('Chat ID is required')],
    fetchChat,
    async (req, res, next) => {
    try {
        const files = await FileService.getFiles(req.chat);
        res.json({ files });
    } catch (error) {
        next(error);
    }
});

// Get security analysis results for a file
router.get('/:chatId/:fileName/analysis', 
    [
        param('chatId').notEmpty().withMessage('Chat ID is required'),
        param('fileName').notEmpty().withMessage('File name is required'),
    ],
    fetchChat,
    async (req, res, next) => {
    try {
        const analysis = await FileService.getAnalysis(req.chat, req.params.fileName);
        res.json(analysis);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
