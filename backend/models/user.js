const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    walletAddress: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true,
        lowercase: true
    },
    name: String,
    experience: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'advanced'], 
        default: 'beginner' 
    },
    projectType: String,
    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);