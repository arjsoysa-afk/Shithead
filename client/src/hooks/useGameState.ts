import { useEffect, useState, useCallback, useRef } from 'react';
import { socket } from '../socket';
import type { ClientGameState, RoomInfo, Card } from '../../../shared/types';
import type { SpecialEffect } from '../components/FloatingEffect';
import type { FloatingEmoji } from '../components/EmojiReaction';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'burn' | 'error';
}

export function useGameState() {
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  const [specialEffects, setSpecialEffects] = useState<SpecialEffect[]>([]);
  const [emojiReactions, setEmojiReactions] = useState<FloatingEmoji[]>([]);
  const effectTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const emojiTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Auto-rejoin after reconnect (screen lock / network blip)
  useEffect(() => {
    const handleReconnect = () => {
      const saved = sessionStorage.getItem('shithead-session');
      if (!saved) return;
      const { roomCode, playerName } = JSON.parse(saved);
      socket.emit('rejoin-room', { roomCode, playerName });
    };
    socket.io.on('reconnect', handleReconnect);
    return () => { socket.io.off('reconnect', handleReconnect); };
  }, []);

  useEffect(() => {
    socket.on('game-state', (state) => {
      setGameState(state);
      // Clear selection when turn changes or phase changes
      setSelectedCardIds(new Set());
    });

    socket.on('room-created', ({ roomCode }) => {
      // Room code is also in room-joined
    });

    socket.on('room-joined', (info) => {
      setRoomInfo(info);
      // Update saved session with confirmed room code
      const saved = sessionStorage.getItem('shithead-session');
      if (saved) {
        const parsed = JSON.parse(saved);
        sessionStorage.setItem('shithead-session', JSON.stringify({ ...parsed, roomCode: info.code }));
      }
    });

    socket.on('player-joined', (info) => {
      setRoomInfo(info);
      const newest = info.players[info.players.length - 1];
      addToast(`${newest.name} joined`, 'info');
    });

    socket.on('player-left', (info) => {
      setRoomInfo(info);
    });

    socket.on('pile-burned', ({ playerName, reason }) => {
      addToast(`${reason}`, 'burn');
    });

    socket.on('pile-picked-up', ({ playerName, cardCount }) => {
      addToast(`${playerName} picked up ${cardCount} cards`, 'info');
    });

    socket.on('invalid-move', ({ reason }) => {
      addToast(reason, 'error');
    });

    socket.on('error', ({ message }) => {
      addToast(message, 'error');
    });

    socket.on('special-effect', ({ effect, playerName }) => {
      const id = `${Date.now()}-${Math.random()}`;
      setSpecialEffects(prev => [...prev, { id, effect, playerName }]);
      // Auto-remove after 2 seconds
      const timer = setTimeout(() => {
        setSpecialEffects(prev => prev.filter(e => e.id !== id));
        effectTimers.current.delete(id);
      }, 2000);
      effectTimers.current.set(id, timer);
    });

    socket.on('emoji-reaction', ({ playerId, playerName, emoji }) => {
      const id = `emoji-${Date.now()}-${Math.random()}`;
      // Randomise horizontal position between 20% and 80% of screen width
      const x = 20 + Math.random() * 60;
      setEmojiReactions(prev => [...prev, { id, emoji, playerName, x }]);
      // Auto-remove after 3 seconds
      const timer = setTimeout(() => {
        setEmojiReactions(prev => prev.filter(r => r.id !== id));
        emojiTimers.current.delete(id);
      }, 3000);
      emojiTimers.current.set(id, timer);
    });

    return () => {
      socket.off('game-state');
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('pile-burned');
      socket.off('pile-picked-up');
      socket.off('invalid-move');
      socket.off('error');
      socket.off('special-effect');
      socket.off('emoji-reaction');
      // Clean up timers
      effectTimers.current.forEach(t => clearTimeout(t));
      emojiTimers.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Auto-remove toasts after 3s
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(t => t.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const addToast = (message: string, type: Toast['type']) => {
    setToasts(t => [...t.slice(-4), { id: Date.now().toString(), message, type }]);
  };

  // ── Actions ─────────────────────────────────────────────
  const createRoom = useCallback((playerName: string) => {
    socket.emit('create-room', { playerName });
    // Room code isn't known yet — saved when room-joined fires (see below)
    sessionStorage.setItem('shithead-session', JSON.stringify({ playerName, roomCode: '' }));
  }, []);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    socket.emit('join-room', { roomCode, playerName });
    sessionStorage.setItem('shithead-session', JSON.stringify({ playerName, roomCode }));
  }, []);

  const playVsComputer = useCallback((playerName: string) => {
    socket.emit('play-vs-computer', { playerName });
    sessionStorage.setItem('shithead-session', JSON.stringify({ playerName, roomCode: '' }));
  }, []);

  const startGame = useCallback(() => {
    socket.emit('start-game');
  }, []);

  const swapCards = useCallback((handCardId: string, faceUpCardId: string) => {
    socket.emit('swap-cards', { handCardId, faceUpCardId });
  }, []);

  const ready = useCallback(() => {
    socket.emit('ready');
  }, []);

  const playSelectedCards = useCallback(() => {
    if (selectedCardIds.size === 0) return;
    socket.emit('play-cards', { cardIds: Array.from(selectedCardIds) });
    setSelectedCardIds(new Set());
  }, [selectedCardIds]);

  const pickUpPile = useCallback(() => {
    socket.emit('pick-up-pile');
  }, []);

  const playFaceDown = useCallback((cardId: string) => {
    socket.emit('play-cards', { cardIds: [cardId] });
  }, []);

  const revealFaceDown = useCallback((cardId: string) => {
    socket.emit('reveal-face-down', { cardId });
  }, []);

  const playAgain = useCallback(() => {
    socket.emit('play-again');
  }, []);

  const toggleCardSelection = useCallback((cardId: string, card: Card) => {
    setSelectedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        // Only allow selecting cards of the same rank
        if (next.size > 0 && gameState) {
          const firstSelectedId = Array.from(next)[0];
          const allCards = [...gameState.you.hand, ...gameState.you.faceUp];
          const firstCard = allCards.find(c => c.id === firstSelectedId);
          if (firstCard && firstCard.rank !== card.rank) {
            // Different rank — start new selection
            return new Set([cardId]);
          }
        }
        next.add(cardId);
      }
      return next;
    });
  }, [gameState]);

  const selectAllSameRank = useCallback(() => {
    if (!gameState || selectedCardIds.size === 0) return;
    const firstId = Array.from(selectedCardIds)[0];
    const allCards = [...gameState.you.hand, ...gameState.you.faceUp];
    const firstCard = allCards.find(c => c.id === firstId);
    if (!firstCard) return;
    const sameRank = allCards.filter(c => c.rank === firstCard.rank);
    setSelectedCardIds(new Set(sameRank.map(c => c.id)));
  }, [gameState, selectedCardIds]);

  const clearSelection = useCallback(() => {
    setSelectedCardIds(new Set());
  }, []);

  const leaveGame = useCallback(() => {
    sessionStorage.removeItem('shithead-session');
    setGameState(null);
    setRoomInfo(null);
    setSelectedCardIds(new Set());
    socket.disconnect();
    socket.connect();
  }, []);

  const sendEmojiReaction = useCallback((emoji: string) => {
    socket.emit('emoji-reaction', { emoji });
  }, []);

  return {
    gameState,
    roomInfo,
    toasts,
    specialEffects,
    emojiReactions,
    selectedCardIds,
    createRoom,
    joinRoom,
    playVsComputer,
    startGame,
    swapCards,
    ready,
    playSelectedCards,
    pickUpPile,
    playFaceDown,
    playAgain,
    revealFaceDown,
    toggleCardSelection,
    selectAllSameRank,
    clearSelection,
    leaveGame,
    sendEmojiReaction,
  };
}
