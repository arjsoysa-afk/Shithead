import { motion } from 'framer-motion';
import type { Card as CardType, Suit } from '../../../shared/types';

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

interface CardProps {
  card?: CardType;       // undefined = face-down
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
  onClick?: () => void;
  index?: number;        // for stagger animations
}

export function Card({ card, selected, disabled, small, onClick, index = 0 }: CardProps) {
  const isRed = card && (card.suit === 'hearts' || card.suit === 'diamonds');
  const w = small ? 'w-[48px]' : 'w-[72px]';
  const h = small ? 'h-[68px]' : 'h-[100px]';

  if (!card) {
    // Face-down card
    return (
      <motion.div
        className={`${w} ${h} rounded-xl relative cursor-pointer flex-shrink-0
          bg-gradient-to-br from-[#1a1a3e] to-[#12122a]
          border border-accent/20 shadow-lg overflow-hidden`}
        onClick={onClick}
        whileHover={onClick ? { y: -4, scale: 1.03 } : undefined}
        whileTap={onClick ? { scale: 0.97 } : undefined}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="absolute inset-[5px] rounded-lg border border-accent/10"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(108,92,231,0.04) 4px, rgba(108,92,231,0.04) 8px)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-accent/20 font-extrabold text-lg">S</span>
        </div>
      </motion.div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const colorClass = isRed ? 'text-card-red' : 'text-[#1a1a2e]';
  const fontSize = small ? 'text-[11px]' : 'text-sm';
  const suitSize = small ? 'text-lg' : 'text-2xl';

  return (
    <motion.div
      className={`${w} ${h} rounded-xl relative cursor-pointer flex-shrink-0
        bg-gradient-to-br from-white to-[#f0f0f5]
        border border-black/[0.08]
        shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_0_0_1px_rgba(255,255,255,0.1)]
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
        ${selected ? 'ring-2 ring-accent shadow-[0_0_20px_rgba(108,92,231,0.3)]' : ''}
      `}
      onClick={disabled ? undefined : onClick}
      animate={{
        y: selected ? (small ? -8 : -20) : 0,
        opacity: 1,
      }}
      whileHover={!disabled && !selected ? { y: small ? -4 : -12, transition: { duration: 0.15 } } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
      layout
    >
      {/* Top-left rank + suit */}
      <span className={`absolute top-1 left-1.5 ${fontSize} font-bold leading-none ${colorClass}`}>
        {card.rank}
      </span>
      <span className={`absolute ${small ? 'top-3.5 left-1.5 text-[9px]' : 'top-5 left-1.5 text-xs'} leading-none ${colorClass}`}>
        {suitSymbol}
      </span>

      {/* Center suit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${suitSize} ${colorClass} mt-1`}>{suitSymbol}</span>
      </div>

      {/* Bottom-right rank (rotated) */}
      <span className={`absolute bottom-1 right-1.5 ${fontSize} font-bold leading-none ${colorClass} rotate-180`}>
        {card.rank}
      </span>

      {/* Selection glow */}
      {selected && (
        <motion.div
          className="absolute -inset-[2px] rounded-xl border-2 border-accent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ boxShadow: '0 0 16px rgba(108,92,231,0.3)' }}
        />
      )}
    </motion.div>
  );
}
