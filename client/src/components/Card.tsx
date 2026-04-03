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
  const w = small ? 'w-[52px]' : 'w-[88px]';
  const h = small ? 'h-[74px]' : 'h-[124px]';
  const r = small ? 'rounded-lg' : 'rounded-xl';

  if (!card) {
    // ══════════════════════════════════════════════════════
    //  FACE-DOWN — Cyberpunk sacred geometry card back
    //  Dark with neon cyan sacred geometry, circuits, hex grid
    // ══════════════════════════════════════════════════════
    const svgW = small ? 52 : 88;
    const svgH = small ? 74 : 124;
    const cx = svgW / 2;
    const cy = svgH / 2;
    const uid = `cb-${small ? 's' : 'l'}-${index}`;

    return (
      <motion.div
        className={`${w} ${h} ${r} relative cursor-pointer flex-shrink-0 overflow-hidden`}
        style={{
          background: 'linear-gradient(160deg, #0a1628 0%, #060e1a 40%, #040a14 100%)',
          border: '1px solid rgba(191,90,242,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6), inset 0 0 20px rgba(191,90,242,0.03)',
        }}
        onClick={onClick}
        whileHover={onClick ? { y: -4, scale: 1.03 } : undefined}
        whileTap={onClick ? { scale: 0.97 } : undefined}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        {/* Sacred geometry SVG */}
        <svg
          className="absolute inset-0"
          width={svgW} height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Hex grid pattern */}
            <pattern id={`hex-${uid}`} x="0" y="0" width="16" height="14" patternUnits="userSpaceOnUse">
              <path d="M8 0 L16 4.62 L16 9.24 L8 13.86 L0 9.24 L0 4.62 Z"
                stroke="rgba(191,90,242,0.06)" strokeWidth="0.3" fill="none" />
            </pattern>
            {/* Radial glow */}
            <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="45%">
              <stop offset="0%" stopColor="rgba(191,90,242,0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background hex grid */}
          <rect width="100%" height="100%" fill={`url(#hex-${uid})`} />

          {/* Central glow */}
          <rect width="100%" height="100%" fill={`url(#glow-${uid})`} />

          {!small ? (
            <>
              {/* ── Sacred geometry: Metatron's Cube ── */}
              {/* Outer circle */}
              <circle cx={cx} cy={cy} r="30" stroke="rgba(191,90,242,0.12)" strokeWidth="0.5" />
              {/* Inner circle */}
              <circle cx={cx} cy={cy} r="18" stroke="rgba(191,90,242,0.15)" strokeWidth="0.5" />
              {/* Core circle */}
              <circle cx={cx} cy={cy} r="6" stroke="rgba(191,90,242,0.2)" strokeWidth="0.6" />
              <circle cx={cx} cy={cy} r="2" fill="rgba(191,90,242,0.15)" />

              {/* Flower of life — 6 overlapping circles */}
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const px = cx + 12 * Math.cos(rad);
                const py = cy + 12 * Math.sin(rad);
                return (
                  <circle key={deg} cx={px} cy={py} r="12"
                    stroke="rgba(191,90,242,0.07)" strokeWidth="0.4" fill="none" />
                );
              })}

              {/* Hexagram (Star of David) — two overlapping triangles */}
              <polygon
                points={[0, 60, 120, 180, 240, 300].map((deg, i) => {
                  if (i % 2 === 0) {
                    const rad = ((deg - 90) * Math.PI) / 180;
                    return `${cx + 22 * Math.cos(rad)},${cy + 22 * Math.sin(rad)}`;
                  }
                  return null;
                }).filter(Boolean).join(' ')}
                stroke="rgba(191,90,242,0.18)" strokeWidth="0.6" fill="none"
              />
              <polygon
                points={[0, 60, 120, 180, 240, 300].map((deg, i) => {
                  if (i % 2 === 1) {
                    const rad = ((deg - 90) * Math.PI) / 180;
                    return `${cx + 22 * Math.cos(rad)},${cy + 22 * Math.sin(rad)}`;
                  }
                  return null;
                }).filter(Boolean).join(' ')}
                stroke="rgba(191,90,242,0.18)" strokeWidth="0.6" fill="none"
              />

              {/* Connecting lines from center to hex vertices */}
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                const px = cx + 22 * Math.cos(rad);
                const py = cy + 22 * Math.sin(rad);
                return (
                  <line key={`line-${deg}`} x1={cx} y1={cy} x2={px} y2={py}
                    stroke="rgba(191,90,242,0.06)" strokeWidth="0.3" />
                );
              })}

              {/* Node dots at hex vertices */}
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                const px = cx + 22 * Math.cos(rad);
                const py = cy + 22 * Math.sin(rad);
                return (
                  <circle key={`dot-${deg}`} cx={px} cy={py} r="1.2"
                    fill="rgba(191,90,242,0.3)" />
                );
              })}

              {/* Corner circuit traces */}
              <path d="M4 4 L12 4 L16 8" stroke="rgba(191,90,242,0.15)" strokeWidth="0.5" />
              <path d="M68 4 L60 4 L56 8" stroke="rgba(191,90,242,0.15)" strokeWidth="0.5" />
              <path d="M4 96 L12 96 L16 92" stroke="rgba(191,90,242,0.15)" strokeWidth="0.5" />
              <path d="M68 96 L60 96 L56 92" stroke="rgba(191,90,242,0.15)" strokeWidth="0.5" />

              {/* Corner dots */}
              <circle cx="4" cy="4" r="1" fill="rgba(191,90,242,0.25)" />
              <circle cx="68" cy="4" r="1" fill="rgba(191,90,242,0.25)" />
              <circle cx="4" cy="96" r="1" fill="rgba(191,90,242,0.25)" />
              <circle cx="68" cy="96" r="1" fill="rgba(191,90,242,0.25)" />

              {/* Top/bottom data lines */}
              <line x1="20" y1="4" x2="52" y2="4" stroke="rgba(191,90,242,0.06)" strokeWidth="0.3" />
              <line x1="20" y1="96" x2="52" y2="96" stroke="rgba(191,90,242,0.06)" strokeWidth="0.3" />
            </>
          ) : (
            <>
              {/* Small card — simplified sacred geometry */}
              <circle cx={cx} cy={cy} r="20" stroke="rgba(191,90,242,0.1)" strokeWidth="0.4" />
              <circle cx={cx} cy={cy} r="12" stroke="rgba(191,90,242,0.12)" strokeWidth="0.4" />
              <circle cx={cx} cy={cy} r="4" stroke="rgba(191,90,242,0.18)" strokeWidth="0.5" />
              <circle cx={cx} cy={cy} r="1.5" fill="rgba(191,90,242,0.12)" />

              {/* Mini hexagram */}
              {[0, 120, 240].map((deg) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                return (
                  <line key={deg} x1={cx + 5 * Math.cos(rad)} y1={cy + 5 * Math.sin(rad)}
                    x2={cx + 15 * Math.cos(rad)} y2={cy + 15 * Math.sin(rad)}
                    stroke="rgba(191,90,242,0.1)" strokeWidth="0.3" />
                );
              })}
              {[60, 180, 300].map((deg) => {
                const rad = ((deg - 90) * Math.PI) / 180;
                return (
                  <line key={deg} x1={cx + 5 * Math.cos(rad)} y1={cy + 5 * Math.sin(rad)}
                    x2={cx + 15 * Math.cos(rad)} y2={cy + 15 * Math.sin(rad)}
                    stroke="rgba(191,90,242,0.1)" strokeWidth="0.3" />
                );
              })}

              {/* Corner ticks */}
              <path d="M3 3 L8 3 L10 5" stroke="rgba(191,90,242,0.12)" strokeWidth="0.4" />
              <path d="M45 3 L40 3 L38 5" stroke="rgba(191,90,242,0.12)" strokeWidth="0.4" />
              <path d="M3 65 L8 65 L10 63" stroke="rgba(191,90,242,0.12)" strokeWidth="0.4" />
              <path d="M45 65 L40 65 L38 63" stroke="rgba(191,90,242,0.12)" strokeWidth="0.4" />
            </>
          )}
        </svg>

        {/* Center "S" emblem */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span
            className={`font-black ${small ? 'text-xs' : 'text-lg'}`}
            style={{
              color: 'rgba(191,90,242,0.35)',
              textShadow: '0 0 10px rgba(191,90,242,0.2), 0 0 25px rgba(191,90,242,0.08)',
              fontFamily: "'CyberSlash', sans-serif",
            }}
          >
            S
          </span>
        </div>

        {/* Inner border frame */}
        <div className="absolute inset-[3px] rounded-lg pointer-events-none"
          style={{ border: '0.5px solid rgba(191,90,242,0.08)' }} />

        {/* Scanline texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(191,90,242,0.15) 2px, rgba(191,90,242,0.15) 3px)',
        }} />
      </motion.div>
    );
  }

  // ══════════════════════════════════════════════════════
  //  FACE-UP — Clean white card with colored rank/suit
  // ══════════════════════════════════════════════════════
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const suitColor = isRed ? '#dc2626' : '#1a1a2e';
  const fontSize = small ? 'text-[11px]' : 'text-[18px]';
  const suitSize = small ? 'text-xl' : 'text-[38px]';
  const cornerSuit = small ? 'text-[8px]' : 'text-[13px]';

  return (
    <motion.div
      className={`${w} ${h} ${r} relative cursor-pointer flex-shrink-0 overflow-hidden
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
      `}
      style={{
        background: 'linear-gradient(160deg, #ffffff 0%, #f8f8fa 50%, #f0f0f4 100%)',
        border: selected
          ? '2px solid #bf5af2'
          : '1px solid rgba(0,0,0,0.08)',
        boxShadow: selected
          ? '0 0 24px rgba(191,90,242,0.4), 0 4px 16px rgba(0,0,0,0.15)'
          : '0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      }}
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
      <div className="absolute top-1.5 left-2 flex flex-col items-center leading-none z-10">
        <span
          className={`${fontSize} font-black`}
          style={{
            color: suitColor,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.02em',
          }}
        >
          {card.rank}
        </span>
        <span
          className={`${cornerSuit} -mt-0.5`}
          style={{ color: suitColor, opacity: 0.8 }}
        >
          {suitSymbol}
        </span>
      </div>

      {/* Center suit — large */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span
          className={`${suitSize}`}
          style={{
            color: suitColor,
            opacity: 0.9,
          }}
        >
          {suitSymbol}
        </span>
      </div>

      {/* Bottom-right rank (rotated) */}
      <div className="absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180 z-10">
        <span
          className={`${fontSize} font-black`}
          style={{
            color: suitColor,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.02em',
          }}
        >
          {card.rank}
        </span>
        <span
          className={`${cornerSuit} -mt-0.5`}
          style={{ color: suitColor, opacity: 0.8 }}
        >
          {suitSymbol}
        </span>
      </div>

      {/* Selection ring glow */}
      {selected && (
        <motion.div
          className={`absolute -inset-[2px] ${r} pointer-events-none`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            border: '2px solid #bf5af2',
            boxShadow: '0 0 20px rgba(191,90,242,0.4), inset 0 0 12px rgba(191,90,242,0.1)',
          }}
        />
      )}
    </motion.div>
  );
}
