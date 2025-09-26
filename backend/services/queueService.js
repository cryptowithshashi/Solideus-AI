const { Queue, Worker } = require('bullmq');
const { createClient } = require('redis');
const logger = require('../utils/logger');
const BlockchainService = require('./blockchainService');
const SlitherService = require('./slitherService');

let connection;
let feeVerificationQueue;
let codeAnalysisQueue;

const initializeQueue = async () => {
    try {
        connection = createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
            },
            password: process.env.REDIS_PASSWORD
        });

        feeVerificationQueue = new Queue('fee-verification', { connection });
        codeAnalysisQueue = new Queue('code-analysis', { connection });

        // Fee verification worker
        new Worker('fee-verification', async (job) => {
            const { transactionHash, expectedAmount, senderAddress, feeTransactionId } = job.data;
            
            try {
                const isValid = await BlockchainService.verifyFeePaymentAsync(
                    transactionHash, 
                    expectedAmount, 
                    senderAddress
                );
                
                await BlockchainService.updateFeeTransactionStatus(
                    feeTransactionId, 
                    isValid ? 'confirmed' : 'failed'
                );

                return { success: true, verified: isValid };
            } catch (error) {
                logger.error('Fee verification job failed:', error);
                await BlockchainService.updateFeeTransactionStatus(feeTransactionId, 'failed');
                throw error;
            }
        }, { connection });

        // Code analysis worker  
        new Worker('code-analysis', async (job) => {
            const { chatId, projectFiles } = job.data;
            
            try {
                const analysisResults = await SlitherService.analyzeProject(projectFiles);
                await SlitherService.updateChatWithResults(chatId, analysisResults);
                return { success: true, results: analysisResults };
            } catch (error) {
                logger.error('Code analysis job failed:', error);
                throw error;
            }
        }, { 
            connection,
            concurrency: 3 // Limit concurrent Slither runs
        });

        logger.info('✅ Queue services initialized');
    } catch (error) {
        logger.error('❌ Failed to initialize queue services:', error);
    }
};

const enqueueFeeVerification = async (data) => {
    return await feeVerificationQueue.add('verify-payment', data, {
        delay: 5000, // Wait 5 seconds for block confirmation
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        }
    });
};

const enqueueCodeAnalysis = async (data) => {
    return await codeAnalysisQueue.add('analyze-code', data, {
        attempts: 2,
        backoff: {
            type: 'fixed',
            delay: 1000
        }
    });
};

module.exports = {
    initializeQueue,
    enqueueFeeVerification,
    enqueueCodeAnalysis
};