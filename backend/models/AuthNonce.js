const mongoose = require('mongoose');

const AuthNonceSchema = new mongoose.Schema({
    walletAddress: { 
        type: String, 
        required: true, 
        index: true,
        lowercase: true
    },
    nonce: { 
        type: String, 
        required: true,
        unique: true
    },
    used: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        expires: 300 // TTL: 5 minutes
    }
});

module.exports = mongoose.model('AuthNonce', AuthNonceSchema);