import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { registerHandlers } from './socketHandlers';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // __dirname = server/dist/server/src — go up to monorepo root, then into client/dist
  const clientDist = path.resolve(__dirname, '../../../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  registerHandlers(io, socket);
});

const PORT = process.env.NODE_ENV === 'production' ? (process.env.PORT || 3001) : 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
