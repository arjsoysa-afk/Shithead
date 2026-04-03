import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import type { Card as CardType } from '../../../shared/types';

interface PileProps {
  topCards: CardType[];
  count: number;
  effectiveCard?: CardType | null; // the card you need to beat (skips 3s)
}

export function Pile({ topCards, count, effectiveCard }: PileProps) {
  if (count === 0) {
    return (
      <div className="w-[88px] h-[124px] rounded-xl border border-dashed border-white/[0.06] flex items-center justify-center">
        <span className="text-text-muted text-xs">Empty</span>
      </div>
    );
  }

  const rotations = [-3, 2, -1, 1];

  // Show the effective card peeking out if the top card is a 3
  // Always show the card underneath slightly so players know what's active
  const topCard = topCards[topCards.length - 1];
  const showPeek = topCard?.rank === '3' && effectiveCard && effectiveCard.id !== topCard.id;
  // Also show a subtle "card below" when there are 2+ cards (not just for 3s)
  const cardBelow = topCards.length >= 2 ? topCards[topCards.length - 2] : null;

  return (
    <div className="relative w-[88px] h-[124px]">
      {/* Peeking card underneath (the card you need to beat) — always visible */}
      {showPeek && effectiveCard && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ zIndex: 0, top: '-28px' }}
        >
          <Card card={effectiveCard} small />
          <div className="text-center text-[9px] text-amber-400/80 font-bold mt-0.5 whitespace-nowrap"
            style={{ fontFamily: "'CyberSlash', sans-serif" }}>
            BEAT THIS
          </div>
        </div>
      )}

      {/* Card below top — always slightly visible */}
      {!showPeek && cardBelow && (
        <div
          className="absolute left-1/2 -translate-x-1/2 opacity-40 scale-[0.88]"
          style={{ zIndex: 0, top: '-12px' }}
        >
          <Card card={cardBelow} small />
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {topCards.map((card, i) => (
          <motion.div
            key={card.id}
            className="absolute inset-0"
            style={{ zIndex: i + 1, rotate: rotations[i % rotations.length] }}
            initial={{ scale: 1.2, opacity: 0, y: -40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card card={card} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Card count */}
      {count > 1 && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-sm font-medium whitespace-nowrap"
          style={{ fontFamily: "'CyberSlash', sans-serif" }}>
          <span style={{ color: '#bf5af2', textShadow: '0 0 8px rgba(191,90,242,0.5)' }}>{count}</span>
          <span className="text-text-muted"> cards</span>
        </div>
      )}

      {/* "Beat this" indicator when 3 is on top */}
      {showPeek && effectiveCard && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-amber-400/70 whitespace-nowrap">
          Beat: {effectiveCard.rank}
        </div>
      )}
    </div>
  );
}
