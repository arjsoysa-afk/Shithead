import {
  Card, Rank, GameState, Player, ClientGameState, OpponentView,
  RANK_ORDER, isBlackSuit, isRedSuit,
} from '../../shared/types';
import { deal } from './deck';
import { isValidPlay, getEffectivePileTop, getCardSource, canPlayOn } from './validators';
import { applySpecialEffects } from './specialCards';

// ── Game Creation ───────────────────────────────────────────

export function createGame(playerInfos: { id: string; name: string }[]): GameState {
  const { playerCards, drawPile } = deal(playerInfos.length);

  const players: Player[] = playerInfos.map((info, i) => {
    const hand = playerCards[i].hand;
    sortHand(hand);
    return {
      id: info.id,
      name: info.name,
      hand,
      faceUp: playerCards[i].faceUp,
      faceDown: playerCards[i].faceDown,
      connected: true,
      ready: false,
    };
  });

  return {
    phase: 'swapping',
    players,
    pile: [],
    drawPile,
    burnPile: [],
    currentPlayerIndex: 0,
    direction: 'clockwise',
    mustPickUp: false,
    mustPlayLower: false,
    lastAction: 'Game started — swap your cards!',
    loserId: null,
    winnerId: null,
    finishedPlayerIds: [],
  };
}

// ── Swap Phase ──────────────────────────────────────────────

export function swapCards(
  state: GameState,
  playerId: string,
  handCardId: string,
  faceUpCardId: string
): GameState | { error: string } {
  if (state.phase !== 'swapping') return { error: 'Not in swap phase' };

  const player = state.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };
  if (player.ready) return { error: 'Already confirmed ready' };

  const handIdx = player.hand.findIndex(c => c.id === handCardId);
  const faceUpIdx = player.faceUp.findIndex(c => c.id === faceUpCardId);
  if (handIdx === -1 || faceUpIdx === -1) return { error: 'Card not found' };

  // Swap
  const temp = player.hand[handIdx];
  player.hand[handIdx] = player.faceUp[faceUpIdx];
  player.faceUp[faceUpIdx] = temp;

  // Re-sort hand after swap
  player.hand.sort((a, b) => {
    const aVal = RANK_ORDER[a.rank];
    const bVal = RANK_ORDER[b.rank];
    if (aVal !== bVal) return aVal - bVal;
    const suitOrder: Record<string, number> = { clubs: 0, spades: 1, diamonds: 2, hearts: 3 };
    return suitOrder[a.suit] - suitOrder[b.suit];
  });

  return { ...state, lastAction: `${player.name} swapped a card` };
}

export function confirmReady(state: GameState, playerId: string): GameState | { error: string } {
  if (state.phase !== 'swapping') return { error: 'Not in swap phase' };

  const player = state.players.find(p => p.id === playerId);
  if (!player) return { error: 'Player not found' };

  player.ready = true;

  // Check if all players are ready
  const allReady = state.players.every(p => p.ready);
  if (allReady) {
    // Determine starting player: lowest card in hand
    const startIdx = findStartingPlayer(state.players);
    return {
      ...state,
      phase: 'playing',
      currentPlayerIndex: startIdx,
      lastAction: `${state.players[startIdx].name} goes first!`,
    };
  }

  return { ...state, lastAction: `${player.name} is ready` };
}

function findStartingPlayer(players: Player[]): number {
  let lowestValue = Infinity;
  let lowestIdx = 0;

  players.forEach((player, idx) => {
    for (const card of player.hand) {
      const val = RANK_ORDER[card.rank];
      if (val < lowestValue) {
        lowestValue = val;
        lowestIdx = idx;
      }
    }
  });

  return lowestIdx;
}

// ── Core Gameplay ───────────────────────────────────────────

export interface PlayCardsResult {
  state: GameState;
  effect?: string;
  burned: boolean;
  pickedUpInstead?: boolean;
  playedRanks: Rank[];
}

