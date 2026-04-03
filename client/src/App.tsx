import { useState, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { useSocket } from './hooks/useSocket';
import { useKeyboard } from './hooks/useKeyboard';
import { useStats } from './hooks/useStats';
import { Lobby } from './components/Lobby';
import { SwapPhase } from './components/SwapPhase';
import { GameBoard } from './components/GameBoard';
import { GameOver } from './components/GameOver';
import { Stats } from './components/Stats';
import { ToastContainer } from './components/Toast';
import { KeyboardHelp } from './components/KeyboardHelp';
import { FloatingEffect } from './components/FloatingEffect';
import { CyberpunkBg } from './components/CyberpunkBg';
import type { GameEndStats, PlayerStats } from '../../shared/types';

export default function App() {
  const { socket, connected } = useSocket();
  const {
    gameState,
    roomInfo,
    toasts,
    specialEffects,
    selectedCardIds,
    createRoom,
    joinRoom,
    playVsComputer,
    startGame,
    swapCards,
    ready,
    playSelectedCards,
    pickUpPile,
    playFaceDown,
    playAgain,
    toggleCardSelection,
    selectAllSameRank,
    clearSelection,
    leaveGame,
  } = useGameState();

  const [showStats, setShowStats] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [endGameStats, setEndGameStats] = useState<PlayerStats | null>(null);

  const { recordGame, loadStats } = useStats(playerName);

  // Track player name from room info
  useEffect(() => {
    if (roomInfo) {
      const me = roomInfo.players.find(p => p.id === socket.id);
      if (me) setPlayerName(me.name);
    }
  }, [roomInfo, socket.id]);

  // Listen for game-over to record stats
  useEffect(() => {
    const handler = ({ stats }: { loserId: string; loserName: string; stats: GameEndStats }) => {
      if (playerName) {
        const updated = recordGame(stats);
        setEndGameStats(updated ?? null);
      }
    };
    socket.on('game-over', handler);
    return () => { socket.off('game-over', handler); };
  }, [playerName, recordGame, socket]);

  const { showHelp, setShowHelp } = useKeyboard({
    gameState,
    selectedCardIds,
    toggleCardSelection,
    playSelectedCards,
    pickUpPile,
    selectAllSameRank,
    clearSelection,
  });

  // Stats view
  if (showStats) {
    const stats = loadStats();
    return <><CyberpunkBg /><Stats stats={stats} onClose={() => setShowStats(false)} /></>;
  }

  // Connection indicator
  if (!connected) {
    return (
      <>
        <CyberpunkBg />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-text-muted animate-pulse">Connecting...</div>
        </div>
      </>
    );
  }

  // Game phases
  if (gameState) {
    if (gameState.phase === 'swapping') {
      return (
        <>
          <CyberpunkBg />
          <SwapPhase gameState={gameState} onSwap={swapCards} onReady={ready} />
          <ToastContainer toasts={toasts} />
        </>
      );
    }

    if (gameState.phase === 'game-over') {
      const isHost = roomInfo?.hostId === socket.id;
      return (
        <>
          <CyberpunkBg />
          <GameOver
            gameState={gameState}
            stats={endGameStats}
            isHost={isHost}
            onPlayAgain={playAgain}
            onLeave={leaveGame}
          />
          <ToastContainer toasts={toasts} />
        </>
      );
    }

    if (gameState.phase === 'playing') {
      return (
        <>
          <CyberpunkBg />
          <GameBoard
            gameState={gameState}
            selectedCardIds={selectedCardIds}
            onToggleCard={toggleCardSelection}
            onPlayCards={playSelectedCards}
            onPickUp={pickUpPile}
            onPlayFaceDown={playFaceDown}
            loadStats={loadStats}
          />
          <FloatingEffect effects={specialEffects} />
          <ToastContainer toasts={toasts} />
          <KeyboardHelp show={showHelp} onClose={() => setShowHelp(false)} />
        </>
      );
    }
  }

  // Lobby
  return (
    <>
      <CyberpunkBg />
      <Lobby
        roomInfo={roomInfo}
        socketId={socket.id ?? ''}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onPlayVsComputer={playVsComputer}
        onStartGame={startGame}
        onShowStats={() => setShowStats(true)}
      />
      <ToastContainer toasts={toasts} />
    </>
  );
}
