import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents, ClientToServerEvents, RoomInfo, GameEndStats,
} from '../../shared/types';
import {
  createRoom, joinRoom, leaveRoom, rejoinRoom, findRoomByPlayer, Room,
} from './roomManager';
import {
  createGame, swapCards, confirmReady, playCards, pickUpPile, revealFaceDown, getClientState,
} from './gameEngine';
import { chooseBotMove } from './botAI';
import { getCardSource, canPlayOn, getEffectivePileTop } from './validators';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const BOT_MOVE_DELAY = 1200; // ms delay for bot moves to feel natural
const BOT_ID_PREFIX = 'bot-';

function isBotId(id: string): boolean {
  return id.startsWith(BOT_ID_PREFIX);
}

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

  // ── Play vs Computer ──────────────────────────────────
  socket.on('play-vs-computer', ({ playerName }) => {
    // Create room with human player
    const room = createRoom(socket.id, playerName);
    socket.join(room.code);

    // Add bot player
    const botId = `${BOT_ID_PREFIX}${Date.now()}`;
    room.players.set(botId, { name: 'T-1000', connected: true });

    socket.emit('room-created', { roomCode: room.code });
    socket.emit('room-joined', getRoomInfo(room));

    // Auto-start game
    const playerInfos = Array.from(room.players.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      isBot: isBotId(id),
    }));

    room.gameState = createGame(playerInfos);

    // Mark bot as isBot in game state
    for (const p of room.gameState.players) {
      if (isBotId(p.id)) {
        p.isBot = true;
      }
    }

    // Auto-ready the bot in swap phase
    const botPlayer = room.gameState.players.find(p => p.isBot);
    if (botPlayer) {
      botPlayer.ready = true;
    }

    broadcastGameState(io, room);

    // If bot goes first after swap phase ready, handle it
    // (player still needs to ready themselves first)
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

    // After all ready, check if bot goes first
    if (room.gameState.phase === 'playing') {
      scheduleBotTurnIfNeeded(io, room);
    }
  });

  // ── Reveal Face-Down Card ───────────────────────────────
  socket.on('reveal-face-down', ({ cardId }) => {
    const room = findRoomByPlayer(socket.id);
    if (!room?.gameState) return;

    const result = revealFaceDown(room.gameState, socket.id, cardId);
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

    const player = room.gameState.players.find(p => p.id === socket.id);
    const playerName = player?.name ?? 'Unknown';

    emitPlayEffects(io, room, result, socket.id, playerName);
    broadcastGameState(io, room);
    checkGameOver(io, room);

    // Schedule bot turn if next player is bot
    if (room.gameState.phase === 'playing') {
      scheduleBotTurnIfNeeded(io, room);
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

    // Schedule bot turn if next player is bot
    if (room.gameState.phase === 'playing') {
      scheduleBotTurnIfNeeded(io, room);
    }
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

    // Re-mark bots and auto-ready them
    for (const p of room.gameState.players) {
      if (isBotId(p.id)) {
        p.isBot = true;
        p.ready = true;
      }
    }

    broadcastGameState(io, room);
  });

  // ── Rejoin Room (after screen lock / reconnect) ─────────
  socket.on('rejoin-room', ({ roomCode, playerName }) => {
    const result = rejoinRoom(roomCode, playerName, socket.id);
    if ('error' in result) {
      socket.emit('error', { message: result.error });
      return;
    }
    socket.join(result.code);
    socket.emit('room-joined', getRoomInfo(result));
    io.to(result.code).emit('player-joined', getRoomInfo(result));
    if (result.gameState) {
      broadcastGameState(io, result);
    }
  });

  // ── Emoji Reaction ──────────────────────────────────────
  socket.on('emoji-reaction', ({ emoji }) => {
    const room = findRoomByPlayer(socket.id);
    if (!room) return;
    const player = room.gameState?.players.find(p => p.id === socket.id)
      ?? Array.from(room.players.entries()).find(([id]) => id === socket.id)?.[1];
    const playerName = (player as any)?.name ?? 'Unknown';
    io.to(room.code).emit('emoji-reaction', { playerId: socket.id, playerName, emoji });
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

// ── Bot Turn Logic ────────────────────────────────────────────

function scheduleBotTurnIfNeeded(io: TypedServer, room: Room): void {
  if (!room.gameState || room.gameState.phase !== 'playing') return;

  const currentPlayer = room.gameState.players[room.gameState.currentPlayerIndex];
  if (!currentPlayer || !isBotId(currentPlayer.id)) return;

  // Delay bot move for natural feel
  setTimeout(() => {
    processBotTurn(io, room);
  }, BOT_MOVE_DELAY);
}

function processBotTurn(io: TypedServer, room: Room): void {
  if (!room.gameState || room.gameState.phase !== 'playing') return;

  const currentPlayer = room.gameState.players[room.gameState.currentPlayerIndex];
  if (!currentPlayer || !isBotId(currentPlayer.id)) return;

  const botId = currentPlayer.id;
  const botName = currentPlayer.name;
  const source = getCardSource(currentPlayer);

  // ── Face-down: two-step reveal then play/pickup ──────────────────────────
  if (source === 'faceDown') {
    // Step 1: reveal a random face-down card and broadcast so players see it
    const randomIdx = Math.floor(Math.random() * currentPlayer.faceDown.length);
    const cardId = currentPlayer.faceDown[randomIdx].id;
    const revealResult = revealFaceDown(room.gameState, botId, cardId);
    if ('error' in revealResult) {
      // Shouldn't happen — just bail
      return;
    }
    room.gameState = revealResult;
    broadcastGameState(io, room);

    // Step 2: after a short delay, decide to play or pick up
    setTimeout(() => {
      if (!room.gameState || room.gameState.phase !== 'playing') return;
      const revealed = room.gameState.revealedFaceDown;
      if (!revealed || revealed.playerId !== botId) return;

      const effectiveTop = getEffectivePileTop(room.gameState.pile);
      const canPlay = canPlayOn(
        revealed.card.rank,
        revealed.card.suit,
        effectiveTop,
        room.gameState.mustPlayLower,
        room.gameState.mustPickUp,
      );

      if (canPlay) {
        const playResult = playCards(room.gameState, botId, [revealed.card.id]);
        if (!('error' in playResult)) {
          room.gameState = playResult.state;
          emitPlayEffects(io, room, playResult, botId, botName);
        } else {
          // Unexpected — pick up as fallback
          botPickUp(io, room, botId, botName);
        }
      } else {
        botPickUp(io, room, botId, botName);
      }

      broadcastGameState(io, room);
      checkGameOver(io, room);
      if (room.gameState.phase === 'playing') {
        scheduleBotTurnIfNeeded(io, room);
      }
    }, BOT_MOVE_DELAY);

    return; // wait for the setTimeout above
  }

  // ── Hand / face-up: normal move ──────────────────────────────────────────
  const move = chooseBotMove(room.gameState, botId);

  if (move.action === 'play' && move.cardIds) {
    const result = playCards(room.gameState, botId, move.cardIds);
    if ('error' in result) {
      botPickUp(io, room, botId, botName);
    } else {
      room.gameState = result.state;
      emitPlayEffects(io, room, result, botId, botName);
    }
  } else {
    botPickUp(io, room, botId, botName);
  }

  broadcastGameState(io, room);
  checkGameOver(io, room);

  // Chain: if bot gets another turn (e.g. after burn/10), schedule again
  if (room.gameState.phase === 'playing') {
    scheduleBotTurnIfNeeded(io, room);
  }
}

/** Pick up the pile (or just the revealed card) for a bot, emitting the event. */
function botPickUp(io: TypedServer, room: Room, botId: string, botName: string): void {
  const result = pickUpPile(room.gameState!, botId);
  if (!('error' in result)) {
    room.gameState = result;
    const botAfter = result.players.find(p => p.id === botId);
    io.to(room.code).emit('pile-picked-up', {
      playerId: botId,
      playerName: botName,
      cardCount: botAfter?.hand.length ?? 0,
    });
  }
}

// ── Shared Helpers ────────────────────────────────────────────

function emitPlayEffects(
  io: TypedServer,
  room: Room,
  result: { effect?: string; burned: boolean; pickedUpInstead?: boolean; playedRanks: string[] },
  playerId: string,
  playerName: string,
): void {
  if (result.burned) {
    io.to(room.code).emit('pile-burned', {
      reason: result.effect ?? 'Burned!',
      playerId,
      playerName,
    });
  }

  // Emit special floating text effects
  if (result.playedRanks.includes('Q')) {
    io.to(room.code).emit('special-effect', { effect: 'FOOF', playerName });
  }
  if (result.burned) {
    if (result.effect?.includes('Four of a kind')) {
      io.to(room.code).emit('special-effect', { effect: 'DESTROYED', playerName });
    } else if (result.playedRanks.includes('10')) {
      io.to(room.code).emit('special-effect', { effect: 'MEGATRON', playerName });
    }
  }

  if (result.pickedUpInstead) {
    const player = room.gameState?.players.find(p => p.id === playerId);
    io.to(room.code).emit('pile-picked-up', {
      playerId,
      playerName,
      cardCount: player?.hand.length ?? 0,
    });
  }
}

function checkGameOver(io: TypedServer, room: Room): void {
  if (!room.gameState || room.gameState.phase !== 'game-over') return;

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
    // Skip emitting to bot players (they don't have real sockets)
    if (isBotId(playerId)) continue;
    const clientState = getClientState(room.gameState, playerId);
    io.to(playerId).emit('game-state', clientState);
  }
}
