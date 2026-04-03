import React from 'react';

const GLOW_RED = '#ff4d6a';
const ACCENT_PURPLE = '#6c5ce7';
const DARK_METAL = '#1a1a2e';
const MID_METAL = '#2d2d44';
const LIGHT_METAL = '#3a3a55';
const HIGHLIGHT = '#4a4a66';

// Avatar 0: Horned Demon Skull
const HornedSkull: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="eyeGlow0" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={GLOW_RED} stopOpacity="1" />
        <stop offset="100%" stopColor={GLOW_RED} stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Horns */}
    <path d="M6 14 L2 2 L10 10 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.5" />
    <path d="M34 14 L38 2 L30 10 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.5" />
    {/* Skull shape */}
    <path d="M10 12 Q10 6 20 5 Q30 6 30 12 L30 24 Q30 30 26 32 L24 35 Q20 37 16 35 L14 32 Q10 30 10 24 Z"
      fill={DARK_METAL} stroke={LIGHT_METAL} strokeWidth="0.8" />
    {/* Forehead plate */}
    <path d="M12 12 Q12 8 20 7 Q28 8 28 12 L28 16 L12 16 Z"
      fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    {/* Cheekbones */}
    <path d="M11 18 L15 17 L15 22 L11 21 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    <path d="M29 18 L25 17 L25 22 L29 21 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    {/* Eye sockets */}
    <path d="M13 17 L18 16 L19 20 L13 21 Z" fill="#050508" />
    <path d="M27 17 L22 16 L21 20 L27 21 Z" fill="#050508" />
    {/* Glowing eyes */}
    <ellipse cx="16" cy="18.5" rx="1.8" ry="1.2" fill={GLOW_RED} />
    <ellipse cx="24" cy="18.5" rx="1.8" ry="1.2" fill={GLOW_RED} />
    <ellipse cx="16" cy="18.5" rx="3.5" ry="2.5" fill="url(#eyeGlow0)" opacity="0.5" />
    <ellipse cx="24" cy="18.5" rx="3.5" ry="2.5" fill="url(#eyeGlow0)" opacity="0.5" />
    {/* Nose cavity */}
    <path d="M18 22 L20 21 L22 22 L21 25 L19 25 Z" fill="#050508" />
    {/* Jaw with teeth */}
    <path d="M13 27 L27 27 L26 32 Q20 35 14 32 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    <path d="M15 27 L15 29.5" stroke={DARK_METAL} strokeWidth="0.5" />
    <path d="M18 27 L18 30" stroke={DARK_METAL} strokeWidth="0.5" />
    <path d="M22 27 L22 30" stroke={DARK_METAL} strokeWidth="0.5" />
    <path d="M25 27 L25 29.5" stroke={DARK_METAL} strokeWidth="0.5" />
    {/* Horn detail lines */}
    <path d="M4 5 L8 11" stroke={HIGHLIGHT} strokeWidth="0.3" opacity="0.5" />
    <path d="M36 5 L32 11" stroke={HIGHLIGHT} strokeWidth="0.3" opacity="0.5" />
  </g>
);

