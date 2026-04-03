import { motion } from 'framer-motion';
import { Card } from './Card';
import { FaceDownCards } from './FaceDownCards';
import { PlayerAvatar } from './Avatar';
import type { OpponentView } from '../../../shared/types';

interface OpponentRowProps {
  opponent: OpponentView;
  isCurrentTurn: boolean;
  isFinished: boolean;
  avatarIndex: number;
}

const CYBER_COLORS = [
  '#bf5af2', // neon purple
  '#00f0ff', // neon teal
  '#ff6bcb', // neon pink
  '#00ff87', // neon green
  '#ffd60a', // neon yellow
  '#7b61ff', // electric violet
];

export function OpponentRow({ opponent, isCurrentTurn, isFinished, avatarIndex }: OpponentRowProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      animate={{
        opacity: isFinished ? 0.4 : 1,
      }}
    >
      {/* Hand cards (face-down) */}
      {opponent.handCount > 0 && (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] uppercase tracking-widest" style={{
            fontFamily: "'CyberSlash', sans-serif",
            color: 'rgba(191,90,242,0.4)',
          }}>Hand</span>
          <FaceDownCards count={opponent.handCount} small />
        </div>
      )}

      {/* Table cards: face-up stacked on top of face-down (like the player's layout) */}
      {(opponent.faceDownCount > 0 || opponent.faceUp.length > 0) && (
        <div className="flex gap-1">
          {Array.from({ length: Math.max(opponent.faceDownCount, opponent.faceUp.length) }).map((_, i) => {
            const hasFD = i < opponent.faceDownCount;
            const faceUpCard = opponent.faceUp[i];
            return (
              <div key={i} className="relative" style={{ width: 52, height: hasFD && faceUpCard ? 82 : 74 }}>
                {hasFD && (
                  <div className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                    <Card small index={i} />
                  </div>
                )}
                {faceUpCard && (
                  <div className="absolute left-0" style={{ top: hasFD ? 12 : 0, zIndex: 2 }}>
                    <Card card={faceUpCard} small disabled index={i} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
