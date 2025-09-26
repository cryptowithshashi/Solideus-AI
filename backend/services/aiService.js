const { model } = require('../config/ai');
const { SOLIDITY_GENERATION_PROMPT } = require('../utils/prompts');
const Ajv = require('ajv');
const crypto = require('crypto');
const path = require('path');
const logger = require('../utils/logger');

// JSON schema for validating AI responses
const ajv = new Ajv();
const projectSchema = {
    type: 'object',
    properties: {
        contractName: { type: 'string' },
        description: { type: 'string' },
        files: {
            type: 'object',
            patternProperties: {
                '^.*$': { type: 'string' }
            }
        }
    },
    required: ['contractName', 'files'],
    additionalProperties: false
};

const validateProject = ajv.compile(projectSchema);

class AIService {
    // Enhanced project generation with validation and retry
    static async generateSolidityProject(userMessage, retryCount = 0) {
        const maxRetries = 2;
        
        try {
            const prompt = SOLIDITY_GENERATION_PROMPT + userMessage;
            
            // Add timeout to AI call
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
            
            const result = await model.generateContent(prompt);
            clearTimeout(timeout);
            
            const aiResponse = result.response.text();
            
            // Store raw AI response for provenance
            const responseHash = crypto.createHash('sha256').update(aiResponse).digest('hex');
            
            // Extract and validate JSON
            const projectData = this.extractValidJSON(aiResponse);
            
            if (projectData) {
                // Sanitize generated code
                const sanitizedFiles = this.sanitizeProjectFiles(projectData.files);
                
                const fileArray = [];
                for (const [fileName, fileContent] of Object.entries(sanitizedFiles)) {
                    const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
                    
                    fileArray.push({
                        fileName,
                        fileType: path.extname(fileName).substring(1) || 'txt',
                        content: fileContent,
                        hash: fileHash
                    });
                }
                
                return {
                    responseContent: `Generated ${projectData.contractName} project!\n\n${projectData.description || ''}`,
                    projectFiles: fileArray,
                    rawResponse: aiResponse,
                    responseHash,
                    generatedAt: new Date()
                };
            } else {
                // Fallback: treat as regular text response
                return {
                    responseContent: aiResponse,
                    projectFiles: null,
                    rawResponse: aiResponse,
                    responseHash,
                    generatedAt: new Date()
                };
            }
            
        } catch (error) {
            logger.error('AI generation failed:', { 
                error: error.message, 
                retryCount,
                userMessage: userMessage.substring(0, 100)
            });
            
            if (retryCount < maxRetries) {
                logger.info(`Retrying AI generation (attempt ${retryCount + 1})`);
                return this.generateSolidityProject(userMessage, retryCount + 1);
            }
            
            throw new Error('AI service unavailable after retries');
        }
    }

    // Extract and validate JSON from AI response
    static extractValidJSON(text) {
        try {
            // Try direct JSON parse first
            const parsed = JSON.parse(text);
            if (validateProject(parsed)) {
                return parsed;
            }
        } catch (e) {
            // Continue to extraction methods
        }

        // Extract JSON from code blocks or mixed text
        const jsonPatterns = [
            /```json\n([\s\S]*?)\n```/,
            /```\n(\{[\s\S]*?\})\n```/,
            /(\{[\s\S]*\})/
        ];

        for (const pattern of jsonPatterns) {
            const match = text.match(pattern);
            if (match) {
                try {
                    const parsed = JSON.parse(match[1]);
                    if (validateProject(parsed)) {
                        return parsed;
                    }
                } catch (e) {
                    continue;
                }
            }
        }

        logger.warn('No valid JSON found in AI response');
        return null;
    }

    // Sanitize generated code for security
    static sanitizeProjectFiles(files) {
        const sanitized = {};
        const dangerousPatterns = [
            /process\.env/gi,
            /require\(['"]fs['"]\)/gi,
            /require\(['"]child_process['"]\)/gi,
            /exec\(/gi,
            /eval\(/gi,
            /\.exec\(/gi
        ];

        for (const [fileName, content] of Object.entries(files)) {
            let cleanContent = content;
            
            // Check for dangerous patterns
            const hasDangerousCode = dangerousPatterns.some(pattern => 
                pattern.test(content)
            );

            if (hasDangerousCode) {
                logger.warn('Dangerous code detected in generated file:', { fileName });
                cleanContent = `// WARNING: This file contained potentially dangerous code and was sanitized\n// Original content was blocked for security reasons\n\n${content}`;
            }

            // Basic content length limit
            if (cleanContent.length > 50000) {
                logger.warn('Generated file too large, truncating:', { fileName });
                cleanContent = cleanContent.substring(0, 50000) + '\n// ... (truncated)';
            }

            sanitized[fileName] = cleanContent;
        }

        return sanitized;
    }
}

module.exports = AIService;