// Avatar 1: Cracked Faceplate
const CrackedFaceplate: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="eyeGlow1" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={GLOW_RED} stopOpacity="1" />
        <stop offset="100%" stopColor={GLOW_RED} stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Main skull */}
    <path d="M8 10 Q8 4 20 3 Q32 4 32 10 L32 26 Q32 32 26 34 L24 36 Q20 38 16 36 L14 34 Q8 32 8 26 Z"
      fill={DARK_METAL} stroke={LIGHT_METAL} strokeWidth="0.8" />
    {/* Faceplate */}
    <path d="M10 9 Q10 5 20 4.5 Q30 5 30 9 L30 25 Q30 28 20 28 Q10 28 10 25 Z"
      fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.5" />
    {/* Crack lines across face */}
    <path d="M18 4 L16 10 L19 15 L17 20 L15 28" stroke={GLOW_RED} strokeWidth="0.6" fill="none" opacity="0.8" />
    <path d="M16 10 L13 12" stroke={GLOW_RED} strokeWidth="0.4" fill="none" opacity="0.6" />
    <path d="M19 15 L22 14" stroke={GLOW_RED} strokeWidth="0.4" fill="none" opacity="0.6" />
    <path d="M17 20 L14 22" stroke={GLOW_RED} strokeWidth="0.4" fill="none" opacity="0.6" />
    {/* Exposed metal under crack */}
    <path d="M17 12 L16 10 L18 8 L19 11 Z" fill={GLOW_RED} opacity="0.15" />
    {/* Eye sockets - angular */}
    <rect x="12" y="14" width="6" height="4" rx="0.5" fill="#050508" transform="skewX(-5)" />
    <rect x="22" y="14" width="6" height="4" rx="0.5" fill="#050508" transform="skewX(5)" />
    {/* Glowing eyes */}
    <ellipse cx="15.5" cy="16" rx="2" ry="1.3" fill={GLOW_RED} />
    <ellipse cx="25" cy="16" rx="2" ry="1.3" fill={GLOW_RED} />
    <ellipse cx="15.5" cy="16" rx="3.5" ry="2.8" fill="url(#eyeGlow1)" opacity="0.4" />
    <ellipse cx="25" cy="16" rx="3.5" ry="2.8" fill="url(#eyeGlow1)" opacity="0.4" />
    {/* Damaged eye - one eye slightly different */}
    <ellipse cx="15.5" cy="16" rx="1" ry="0.6" fill="#fff" opacity="0.3" />
    {/* Nose slit */}
    <path d="M19 21 L20 20 L21 21 L20.5 23.5 L19.5 23.5 Z" fill="#050508" />
    {/* Jaw plate - bolted */}
    <path d="M11 28 L29 28 L28 33 Q20 37 12 33 Z" fill={DARK_METAL} stroke={HIGHLIGHT} strokeWidth="0.5" />
    <path d="M12 29 L28 29" stroke={LIGHT_METAL} strokeWidth="0.3" />
    {/* Jaw teeth marks */}
    <path d="M14 29 L14 31 M17 29 L17 32 M20 29 L20 32.5 M23 29 L23 32 M26 29 L26 31" stroke={LIGHT_METAL} strokeWidth="0.6" />
    {/* Bolts */}
    <circle cx="11" cy="12" r="1" fill={HIGHLIGHT} stroke={DARK_METAL} strokeWidth="0.3" />
    <circle cx="29" cy="12" r="1" fill={HIGHLIGHT} stroke={DARK_METAL} strokeWidth="0.3" />
  </g>
);

// Avatar 2: Exposed Circuitry
const CircuitrySkull: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="eyeGlow2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={GLOW_RED} stopOpacity="1" />
        <stop offset="100%" stopColor={GLOW_RED} stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Skull outline */}
    <path d="M9 12 Q9 5 20 4 Q31 5 31 12 L31 25 Q31 31 25 34 L22 36 Q20 37 18 36 L15 34 Q9 31 9 25 Z"
      fill={DARK_METAL} stroke={LIGHT_METAL} strokeWidth="0.8" />
    {/* Half face plate (right side) */}
    <path d="M20 5 Q30 6 30 12 L30 25 Q30 30 24 33 L20 33 L20 5 Z"
      fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    {/* Exposed circuitry on left side */}
    <path d="M12 8 L12 14 L15 14 L15 11 L18 11 L18 8" stroke={ACCENT_PURPLE} strokeWidth="0.5" fill="none" />
    <path d="M11 16 L14 16 L14 20 L17 20" stroke={ACCENT_PURPLE} strokeWidth="0.5" fill="none" />
    <path d="M11 22 L13 22 L13 26 L16 26 L16 30" stroke={ACCENT_PURPLE} strokeWidth="0.5" fill="none" />
    <path d="M15 14 L15 18 L18 18 L18 22" stroke={ACCENT_PURPLE} strokeWidth="0.4" fill="none" />
    {/* Circuit nodes */}
    <circle cx="12" cy="8" r="0.8" fill={ACCENT_PURPLE} />
    <circle cx="18" cy="8" r="0.8" fill={ACCENT_PURPLE} />
    <circle cx="15" cy="14" r="0.8" fill={ACCENT_PURPLE} />
    <circle cx="14" cy="20" r="0.8" fill={ACCENT_PURPLE} />
    <circle cx="13" cy="26" r="0.8" fill={ACCENT_PURPLE} />
    <circle cx="18" cy="22" r="0.8" fill={ACCENT_PURPLE} opacity="0.8" />
    {/* Pulsing circuit highlight */}
    <circle cx="15" cy="14" r="1.5" fill={ACCENT_PURPLE} opacity="0.3" />
    {/* Eye sockets */}
    <path d="M12 15 L17 14 L18 19 L12 19 Z" fill="#050508" />
    <path d="M28 15 L23 14 L22 19 L28 19 Z" fill="#050508" />
    {/* Glowing eyes - left one slightly different (exposed) */}
    <ellipse cx="15" cy="16.5" rx="1.5" ry="1.5" fill={GLOW_RED} />
    <ellipse cx="25" cy="16.5" rx="1.8" ry="1.2" fill={GLOW_RED} />
    <ellipse cx="15" cy="16.5" rx="3" ry="3" fill="url(#eyeGlow2)" opacity="0.4" />
    <ellipse cx="25" cy="16.5" rx="3.5" ry="2.5" fill="url(#eyeGlow2)" opacity="0.4" />
    {/* Nose */}
    <path d="M19 21 L20 20 L21 21 L20.5 24 L19.5 24 Z" fill="#050508" />
    {/* Lower jaw - asymmetric */}
    <path d="M11 27 L29 27 L28 32 Q20 36 12 32 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    {/* Teeth */}
    <path d="M14 27 L14 30 M17 27 L17 31 M20 27 L20 31.5 M23 27 L23 31 M26 27 L26 30" stroke={DARK_METAL} strokeWidth="0.5" />
    {/* Wires hanging from left jaw */}
    <path d="M12 30 Q10 33 11 36" stroke={ACCENT_PURPLE} strokeWidth="0.4" fill="none" />
    <path d="M14 31 Q12 34 13 37" stroke={GLOW_RED} strokeWidth="0.3" fill="none" />
  </g>
);

