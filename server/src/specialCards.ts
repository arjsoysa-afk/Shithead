import { Card, GameState, isRedSuit, isBlackSuit } from '../../shared/types';
import { checkFourOfAKind } from './validators';

export interface PlayResult {
  state: GameState;
  effect?: string;       // human-readable effect description
  burned: boolean;       // did the pile burn?
  sameTurnAgain: boolean; // does the same player go again?
  skipNext: boolean;     // skip the next player?
}

/**
 * Apply special card effects after cards are placed on the pile.
 * Called after the cards have already been added to the pile.
 */
export function applySpecialEffects(state: GameState, playedCards: Card[]): PlayResult {
  const result: PlayResult = {
    state: { ...state },
    burned: false,
    sameTurnAgain: false,
    skipNext: false,
  };

  const rank = playedCards[0].rank;

  // --- Four of a kind check (always runs, regardless of card played) ---
  if (checkFourOfAKind(result.state.pile)) {
    result.state.pile = [];
    result.state.burnPile = [...result.state.burnPile, ...state.pile];
    result.burned = true;
    result.sameTurnAgain = true;
    result.state.mustPlayLower = false;
    result.state.mustPickUp = false;
    result.effect = 'Four of a kind — pile burned!';
    return result;
  }

  switch (rank) {
    case '2': // Reset
      result.state.mustPlayLower = false;
      result.effect = 'Reset — play anything';
      break;

    case '3': // Invisible — no effect on game state
      result.effect = 'Invisible';
      break;

    case '7': // Play lower
      result.state.mustPlayLower = true;
      result.effect = 'Play lower than 7';
      break;

    case '8': // Skip
      result.skipNext = true;
      result.effect = 'Skip!';
      break;

    case '10': // Burn
      result.state.burnPile = [...result.state.burnPile, ...result.state.pile];
      result.state.pile = [];
      result.burned = true;
      result.sameTurnAgain = true;
      result.state.mustPlayLower = false;
      result.effect = 'Pile burned!';
      break;

    case 'J': // Reverse
      result.state.direction =
        result.state.direction === 'clockwise' ? 'counter-clockwise' : 'clockwise';
      result.effect = 'Reversed!';
      break;

    case '6': {
      // Check if ANY of the played cards is a red 6
      const hasRed6 = playedCards.some(c => isRedSuit(c.suit));
      const allBlack = playedCards.every(c => isBlackSuit(c.suit));
      const blackCount = playedCards.filter(c => isBlackSuit(c.suit)).length;

      if (hasRed6) {
        // Red 6 always attacks — any black 6s played alongside are invisible (like a 3)
        // Only a black 6 from the NEXT player can cancel it
        result.state.mustPickUp = true;
        result.effect = 'Red 6 — pick up or play a black 6!';
      } else if (allBlack && state.mustPickUp) {
        // Black 6 cancels the red 6 — nobody picks up
        // Play continues normally from 6 (next player must play 6 or higher)
        result.state.mustPickUp = false;
        result.effect = 'Black 6 — cancelled! Play continues from 6';
      }
      break;
    }

    default:
      // Regular card, clear mustPlayLower if it was set
      // (mustPlayLower only applies to the immediate next play after a 7)
      result.state.mustPlayLower = false;
      break;
  }

  // Non-special cards clear mustPlayLower (except 3 which is invisible)
  if (rank !== '7' && rank !== '3' && !KEEPS_LOWER.has(rank)) {
    result.state.mustPlayLower = false;
  }

  return result;
}

// Ranks that DON'T clear the mustPlayLower flag (because they're special)
const KEEPS_LOWER = new Set(['2', '10']);
