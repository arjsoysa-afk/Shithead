import { GameState } from '../../shared/types';

export interface Room {
  code: string;
  players: Map<string, { name: string; connected: boolean }>;
  hostId: string;
  gameState: GameState | null;
  lastActivity: number;
}

const rooms = new Map<string, Room>();

// Grace period (ms) before removing a disconnected player during an active game
const DISCONNECT_GRACE_MS = 90_000;
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

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
      room.lastActivity = Date.now();

      // During an active game, keep the slot for 90s to allow reconnection
      if (room.gameState && (room.gameState.phase === 'swapping' || room.gameState.phase === 'playing')) {
        const playerInfo = room.players.get(playerId)!;
        playerInfo.connected = false;
        const player = room.gameState.players.find(p => p.id === playerId);
        if (player) player.connected = false;

        // Schedule actual removal after grace period
        const timer = setTimeout(() => {
          disconnectTimers.delete(playerId);
          for (const [code, r] of rooms) {
            if (r.players.has(playerId)) {
              r.players.delete(playerId);
              if (r.players.size === 0) rooms.delete(code);
              break;
            }
          }
        }, DISCONNECT_GRACE_MS);
        disconnectTimers.set(playerId, timer);

        return { room, wasHost };
      }

      // Outside of game — remove immediately
      room.players.delete(playerId);
      if (wasHost && room.players.size > 0) {
        room.hostId = room.players.keys().next().value!;
      }
      if (room.players.size === 0) {
        rooms.delete(room.code);
      }
      return { room, wasHost };
    }
  }
  return null;
}

export function rejoinRoom(
  roomCode: string,
  playerName: string,
  newSocketId: string,
): Room | { error: string } {
  const room = rooms.get(roomCode.toUpperCase());
  if (!room) return { error: 'Room not found — it may have expired' };

  // Find a disconnected player slot with this name
  let oldSocketId: string | null = null;
  for (const [id, info] of room.players) {
    if (info.name === playerName && !info.connected) {
      oldSocketId = id;
      break;
    }
  }
  if (!oldSocketId) return { error: 'No disconnected player found — try rejoining manually' };

  // Cancel the grace-period removal timer
  const timer = disconnectTimers.get(oldSocketId);
  if (timer) { clearTimeout(timer); disconnectTimers.delete(oldSocketId); }

  // Remap socket ID in the players map
  const playerInfo = room.players.get(oldSocketId)!;
  playerInfo.connected = true;
  room.players.delete(oldSocketId);
  room.players.set(newSocketId, playerInfo);

  // Update host if needed
  if (room.hostId === oldSocketId) room.hostId = newSocketId;

  // Update game state player ID and any ID references
  if (room.gameState) {
    const gp = room.gameState.players.find(p => p.id === oldSocketId);
    if (gp) { gp.id = newSocketId; gp.connected = true; }

    const finIdx = room.gameState.finishedPlayerIds.indexOf(oldSocketId);
    if (finIdx !== -1) room.gameState.finishedPlayerIds[finIdx] = newSocketId;
    if (room.gameState.winnerId === oldSocketId) room.gameState.winnerId = newSocketId;
    if (room.gameState.loserId === oldSocketId) room.gameState.loserId = newSocketId;
    if (room.gameState.revealedFaceDown?.playerId === oldSocketId) {
      room.gameState.revealedFaceDown.playerId = newSocketId;
    }
  }

  room.lastActivity = Date.now();
  return room;
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
