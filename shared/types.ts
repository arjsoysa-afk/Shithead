// ── Card Types ──────────────────────────────────────────────
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // e.g. "hearts-7-0" (trailing index for multi-deck)
}

export const RANK_ORDER: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

// Cards that can be played on anything (true "magic" cards)
export const SPECIAL_RANKS = new Set<Rank>(['2', '3', '10']);
// 7 is special (play-lower effect) but follows normal rank rules + cannot go on Ace

export function isRedSuit(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

export function isBlackSuit(suit: Suit): boolean {
  return suit === 'clubs' || suit === 'spades';
}

// ── Player Types ────────────────────────────────────────────
export interface Player {
  id: string;           // socket.id or "bot-xxx" for bots
  name: string;
  hand: Card[];
  faceUp: Card[];
  faceDown: Card[];
  connected: boolean;
  ready: boolean;       // swap phase readiness
  isBot?: boolean;      // true for computer players
}

export interface OpponentView {
  id: string;
  name: string;
  handCount: number;
  faceUp: Card[];
  faceDownCount: number;
  connected: boolean;
}

// ── Game State ──────────────────────────────────────────────
export type GamePhase = 'lobby' | 'swapping' | 'playing' | 'game-over';
export type PlayDirection = 'clockwise' | 'counter-clockwise';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  pile: Card[];
  drawPile: Card[];
  burnPile: Card[];
  currentPlayerIndex: number;
  direction: PlayDirection;
  mustPickUp: boolean;       // red 6 forced pickup
  mustPlayLower: boolean;    // 7 effect active
  lastAction: string;
  loserId: string | null;
  winnerId: string | null;     // first player to get rid of all cards
  finishedPlayerIds: string[]; // players who have emptied all cards (in order)
}

export interface ClientGameState {
  phase: GamePhase;
  you: {
    id: string;
    name: string;
    hand: Card[];
    faceUp: Card[];
    faceDownCount: number;
    faceDownIds: string[];  // IDs only (no rank/suit) so player can click to play blind
  };
  opponents: OpponentView[];
  pileTop: Card[];          // top 4 cards for display/validation context
  pileCount: number;
  effectiveCard: Card | null; // the card you need to beat (skips 3s) — shown peeking out
  drawPileCount: number;
  currentPlayerId: string;
  direction: PlayDirection;
  isYourTurn: boolean;
  mustPickUp: boolean;
  mustPlayLower: boolean;
  canDeflect: boolean;
  lastAction: string;
  loserId: string | null;
  loserName: string | null;
  winnerId: string | null;
  winnerName: string | null;
  playerOrder: { id: string; name: string; connected: boolean }[];
  finishedPlayerIds: string[];
}

// ── Room Types ──────────────────────────────────────────────
export interface RoomInfo {
  code: string;
  players: { id: string; name: string; connected: boolean }[];
  hostId: string;
}

// ── Socket Events ───────────────────────────────────────────
export interface ServerToClientEvents {
  'room-created': (data: { roomCode: string }) => void;
  'room-joined': (data: RoomInfo) => void;
  'player-joined': (data: RoomInfo) => void;
  'player-left': (data: RoomInfo) => void;
  'game-state': (state: ClientGameState) => void;
  'card-played': (data: { playerId: string; playerName: string; cards: Card[]; effect?: string }) => void;
  'pile-burned': (data: { reason: string; playerId: string; playerName: string }) => void;
  'special-effect': (data: { effect: 'FOOF' | 'MEGATRON' | 'DESTROYED'; playerName: string }) => void;
  'pile-picked-up': (data: { playerId: string; playerName: string; cardCount: number }) => void;
  'invalid-move': (data: { reason: string }) => void;
  'game-over': (data: { loserId: string; loserName: string; stats: GameEndStats }) => void;
  'error': (data: { message: string }) => void;
  'emoji-reaction': (data: { playerId: string; playerName: string; emoji: string }) => void;
}

export interface ClientToServerEvents {
  'create-room': (data: { playerName: string }) => void;
  'join-room': (data: { roomCode: string; playerName: string }) => void;
  'start-game': () => void;
  'swap-cards': (data: { handCardId: string; faceUpCardId: string }) => void;
  'ready': () => void;
  'play-cards': (data: { cardIds: string[] }) => void;
  'pick-up-pile': () => void;
  'play-again': () => void;
  'play-vs-computer': (data: { playerName: string }) => void;
  'rejoin-room': (data: { roomCode: string; playerName: string }) => void;
  'emoji-reaction': (data: { emoji: string }) => void;
}

// ── Stats Types ─────────────────────────────────────────────
export interface GameEndStats {
  players: { id: string; name: string }[];
  loserId: string;
  loserName: string;
  timestamp: number;
}

export interface PlayerStats {
  name: string;
  totalGames: number;
  wins: number;
  losses: number;
  currentStreak: number;    // positive = wins, negative = losses
  longestWinStreak: number;
  headToHead: Record<string, { wins: number; losses: number }>; // keyed by opponent name
  recentGames: {
    opponent: string; // or "multiplayer"
    won: boolean;
    timestamp: number;
    playerCount: number;
  }[];
}
