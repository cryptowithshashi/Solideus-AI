const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const FeeService = require('../services/feeService');
const { isAuthenticated } = require('../middleware/auth');

// Apply auth middleware
router.use(isAuthenticated);

// Get fee information
router.get('/info', (req, res) => {
    res.json(FeeService.getFeeInfo());
});

// Get user's fee transaction history
router.get('/history', async (req, res, next) => {
    try {
        const history = await FeeService.getFeeHistory(req.session.walletAddress);
        res.json(history);
    } catch (error) {
        next(error);
    }
});

// Get transaction status
router.get('/status/:transactionHash', 
    [param('transactionHash').isHexadecimal().withMessage('Invalid transaction hash').isLength({ min: 66, max: 66 }).withMessage('Invalid transaction hash length')],
    async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const status = await FeeService.getTransactionStatus(req.params.transactionHash, req.session.walletAddress);
        res.json(status);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
