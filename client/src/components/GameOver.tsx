import { motion } from 'framer-motion';
import type { ClientGameState, PlayerStats } from '../../../shared/types';

interface GameOverProps {
  gameState: ClientGameState;
  stats: PlayerStats | null;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function GameOver({ gameState, stats, isHost, onPlayAgain, onLeave }: GameOverProps) {
  const isLoser = gameState.loserId === gameState.you.id;
  const isWinner = gameState.winnerId === gameState.you.id;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg bg-bg-card border border-border rounded-3xl p-12 text-center
          relative overflow-hidden shadow-2xl"
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
            <div className="text-2xl font-extrabold text-accent tracking-tight"
              style={{ fontFamily: "'CyberSlash', sans-serif" }}>
              {gameState.winnerName} wins!
            </div>
          </motion.div>
        )}

        {/* Shithead banner */}
        <motion.div
          className="relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
        >
          <div className="text-6xl mb-4">💩</div>
        </motion.div>

        <motion.h2
          className="text-3xl font-extrabold tracking-tight mb-2 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span style={{ fontFamily: "'CyberSlash', sans-serif" }}>{gameState.loserName} is the{' '}
          <span className="text-danger uppercase">SHITHEAD</span></span>
        </motion.h2>

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