// Avatar 3: Visor Head
const VisorHead: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={GLOW_RED} stopOpacity="0.6" />
        <stop offset="50%" stopColor={GLOW_RED} stopOpacity="1" />
        <stop offset="100%" stopColor={GLOW_RED} stopOpacity="0.6" />
      </linearGradient>
      <radialGradient id="visorGlow3" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor={GLOW_RED} stopOpacity="0.5" />
        <stop offset="100%" stopColor={GLOW_RED} stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Skull shape - wider, more angular */}
    <path d="M7 13 Q7 4 20 3 Q33 4 33 13 L33 24 Q33 30 27 33 L24 35 Q20 37 16 35 L13 33 Q7 30 7 24 Z"
      fill={DARK_METAL} stroke={LIGHT_METAL} strokeWidth="0.8" />
    {/* Top cranium plates */}
    <path d="M10 10 Q10 6 20 5 Q30 6 30 10 L30 13 L10 13 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    <path d="M13 7 L20 5.5 L27 7" stroke={HIGHLIGHT} strokeWidth="0.3" fill="none" />
    {/* Visor band */}
    <path d="M8 14 L32 14 L33 18 Q33 20 32 21 L8 21 Q7 20 7 18 Z"
      fill="#0a0a12" stroke={LIGHT_METAL} strokeWidth="0.6" />
    {/* Visor glow */}
    <path d="M9 15 L31 15 L31.5 19.5 L8.5 19.5 Z" fill="url(#visorGrad)" opacity="0.9" />
    <rect x="8" y="13" width="24" height="9" rx="1" fill="url(#visorGlow3)" opacity="0.4" />
    {/* Visor scan line */}
    <line x1="10" y1="17.5" x2="30" y2="17.5" stroke="#fff" strokeWidth="0.3" opacity="0.4" />
    {/* Cheek plates */}
    <path d="M8 22 L14 21 L14 26 L9 26 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    <path d="M32 22 L26 21 L26 26 L31 26 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    {/* Nose area */}
    <path d="M18 22 L20 21 L22 22 L21 25 L19 25 Z" fill="#050508" />
    {/* Lower face / mouth guard */}
    <path d="M10 27 L30 27 L29 31 Q20 35 11 31 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    {/* Ventilation slits */}
    <line x1="14" y1="28" x2="14" y2="30.5" stroke={DARK_METAL} strokeWidth="0.8" />
    <line x1="17" y1="28" x2="17" y2="31" stroke={DARK_METAL} strokeWidth="0.8" />
    <line x1="20" y1="28" x2="20" y2="31.5" stroke={DARK_METAL} strokeWidth="0.8" />
    <line x1="23" y1="28" x2="23" y2="31" stroke={DARK_METAL} strokeWidth="0.8" />
    <line x1="26" y1="28" x2="26" y2="30.5" stroke={DARK_METAL} strokeWidth="0.8" />
    {/* Side bolts */}
    <circle cx="8" cy="17" r="1.2" fill={HIGHLIGHT} stroke={DARK_METAL} strokeWidth="0.3" />
    <circle cx="32" cy="17" r="1.2" fill={HIGHLIGHT} stroke={DARK_METAL} strokeWidth="0.3" />
  </g>
);

