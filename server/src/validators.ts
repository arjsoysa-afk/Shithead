import { Card, GameState, Rank, RANK_ORDER, SPECIAL_RANKS, isRedSuit, isBlackSuit } from '../../shared/types';

/**
 * Get the effective top card of the pile, skipping invisible 3s.
 */
export function getEffectivePileTop(pile: Card[]): Card | null {
  for (let i = pile.length - 1; i >= 0; i--) {
    if (pile[i].rank !== '3') {
      return pile[i];
    }
  }
  return null; // all 3s or empty pile
}

/**
 * Check if a rank can be played on the current pile top.
 */
export function canPlayOn(
  playRank: Rank,
  playSuit: Card['suit'],
  effectiveTop: Card | null,
  mustPlayLower: boolean,
  mustPickUp: boolean,
): boolean {
  // If must pick up (red 6), only a black 6 can be played as deflect
  if (mustPickUp) {
    return playRank === '6' && isBlackSuit(playSuit);
  }

  // Special cards can always be played (except 7 on ace — handled separately)
  if (SPECIAL_RANKS.has(playRank)) {
    return true;
  }

  // Empty pile or after a reset (2) — anything goes
  if (!effectiveTop) {
    return true;
  }

  // 7 cannot be played on an Ace
  if (playRank === '7' && effectiveTop.rank === 'A') {
    return false;
  }

  // If under a 7's effect, must play lower than 7
  if (mustPlayLower) {
    // Only 4, 5, 6 (non-special cards below 7) are valid
    // Special cards (2, 3, 10) are already handled above
    const playValue = RANK_ORDER[playRank];
    return playValue < RANK_ORDER['7'];
  }

  // Normal play: must play equal or higher
  const playValue = RANK_ORDER[playRank];
  const topValue = RANK_ORDER[effectiveTop.rank];
  return playValue >= topValue;
}

/**
 * Full validation of a play attempt.
 */
export function isValidPlay(
  state: GameState,
  playerId: string,
  cardIds: string[]
): { valid: boolean; reason?: string } {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return { valid: false, reason: 'Player not found' };
  if (state.currentPlayerIndex !== playerIndex) return { valid: false, reason: 'Not your turn' };
  if (cardIds.length === 0) return { valid: false, reason: 'No cards selected' };

  const player = state.players[playerIndex];

  // Determine which card source the player should be using
  const source = getCardSource(player);
  if (!source) return { valid: false, reason: 'You have no cards to play' };

  // For face-down cards, only 1 card allowed (blind play)
  if (source === 'faceDown') {
    if (cardIds.length !== 1) return { valid: false, reason: 'Must play exactly one face-down card' };
    const card = player.faceDown.find(c => c.id === cardIds[0]);
    if (!card) return { valid: false, reason: 'Card not in your face-down cards' };
    // Face-down cards are always "valid" to attempt — if the card can't be played,
    // the player picks up. Validation happens after reveal.
    return { valid: true };
  }

  // Get the cards from the correct source
  const cards = source === 'hand' ? player.hand : player.faceUp;
  const selectedCards: Card[] = [];
  for (const id of cardIds) {
    const card = cards.find(c => c.id === id);
    if (!card) return { valid: false, reason: `Card ${id} not found in your ${source}` };
    selectedCards.push(card);
  }

  // All cards must be the same rank
  const rank = selectedCards[0].rank;
  if (!selectedCards.every(c => c.rank === rank)) {
    return { valid: false, reason: 'All cards must be the same rank' };
  }

  // Check if the rank can be played on the pile
  const effectiveTop = getEffectivePileTop(state.pile);
  if (!canPlayOn(rank, selectedCards[0].suit, effectiveTop, state.mustPlayLower, state.mustPickUp)) {
    if (state.mustPickUp) {
      return { valid: false, reason: 'You must pick up or play a black 6 to deflect' };
    }
    if (state.mustPlayLower) {
      return { valid: false, reason: 'Must play lower than 7 (4, 5, 6) or a special card' };
    }
    if (rank === '7' && effectiveTop?.rank === 'A') {
      return { valid: false, reason: 'Cannot play 7 on an Ace' };
    }
    return { valid: false, reason: 'Card is too low' };
  }

  // Special case: if mustPickUp and playing black 6, only one black 6 allowed
  if (state.mustPickUp && rank === '6') {
    if (selectedCards.length !== 1) {
      return { valid: false, reason: 'Can only play one black 6 to deflect' };
    }
    if (!isBlackSuit(selectedCards[0].suit)) {
      return { valid: false, reason: 'Only a black 6 can deflect' };
    }
  }

  return { valid: true };
}

/**
 * Determine which card source the player should use.
 */
export function getCardSource(player: { hand: Card[]; faceUp: Card[]; faceDown: Card[] }): 'hand' | 'faceUp' | 'faceDown' | null {
  if (player.hand.length > 0) return 'hand';
  if (player.faceUp.length > 0) return 'faceUp';
  if (player.faceDown.length > 0) return 'faceDown';
  return null;
}

/**
 * Check if the top 4 cards of the pile are the same rank (four-of-a-kind burn).
 */
export function checkFourOfAKind(pile: Card[]): boolean {
  if (pile.length < 4) return false;
  const top4 = pile.slice(-4);
  return top4.every(c => c.rank === top4[0].rank);
}
