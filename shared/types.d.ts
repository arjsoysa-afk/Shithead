export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export interface Card {
    suit: Suit;
    rank: Rank;
    id: string;
}
export declare const RANK_ORDER: Record<Rank, number>;
export declare const SPECIAL_RANKS: Set<Rank>;
export declare function isRedSuit(suit: Suit): boolean;
export declare function isBlackSuit(suit: Suit): boolean;
export interface Player {
    id: string;
    name: string;
    hand: Card[];
    faceUp: Card[];
    faceDown: Card[];
    connected: boolean;
    ready: boolean;
}
export interface OpponentView {
    id: string;
    name: string;
    handCount: number;
    faceUp: Card[];
    faceDownCount: number;
    connected: boolean;
}
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
    mustPickUp: boolean;
    mustPlayLower: boolean;
    lastAction: string;
    loserId: string | null;
    finishedPlayerIds: string[];
}
export interface ClientGameState {
    phase: GamePhase;
    you: {
        id: string;
        name: string;
        hand: Card[];
        faceUp: Card[];
        faceDownCount: number;
    };
    opponents: OpponentView[];
    pileTop: Card[];
    pileCount: number;
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
    playerOrder: {
        id: string;
        name: string;
        connected: boolean;
    }[];
    finishedPlayerIds: string[];
}
export interface RoomInfo {
    code: string;
    players: {
        id: string;
        name: string;
        connected: boolean;
    }[];
    hostId: string;
}
export interface ServerToClientEvents {
    'room-created': (data: {
        roomCode: string;
    }) => void;
    'room-joined': (data: RoomInfo) => void;
    'player-joined': (data: RoomInfo) => void;
    'player-left': (data: RoomInfo) => void;
    'game-state': (state: ClientGameState) => void;
    'card-played': (data: {
        playerId: string;
        playerName: string;
        cards: Card[];
        effect?: string;
    }) => void;
    'pile-burned': (data: {
        reason: string;
        playerId: string;
        playerName: string;
    }) => void;
    'pile-picked-up': (data: {
        playerId: string;
        playerName: string;
        cardCount: number;
    }) => void;
    'invalid-move': (data: {
        reason: string;
    }) => void;
    'game-over': (data: {
        loserId: string;
        loserName: string;
        stats: GameEndStats;
    }) => void;
    'error': (data: {
        message: string;
    }) => void;
}
export interface ClientToServerEvents {
    'create-room': (data: {
        playerName: string;
    }) => void;
    'join-room': (data: {
        roomCode: string;
        playerName: string;
    }) => void;
    'start-game': () => void;
    'swap-cards': (data: {
        handCardId: string;
        faceUpCardId: string;
    }) => void;
    'ready': () => void;
    'play-cards': (data: {
        cardIds: string[];
    }) => void;
    'pick-up-pile': () => void;
    'play-again': () => void;
}
export interface GameEndStats {
    players: {
        id: string;
        name: string;
    }[];
    loserId: string;
    loserName: string;
    timestamp: number;
}
export interface PlayerStats {
    name: string;
    totalGames: number;
    wins: number;
    losses: number;
    currentStreak: number;
    longestWinStreak: number;
    headToHead: Record<string, {
        wins: number;
        losses: number;
    }>;
    recentGames: {
        opponent: string;
        won: boolean;
        timestamp: number;
        playerCount: number;
    }[];
}
