import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export type SpecialEffect = {
  id: string;
  effect: 'FOOF' | 'MEGATRON' | 'DESTROYED';
  playerName: string;
};

interface FloatingEffectProps {
  effects: SpecialEffect[];
}

const EFFECT_STYLES: Record<SpecialEffect['effect'], {
  text: string;
  gradient: string;
  glow: string;
  emoji: string;
}> = {
  FOOF: {
    text: 'FOOF',
    gradient: 'from-pink-500 via-purple-500 to-pink-500',
    glow: 'shadow-[0_0_60px_rgba(236,72,153,0.6)]',
    emoji: '👑',
  },
  MEGATRON: {
    text: 'MEGATRON',
    gradient: 'from-purple-400 via-fuchsia-300 to-violet-400',
    glow: 'shadow-[0_0_60px_rgba(191,90,242,0.6)]',
    emoji: '🔥',
  },
  DESTROYED: {
    text: 'DESTROYED',
    gradient: 'from-cyan-400 via-blue-500 to-purple-600',
    glow: 'shadow-[0_0_60px_rgba(59,130,246,0.6)]',
    emoji: '💥',
  },
};

export function FloatingEffect({ effects }: FloatingEffectProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <AnimatePresence>
        {effects.map((fx) => {
          const style = EFFECT_STYLES[fx.effect];
          return (
            <motion.div
              key={fx.id}
              className="absolute flex flex-col items-center"
              initial={{ scale: 0.3, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -40 }}
              transition={{
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1],
                exit: { duration: 0.5, ease: 'easeOut' },
              }}
            >
              <div
                className={`
                  text-5xl sm:text-7xl md:text-8xl font-black tracking-wider
                  bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent
                  ${style.glow} rounded-2xl
                  drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]
                  select-none
                `}
                style={{
                  fontFamily: "'CyberSlash', sans-serif",
                  WebkitTextStroke: '1px rgba(255,255,255,0.15)',
                  textShadow: '0 0 40px rgba(255,255,255,0.2)',
                }}
              >
                {style.emoji} {style.text} {style.emoji}
              </div>
              <motion.div
                className="text-white/60 text-sm mt-2 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {fx.playerName}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
