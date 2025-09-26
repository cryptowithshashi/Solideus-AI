const Docker = require('dockerode');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const Chat = require('../models/Chat');
const logger = require('../utils/logger');

class SlitherService {
    static docker = new Docker();

    // Analyze project files using Slither in Docker container
    static async analyzeProject(projectFiles) {
        const tempDir = `/tmp/solideus-${crypto.randomBytes(16).toString('hex')}`;
        
        try {
            // Create temporary directory and write files
            await fs.mkdir(tempDir, { recursive: true });
            
            for (const file of projectFiles) {
                const filePath = path.join(tempDir, file.fileName);
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, file.content);
            }

            // Run Slither in Docker container
            const container = await this.docker.createContainer({
                Image: 'trailofbits/eth-security-toolbox',
                Cmd: ['slither', tempDir, '--json', '-'],
                WorkingDir: '/tmp',
                HostConfig: {
                    AutoRemove: true,
                    Memory: 512 * 1024 * 1024, // 512MB limit
                    CpuQuota: 50000, // 50% CPU limit
                    NetworkMode: 'none' // No network access
                },
                AttachStdout: true,
                AttachStderr: true
            });

            await container.start();
            
            // Get analysis results with timeout
            const stream = await container.attach({
                stream: true,
                stdout: true,
                stderr: true
            });

            let output = '';
            const timeout = setTimeout(() => {
                container.kill();
            }, 30000); // 30 second timeout

            stream.on('data', (chunk) => {
                output += chunk.toString();
            });

            await container.wait();
            clearTimeout(timeout);

            // Parse Slither JSON output
            const results = this.parseSlitherOutput(output);
            
            // Clean up temporary directory
            await fs.rm(tempDir, { recursive: true, force: true });

            return results;

        } catch (error) {
            logger.error('Slither analysis failed:', error);
            
            // Clean up on error
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                logger.error('Failed to clean up temp directory:', cleanupError);
            }

            throw new Error('Static analysis failed');
        }
    }

    // Parse Slither JSON output
    static parseSlitherOutput(rawOutput) {
        try {
            // Extract JSON from output (Slither might include other text)
            const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in Slither output');
            }

            const slitherData = JSON.parse(jsonMatch[0]);
            
            // Calculate security score based on findings
            const findings = slitherData.results?.detectors || [];
            const criticalIssues = findings.filter(f => f.impact === 'High').length;
            const mediumIssues = findings.filter(f => f.impact === 'Medium').length;
            const lowIssues = findings.filter(f => f.impact === 'Low').length;

            // Simple scoring algorithm (0-100)
            let score = 100;
            score -= criticalIssues * 30;
            score -= mediumIssues * 10;
            score -= lowIssues * 2;
            score = Math.max(0, score);

            return {
                score,
                findings: findings.map(f => ({
                    severity: f.impact,
                    title: f.check,
                    description: f.description,
                    location: f.elements?.[0]?.source_mapping
                })),
                rawOutput: slitherData,
                analyzedAt: new Date()
            };

        } catch (error) {
            logger.error('Failed to parse Slither output:', error);
            return {
                score: 0,
                findings: [],
                error: 'Analysis parsing failed',
                analyzedAt: new Date()
            };
        }
    }

    // Update chat with analysis results
    static async updateChatWithResults(chatId, results) {
        try {
            const chat = await Chat.findOne({ chatId });
            if (!chat) return;

            // Update scan status for all files
            chat.projectFiles.forEach(file => {
                file.scanStatus = results.score > 70 ? 'safe' : 'issues';
                file.slitherResults = results;
            });

            await chat.save();
            logger.info('Updated chat with analysis results:', { chatId, score: results.score });
        } catch (error) {
            logger.error('Failed to update chat with results:', error);
        }
    }
}

module.exports = SlitherService;