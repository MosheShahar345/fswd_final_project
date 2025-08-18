import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { getDb } from './infra/db.js';

const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket.IO setup for real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user to their personal room for notifications
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
  });

  // Join admin room for announcements
  socket.on('join-admin', () => {
    socket.join('admin-room');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await getDb().then(db => db.close());
  server.close(() => {
    console.log('Process terminated');
  });
});
