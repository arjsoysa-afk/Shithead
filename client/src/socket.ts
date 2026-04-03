import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../../shared/types';

// In dev, connect via Vite proxy (same origin) so preview browsers can reach the server
const URL = import.meta.env.DEV ? '' : '';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
