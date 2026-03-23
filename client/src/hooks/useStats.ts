import { useCallback } from 'react';
import type { GameEndStats, PlayerStats } from '../../../shared/types';

const STATS_KEY = 'shithead-stats';

function getStats(playerName: string): PlayerStats {
  try {
    const raw = localStorage.getItem(`${STATS_KEY}-${playerName}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    name: playerName,
    totalGames: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    headToHead: {},
    recentGames: [],
  };
}

function saveStats(stats: PlayerStats): void {
  localStorage.setItem(`${STATS_KEY}-${stats.name}`, JSON.stringify(stats));
}

export function useStats(playerName: string) {
  const recordGame = useCallback((endStats: GameEndStats) => {
    if (!playerName) return;

    const stats = getStats(playerName);
    const isLoser = endStats.loserName === playerName;
    const won = !isLoser;
    const playerCount = endStats.players.length;

    stats.totalGames++;
    if (won) {
      stats.wins++;
      stats.currentStreak = stats.currentStreak > 0 ? stats.currentStreak + 1 : 1;
      stats.longestWinStreak = Math.max(stats.longestWinStreak, stats.currentStreak);
    } else {
      stats.losses++;
      stats.currentStreak = stats.currentStreak < 0 ? stats.currentStreak - 1 : -1;
    }

    // Head-to-head (for 1v1 games, track against the opponent)
    if (playerCount === 2) {
      const opponent = endStats.players.find(p => p.name !== playerName);
      if (opponent) {
        if (!stats.headToHead[opponent.name]) {
          stats.headToHead[opponent.name] = { wins: 0, losses: 0 };
        }
        if (won) stats.headToHead[opponent.name].wins++;
        else stats.headToHead[opponent.name].losses++;
      }
    }

    // For multiplayer, track h2h against the loser (if we won) or all players (if we lost)
    if (playerCount > 2) {
      const opponents = endStats.players.filter(p => p.name !== playerName);
      for (const opp of opponents) {
        if (!stats.headToHead[opp.name]) {
          stats.headToHead[opp.name] = { wins: 0, losses: 0 };
        }
      }
      // In multiplayer, only the loser "loses" — everyone else wins
      if (won) {
        if (!stats.headToHead[endStats.loserName]) {
          stats.headToHead[endStats.loserName] = { wins: 0, losses: 0 };
        }
        stats.headToHead[endStats.loserName].wins++;
      } else {
        // We lost — record a loss against everyone
        for (const opp of opponents) {
          stats.headToHead[opp.name].losses++;
        }
      }
    }

    // Recent games
    stats.recentGames.unshift({
      opponent: playerCount === 2
        ? endStats.players.find(p => p.name !== playerName)?.name ?? 'Unknown'
        : `${playerCount} players`,
      won,
      timestamp: endStats.timestamp,
      playerCount,
    });
    stats.recentGames = stats.recentGames.slice(0, 20);

    saveStats(stats);
    return stats;
  }, [playerName]);

  const loadStats = useCallback((): PlayerStats => {
    return getStats(playerName);
  }, [playerName]);

  return { recordGame, loadStats };
}
