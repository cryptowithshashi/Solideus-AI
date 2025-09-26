const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    chatId: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    walletAddress: { 
        type: String, 
        required: true, 
        index: true,
        lowercase: true
    },
    title: { type: String, default: 'New Chat' },
    messages: [{
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: String,
        timestamp: { type: Date, default: Date.now },
        gasFeePaid: String, // Store as string (wei) to avoid precision issues
        transactionHash: String
    }],
    projectFiles: [{
        fileName: String,
        fileType: String,
        content: String,
        hash: String, // File content hash for integrity
        scanStatus: { 
            type: String, 
            enum: ['pending', 'safe', 'issues', 'error'], 
            default: 'pending' 
        },
        slitherResults: Object, // Store Slither analysis results
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', ChatSchema);