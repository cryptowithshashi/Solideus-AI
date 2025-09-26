const { ethers } = require('ethers');
const crypto = require('crypto');
const { nanoid } = require('nanoid');
const AuthNonce = require('../models/AuthNonce');
const User = require('../models/user');
const logger = require('../utils/logger');

class AuthService {
    // Generate authentication nonce
    static async generateNonce(walletAddress) {
        try {
            const nonce = nanoid(32);
            const message = `Please sign this message to authenticate with Solideus AI.\n\nNonce: ${nonce}\nTimestamp: ${Date.now()}`;
            
            // Store nonce in database
            await AuthNonce.create({
                walletAddress: walletAddress.toLowerCase(),
                nonce
            });

            return { nonce, message };
        } catch (error) {
            logger.error('Failed to generate nonce:', error);
            throw new Error('Nonce generation failed');
        }
    }

    // Verify signature using EIP-191 standard
    static async verifySignature(walletAddress, signature, nonce) {
        try {
            // Find and validate nonce
            const nonceDoc = await AuthNonce.findOne({
                walletAddress: walletAddress.toLowerCase(),
                nonce,
                used: false
            });

            if (!nonceDoc) {
                throw new Error('Invalid or expired nonce');
            }

            // Reconstruct the original message
            const message = `Please sign this message to authenticate with Solideus AI.\n\nNonce: ${nonce}\nTimestamp: ${nonceDoc.createdAt.getTime()}`;
            
            // Verify signature
            const recoveredAddress = ethers.verifyMessage(message, signature);
            const isValid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase();

            if (isValid) {
                // Mark nonce as used
                nonceDoc.used = true;
                await nonceDoc.save();
                
                logger.info('Successful wallet authentication:', { walletAddress });
            } else {
                logger.warn('Failed signature verification:', { 
                    walletAddress, 
                    recoveredAddress 
                });
                throw new Error('Signature verification failed');
            }

        } catch (error) {
            logger.error('Signature verification error:', error);
            throw new Error(error.message || 'Verification process failed');
        }
    }

    static async connectUser(walletAddress) {
        try {
            const lowercasedAddress = walletAddress.toLowerCase();
            let user = await User.findOne({ walletAddress: lowercasedAddress });

            if (!user) {
                user = new User({ walletAddress: lowercasedAddress });
                await user.save();
            } else {
                user.lastActiveAt = new Date();
                await user.save();
            }

            return user;
        } catch (error) {
            logger.error('User connection error:', error);
            throw new Error('Failed to connect user');
        }
    }

    static async onboardUser(walletAddress, { name, experience, projectType }) {
        try {
            const user = await User.findOneAndUpdate(
                { walletAddress },
                { name, experience, projectType, lastActiveAt: new Date() },
                { new: true }
            );

            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            logger.error('Onboarding error:', error);
            throw new Error('Onboarding failed');
        }
    }
}
