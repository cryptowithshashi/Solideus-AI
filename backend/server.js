require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const csrf = require('csurf');
const Sentry = require('@sentry/node');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { initializeQueue } = require('./services/queueService');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Sentry for error tracking
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development'
    });
    app.use(Sentry.Handlers.requestHandler());
}

// Connect to database and initialize queue
connectDB();
initializeQueue();

// Enhanced security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Enhanced rate limiting (per IP and per wallet)
const ipLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false
});

const walletLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    keyGenerator: (req) => req.session.walletAddress || req.ip,
    message: 'Too many requests from this wallet'
});

app.use('/api', ipLimiter);
app.use('/api', walletLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enhanced session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'solideus-dev-secret-change-in-prod',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/solideus'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
    }
}));

// CSRF protection (only in production)
if (process.env.NODE_ENV === 'production') {
    const csrfProtection = csrf();
    app.use(csrfProtection);
    
    // Provide CSRF token endpoint
    app.get('/api/csrf-token', (req, res) => {
        res.json({ csrfToken: req.csrfToken() });
    });
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

// Import and use routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');
const messageRoutes = require('./routes/messages');
const fileRoutes = require('./routes/files');
const feeRoutes = require('./routes/fees');

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/fees', feeRoutes);

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN) {
    app.use(Sentry.Handlers.errorHandler());
}

// Enhanced error handling
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Map known errors to proper status codes
    let statusCode = 500;
    let message = 'Internal server error';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Authentication required';
    } else if (err.code === 11000) { // MongoDB duplicate key
        statusCode = 409;
        message = 'Resource already exists';
    }

    res.status(statusCode).json({ 
        error: message,
        code: err.code || 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    logger.info(`🚀 Solideus AI Backend running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        port: PORT
    });
});

module.exports = app;