import { motion } from 'framer-motion';
import type { ClientGameState, PlayerStats } from '../../../shared/types';

interface GameOverProps {
  gameState: ClientGameState;
  stats: PlayerStats | null;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

// Generate stable raindrop configs once (not on every render)
const RAINDROP_COUNT = 30;
const NEON_COLOURS = ['#bf5af2', '#00f0ff', '#ff6bcb', '#00ff87'];

const raindrops = Array.from({ length: RAINDROP_COUNT }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${(Math.random() * 2).toFixed(2)}s`,
  duration: `${(1 + Math.random() * 2).toFixed(2)}s`,
  height: `${Math.floor(20 + Math.random() * 21)}px`,
  colour: NEON_COLOURS[Math.floor(Math.random() * NEON_COLOURS.length)],
}));

export function GameOver({ gameState, stats, isHost, onPlayAgain, onLeave }: GameOverProps) {
  const isLoser = gameState.loserId === gameState.you.id;
  const isWinner = gameState.winnerId === gameState.you.id;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      {/* ── Neon rain (winner only) ─────────────────────────────────── */}
      {isWinner && (
        <>
          <style>{`
            @keyframes neon-rain {
              from { transform: translateY(-40px); opacity: 1; }
              to   { transform: translateY(100vh);  opacity: 0; }
            }
          `}</style>
          {raindrops.map((drop) => (
            <div
              key={drop.id}
              style={{
                position: 'fixed',
                top: 0,
                left: drop.left,
                width: '2px',
                height: drop.height,
                background: drop.colour,
                borderRadius: '1px',
                boxShadow: `0 0 6px ${drop.colour}`,
                animation: `neon-rain ${drop.duration} ${drop.delay} linear infinite`,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          ))}
        </>
      )}

      {/* ── Crown drop (loser only) ──────────────────────────────────── */}
      {isLoser && (
        <motion.div
          className="fixed top-6 left-1/2 -translate-x-1/2 text-6xl select-none"
          style={{ zIndex: 20 }}
          initial={{ y: -200 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.15 }}
        >
          👑
        </motion.div>
      )}

      {/* ── Main card ───────────────────────────────────────────────── */}
      <motion.div
        className="w-full max-w-lg bg-bg-card border border-border rounded-3xl p-12 text-center
          relative overflow-hidden shadow-2xl"
        style={{ zIndex: 10 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(108,92,231,0.03),transparent,rgba(191,90,242,0.03),transparent)]" />
          </div>
        </div>

        {/* Winner banner */}
        {gameState.winnerName && (
          <motion.div
            className="mb-6 relative z-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-5xl mb-3">🏆</div>
            <div
              className="text-2xl font-extrabold text-accent tracking-tight"
              style={{ fontFamily: "'CyberSlash', sans-serif" }}
            >
              {gameState.winnerName} wins!
            </div>
          </motion.div>
        )}

        {/* ── Poop emoji — spinning for loser ─────────────────────── */}
        <motion.div
          className="relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
        >
          <motion.div
            className="text-7xl mb-4 inline-block"
            animate={isLoser ? { rotate: 360 } : {}}
            transition={
              isLoser
                ? { duration: 3, repeat: Infinity, ease: 'linear' }
                : {}
            }
          >
            💩
          </motion.div>
        </motion.div>

        {/* ── "YOU ARE THE SHITHEAD" headline (loser) ─────────────── */}
        {isLoser ? (
          <motion.div
            className="relative z-10 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* "YOU ARE THE" flicker */}
            <motion.div
              className="text-lg font-bold uppercase tracking-widest mb-1"
              style={{ color: '#ff2222', fontFamily: "'CyberSlash', sans-serif" }}
              animate={{ opacity: [1, 0.7, 1, 0.75, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              YOU ARE THE
            </motion.div>

            {/* "SHITHEAD" pulsing */}
            <motion.div
              className="text-5xl font-extrabold uppercase"
              style={{
                color: '#ff2222',
                fontFamily: "'CyberSlash', sans-serif",
                textShadow: '0 0 18px rgba(255,34,34,0.85), 0 0 40px rgba(255,34,34,0.4)',
              }}
              animate={{ scale: [1.0, 1.08, 1.0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              SHITHEAD
            </motion.div>
          </motion.div>
        ) : (
          /* ── Standard loser banner (not current player) ──────────── */
          <motion.h2
            className="text-3xl font-extrabold tracking-tight mb-2 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span style={{ fontFamily: "'CyberSlash', sans-serif" }}>
              {gameState.loserName} is the{' '}
              <span
                className="text-danger uppercase"
                style={{ textShadow: '0 0 30px rgba(239,68,68,0.8)' }}
              >
                SHITHEAD
              </span>
            </span>
          </motion.h2>
        )}

        {/* ── Loser's name with red glow (non-loser perspective) ───── */}
        {!isLoser && gameState.loserName && (
          <motion.p
            className="text-lg font-semibold mb-1 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            style={{
              color: '#ef4444',
              textShadow: '0 0 30px rgba(239,68,68,0.8)',
              fontFamily: "'CyberSlash', sans-serif",
            }}
          >
            {gameState.loserName}
          </motion.p>
        )}

        <motion.p
          className="text-text-secondary text-lg mb-8 relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isLoser ? 'Better luck next time.' : isWinner ? 'Get in there!' : 'Well played!'}
        </motion.p>

        {/* Stats flash */}
        {stats && (
          <motion.div
            className="mb-8 p-4 rounded-xl bg-white/[0.02] border border-border relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-accent">{stats.wins}</div>
                <div className="text-[11px] text-text-muted uppercase tracking-wide">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-danger">{stats.losses}</div>
                <div className="text-[11px] text-text-muted uppercase tracking-wide">Losses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {stats.currentStreak > 0 ? `${stats.currentStreak}` : '0'}
                </div>
                <div className="text-[11px] text-text-muted uppercase tracking-wide">Streak</div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="flex gap-3 justify-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {isHost && (
            <button
              className="px-8 py-3.5 rounded-xl bg-accent text-white font-semibold
                hover:shadow-[0_4px_24px_rgba(108,92,231,0.3)] hover:-translate-y-0.5
                transition-all duration-200"
              onClick={onPlayAgain}
            >
              Play Again
            </button>
          )}
          <button
            className="px-8 py-3.5 rounded-xl bg-transparent border border-border
              text-text-primary font-medium hover:border-border-hover hover:bg-white/[0.02]
              transition-all duration-200"
            onClick={onLeave}
          >
            Leave
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
