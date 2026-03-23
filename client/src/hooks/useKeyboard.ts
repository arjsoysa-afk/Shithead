import { useEffect, useState } from 'react';
import type { ClientGameState, Card } from '../../../shared/types';

interface UseKeyboardProps {
  gameState: ClientGameState | null;
  selectedCardIds: Set<string>;
  toggleCardSelection: (cardId: string, card: Card) => void;
  playSelectedCards: () => void;
  pickUpPile: () => void;
  selectAllSameRank: () => void;
  clearSelection: () => void;
}

export function useKeyboard({
  gameState,
  selectedCardIds,
  toggleCardSelection,
  playSelectedCards,
  pickUpPile,
  selectAllSameRank,
  clearSelection,
}: UseKeyboardProps) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return;

      // ? — show help
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(v => !v);
        return;
      }

      // Esc — clear selection or close help
      if (e.key === 'Escape') {
        if (showHelp) setShowHelp(false);
        else clearSelection();
        return;
      }

      if (!gameState || gameState.phase !== 'playing' || !gameState.isYourTurn) return;

      // Number keys 1-9 — select card by position
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const cards = gameState.you.hand.length > 0
          ? gameState.you.hand
          : gameState.you.faceUp;
        const idx = num - 1;
        if (idx < cards.length) {
          toggleCardSelection(cards[idx].id, cards[idx]);
        }
        return;
      }

      // Enter — play selected cards
      if (e.key === 'Enter' && selectedCardIds.size > 0) {
        e.preventDefault();
        playSelectedCards();
        return;
      }

      // Space — pick up pile
      if (e.key === ' ') {
        e.preventDefault();
        pickUpPile();
        return;
      }

      // D — select all same rank
      if (e.key === 'd' || e.key === 'D') {
        selectAllSameRank();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, selectedCardIds, showHelp, toggleCardSelection, playSelectedCards, pickUpPile, selectAllSameRank, clearSelection]);

  return { showHelp, setShowHelp };
}
