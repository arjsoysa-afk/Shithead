import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import type { ClientGameState, Card as CardType } from '../../../shared/types';

interface SwapPhaseProps {
  gameState: ClientGameState;
  onSwap: (handCardId: string, faceUpCardId: string) => void;
  onReady: () => void;
}

export function SwapPhase({ gameState, onSwap, onReady }: SwapPhaseProps) {
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedFaceUp, setSelectedFaceUp] = useState<string | null>(null);

  const handleHandClick = (card: CardType) => {
    if (selectedHand === card.id) {
      setSelectedHand(null);
    } else {
      setSelectedHand(card.id);
      if (selectedFaceUp) {
        onSwap(card.id, selectedFaceUp);
        setSelectedHand(null);
        setSelectedFaceUp(null);
      }
    }
  };

  const handleFaceUpClick = (card: CardType) => {
    if (selectedFaceUp === card.id) {
      setSelectedFaceUp(null);
    } else {
      setSelectedFaceUp(card.id);
      if (selectedHand) {
        onSwap(selectedHand, card.id);
        setSelectedHand(null);
        setSelectedFaceUp(null);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold mb-2">Swap Your Cards</h2>
        <p className="text-text-secondary text-sm">
          Click a hand card then a face-up card to swap them. Press Ready when done.
        </p>
      </motion.div>

      {/* Face-up cards */}
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Face Up</div>
        <div className="flex gap-3 justify-center">
          {gameState.you.faceUp.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              selected={selectedFaceUp === card.id}
              onClick={() => handleFaceUpClick(card)}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Face-down cards (not interactive) */}
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Face Down</div>
        <div className="flex gap-3 justify-center">
          {Array.from({ length: gameState.you.faceDownCount }).map((_, i) => (
            <Card key={`fd-${i}`} index={i} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-48 h-px bg-border" />

      {/* Hand cards */}
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-3">Your Hand</div>
        <div className="flex gap-3 justify-center">
          {gameState.you.hand.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              selected={selectedHand === card.id}
              onClick={() => handleHandClick(card)}
              index={i}
            />
          ))}
        </div>
      </div>

      <motion.button
        className="px-8 py-3.5 rounded-xl bg-accent text-white font-semibold
          hover:shadow-[0_4px_24px_rgba(108,92,231,0.3)] hover:-translate-y-0.5
          transition-all duration-200"
        onClick={onReady}
        whileTap={{ scale: 0.97 }}
      >
        Ready
      </motion.button>

      {/* Opponents ready status */}
      <div className="flex gap-4 text-sm text-text-muted">
        {gameState.opponents.map((opp) => (
          <span key={opp.id} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${opp.connected ? 'bg-success' : 'bg-text-muted'}`} />
            {opp.name}
          </span>
        ))}
      </div>
    </div>
  );
}
