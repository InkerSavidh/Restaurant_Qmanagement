// Backend/src/config/socket.js
import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Optimize connection settings
    pingTimeout: 60000,        // 60 seconds before considering connection dead
    pingInterval: 25000,       // Send ping every 25 seconds
    upgradeTimeout: 30000,     // 30 seconds to upgrade transport
    allowEIO3: true,           // Allow Engine.IO v3 clients
    transports: ['websocket', 'polling'],
    // Connection management
    maxHttpBufferSize: 1e6,    // 1MB max buffer
    allowRequest: (req, callback) => {
      // Add connection validation if needed
      callback(null, true);
    },
  });

  // Track active connections
  let activeConnections = 0;

  io.on('connection', (socket) => {
    activeConnections++;
    console.log(`✅ Client connected: ${socket.id} (Total: ${activeConnections})`);

    // Send welcome message to confirm connection
    socket.emit('connection:confirmed', { 
      id: socket.id, 
      timestamp: new Date().toISOString() 
    });

    socket.on('disconnect', (reason) => {
      activeConnections--;
      console.log(`❌ Client disconnected: ${socket.id} (Reason: ${reason}, Total: ${activeConnections})`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`🔥 Socket error for ${socket.id}:`, error);
    });

    // Heartbeat to keep connection alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
