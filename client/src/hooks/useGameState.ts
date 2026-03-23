import { useEffect, useState, useCallback } from 'react';
import { socket } from '../socket';
import type { ClientGameState, RoomInfo, Card } from '../../../shared/types';

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
  }, []);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    socket.emit('join-room', { roomCode, playerName });
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
    setGameState(null);
    setRoomInfo(null);
    setSelectedCardIds(new Set());
    socket.disconnect();
    socket.connect();
  }, []);

  return {
    gameState,
    roomInfo,
    toasts,
    selectedCardIds,
    createRoom,
    joinRoom,
    startGame,
    swapCards,
    ready,
    playSelectedCards,
    pickUpPile,
    playAgain,
    toggleCardSelection,
    selectAllSameRank,
    clearSelection,
    leaveGame,
  };
}
