import { GameState } from '../../shared/types';

export interface Room {
  code: string;
  players: Map<string, { name: string; connected: boolean }>;
  hostId: string;
  gameState: GameState | null;
  lastActivity: number;
}

const rooms = new Map<string, Room>();

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateCode(): string {
  let code: string;
  do {
    code = Array.from({ length: 4 }, () =>
      CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ).join('');
  } while (rooms.has(code));
  return code;
}

export function createRoom(hostId: string, hostName: string): Room {
  const code = generateCode();
  const room: Room = {
    code,
    players: new Map([[hostId, { name: hostName, connected: true }]]),
    hostId,
    gameState: null,
    lastActivity: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

export function joinRoom(
  code: string,
  playerId: string,
  playerName: string
): Room | { error: string } {
  const room = rooms.get(code.toUpperCase());
  if (!room) return { error: 'Room not found' };
  if (room.players.size >= 6) return { error: 'Room is full (max 6 players)' };
  if (room.gameState && room.gameState.phase !== 'lobby') {
    return { error: 'Game already in progress' };
  }

  room.players.set(playerId, { name: playerName, connected: true });
  room.lastActivity = Date.now();
  return room;
}

export function leaveRoom(playerId: string): { room: Room; wasHost: boolean } | null {
  for (const [, room] of rooms) {
    if (room.players.has(playerId)) {
      const wasHost = room.hostId === playerId;
      room.players.delete(playerId);
      room.lastActivity = Date.now();

      // If game is in progress, mark as disconnected instead of removing
      if (room.gameState && room.gameState.phase === 'playing') {
        const player = room.gameState.players.find(p => p.id === playerId);
        if (player) player.connected = false;
      }

      // Transfer host if needed
      if (wasHost && room.players.size > 0) {
        room.hostId = room.players.keys().next().value!;
      }

      // Clean up empty rooms
      if (room.players.size === 0) {
        rooms.delete(room.code);
      }

      return { room, wasHost };
    }
  }
  return null;
}

export function findRoomByPlayer(playerId: string): Room | null {
  for (const [, room] of rooms) {
    if (room.players.has(playerId)) return room;
  }
  return null;
}

export function getRoom(code: string): Room | null {
  return rooms.get(code.toUpperCase()) ?? null;
}

export function reconnectPlayer(playerId: string, room: Room): void {
  const playerInfo = room.players.get(playerId);
  if (playerInfo) playerInfo.connected = true;
  if (room.gameState) {
    const player = room.gameState.players.find(p => p.id === playerId);
    if (player) player.connected = true;
  }
  room.lastActivity = Date.now();
}

// Clean up stale rooms every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (now - room.lastActivity > 60 * 60 * 1000) { // 1 hour
      rooms.delete(code);
    }
  }
}, 10 * 60 * 1000);
