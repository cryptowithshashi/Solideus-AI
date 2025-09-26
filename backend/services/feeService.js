const BlockchainService = require('./blockchainService');
const FeeTransaction = require('../models/FeeTransaction');
const logger = require('../utils/logger');

class FeeService {
    static getFeeInfo() {
        return BlockchainService.getFeeInfo();
    }

    static async getFeeHistory(walletAddress) {
        try {
            const transactions = await FeeTransaction.find({ walletAddress })
                .select('chatId transactionHash amount status createdAt')
                .sort({ createdAt: -1 })
                .limit(50);

            return { transactions };
        } catch (error) {
            logger.error('Get fee history error:', error);
            throw new Error('Failed to fetch fee history');
        }
    }

    static async getTransactionStatus(transactionHash, walletAddress) {
        try {
            const transaction = await FeeTransaction.findOne({
                transactionHash,
                walletAddress
            });

            if (!transaction) {
                throw new Error('Transaction not found');
            }

            return {
                status: transaction.status,
                amount: transaction.amount,
                createdAt: transaction.createdAt,
                verificationAttempts: transaction.verificationAttempts
            };
        } catch (error) {
            logger.error('Get transaction status error:', error);
            throw new Error('Failed to fetch transaction status');
        }
    }
}

module.exports = FeeService;
