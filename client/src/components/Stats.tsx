import { motion } from 'framer-motion';
import type { PlayerStats } from '../../../shared/types';

interface StatsProps {
  stats: PlayerStats;
  onClose: () => void;
}

export function Stats({ stats, onClose }: StatsProps) {
  const winRate = stats.totalGames > 0
    ? Math.round((stats.wins / stats.totalGames) * 100)
    : 0;

  const h2hEntries = Object.entries(stats.headToHead)
    .sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses));

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-lg bg-bg-card border border-border rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Your Stats</h2>
          <button
            className="text-text-muted hover:text-text-primary transition-colors text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {stats.totalGames === 0 ? (
          <p className="text-text-muted text-center py-8">No games played yet!</p>
        ) : (
          <>
            {/* Overview */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-border">
                <div className="text-xl font-bold">{stats.totalGames}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wide mt-1">Played</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-border">
                <div className="text-xl font-bold text-accent">{stats.wins}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wide mt-1">Wins</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-border">
                <div className="text-xl font-bold text-danger">{stats.losses}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wide mt-1">Losses</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-border">
                <div className="text-xl font-bold text-success">{winRate}%</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wide mt-1">Win Rate</div>
              </div>
            </div>

            {/* Streaks */}
            <div className="flex gap-3 mb-8">
              <div className="flex-1 p-3 rounded-xl bg-white/[0.02] border border-border">
                <div className="text-sm text-text-secondary">Current Streak</div>
                <div className={`text-lg font-bold ${stats.currentStreak > 0 ? 'text-success' : stats.currentStreak < 0 ? 'text-danger' : 'text-text-muted'}`}>
                  {stats.currentStreak > 0 ? `${stats.currentStreak}W` : stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}L` : '—'}
                </div>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-white/[0.02] border border-border">
                <div className="text-sm text-text-secondary">Best Streak</div>
                <div className="text-lg font-bold text-accent">{stats.longestWinStreak}W</div>
              </div>
            </div>

            {/* Head to Head */}
            {h2hEntries.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                  Head to Head
                </h3>
                <div className="space-y-2 mb-8">
                  {h2hEntries.map(([name, record]) => (
                    <div key={name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02] border border-border">
                      <span className="text-sm font-medium">vs {name}</span>
                      <span className="text-sm">
                        <span className="text-accent font-bold">{record.wins}</span>
                        <span className="text-text-muted mx-1">-</span>
                        <span className="text-danger font-bold">{record.losses}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Recent Games */}
            {stats.recentGames.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
                  Recent Games
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {stats.recentGames.map((game, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]">
                      <span className="text-sm text-text-secondary">
                        vs {game.opponent}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        game.won
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {game.won ? 'WIN' : 'LOSS'}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
