import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents, ClientToServerEvents, RoomInfo, GameEndStats,
} from '../../shared/types';
import {
  createRoom, joinRoom, leaveRoom, findRoomByPlayer, Room,
} from './roomManager';
import {
  createGame, swapCards, confirmReady, playCards, pickUpPile, getClientState,
} from './gameEngine';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerHandlers(io: TypedServer, socket: TypedSocket): void {

  // ── Create Room ─────────────────────────────────────────
  socket.on('create-room', ({ playerName }) => {
    const room = createRoom(socket.id, playerName);
    socket.join(room.code);
    socket.emit('room-created', { roomCode: room.code });
    socket.emit('room-joined', getRoomInfo(room));
  });

  // ── Join Room ───────────────────────────────────────────
  socket.on('join-room', ({ roomCode, playerName }) => {
    const result = joinRoom(roomCode, socket.id, playerName);
    if ('error' in result) {
      socket.emit('error', { message: result.error });
      return;
    }
    socket.join(result.code);
    socket.emit('room-joined', getRoomInfo(result));
    io.to(result.code).emit('player-joined', getRoomInfo(result));
  });

  // ── Start Game ──────────────────────────────────────────
  socket.on('start-game', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room) return socket.emit('error', { message: 'Not in a room' });
    if (room.hostId !== socket.id) return socket.emit('error', { message: 'Only the host can start' });
    if (room.players.size < 2) return socket.emit('error', { message: 'Need at least 2 players' });

    const playerInfos = Array.from(room.players.entries()).map(([id, info]) => ({
      id,
      name: info.name,
    }));

    room.gameState = createGame(playerInfos);
    broadcastGameState(io, room);
  });

  // ── Swap Cards ──────────────────────────────────────────
  socket.on('swap-cards', ({ handCardId, faceUpCardId }) => {
    const room = findRoomByPlayer(socket.id);
    if (!room?.gameState) return;

    const result = swapCards(room.gameState, socket.id, handCardId, faceUpCardId);
    if ('error' in result) {
      socket.emit('invalid-move', { reason: result.error });
      return;
    }

    room.gameState = result;
    broadcastGameState(io, room);
  });

  // ── Ready ───────────────────────────────────────────────
  socket.on('ready', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room?.gameState) return;

    const result = confirmReady(room.gameState, socket.id);
    if ('error' in result) {
      socket.emit('invalid-move', { reason: result.error });
      return;
    }

    room.gameState = result;
    broadcastGameState(io, room);
  });

  // ── Play Cards ──────────────────────────────────────────
  socket.on('play-cards', ({ cardIds }) => {
    const room = findRoomByPlayer(socket.id);
    if (!room?.gameState) return;

    const result = playCards(room.gameState, socket.id, cardIds);
    if ('error' in result) {
      socket.emit('invalid-move', { reason: result.error });
      return;
    }

    room.gameState = result.state;

    // Send animation hints before full state
    const player = room.gameState.players.find(p => p.id === socket.id);
    const playerName = player?.name ?? 'Unknown';

    if (result.burned) {
      io.to(room.code).emit('pile-burned', {
        reason: result.effect ?? 'Burned!',
        playerId: socket.id,
        playerName,
      });
    }

    if (result.pickedUpInstead) {
      io.to(room.code).emit('pile-picked-up', {
        playerId: socket.id,
        playerName,
        cardCount: player?.hand.length ?? 0,
      });
    }

    broadcastGameState(io, room);

    // Check game over
    if (room.gameState.phase === 'game-over') {
      const loser = room.gameState.players.find(p => p.id === room.gameState!.loserId);
      const stats: GameEndStats = {
        players: room.gameState.players.map(p => ({ id: p.id, name: p.name })),
        loserId: room.gameState.loserId!,
        loserName: loser?.name ?? 'Unknown',
        timestamp: Date.now(),
      };
      io.to(room.code).emit('game-over', {
        loserId: room.gameState.loserId!,
        loserName: loser?.name ?? 'Unknown',
        stats,
      });
    }
  });

  // ── Pick Up Pile ────────────────────────────────────────
  socket.on('pick-up-pile', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room?.gameState) return;

    const result = pickUpPile(room.gameState, socket.id);
    if ('error' in result) {
      socket.emit('invalid-move', { reason: result.error });
      return;
    }

    room.gameState = result;

    const player = result.players.find(p => p.id === socket.id);
    io.to(room.code).emit('pile-picked-up', {
      playerId: socket.id,
      playerName: player?.name ?? 'Unknown',
      cardCount: player?.hand.length ?? 0,
    });

    broadcastGameState(io, room);
  });

  // ── Play Again ──────────────────────────────────────────
  socket.on('play-again', () => {
    const room = findRoomByPlayer(socket.id);
    if (!room) return;
    if (room.hostId !== socket.id) return socket.emit('error', { message: 'Only the host can restart' });

    const playerInfos = Array.from(room.players.entries()).map(([id, info]) => ({
      id,
      name: info.name,
    }));

    room.gameState = createGame(playerInfos);
    broadcastGameState(io, room);
  });

  // ── Disconnect ──────────────────────────────────────────
  socket.on('disconnect', () => {
    const result = leaveRoom(socket.id);
    if (result) {
      io.to(result.room.code).emit('player-left', getRoomInfo(result.room));
      if (result.room.gameState) {
        broadcastGameState(io, result.room);
      }
    }
  });
}

// ── Helpers ──────────────────────────────────────────────────

function getRoomInfo(room: Room): RoomInfo {
  return {
    code: room.code,
    players: Array.from(room.players.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      connected: info.connected,
    })),
    hostId: room.hostId,
  };
}

function broadcastGameState(io: TypedServer, room: Room): void {
  if (!room.gameState) return;
  for (const [playerId] of room.players) {
    const clientState = getClientState(room.gameState, playerId);
    io.to(playerId).emit('game-state', clientState);
  }
}
