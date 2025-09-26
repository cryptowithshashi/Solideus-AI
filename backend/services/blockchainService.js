const { provider, treasuryWallet, FEE_AMOUNT_WEI } = require('../config/blockchain');
const { ethers } = require('ethers');
const FeeTransaction = require('../models/FeeTransaction');
const logger = require('../utils/logger');

class BlockchainService {
    // Async fee verification with proper BigInt handling
    static async verifyFeePaymentAsync(transactionHash, expectedAmount, senderAddress) {
        try {
            // Get transaction receipt (more reliable than getTransaction)
            const receipt = await provider.getTransactionReceipt(transactionHash);
            
            if (!receipt) {
                logger.warn('Transaction receipt not found:', { transactionHash });
                return false;
            }

            // Check if transaction was successful
            if (receipt.status !== 1) {
                logger.warn('Transaction failed on-chain:', { transactionHash });
                return false;
            }

            // Get transaction details
            const tx = await provider.getTransaction(transactionHash);
            if (!tx) {
                logger.warn('Transaction not found:', { transactionHash });
                return false;
            }

            // Convert expected amount to BigInt for proper comparison
            const expectedAmountBig = BigInt(expectedAmount.toString());
            const txValueBig = BigInt(tx.value.toString());

            // Validate transaction parameters with proper BigInt comparison
            const isValidAmount = txValueBig >= expectedAmountBig;
            const isValidSender = tx.from.toLowerCase() === senderAddress.toLowerCase();
            const isValidRecipient = tx.to && tx.to.toLowerCase() === treasuryWallet.address.toLowerCase();

            const isValid = isValidAmount && isValidSender && isValidRecipient;

            if (!isValid) {
                logger.warn('Fee verification failed:', {
                    transactionHash,
                    isValidAmount,
                    isValidSender,
                    isValidRecipient,
                    txValue: tx.value.toString(),
                    expectedAmount: expectedAmount.toString()
                });
            }

            return isValid;
        } catch (error) {
            logger.error('Fee verification error:', { transactionHash, error: error.message });
            return false;
        }
    }

    // Update fee transaction status
    static async updateFeeTransactionStatus(feeTransactionId, status) {
        try {
            await FeeTransaction.findByIdAndUpdate(feeTransactionId, {
                status,
                lastVerificationAt: new Date(),
                $inc: { verificationAttempts: 1 }
            });
        } catch (error) {
            logger.error('Failed to update fee transaction status:', error);
        }
    }

    // Check if transaction hash was already used (prevent replay)
    static async isTransactionUsed(transactionHash) {
        const existingTx = await FeeTransaction.findOne({ transactionHash });
        return !!existingTx;
    }

    static getFeeInfo() {
        return {
            feeAmount: ethers.formatEther(FEE_AMOUNT_WEI),
            feeAmountWei: FEE_AMOUNT_WEI.toString(),
            treasuryAddress: treasuryWallet.address,
            network: 'sepolia'
        };
    }
}

module.exports = BlockchainService;