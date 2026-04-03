export function CyberpunkBg() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080818 0%, #0a0a20 40%, #0c0c28 100%)' }}>

      {/* ── Primary neon grid ── */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Main grid pattern */}
          <pattern id="grid-main" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Horizontal line */}
            <line x1="0" y1="120" x2="120" y2="120" stroke="rgba(191,90,242,0.12)" strokeWidth="0.8" />
            {/* Vertical line */}
            <line x1="120" y1="0" x2="120" y2="120" stroke="rgba(191,90,242,0.12)" strokeWidth="0.8" />
          </pattern>

          {/* Sub-grid pattern (smaller divisions) */}
          <pattern id="grid-sub" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="0" y1="40" x2="40" y2="40" stroke="rgba(191,90,242,0.04)" strokeWidth="0.4" />
            <line x1="40" y1="0" x2="40" y2="40" stroke="rgba(191,90,242,0.04)" strokeWidth="0.4" />
          </pattern>

          {/* Glow filter for nodes */}
          <filter id="node-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="line-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Sub-grid */}
        <rect width="100%" height="100%" fill="url(#grid-sub)" />
        {/* Main grid */}
        <rect width="100%" height="100%" fill="url(#grid-main)" />
      </svg>

      {/* ── Glowing horizontal accent lines ── */}
      <div className="absolute inset-0">
        {/* Purple accent line — upper */}
        <div className="absolute left-0 right-0" style={{
          top: '25%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(191,90,242,0.25) 20%, rgba(191,90,242,0.4) 50%, rgba(191,90,242,0.25) 80%, transparent 100%)',
          boxShadow: '0 0 12px rgba(191,90,242,0.2), 0 0 30px rgba(191,90,242,0.08)',
        }} />
        {/* Teal accent line — middle */}
        <div className="absolute left-0 right-0" style={{
          top: '50%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.15) 15%, rgba(0,240,255,0.3) 50%, rgba(0,240,255,0.15) 85%, transparent 100%)',
          boxShadow: '0 0 12px rgba(0,240,255,0.15), 0 0 30px rgba(0,240,255,0.06)',
        }} />
        {/* Purple accent line — lower */}
        <div className="absolute left-0 right-0" style={{
          top: '75%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(191,90,242,0.2) 25%, rgba(191,90,242,0.35) 50%, rgba(191,90,242,0.2) 75%, transparent 100%)',
          boxShadow: '0 0 12px rgba(191,90,242,0.15), 0 0 30px rgba(191,90,242,0.06)',
        }} />

        {/* Vertical accent lines */}
        <div className="absolute top-0 bottom-0" style={{
          left: '25%',
          width: '1px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(191,90,242,0.2) 20%, rgba(191,90,242,0.35) 50%, rgba(191,90,242,0.2) 80%, transparent 100%)',
          boxShadow: '0 0 10px rgba(191,90,242,0.12)',
        }} />
        <div className="absolute top-0 bottom-0" style={{
          left: '75%',
          width: '1px',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,240,255,0.15) 20%, rgba(0,240,255,0.25) 50%, rgba(0,240,255,0.15) 80%, transparent 100%)',
          boxShadow: '0 0 10px rgba(0,240,255,0.1)',
        }} />
      </div>

      {/* ── Glowing intersection nodes ── */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Purple nodes at grid intersections */}
        {[
          [120, 120], [360, 120], [600, 120], [840, 120],
          [240, 240], [480, 240], [720, 240],
          [120, 360], [360, 360], [600, 360], [840, 360],
          [240, 480], [480, 480], [720, 480],
          [120, 600], [360, 600], [600, 600], [840, 600],
        ].map(([x, y], i) => (
          <g key={`node-${i}`}>
            {/* Outer glow */}
            <circle cx={x} cy={y} r="8" fill="none"
              stroke={i % 3 === 1 ? 'rgba(0,240,255,0.15)' : 'rgba(191,90,242,0.15)'}
              strokeWidth="0.5" />
            {/* Inner glow halo */}
            <circle cx={x} cy={y} r="4"
              fill={i % 3 === 1 ? 'rgba(0,240,255,0.08)' : 'rgba(191,90,242,0.08)'}
              filter="url(#node-glow)" />
            {/* Core dot */}
            <circle cx={x} cy={y} r="1.5"
              fill={i % 3 === 1 ? 'rgba(0,240,255,0.6)' : 'rgba(191,90,242,0.6)'} />
          </g>
        ))}

        {/* Bright accent nodes — pink/magenta like the reference */}
        {[
          [180, 180], [540, 300], [300, 540], [660, 180], [420, 420],
        ].map(([x, y], i) => (
          <g key={`bright-${i}`}>
            <circle cx={x} cy={y} r="12"
              fill="none" stroke="rgba(255,107,203,0.12)" strokeWidth="0.5" />
            <circle cx={x} cy={y} r="5"
              fill="rgba(255,107,203,0.1)" filter="url(#node-glow)" />
            <circle cx={x} cy={y} r="2"
              fill="rgba(255,107,203,0.7)" />
          </g>
        ))}
      </svg>

      {/* ── Circuit trace overlays ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        {/* Top-left circuit */}
        <path d="M0 120 L80 120 L100 140 L100 240 L130 270 L200 270"
          stroke="#bf5af2" strokeWidth="1.2" fill="none" />
        <path d="M100 140 L160 140 L180 160 L180 200"
          stroke="#bf5af2" strokeWidth="0.8" fill="none" />

        {/* Bottom-right circuit */}
        <path d="M100% 80% L 90% 80% L 88% 78% L 88% 65% L 85% 62% L 80% 62%"
          stroke="#00f0ff" strokeWidth="1" fill="none" />

        {/* Top-right circuit */}
        <path d="M85% 0 L 85% 8% L 82% 11% L 75% 11% L 72% 14% L 72% 22%"
          stroke="#bf5af2" strokeWidth="0.8" fill="none" />

        {/* Bottom-left circuit */}
        <path d="M0 85% L 5% 85% L 8% 82% L 8% 70% L 12% 66%"
          stroke="#00f0ff" strokeWidth="0.8" fill="none" />

        {/* Random circuit rectangles */}
        <rect x="75%" y="70%" width="8%" height="5%" rx="2"
          stroke="#bf5af2" strokeWidth="0.6" fill="none" opacity="0.5" />
        <rect x="10%" y="15%" width="6%" height="4%" rx="2"
          stroke="#00f0ff" strokeWidth="0.6" fill="none" opacity="0.4" />
      </svg>

      {/* ── Scanline overlay ── */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 3px)',
      }} />

      {/* ── Animated pulse nodes ── */}
      <div className="absolute animate-pulse" style={{
        top: '25%', left: '25%',
        width: 6, height: 6, borderRadius: '50%',
        background: 'rgba(191,90,242,0.4)',
        boxShadow: '0 0 15px rgba(191,90,242,0.3), 0 0 40px rgba(191,90,242,0.1)',
      }} />
      <div className="absolute animate-pulse" style={{
        top: '50%', left: '75%',
        width: 5, height: 5, borderRadius: '50%',
        background: 'rgba(0,240,255,0.35)',
        boxShadow: '0 0 15px rgba(0,240,255,0.25), 0 0 40px rgba(0,240,255,0.08)',
        animationDelay: '1.5s',
      }} />
      <div className="absolute animate-pulse" style={{
        top: '75%', left: '50%',
        width: 5, height: 5, borderRadius: '50%',
        background: 'rgba(255,107,203,0.35)',
        boxShadow: '0 0 15px rgba(255,107,203,0.25), 0 0 40px rgba(255,107,203,0.08)',
        animationDelay: '0.8s',
      }} />

      {/* ── Corner brackets ── */}
      <svg className="absolute top-3 left-3 w-10 h-10 opacity-25" viewBox="0 0 40 40">
        <path d="M0 15 L0 0 L15 0" fill="none" stroke="#bf5af2" strokeWidth="1.5" />
      </svg>
      <svg className="absolute top-3 right-3 w-10 h-10 opacity-25" viewBox="0 0 40 40">
        <path d="M25 0 L40 0 L40 15" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-3 left-3 w-10 h-10 opacity-25" viewBox="0 0 40 40">
        <path d="M0 25 L0 40 L15 40" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-3 right-3 w-10 h-10 opacity-25" viewBox="0 0 40 40">
        <path d="M25 40 L40 40 L40 25" fill="none" stroke="#bf5af2" strokeWidth="1.5" />
      </svg>

      {/* ── Vignette overlay ── */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(4,4,12,0.6) 100%)',
      }} />
    </div>
  );
}
