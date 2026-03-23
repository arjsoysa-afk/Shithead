import { useState } from 'react';
import { motion } from 'framer-motion';
import type { RoomInfo } from '../../../shared/types';

interface LobbyProps {
  roomInfo: RoomInfo | null;
  socketId: string;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onStartGame: () => void;
  onShowStats: () => void;
}

export function Lobby({ roomInfo, socketId, onCreateRoom, onJoinRoom, onStartGame, onShowStats }: LobbyProps) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  // In a waiting room
  if (roomInfo) {
    const isHost = roomInfo.hostId === socketId;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md bg-bg-card border border-border rounded-2xl p-10 shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Room code */}
          <div className="text-center mb-8">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-2">
              Room Code
            </div>
            <div className="text-5xl font-extrabold tracking-[12px] text-accent">
              {roomInfo.code}
            </div>
            <div className="text-text-muted text-xs mt-2">Share this with your friends</div>
          </div>

          {/* Player list */}
          <ul className="space-y-0 mb-8">
            {roomInfo.players.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 py-3 border-b border-border last:border-0"
              >
                <div className="w-9 h-9 rounded-full bg-bg-elevated border border-border
                  flex items-center justify-center text-sm font-semibold text-accent">
                  {p.name[0]?.toUpperCase()}
                </div>
                <span className="text-[15px]">{p.name}</span>
                {p.id === roomInfo.hostId && (
                  <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide
                    px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                    Host
                  </span>
                )}
              </li>
            ))}
            {roomInfo.players.length < 6 && (
              <li className="flex items-center gap-3 py-3 text-text-muted italic">
                <div className="w-9 h-9 rounded-full border border-dashed border-border
                  flex items-center justify-center text-sm text-text-muted">
                  ?
                </div>
                Waiting for players...
              </li>
            )}
          </ul>

          {isHost && roomInfo.players.length >= 2 && (
            <button
              className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-[15px]
                hover:shadow-[0_4px_24px_rgba(108,92,231,0.3)] hover:-translate-y-0.5
                transition-all duration-200"
              onClick={onStartGame}
            >
              Start Game
            </button>
          )}
          {isHost && roomInfo.players.length < 2 && (
            <div className="text-center text-text-muted text-sm">
              Need at least 2 players to start
            </div>
          )}
          {!isHost && (
            <div className="text-center text-text-muted text-sm">
              Waiting for host to start...
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Landing / create / join
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] bg-accent/[0.06] rounded-full blur-[120px] top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border
            text-[13px] text-text-secondary mb-6 bg-white/[0.02] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Online Card Game
          </div>
          <h1 className="text-6xl font-extrabold tracking-[-3px] bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            SHITHEAD
          </h1>
        </div>

        <div className="bg-bg-card border border-border rounded-2xl p-10 shadow-2xl">
          {/* Name input */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Your name</label>
            <input
              className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl
                text-[15px] text-text-primary outline-none
                focus:border-accent focus:ring-2 focus:ring-accent/20
                placeholder:text-text-muted transition-all"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  onCreateRoom(name.trim());
                }
              }}
              maxLength={20}
              autoFocus
            />
          </div>

          {mode === 'menu' ? (
            <>
              <button
                className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-[15px]
                  hover:shadow-[0_4px_24px_rgba(108,92,231,0.3)] hover:-translate-y-0.5
                  transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                disabled={!name.trim()}
                onClick={() => onCreateRoom(name.trim())}
              >
                Create Room
              </button>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] uppercase tracking-widest text-text-muted">or join a friend</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                className="w-full py-3.5 rounded-xl bg-transparent border border-border text-text-primary
                  font-medium text-[15px] hover:border-border-hover hover:bg-white/[0.02]
                  transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                disabled={!name.trim()}
                onClick={() => setMode('join')}
              >
                Join Room
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Room code</label>
                <input
                  className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl
                    text-xl font-bold tracking-[8px] text-center text-text-primary outline-none
                    focus:border-accent focus:ring-2 focus:ring-accent/20
                    placeholder:text-text-muted placeholder:tracking-normal placeholder:font-normal placeholder:text-base
                    uppercase transition-all"
                  placeholder="ABCD"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && roomCode.length === 4 && name.trim()) {
                      onJoinRoom(roomCode, name.trim());
                    }
                  }}
                  maxLength={4}
                  autoFocus
                />
              </div>
              <button
                className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-[15px]
                  hover:shadow-[0_4px_24px_rgba(108,92,231,0.3)] hover:-translate-y-0.5
                  transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
                disabled={roomCode.length !== 4 || !name.trim()}
                onClick={() => onJoinRoom(roomCode, name.trim())}
              >
                Join
              </button>
              <button
                className="w-full mt-3 py-2.5 rounded-xl text-text-secondary text-sm hover:text-text-primary transition-colors"
                onClick={() => setMode('menu')}
              >
                Back
              </button>
            </>
          )}
        </div>

        {/* Stats link */}
        <button
          className="mt-6 mx-auto block text-text-muted text-sm hover:text-text-secondary transition-colors"
          onClick={onShowStats}
        >
          View Stats
        </button>
      </motion.div>
    </div>
  );
}