// Avatar 4: Heavy Jaw Plate
const JawPlate: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="eyeGlow4" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={GLOW_RED} stopOpacity="1" />
        <stop offset="100%" stopColor={GLOW_RED} stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Skull - squarish */}
    <path d="M9 11 Q9 4 20 3 Q31 4 31 11 L31 22 L31 22 L9 22 L9 11 Z"
      fill={DARK_METAL} stroke={LIGHT_METAL} strokeWidth="0.8" />
    {/* Forehead ridge */}
    <path d="M10 10 Q10 6 20 5 Q30 6 30 10 L30 12 L10 12 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    <path d="M10 12 L30 12" stroke={HIGHLIGHT} strokeWidth="0.6" />
    {/* Brow ridge - heavy */}
    <path d="M10 14 L18 13 L20 14 L22 13 L30 14 L30 15 L10 15 Z" fill={LIGHT_METAL} />
    {/* Eye sockets - deep set under brow */}
    <path d="M12 15.5 L18 15 L18 19 L12 19.5 Z" fill="#050508" />
    <path d="M28 15.5 L22 15 L22 19 L28 19.5 Z" fill="#050508" />
    {/* Glowing eyes - narrow angry */}
    <ellipse cx="15" cy="17" rx="2.2" ry="0.9" fill={GLOW_RED} />
    <ellipse cx="25" cy="17" rx="2.2" ry="0.9" fill={GLOW_RED} />
    <ellipse cx="15" cy="17" rx="3.5" ry="2" fill="url(#eyeGlow4)" opacity="0.45" />
    <ellipse cx="25" cy="17" rx="3.5" ry="2" fill="url(#eyeGlow4)" opacity="0.45" />
    {/* Eye highlights */}
    <ellipse cx="15" cy="16.8" rx="0.8" ry="0.4" fill="#fff" opacity="0.2" />
    <ellipse cx="25" cy="16.8" rx="0.8" ry="0.4" fill="#fff" opacity="0.2" />
    {/* Nose */}
    <path d="M19 20 L20 19.5 L21 20 L20.5 22 L19.5 22 Z" fill="#050508" />
    {/* MASSIVE jaw plate */}
    <path d="M7 23 L33 23 L34 28 L33 34 Q20 40 7 34 L6 28 Z"
      fill={MID_METAL} stroke={LIGHT_METAL} strokeWidth="0.6" />
    {/* Jaw ridge */}
    <path d="M8 24 L32 24" stroke={HIGHLIGHT} strokeWidth="0.5" />
    {/* Teeth - large industrial */}
    <rect x="13" y="24" width="2.5" height="3.5" rx="0.3" fill={DARK_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    <rect x="16.5" y="24" width="2.5" height="4" rx="0.3" fill={DARK_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    <rect x="20" y="24" width="2.5" height="4" rx="0.3" fill={DARK_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    <rect x="23.5" y="24" width="2.5" height="3.5" rx="0.3" fill={DARK_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    {/* Jaw bolts */}
    <circle cx="9" cy="27" r="1.3" fill={HIGHLIGHT} stroke={DARK_METAL} strokeWidth="0.4" />
    <circle cx="31" cy="27" r="1.3" fill={HIGHLIGHT} stroke={DARK_METAL} strokeWidth="0.4" />
    <circle cx="9" cy="32" r="0.8" fill={HIGHLIGHT} stroke={DARK_METAL} strokeWidth="0.3" />
    <circle cx="31" cy="32" r="0.8" fill={HIGHLIGHT} stroke={DARK_METAL} strokeWidth="0.3" />
    {/* Chin plate detail */}
    <path d="M15 32 L25 32 L23 36 Q20 38 17 36 Z" fill={DARK_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
  </g>
);

// Avatar 5: Mohawk Crest
const MohawkCrest: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="eyeGlow5" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={GLOW_RED} stopOpacity="1" />
        <stop offset="100%" stopColor={GLOW_RED} stopOpacity="0" />
      </radialGradient>
      <linearGradient id="crestGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor={ACCENT_PURPLE} stopOpacity="0.8" />
        <stop offset="100%" stopColor={GLOW_RED} stopOpacity="0.9" />
      </linearGradient>
    </defs>
    {/* Mohawk crest - tall sharp fins */}
    <path d="M18 10 L19 1 L20 4 L21 0 L22 5 L23 2 L24 10" fill="url(#crestGrad)" stroke={GLOW_RED} strokeWidth="0.3" />
    {/* Secondary crest details */}
    <path d="M19 8 L19.5 3 L20 6 Z" fill={GLOW_RED} opacity="0.4" />
    <path d="M22 8 L22.5 4 L23 7 Z" fill={GLOW_RED} opacity="0.4" />
    {/* Skull - narrow and angular */}
    <path d="M11 13 Q11 7 20 6 Q29 7 29 13 L30 24 Q30 30 26 33 L23 35 Q20 36 17 35 L14 33 Q10 30 10 24 Z"
      fill={DARK_METAL} stroke={LIGHT_METAL} strokeWidth="0.8" />
    {/* Face plates - segmented */}
    <path d="M13 11 Q13 8 20 7.5 Q27 8 27 11 L27 14 L13 14 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    <path d="M12 15 L19 15 L19 22 L12 22 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    <path d="M21 15 L28 15 L28 22 L21 22 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.3" />
    {/* Eye sockets - triangular/aggressive */}
    <path d="M14 16 L18 15.5 L18 19.5 L13 20 Z" fill="#050508" />
    <path d="M26 16 L22 15.5 L22 19.5 L27 20 Z" fill="#050508" />
    {/* Glowing eyes */}
    <ellipse cx="16" cy="17.5" rx="1.5" ry="1.3" fill={GLOW_RED} />
    <ellipse cx="24" cy="17.5" rx="1.5" ry="1.3" fill={GLOW_RED} />
    <ellipse cx="16" cy="17.5" rx="3" ry="2.5" fill="url(#eyeGlow5)" opacity="0.45" />
    <ellipse cx="24" cy="17.5" rx="3" ry="2.5" fill="url(#eyeGlow5)" opacity="0.45" />
    {/* Nose */}
    <path d="M19 22 L20 21 L21 22 L20.5 24.5 L19.5 24.5 Z" fill="#050508" />
    {/* Scarred cheek */}
    <line x1="26" y1="20" x2="29" y2="24" stroke={GLOW_RED} strokeWidth="0.3" opacity="0.6" />
    <line x1="27" y1="20" x2="30" y2="23" stroke={GLOW_RED} strokeWidth="0.2" opacity="0.4" />
    {/* Lower jaw */}
    <path d="M12 26 L28 26 L27 31 Q20 35 13 31 Z" fill={MID_METAL} stroke={HIGHLIGHT} strokeWidth="0.4" />
    {/* Teeth - jagged */}
    <path d="M15 26 L16 29 L17 26 L18.5 30 L20 26 L21.5 30 L23 26 L24 29 L25 26" stroke={LIGHT_METAL} strokeWidth="0.5" fill={DARK_METAL} />
    {/* Side head studs */}
    <circle cx="10" cy="17" r="1" fill={ACCENT_PURPLE} opacity="0.7" />
    <circle cx="30" cy="17" r="1" fill={ACCENT_PURPLE} opacity="0.7" />
    <circle cx="10" cy="21" r="0.7" fill={ACCENT_PURPLE} opacity="0.5" />
    <circle cx="30" cy="21" r="0.7" fill={ACCENT_PURPLE} opacity="0.5" />
  </g>
);

const avatarComponents = [
  HornedSkull,
  CrackedFaceplate,
  CircuitrySkull,
  VisorHead,
  JawPlate,
  MohawkCrest,
];

/**
 * Returns the avatar SVG component for a given player index (cycles 0-5).
 */
export function getAvatar(playerIndex: number): React.FC {
  const idx = ((playerIndex % 6) + 6) % 6;
  return avatarComponents[idx];
}

interface PlayerAvatarProps {
  index: number;
  size?: number;
}

/**
 * Renders a terminator head avatar at the given size.
 */
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ index, size = 32 }) => {
  const AvatarComponent = getAvatar(index);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <AvatarComponent />
    </svg>
  );
};

export default PlayerAvatar;
