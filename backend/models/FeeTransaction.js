const mongoose = require('mongoose');

const FeeTransactionSchema = new mongoose.Schema({
    walletAddress: { 
        type: String, 
        required: true, 
        index: true,
        lowercase: true
    },
    chatId: String,
    transactionHash: { 
        type: String, 
        required: true, 
        unique: true 
    },
    amount: { type: String, required: true }, // Wei amount as string
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'failed'], 
        default: 'pending' 
    },
    blockNumber: Number,
    gasUsed: String,
    verificationAttempts: { type: Number, default: 0 },
    lastVerificationAt: Date,
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient queries
FeeTransactionSchema.index({ transactionHash: 1 });
FeeTransactionSchema.index({ walletAddress: 1, status: 1 });

module.exports = mongoose.model('FeeTransaction', FeeTransactionSchema);