export function playCards(
  state: GameState,
  playerId: string,
  cardIds: string[]
): PlayCardsResult | { error: string } {
  if (state.phase !== 'playing') return { error: 'Game is not in playing phase' };

  const validation = isValidPlay(state, playerId, cardIds);
  if (!validation.valid) return { error: validation.reason! };

  const playerIndex = state.players.findIndex(p => p.id === playerId);
  const player = state.players[playerIndex];
  const source = getCardSource(player)!;

  let newState = deepClone(state);
  const newPlayer = newState.players[playerIndex];

  // ── Play a previously-revealed face-down card ────────
  if (
    newState.revealedFaceDown &&
    newState.revealedFaceDown.playerId === playerId &&
    cardIds.length === 1 &&
    cardIds[0] === newState.revealedFaceDown.card.id
  ) {
    const card = newState.revealedFaceDown.card;
    newState.revealedFaceDown = undefined;

    if (card.rank === '6' && isRedSuit(card.suit)) {
      newState.burnPile.push(card);
    } else {
      newState.pile.push(card);
    }
    const result = applySpecialEffects(newState, [card]);
    newState = result.state;
    if (card.rank !== '6') newState.mustPickUp = false;

    drawCards(newState, playerIndex);
    newState = checkPlayerFinished(newState, playerIndex);
    if (!result.sameTurnAgain) newState = advanceTurn(newState, result.skipNext);

    newState.lastAction = `${newPlayer.name} played ${formatCard(card)} (from face-down)`;
    if (result.effect) newState.lastAction += ` — ${result.effect}`;
    return { state: checkGameOver(newState), effect: result.effect, burned: result.burned, playedRanks: [card.rank] };
  }

  // ── Face-down: reveal first, don't play immediately ──
  if (source === 'faceDown') {
    return { error: 'Click the face-down card to reveal it first, then choose to play or pick up' };
  }

  // ── Normal play (hand or face-up, or cross-source same rank) ─────────────────────
  const cards: Card[] = [];
  for (const id of cardIds) {
    // Search hand first, then face-up (supports cross-source plays)
    let idx = newPlayer.hand.findIndex(c => c.id === id);
    if (idx !== -1) {
      cards.push(newPlayer.hand.splice(idx, 1)[0]);
    } else {
      idx = newPlayer.faceUp.findIndex(c => c.id === id);
      if (idx !== -1) cards.push(newPlayer.faceUp.splice(idx, 1)[0]);
    }
  }

  // Red 6s never go into the pile — they are always burnt
  // Black 6s played alongside a red 6 are invisible (go to pile normally)
  const red6s = cards.filter(c => c.rank === '6' && isRedSuit(c.suit));
  const nonRed6s = cards.filter(c => !(c.rank === '6' && isRedSuit(c.suit)));

  if (red6s.length > 0) {
    newState.burnPile.push(...red6s);
  }

  // Add remaining cards (non-red-6) to pile
  newState.pile.push(...nonRed6s);

  // Apply special effects
  const result = applySpecialEffects(newState, cards);
  newState = result.state;

  // If not a red 6 play and not deflecting, clear mustPickUp
  if (cards[0].rank !== '6') {
    newState.mustPickUp = false;
  }

  // Draw cards to maintain hand of 3
  drawCards(newState, playerIndex);

  // Check if player has finished
  newState = checkPlayerFinished(newState, playerIndex);

  // Advance turn
  if (!result.sameTurnAgain) {
    newState = advanceTurn(newState, result.skipNext);
  }

  const cardStr = cards.map(formatCard).join(', ');
  newState.lastAction = `${newPlayer.name} played ${cardStr}`;
  if (result.effect) newState.lastAction += ` — ${result.effect}`;

  return { state: checkGameOver(newState), effect: result.effect, burned: result.burned, playedRanks: cards.map(c => c.rank) };
}

// ── Reveal Face-Down Card ───────────────────────────────────

