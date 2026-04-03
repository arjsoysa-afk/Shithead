import { motion } from 'framer-motion';

// Hand-crafted cyberpunk angular letterforms
// Each letter is drawn with sharp, jagged, lightning-bolt style strokes
// Designed to match the pointed cyberpunk font aesthetic

// Jagged, angular, lightning-bolt style cyberpunk letterforms
// Each letter uses sharp zigzag strokes — like electric discharge forming text
// Italic slant applied via CSS transform
const LETTER_PATHS: Record<string, { path: string; width: number }> = {
  S: {
    path: 'M30 4 L12 2 L6 4 L4 8 L6 12 L4 18 L8 22 L26 20 L30 24 L32 30 L28 36 L30 40 L26 44 L8 42 L4 40',
    width: 34,
  },
  H: {
    path: 'M4 2 L6 14 L4 26 L6 38 L4 44 M4 22 L10 20 L20 24 L30 20 L34 22 M34 2 L32 14 L34 26 L32 38 L34 44',
    width: 38,
  },
  I: {
    path: 'M4 2 L18 4 M11 2 L13 14 L10 22 L13 32 L11 44 M4 44 L18 42',
    width: 22,
  },
  T: {
    path: 'M2 2 L14 5 L22 2 L34 4 M18 4 L16 16 L19 28 L16 38 L18 44',
    width: 36,
  },
  E: {
    path: 'M32 2 L18 4 L8 2 L4 4 L6 14 L4 22 L6 32 L4 40 L8 44 L20 42 L32 44 M6 22 L14 24 L24 20',
    width: 36,
  },
  A: {
    path: 'M2 44 L8 30 L6 22 L12 12 L18 2 L24 12 L30 22 L28 30 L34 44 M8 30 L14 28 L22 30 L28 28',
    width: 36,
  },
  D: {
    path: 'M4 2 L6 14 L4 26 L6 38 L4 44 L22 42 L30 36 L32 28 L30 18 L32 10 L28 4 L14 2 L4 2',
    width: 36,
  },
  F: {
    path: 'M32 2 L18 4 L8 2 L4 4 L6 14 L4 22 L6 32 L4 44 M6 22 L14 24 L24 20',
    width: 36,
  },
  O: {
    path: 'M12 2 L24 4 L30 8 L32 16 L30 24 L32 32 L28 40 L24 44 L12 42 L6 38 L4 32 L6 24 L4 16 L8 8 L12 2',
    width: 36,
  },
  M: {
    path: 'M4 44 L6 30 L4 18 L6 8 L4 2 L12 18 L20 4 L28 18 L36 2 L34 8 L36 18 L34 30 L36 44',
    width: 40,
  },
  G: {
    path: 'M32 4 L18 2 L8 4 L4 10 L6 18 L4 26 L6 34 L4 40 L10 44 L24 42 L32 40 L32 28 L22 26',
    width: 36,
  },
  R: {
    path: 'M4 2 L6 14 L4 26 L6 38 L4 44 M6 2 L24 4 L30 8 L28 16 L30 20 L26 24 L12 22 L6 22 M22 24 L28 34 L32 44',
    width: 36,
  },
  N: {
    path: 'M4 44 L6 30 L4 18 L6 8 L4 2 L14 18 L24 32 L32 44 L30 30 L32 18 L30 8 L32 2',
    width: 36,
  },
  Y: {
    path: 'M2 2 L8 12 L14 18 L18 24 L16 34 L18 44 M34 2 L28 12 L22 18 L18 24',
    width: 36,
  },
  W: {
    path: 'M2 2 L6 18 L10 34 L12 44 L18 28 L22 16 L26 28 L30 44 L34 34 L38 18 L42 2',
    width: 44,
  },
  U: {
    path: 'M4 2 L6 14 L4 26 L6 34 L10 42 L18 44 L26 42 L30 34 L32 26 L30 14 L32 2',
    width: 36,
  },
  C: {
    path: 'M32 4 L18 2 L8 4 L4 10 L6 18 L4 26 L6 34 L4 40 L10 44 L24 42 L32 40',
    width: 36,
  },
  K: {
    path: 'M4 2 L6 14 L4 26 L6 38 L4 44 M32 2 L22 12 L12 22 L6 22 M14 24 L24 34 L32 44',
    width: 36,
  },
  L: {
    path: 'M4 2 L6 14 L4 26 L6 38 L4 44 L16 42 L28 44 L32 42',
    width: 36,
  },
  P: {
    path: 'M4 2 L6 14 L4 26 L6 38 L4 44 M6 2 L24 4 L30 8 L28 16 L30 20 L26 24 L12 22 L6 22',
    width: 36,
  },
};

