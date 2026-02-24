/**
 * Adda Housing - Backend Server
 * Main Express Application Entry Point
 * Production-ready server with all configurations
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Socket.IO Setup for Real-time Chat
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com'
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080', 'http://localhost:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Make io accessible to routes
app.set('io', io);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/v1', routes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Adda Housing API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    health: '/health'
  });
});

// Socket.IO Connection Handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join_society', (societyId) => {
    socket.join(`society_${societyId}`);
    logger.info(`Socket ${socket.id} joined society_${societyId}`);
  });

  socket.on('join_flat', (flatId) => {
    socket.join(`flat_${flatId}`);
    logger.info(`Socket ${socket.id} joined flat_${flatId}`);
  });

  socket.on('send_message', (data) => {
    const { societyId, message } = data;
    io.to(`society_${societyId}`).emit('new_message', message);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  logger.info(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🏠 Adda Housing Server                                 ║
  ║                                                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
  ║   Server URL: http://${HOST}:${PORT}                         ║
  ║   API Endpoint: http://${HOST}:${PORT}/api/v1               ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