export function revealFaceDown(
  state: GameState,
  playerId: string,
  cardId: string,
): GameState | { error: string } {
  if (state.phase !== 'playing') return { error: 'Game is not in playing phase' };
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return { error: 'Player not found' };
  if (state.currentPlayerIndex !== playerIndex) return { error: 'Not your turn' };

  const player = state.players[playerIndex];
  if (getCardSource(player) !== 'faceDown') return { error: 'You still have hand or face-up cards to play' };
  if (state.revealedFaceDown) return { error: 'A card is already revealed' };

  const newState = deepClone(state);
  const newPlayer = newState.players[playerIndex];
  const cardIdx = newPlayer.faceDown.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return { error: 'Card not found in face-down' };

  const card = newPlayer.faceDown.splice(cardIdx, 1)[0];
  newState.revealedFaceDown = { playerId, card };
  newState.lastAction = `${newPlayer.name} revealed ${formatCard(card)} from face-down`;
  return newState;
}

// ── Pick Up Pile ────────────────────────────────────────────

export function pickUpPile(state: GameState, playerId: string): GameState | { error: string } {
  if (state.phase !== 'playing') return { error: 'Game is not in playing phase' };

  const playerIndex = state.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return { error: 'Player not found' };
  if (state.currentPlayerIndex !== playerIndex) return { error: 'Not your turn' };
  // Allow pickup if pile is empty but player has a revealed face-down card to take back
  if (state.pile.length === 0 && state.revealedFaceDown?.playerId !== playerId) {
    return { error: 'Pile is empty' };
  }

  let newState = deepClone(state);
  const player = newState.players[playerIndex];

  const wasForced = newState.mustPickUp; // red 6 forced pickup

  // If a face-down card was revealed, it goes to hand along with the pile
  if (newState.revealedFaceDown?.playerId === playerId) {
    player.hand.push(newState.revealedFaceDown.card);
    newState.revealedFaceDown = undefined;
  }

  player.hand = [...player.hand, ...newState.pile];
  newState.pile = [];
  newState.mustPlayLower = false;
  newState.mustPickUp = false;
  sortHand(player.hand);
  newState.lastAction = `${player.name} picked up${wasForced ? ' (red 6 — still your turn!)' : ''}`;

  // Remove from finished if they were somehow there
  newState.finishedPlayerIds = newState.finishedPlayerIds.filter(id => id !== playerId);

  // If forced by a red 6, the pickup doesn't count as a turn — player plays again
  if (!wasForced) {
    newState = advanceTurn(newState);
  }

  return newState;
}

// ── Turn Management ─────────────────────────────────────────

function advanceTurn(state: GameState, skip: boolean = false): GameState {
  const activePlayers = state.players.filter(
    p => !state.finishedPlayerIds.includes(p.id) && p.connected
  );

  if (activePlayers.length <= 1) return state;

  const step = state.direction === 'clockwise' ? 1 : -1;
  let next = state.currentPlayerIndex;

  const advance = () => {
    next = (next + step + state.players.length) % state.players.length;
    // Skip finished or disconnected players
    let safety = 0;
    while (
      (state.finishedPlayerIds.includes(state.players[next].id) ||
        !state.players[next].connected) &&
      safety < state.players.length
    ) {
      next = (next + step + state.players.length) % state.players.length;
      safety++;
    }
  };

  advance(); // normal advance
  if (skip) advance(); // skip one more

  return { ...state, currentPlayerIndex: next };
}

function drawCards(state: GameState, playerIndex: number): void {
  const player = state.players[playerIndex];
  while (player.hand.length < 3 && state.drawPile.length > 0) {
    player.hand.push(state.drawPile.pop()!);
  }
  sortHand(player.hand);
}

/** Sort hand from worst to best (left to right) based on game value */
/** Sort hand from weakest to strongest (left to right).
 *  Regular cards by rank, then special cards (2, 3, 10) at the far right
 *  since they're the most powerful utility cards. */
function sortHand(hand: Card[]): void {
  // Game-power sort order: 4,5,6,7,8,9,J,Q,K,A, then specials 3,2,10
  const SORT_ORDER: Record<string, number> = {
    '4': 1, '5': 2, '6': 3, '7': 4, '8': 5, '9': 6,
    'J': 7, 'Q': 8, 'K': 9, 'A': 10,
    '3': 11, '2': 12, '10': 13, // specials at the end (strongest)
  };
  hand.sort((a, b) => {
    const aVal = SORT_ORDER[a.rank] ?? 0;
    const bVal = SORT_ORDER[b.rank] ?? 0;
    if (aVal !== bVal) return aVal - bVal;
    const suitOrder: Record<string, number> = { clubs: 0, spades: 1, diamonds: 2, hearts: 3 };
    return suitOrder[a.suit] - suitOrder[b.suit];
  });
}

