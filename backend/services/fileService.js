const Chat = require('../models/Chat');
const logger = require('../utils/logger');

class FileService {
    static async getFile(chat, fileName) {
        try {
            const file = chat.projectFiles.find(f => f.fileName === fileName);
            if (!file) {
                throw new Error('File not found');
            }

            return {
                fileName: file.fileName,
                fileType: file.fileType,
                content: file.content,
                hash: file.hash,
                scanStatus: file.scanStatus,
                slitherResults: file.slitherResults,
                createdAt: file.createdAt
            };
        } catch (error) {
            logger.error('File preview error:', error);
            throw new Error('Failed to load file');
        }
    }

    static async getFiles(chat) {
        try {
            return chat.projectFiles.map(file => ({
                fileName: file.fileName,
                fileType: file.fileType,
                hash: file.hash,
                scanStatus: file.scanStatus,
                hasSlitherResults: !!file.slitherResults,
                createdAt: file.createdAt
            }));
        } catch (error) {
            logger.error('Get files error:', error);
            throw new Error('Failed to fetch files');
        }
    }

    static async getAnalysis(chat, fileName) {
        try {
            const file = chat.projectFiles.find(f => f.fileName === fileName);
            if (!file || !file.slitherResults) {
                throw new Error('Analysis results not found');
            }

            return {
                fileName: file.fileName,
                scanStatus: file.scanStatus,
                analysisResults: file.slitherResults
            };
        } catch (error) {
            logger.error('Get analysis error:', error);
            throw new Error('Failed to fetch analysis results');
        }
    }
}

module.exports = FileService;