// Add jagged/electric distortion to path points
function electrify(pathStr: string, intensity: number = 1.5): string {
  return pathStr.replace(/(\d+\.?\d*)\s+(\d+\.?\d*)/g, (_, x, y) => {
    const nx = parseFloat(x) + (Math.random() - 0.5) * intensity;
    const ny = parseFloat(y) + (Math.random() - 0.5) * intensity;
    return `${nx.toFixed(1)} ${ny.toFixed(1)}`;
  });
}

interface CyberpunkTitleProps {
  text: string;
  className?: string;
}

export function CyberpunkTitle({ text, className = '' }: CyberpunkTitleProps) {
  const letters = text.toUpperCase().split('');
  const gap = 6;
  let totalWidth = 0;
  const letterPositions: { char: string; x: number; w: number }[] = [];

  for (const char of letters) {
    const info = LETTER_PATHS[char];
    if (info) {
      letterPositions.push({ char, x: totalWidth, w: info.width });
      totalWidth += info.width + gap;
    } else if (char === ' ') {
      totalWidth += 20;
    }
  }
  totalWidth -= gap; // remove trailing gap

  const height = 44;
  const padding = 4;
  const viewW = totalWidth + padding * 2;
  const viewH = height + padding * 2;

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
    >
      {/* Glitch layer 1 */}
      <svg
        className="absolute inset-0 w-full select-none"
        viewBox={`0 0 ${viewW} ${viewH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'skewX(-8deg) translate(3px, -2px)' }}
        aria-hidden="true"
      >
        {letterPositions.map(({ char, x }, i) => {
          const info = LETTER_PATHS[char];
          if (!info) return null;
          return (
            <g key={`g1-${i}`} transform={`translate(${x + padding}, ${padding})`}>
              <path
                d={electrify(info.path, 2)}
                stroke="rgba(191,90,242,0.15)"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="bevel"
                fill="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Glitch layer 2 */}
      <svg
        className="absolute inset-0 w-full select-none"
        viewBox={`0 0 ${viewW} ${viewH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: 'skewX(-8deg) translate(-3px, 2px)' }}
        aria-hidden="true"
      >
        {letterPositions.map(({ char, x }, i) => {
          const info = LETTER_PATHS[char];
          if (!info) return null;
          return (
            <g key={`g2-${i}`} transform={`translate(${x + padding}, ${padding})`}>
              <path
                d={electrify(info.path, 2)}
                stroke="rgba(120,50,200,0.12)"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="bevel"
                fill="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Main title */}
      <svg
        className="relative w-full"
        viewBox={`0 0 ${viewW} ${viewH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 0 6px rgba(191,90,242,0.7)) drop-shadow(0 0 25px rgba(191,90,242,0.35))',
          transform: 'skewX(-8deg)',
        }}
      >
        {letterPositions.map(({ char, x }, i) => {
          const info = LETTER_PATHS[char];
          if (!info) return null;
          return (
            <g key={`main-${i}`} transform={`translate(${x + padding}, ${padding})`}>
              <path
                d={info.path}
                stroke="#bf5af2"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="bevel"
                fill="none"
              />
            </g>
          );
        })}
      </svg>

      {/* Underline glow bar */}
      <motion.div
        className="mx-auto mt-2 h-[2px] rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #bf5af2, transparent)',
          boxShadow: '0 0 20px rgba(191,90,242,0.4)',
        }}
        initial={{ width: 0 }}
        animate={{ width: '80%' }}
        transition={{ delay: 0.4, duration: 0.6 }}
      />
    </motion.div>
  );
}