function checkPlayerFinished(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex];
  if (
    player.hand.length === 0 &&
    player.faceUp.length === 0 &&
    player.faceDown.length === 0 &&
    !state.finishedPlayerIds.includes(player.id)
  ) {
    state.finishedPlayerIds.push(player.id);
    // First player to finish is the winner
    if (!state.winnerId) {
      state.winnerId = player.id;
    }
  }
  return state;
}

function checkGameOver(state: GameState): GameState {
  const activePlayers = state.players.filter(
    p => !state.finishedPlayerIds.includes(p.id)
  );

  if (activePlayers.length <= 1 && state.players.length > 1) {
    const loser = activePlayers[0];
    const winner = state.winnerId ? state.players.find(p => p.id === state.winnerId) : null;
    return {
      ...state,
      phase: 'game-over',
      loserId: loser?.id ?? null,
      lastAction: winner && loser
        ? `${winner.name} wins! ${loser.name} is the SHITHEAD!`
        : 'Game over!',
    };
  }

  return state;
}

// ── Client State Projection ─────────────────────────────────

export function getClientState(state: GameState, playerId: string): ClientGameState {
  const player = state.players.find(p => p.id === playerId);
  const currentPlayer = state.players[state.currentPlayerIndex];

  const opponents: OpponentView[] = state.players
    .filter(p => p.id !== playerId)
    .map(p => ({
      id: p.id,
      name: p.name,
      handCount: p.hand.length,
      faceUp: p.faceUp,
      faceDownCount: p.faceDown.length,
      connected: p.connected,
    }));

  const loser = state.loserId ? state.players.find(p => p.id === state.loserId) : null;

  // Check if player can deflect (has a black 6 in playable source)
  let canDeflect = false;
  if (state.mustPickUp && player) {
    const source = getCardSource(player);
    if (source === 'hand') {
      canDeflect = player.hand.some(c => c.rank === '6' && isBlackSuit(c.suit));
    } else if (source === 'faceUp') {
      canDeflect = player.faceUp.some(c => c.rank === '6' && isBlackSuit(c.suit));
    }
  }

  return {
    phase: state.phase,
    you: player
      ? {
          id: player.id,
          name: player.name,
          hand: player.hand,
          faceUp: player.faceUp,
          faceDownCount: player.faceDown.length,
          faceDownIds: player.faceDown.map(c => c.id),
          revealedFaceDown: state.revealedFaceDown?.playerId === playerId
            ? state.revealedFaceDown.card
            : undefined,
        }
      : { id: playerId, name: 'Unknown', hand: [], faceUp: [], faceDownCount: 0, faceDownIds: [] },
    opponents,
    pileTop: state.pile.slice(-4),
    pileCount: state.pile.length,
    effectiveCard: getEffectivePileTop(state.pile),
    drawPileCount: state.drawPile.length,
    currentPlayerId: currentPlayer?.id ?? '',
    direction: state.direction,
    isYourTurn: currentPlayer?.id === playerId,
    mustPickUp: state.mustPickUp && currentPlayer?.id === playerId,
    mustPlayLower: state.mustPlayLower,
    canDeflect,
    lastAction: state.lastAction,
    loserId: state.loserId,
    loserName: loser?.name ?? null,
    winnerId: state.winnerId,
    winnerName: state.winnerId ? state.players.find(p => p.id === state.winnerId)?.name ?? null : null,
    playerOrder: state.players.map(p => ({ id: p.id, name: p.name, connected: p.connected })),
    finishedPlayerIds: state.finishedPlayerIds,
  };
}

// ── Helpers ──────────────────────────────────────────────────

function formatCard(card: Card): string {
  const suitSymbols: Record<string, string> = {
    hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
  };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
