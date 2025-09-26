const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const AuthService = require('../services/authService');
const logger = require('../utils/logger');

const isAuthenticated = (req, res, next) => {
    if (!req.session.walletAddress) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

const fetchUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ walletAddress: req.session.walletAddress });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        logger.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// Generate nonce for wallet authentication
router.post('/nonce', 
    [body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address')],
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { walletAddress } = req.body;
        const { nonce, message } = await AuthService.generateNonce(walletAddress);
        
        res.json({ nonce, message });
    } catch (error) {
        logger.error('Nonce generation failed:', error);
        next(error);
    }
});

// Wallet authentication with signature verification
router.post('/connect', 
    [
        body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
        body('signature').notEmpty().withMessage('Signature is required'),
        body('nonce').notEmpty().withMessage('Nonce is required'),
    ],
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { walletAddress, signature, nonce } = req.body;

        await AuthService.verifySignature(walletAddress, signature, nonce);
        const user = await AuthService.connectUser(walletAddress);

        req.session.walletAddress = user.walletAddress;

        logger.info('User authenticated successfully:', { walletAddress: user.walletAddress });

        res.json({ 
            success: true, 
            user: {
                walletAddress: user.walletAddress,
                name: user.name,
                experience: user.experience,
                needsOnboarding: !user.name
            }
        });
    } catch (error) {
        logger.error('Auth error:', error);
        next(error);
    }
});

// Onboarding
router.post('/onboarding', 
    isAuthenticated,
    [
        body('name').notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
        body('experience').notEmpty().withMessage('Experience is required'),
        body('projectType').notEmpty().withMessage('Project type is required'),
    ],
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, experience, projectType } = req.body;

        const user = await AuthService.onboardUser(req.session.walletAddress, { name, experience, projectType });

        res.json({ success: true, user });
    } catch (error) {
        logger.error('Onboarding error:', error);
        next(error);
    }
});

// Logout
router.post('/logout', isAuthenticated, (req, res, next) => {
    const walletAddress = req.session.walletAddress;
    req.session.destroy((err) => {
        if (err) {
            logger.error('Logout failed:', err);
            return next(err);
        }
        logger.info('User logged out:', { walletAddress });
        res.json({ success: true });
    });
});

// Get current user
router.get('/me', isAuthenticated, fetchUser, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;