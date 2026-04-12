import { AnimatePresence, motion } from 'framer-motion';

export interface FloatingEmoji {
  id: string;
  emoji: string;
  playerName: string;
  /** Horizontal position as a percentage of screen width (20–80). */
  x: number;
}

interface EmojiReactionProps {
  reactions: FloatingEmoji[];
}

export function EmojiReaction({ reactions }: EmojiReactionProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: `${reaction.x}%`, bottom: '10%' }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -150, opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
          >
            {/* Emoji */}
            <span className="text-4xl select-none drop-shadow-lg">
              {reaction.emoji}
            </span>
            {/* Player name */}
            <span
              className="text-xs text-purple-300 whitespace-nowrap"
              style={{
                fontFamily: "'CyberSlash', sans-serif",
                textShadow: '0 0 8px rgba(168, 85, 247, 0.9)',
              }}
            >
              {reaction.playerName}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
