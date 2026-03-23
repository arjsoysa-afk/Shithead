import { Card, Suit, Rank } from '../../shared/types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function createDeck(deckCount: number = 1): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank, id: `${suit}-${rank}-${d}` });
      }
    }
  }
  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function deal(playerCount: number): {
  playerCards: { hand: Card[]; faceUp: Card[]; faceDown: Card[] }[];
  drawPile: Card[];
} {
  const deckCount = playerCount >= 5 ? 2 : 1;
  const deck = createDeck(deckCount);

  const playerCards: { hand: Card[]; faceUp: Card[]; faceDown: Card[] }[] = [];

  let idx = 0;
  for (let p = 0; p < playerCount; p++) {
    const faceDown = deck.slice(idx, idx + 3); idx += 3;
    const faceUp = deck.slice(idx, idx + 3); idx += 3;
    const hand = deck.slice(idx, idx + 3); idx += 3;
    playerCards.push({ hand, faceUp, faceDown });
  }

  const drawPile = deck.slice(idx);
  return { playerCards, drawPile };
}
