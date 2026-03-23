import { motion } from 'framer-motion';
import { FaceUpCards } from './FaceUpCards';
import { FaceDownCards } from './FaceDownCards';
import type { OpponentView } from '../../../shared/types';

interface OpponentRowProps {
  opponent: OpponentView;
  isCurrentTurn: boolean;
  isFinished: boolean;
}

export function OpponentRow({ opponent, isCurrentTurn, isFinished }: OpponentRowProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      animate={{
        opacity: isFinished ? 0.4 : 1,
      }}
    >
      {/* Name + status */}
      <div className={`flex items-center gap-2 text-sm font-medium
        ${isCurrentTurn ? 'text-accent' : 'text-text-secondary'}
        ${!opponent.connected ? 'opacity-50' : ''}
      `}>
        <div className={`w-2 h-2 rounded-full ${
          !opponent.connected ? 'bg-danger' :
          isCurrentTurn ? 'bg-accent animate-pulse' :
          'bg-success'
        }`} />
        <span>{opponent.name}</span>
        {isFinished && <span className="text-success text-xs">(out)</span>}
      </div>

      {/* Face-down cards */}
      {opponent.faceDownCount > 0 && (
        <FaceDownCards count={opponent.faceDownCount} small />
      )}

      {/* Face-up cards */}
      {opponent.faceUp.length > 0 && (
        <FaceUpCards cards={opponent.faceUp} small disabled />
      )}

      {/* Hand count */}
      {opponent.handCount > 0 && (
        <div className="text-text-muted text-[11px]">
          {opponent.handCount} in hand
        </div>
      )}
    </motion.div>
  );
}
