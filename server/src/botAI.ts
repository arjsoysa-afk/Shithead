import { GameState, Card, Rank, RANK_ORDER, isBlackSuit, isRedSuit } from '../../shared/types';
import { getEffectivePileTop, canPlayOn, getCardSource } from './validators';

export interface BotMove {
  action: 'play' | 'pickup';
  cardIds?: string[];
}

/**
 * Choose the best move for a bot player.
 * Strategy: play lowest valid rank, save specials (2, 10) for later.
 */
export function chooseBotMove(state: GameState, botPlayerId: string): BotMove {
  const player = state.players.find(p => p.id === botPlayerId);
  if (!player) return { action: 'pickup' };

  const source = getCardSource(player);
  if (!source) return { action: 'pickup' };

  // Face-down: blind play — pick a random card
  if (source === 'faceDown') {
    const randomIdx = Math.floor(Math.random() * player.faceDown.length);
    return { action: 'play', cardIds: [player.faceDown[randomIdx].id] };
  }

  const cards = source === 'hand' ? player.hand : player.faceUp;
  const effectiveTop = getEffectivePileTop(state.pile);

  // If mustPickUp, look for black 6 to deflect
  if (state.mustPickUp) {
    const black6s = cards.filter(c => c.rank === '6' && isBlackSuit(c.suit));
    if (black6s.length > 0) {
      // Play one black 6 to deflect
      return { action: 'play', cardIds: [black6s[0].id] };
    }
    return { action: 'pickup' };
  }

  // Group cards by rank
  const groups = new Map<Rank, Card[]>();
  for (const card of cards) {
    const existing = groups.get(card.rank) || [];
    existing.push(card);
    groups.set(card.rank, existing);
  }

  // Find all playable ranks
  const playableGroups: { rank: Rank; cards: Card[]; priority: number }[] = [];

  for (const [rank, rankCards] of groups) {
    // Check if at least one card of this rank can be played
    const testCard = rankCards[0];
    if (canPlayOn(rank, testCard.suit, effectiveTop, state.mustPlayLower, state.mustPickUp)) {
      // If playing 6s, handle red/black separately
      if (rank === '6') {
        const red6s = rankCards.filter(c => isRedSuit(c.suit));
        const black6s = rankCards.filter(c => isBlackSuit(c.suit));

        // Play red 6 as attack (with any black 6s as invisible alongside)
        if (red6s.length > 0) {
          // Red 6 is an attack card — play it
          const allSixes = [...red6s, ...black6s]; // black 6s are invisible when played with red
          playableGroups.push({ rank, cards: allSixes, priority: getPriority(rank, true) });
        } else if (black6s.length > 0) {
          // Only black 6s — normal play
          playableGroups.push({ rank, cards: black6s, priority: getPriority(rank, false) });
        }
      } else {
        playableGroups.push({ rank, cards: rankCards, priority: getPriority(rank, false) });
      }
    }
  }

  if (playableGroups.length === 0) {
    return { action: 'pickup' };
  }

  // Sort by priority (lower = play first, save high-priority specials)
  playableGroups.sort((a, b) => a.priority - b.priority);

  const chosen = playableGroups[0];
  return { action: 'play', cardIds: chosen.cards.map(c => c.id) };
}

/**
 * Priority for card selection. Lower = play sooner.
 * We save powerful specials (2, 10) for later.
 */
function getPriority(rank: Rank, isRed6: boolean): number {
  // Red 6 is a strong attack — save it a bit
  if (isRed6) return 80;

  switch (rank) {
    case '4': return 10;
    case '5': return 15;
    case '6': return 20; // black 6 normal play
    case '9': return 25;
    case '8': return 30; // skip — moderately useful
    case 'J': return 35; // reverse — situational
    case 'Q': return 40;
    case 'K': return 45;
    case 'A': return 50;
    case '7': return 55; // play-lower effect, useful
    case '3': return 60; // invisible, save for later
    case '2': return 90; // reset — save for emergencies
    case '10': return 95; // burn — most powerful, save last
    default: return RANK_ORDER[rank];
  }
}
