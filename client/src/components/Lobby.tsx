import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayerAvatar } from './Avatar';
import { CyberpunkTitle } from './CyberpunkTitle';
import type { RoomInfo } from '../../../shared/types';

interface LobbyProps {
  roomInfo: RoomInfo | null;
  socketId: string;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onPlayVsComputer: (name: string) => void;
  onStartGame: () => void;
  onShowStats: () => void;
}

export function Lobby({ roomInfo, socketId, onCreateRoom, onJoinRoom, onPlayVsComputer, onStartGame, onShowStats }: LobbyProps) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  // In a waiting room
  if (roomInfo) {
    const isHost = roomInfo.hostId === socketId;
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <motion.div
          className="w-full max-w-md rounded-2xl p-10 shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(20,20,35,0.95), rgba(12,12,26,0.98))',
            border: '1px solid rgba(191,90,242,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(191,90,242,0.05)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Room code */}
          <div className="text-center mb-8">
            <div className="text-[11px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'rgba(191,90,242,0.4)', fontFamily: "'CyberSlash', sans-serif" }}>
              Room Code
            </div>
            <div className="text-5xl font-extrabold tracking-[12px]"
              style={{
                color: '#bf5af2',
                textShadow: '0 0 20px rgba(191,90,242,0.5), 0 0 40px rgba(191,90,242,0.2)',
                fontFamily: "'CyberSlash', sans-serif",
              }}>
              {roomInfo.code}
            </div>
            <div className="text-xs mt-2" style={{ color: 'rgba(191,90,242,0.3)' }}>Share this with your friends</div>
          </div>

          {/* Player list */}
          <ul className="space-y-0 mb-8">
            {roomInfo.players.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 py-3 last:border-0"
                style={{ borderBottom: '1px solid rgba(191,90,242,0.08)' }}
              >
                <PlayerAvatar index={i} size={72} />
                <span className="text-[15px]" style={{ fontFamily: "'CyberSlash', sans-serif" }}>{p.name}</span>
                {p.id === roomInfo.hostId && (
                  <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide
                    px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                    Host
                  </span>
                )}
              </li>
            ))}
            {roomInfo.players.length < 6 && (
              <li className="flex items-center gap-3 py-3 italic" style={{ color: 'rgba(191,90,242,0.3)' }}>
                <div className="w-9 h-9 rounded-full border border-dashed flex items-center justify-center text-sm"
                  style={{ borderColor: 'rgba(191,90,242,0.15)', color: 'rgba(191,90,242,0.3)' }}>
                  ?
                </div>
                Waiting for players...
              </li>
            )}
          </ul>

          {isHost && roomInfo.players.length >= 2 && (
            <button
              className="w-full py-3.5 rounded-xl font-bold text-[15px] uppercase tracking-wider
                hover:-translate-y-0.5 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(191,90,242,0.9), rgba(191,90,242,0.7))',
                color: '#0a0a14',
                boxShadow: '0 4px 24px rgba(191,90,242,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
              onClick={onStartGame}
            >
              Start Game
            </button>
          )}
          {isHost && roomInfo.players.length < 2 && (
            <div className="text-center text-sm" style={{ color: 'rgba(191,90,242,0.3)' }}>
              Need at least 2 players to start
            </div>
          )}
          {!isHost && (
            <div className="text-center text-sm" style={{ color: 'rgba(191,90,242,0.3)' }}>
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
      {/* Cyberpunk background layers */}
      {/* Main neon teal glow */}
      <div className="absolute w-[800px] h-[800px] rounded-full blur-[200px] top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(191,90,242,0.08) 0%, rgba(191,90,242,0.02) 50%, transparent 70%)' }} />
      {/* Secondary accent glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[150px] bottom-0 right-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.06) 0%, transparent 70%)' }} />

      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(191,90,242,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(191,90,242,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Horizontal scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(191,90,242,0.4) 2px, rgba(191,90,242,0.4) 3px)',
        }}
      />

      {/* Circuit SVG decorations */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        {/* Left circuit trace */}
        <path d="M0 200 L80 200 L100 220 L100 350 L120 370 L120 500" stroke="#bf5af2" strokeWidth="1" fill="none" />
        <circle cx="100" cy="220" r="3" fill="#bf5af2" opacity="0.5" />
        <circle cx="120" cy="370" r="3" fill="#bf5af2" opacity="0.5" />
        {/* Right circuit trace */}
        <path d="M100% 300 L calc(100% - 80px) 300 L calc(100% - 100px) 320 L calc(100% - 100px) 450" stroke="#bf5af2" strokeWidth="1" fill="none" style={{ transform: 'scaleX(-1)' }} />
        {/* Top horizontal line */}
        <line x1="0" y1="80" x2="100%" y2="80" stroke="#bf5af2" strokeWidth="0.5" opacity="0.3" />
        <line x1="0" y1="82" x2="30%" y2="82" stroke="#bf5af2" strokeWidth="0.3" opacity="0.2" />
      </svg>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Cyberpunk Title */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[13px] mb-6 backdrop-blur-sm"
            style={{
              borderColor: 'rgba(191,90,242,0.2)',
              background: 'rgba(191,90,242,0.03)',
              color: 'rgba(191,90,242,0.7)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#bf5af2' }} />
            Online Card Game
          </motion.div>

          {/* SHITHEAD neon logo */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            {/* Glitch offset layers */}
            <h1
              className="absolute inset-0 text-8xl text-center select-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px rgba(191,90,242,0.2)',
                transform: 'translate(3px, -2px)',
                fontFamily: "'CyberSlash', sans-serif",
                letterSpacing: '4px',
              }}
              aria-hidden="true"
            >
              SHITHEAD
            </h1>
            <h1
              className="absolute inset-0 text-8xl text-center select-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: '1px rgba(120,50,200,0.15)',
                transform: 'translate(-3px, 2px)',
                fontFamily: "'CyberSlash', sans-serif",
                letterSpacing: '4px',
              }}
              aria-hidden="true"
            >
              SHITHEAD
            </h1>
            {/* Main title */}
            <h1
              className="relative text-8xl text-center"
              style={{
                background: 'linear-gradient(180deg, #ffffff 20%, #e0b0ff 50%, #bf5af2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                WebkitTextStroke: '2px #bf5af2',
                paintOrder: 'stroke fill',
                filter: 'drop-shadow(0 0 8px rgba(191,90,242,0.8)) drop-shadow(0 0 30px rgba(191,90,242,0.5)) drop-shadow(0 0 60px rgba(191,90,242,0.25))',
                fontFamily: "'CyberSlash', sans-serif",
                letterSpacing: '4px',
              }}
            >
              SHIT<span style={{ position: 'relative', top: '10px', background: 'linear-gradient(180deg, #ffffff 20%, #e0b0ff 50%, #bf5af2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>H</span>EAD
            </h1>
            {/* Underline glow */}
            <motion.div
              className="mx-auto mt-3 h-[2px] rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #bf5af2, transparent)',
                boxShadow: '0 0 20px rgba(191,90,242,0.4)',
              }}
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              transition={{ delay: 0.4, duration: 0.6 }}
            />
            {/* Subtitle */}
            <motion.div
              className="mt-3 text-[11px] uppercase tracking-[8px] text-center"
              style={{ color: 'rgba(191,90,242,0.35)', fontFamily: "'Inter', sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              The Card Game
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="rounded-2xl p-10 shadow-2xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, rgba(20,20,35,0.95), rgba(12,12,26,0.98))',
            border: '1px solid rgba(191,90,242,0.1)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(191,90,242,0.05)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Card corner tick marks */}
          <div className="absolute top-3 left-3 w-4 h-[1px]" style={{ background: 'rgba(191,90,242,0.2)' }} />
          <div className="absolute top-3 left-3 w-[1px] h-4" style={{ background: 'rgba(191,90,242,0.2)' }} />
          <div className="absolute top-3 right-3 w-4 h-[1px]" style={{ background: 'rgba(191,90,242,0.2)' }} />
          <div className="absolute top-3 right-3 w-[1px] h-4" style={{ background: 'rgba(191,90,242,0.2)' }} />
          <div className="absolute bottom-3 left-3 w-4 h-[1px]" style={{ background: 'rgba(191,90,242,0.2)' }} />
          <div className="absolute bottom-3 left-3 w-[1px] h-4" style={{ background: 'rgba(191,90,242,0.2)' }} />
          <div className="absolute bottom-3 right-3 w-4 h-[1px]" style={{ background: 'rgba(191,90,242,0.2)' }} />
          <div className="absolute bottom-3 right-3 w-[1px] h-4" style={{ background: 'rgba(191,90,242,0.2)' }} />
          {/* Name input */}
          <div className="mb-5">
            <label className="block text-[10px] font-semibold uppercase tracking-[3px] mb-2"
              style={{ color: 'rgba(191,90,242,0.4)' }}>
              Your name
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl text-[15px] text-text-primary outline-none
                placeholder:text-text-muted transition-all"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(191,90,242,0.12)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(191,90,242,0.4)';
                e.target.style.boxShadow = '0 0 20px rgba(191,90,242,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(191,90,242,0.12)';
                e.target.style.boxShadow = 'none';
              }}
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
                className="w-full py-3.5 rounded-xl font-bold text-[15px] uppercase tracking-wider
                  hover:-translate-y-0.5 transition-all duration-200
                  disabled:opacity-40 disabled:pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(191,90,242,0.9), rgba(191,90,242,0.7))',
                  color: '#0a0a14',
                  boxShadow: '0 4px 24px rgba(191,90,242,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                disabled={!name.trim()}
                onClick={() => onCreateRoom(name.trim())}
              >
                Create Room
              </button>

              <button
                className="w-full py-3.5 rounded-xl font-bold text-[15px] uppercase tracking-wider
                  hover:-translate-y-0.5 transition-all duration-200
                  disabled:opacity-40 disabled:pointer-events-none mt-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,240,255,0.9), rgba(0,200,220,0.7))',
                  color: '#0a0a14',
                  boxShadow: '0 4px 24px rgba(0,240,255,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                  fontFamily: "'CyberSlash', sans-serif",
                }}
                disabled={!name.trim()}
                onClick={() => onPlayVsComputer(name.trim())}
              >
                Play vs Computer
              </button>

              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(191,90,242,0.1)' }} />
                <span className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(191,90,242,0.3)' }}>
                  or join a friend
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(191,90,242,0.1)' }} />
              </div>

              <button
                className="w-full py-3.5 rounded-xl font-medium text-[15px]
                  hover:-translate-y-0.5 transition-all duration-200
                  disabled:opacity-40 disabled:pointer-events-none"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(191,90,242,0.2)',
                  color: 'rgba(191,90,242,0.7)',
                }}
                disabled={!name.trim()}
                onClick={() => setMode('join')}
              >
                Join Room
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-[10px] font-semibold uppercase tracking-[3px] mb-2"
                  style={{ color: 'rgba(191,90,242,0.4)' }}>
                  Room code
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl
                    text-xl font-bold tracking-[8px] text-center text-text-primary outline-none
                    placeholder:text-text-muted placeholder:tracking-normal placeholder:font-normal placeholder:text-base
                    uppercase transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(191,90,242,0.12)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(191,90,242,0.4)';
                    e.target.style.boxShadow = '0 0 20px rgba(191,90,242,0.08)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(191,90,242,0.12)';
                    e.target.style.boxShadow = 'none';
                  }}
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
                className="w-full py-3.5 rounded-xl font-bold text-[15px] uppercase tracking-wider
                  hover:-translate-y-0.5 transition-all duration-200
                  disabled:opacity-40 disabled:pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(191,90,242,0.9), rgba(191,90,242,0.7))',
                  color: '#0a0a14',
                  boxShadow: '0 4px 24px rgba(191,90,242,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                disabled={roomCode.length !== 4 || !name.trim()}
                onClick={() => onJoinRoom(roomCode, name.trim())}
              >
                Join
              </button>
              <button
                className="w-full mt-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: 'rgba(191,90,242,0.4)' }}
                onClick={() => setMode('menu')}
              >
                Back
              </button>
            </>
          )}
        </motion.div>

        {/* Stats link */}
        <button
          className="mt-6 mx-auto block text-sm transition-colors"
          style={{ color: 'rgba(191,90,242,0.25)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(191,90,242,0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(191,90,242,0.25)')}
          onClick={onShowStats}
        >
          View Stats
        </button>
      </motion.div>
    </div>
  );
}
