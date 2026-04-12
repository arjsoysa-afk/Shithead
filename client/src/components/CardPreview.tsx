import { motion } from 'framer-motion';
import { Card } from './Card';
import type { Card as CardType } from '../../../shared/types';

interface CardPreviewProps {
  card: CardType;
  onClose: () => void;
}

export function CardPreview({ card, onClose }: CardPreviewProps) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', zIndex: 100 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1.2 }}
        exit={{ scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card card={card} small={false} />
      </motion.div>
    </motion.div>
  );
}
