import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import type { Card as CardType } from '../../../shared/types';

interface PileProps {
  topCards: CardType[];
  count: number;
}

export function Pile({ topCards, count }: PileProps) {
  if (count === 0) {
    return (
      <div className="w-[72px] h-[100px] rounded-xl border border-dashed border-white/[0.06] flex items-center justify-center">
        <span className="text-text-muted text-xs">Empty</span>
      </div>
    );
  }

  const rotations = [-3, 2, -1, 1];

  return (
    <div className="relative w-[72px] h-[100px]">
      <AnimatePresence mode="popLayout">
        {topCards.map((card, i) => (
          <motion.div
            key={card.id}
            className="absolute inset-0"
            style={{ zIndex: i, rotate: rotations[i % rotations.length] }}
            initial={{ scale: 1.2, opacity: 0, y: -40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card card={card} />
          </motion.div>
        ))}
      </AnimatePresence>
      {count > 1 && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-text-muted text-[11px] whitespace-nowrap">
          {count} cards
        </div>
      )}
    </div>
  );
}
