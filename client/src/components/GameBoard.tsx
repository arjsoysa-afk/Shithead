import { motion } from 'framer-motion';
import { Hand } from './Hand';
import { Card } from './Card';
import { Pile } from './Pile';
import { DrawPile } from './DrawPile';
import { OpponentRow } from './OpponentRow';
import { PlayerAvatar } from './Avatar';
import type { ClientGameState, Card as CardType, PlayerStats } from '../../../shared/types';

const CYBER_COLORS = ['#bf5af2','#00f0ff','#ff6bcb','#00ff87','#ffd60a','#7b61ff'];

interface GameBoardProps {
  gameState: ClientGameState;
  selectedCardIds: Set<string>;
  onToggleCard: (cardId: string, card: CardType) => void;
  onPlayCards: () => void;
  onPickUp: () => void;
  onPlayFaceDown: (cardId: string) => void;
  loadStats: () => PlayerStats;
}

export function GameBoard({
  gameState,
  selectedCardIds,
  onToggleCard,
  onPlayCards,
  onPickUp,
  onPlayFaceDown,
  loadStats,
}: GameBoardProps) {
  const { you, opponents, pileTop, pileCount, drawPileCount, isYourTurn, mustPickUp, mustPlayLower, direction, lastAction, currentPlayerId } = gameState;

  const hasHand = you.hand.length > 0;
  const hasFaceUp = you.faceUp.length > 0;
  const hasFaceDown = you.faceDownCount > 0;
  const isFinished = gameState.finishedPlayerIds.includes(you.id);

  // Build player ID → avatar index mapping from playerOrder
  const avatarMap = new Map<string, number>();
  gameState.playerOrder.forEach((p, i) => avatarMap.set(p.id, i));
  const myAvatarIndex = avatarMap.get(you.id) ?? 0;

  // Position opponents around the table
  const opponentPositions = getOpponentPositions(opponents.length);

  return (
    <div className="h-screen w-screen relative overflow-hidden">

      {/* Head-to-head scoreboard — top right */}
      {(() => {
        const stats = loadStats();
        const h2h = stats.headToHead;
        const opponentNames = opponents.map(o => o.name);
        const entries = opponentNames
          .map(name => ({ name, record: h2h[name] }))
          .filter(e => e.record);

        return (
          <div className="fixed top-4 right-4 z-30 flex flex-col items-end gap-1.5"
            style={{
              background: 'rgba(10,10,24,0.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(191,90,242,0.15)',
              borderRadius: '12px',
              padding: '10px 14px',
            }}>
            <div className="text-[10px] uppercase tracking-widest mb-0.5"
              style={{ fontFamily: "'CyberSlash', sans-serif", color: 'rgba(191,90,242,0.5)' }}>
              Head to Head
            </div>
            {opponentNames.map((name) => {
              const record = h2h[name] || { wins: 0, losses: 0 };
              const oppIdx = gameState.playerOrder.findIndex(p => p.name === name);
              const oppColor = CYBER_COLORS[oppIdx >= 0 ? oppIdx % CYBER_COLORS.length : 0];
              const myIdx = gameState.playerOrder.findIndex(p => p.id === you.id);
              const myColor = CYBER_COLORS[myIdx >= 0 ? myIdx % CYBER_COLORS.length : 0];
              return (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span style={{ fontFamily: "'CyberSlash', sans-serif", color: myColor, textShadow: `0 0 8px ${myColor}50` }}>
                    {you.name}
                  </span>
                  <span className="text-white/80 font-mono text-xs">
                    <span className="text-green-400">{record.wins}</span>
                    <span className="text-white/40"> - </span>
                    <span className="text-red-400">{record.losses}</span>
                  </span>
                  <span style={{ fontFamily: "'CyberSlash', sans-serif", color: oppColor, textShadow: `0 0 8px ${oppColor}50` }}>
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Opponent names — fixed top-left */}
      <div className="fixed top-4 left-4 z-30 flex flex-col gap-4">
        {opponents.map((opp, i) => {
          const oppAvatarIdx = avatarMap.get(opp.id) ?? i + 1;
          const oppColor = CYBER_COLORS[oppAvatarIdx % CYBER_COLORS.length];
          const isOppTurn = currentPlayerId === opp.id;
          const oppFinished = gameState.finishedPlayerIds.includes(opp.id);
          return (
            <div key={opp.id} className={`flex items-center gap-3 ${!opp.connected ? 'opacity-50' : ''} ${oppFinished ? 'opacity-40' : ''}`}>
              <PlayerAvatar index={oppAvatarIdx} size={36} />
              <div className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  !opp.connected ? 'bg-danger' :
                  isOppTurn ? 'bg-accent animate-pulse' :
                  'bg-success'
                }`} />
                <span className="text-2xl sm:text-4xl" style={{
                  fontFamily: "'CyberSlash', sans-serif",
                  color: oppColor,
                  textShadow: `0 0 14px ${oppColor}60`,
                }}>{opp.name}</span>
                {oppFinished && <span className="text-success text-sm">(out)</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Your name — fixed bottom-left */}
      {(() => {
        const myColor = CYBER_COLORS[myAvatarIndex % CYBER_COLORS.length];
        return (
          <div className={`fixed bottom-4 left-4 z-30 flex items-center gap-3 ${isFinished ? 'opacity-40' : ''}`}>
            <PlayerAvatar index={myAvatarIndex} size={36} />
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${
                isYourTurn ? 'bg-accent animate-pulse' : 'bg-success'
              }`} />
              <span className="text-2xl sm:text-4xl" style={{
                fontFamily: "'CyberSlash', sans-serif",
                color: myColor,
                textShadow: `0 0 14px ${myColor}60`,
              }}>{you.name}</span>
              {isFinished && <span className="text-success text-sm">(out)</span>}
            </div>
          </div>
        );
      })()}

      {/* Direction indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-48 h-48 rounded-full border border-dashed border-white/[0.03] pointer-events-none">
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-text-muted text-xs"
          animate={{ rotate: direction === 'clockwise' ? 360 : -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          {direction === 'clockwise' ? '\u21bb' : '\u21ba'}
        </motion.div>
      </div>

      {/* Opponents */}
      {opponents.map((opp, i) => (
        <div
          key={opp.id}
          className="absolute"
          style={opponentPositions[i]}
        >
          <OpponentRow
            opponent={opp}
            isCurrentTurn={currentPlayerId === opp.id}
            isFinished={gameState.finishedPlayerIds.includes(opp.id)}
            avatarIndex={avatarMap.get(opp.id) ?? i + 1}
          />
        </div>
      ))}

      {/* Center area: draw pile + discard pile — always visible */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2
        flex items-center gap-8 z-10">
        <DrawPile count={drawPileCount} />
        <Pile topCards={pileTop} count={pileCount} effectiveCard={gameState.effectiveCard} />
      </div>

      {/* Status notification — fixed bottom right, above player panel */}
      <div className="fixed bottom-4 right-4 z-30">
        {isYourTurn && !isFinished ? (
          <motion.div
            className="px-5 py-2 rounded-xl flex flex-col items-end gap-0.5"
            style={{
              background: 'rgba(10,10,24,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(191,90,242,0.2)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={lastAction}
          >
            <div className="text-[10px]" style={{ color: 'rgba(191,90,242,0.4)' }}>{lastAction}</div>
            <div className="text-sm font-medium" style={{ color: '#bf5af2', fontFamily: "'CyberSlash', sans-serif" }}>
              {mustPickUp ? (
                <>Pick up or deflect</>
              ) : mustPlayLower ? (
                <>Play lower than 7</>
              ) : (
                <>Your turn</>
              )}
            </div>
          </motion.div>
        ) : isFinished ? (
          <motion.div
            className="px-5 py-2 rounded-xl flex flex-col items-end gap-0.5"
            style={{
              background: 'rgba(10,10,24,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,214,143,0.2)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-[10px]" style={{ color: 'rgba(0,214,143,0.4)' }}>{lastAction}</div>
            <div className="text-sm font-medium text-success" style={{ fontFamily: "'CyberSlash', sans-serif" }}>
              You're out!
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="px-5 py-2 rounded-xl flex flex-col items-end gap-0.5"
            style={{
              background: 'rgba(10,10,24,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            key={lastAction}
          >
            <div className="text-[10px]" style={{ color: 'rgba(191,90,242,0.4)' }}>{lastAction}</div>
            <div className="text-sm" style={{ color: 'rgba(191,90,242,0.5)', fontFamily: "'CyberSlash', sans-serif" }}>
              Waiting for {gameState.playerOrder.find(p => p.id === currentPlayerId)?.name}...
            </div>
          </motion.div>
        )}
      </div>

      {/* Player area — fixed to bottom, cards scroll, buttons always pinned */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col" style={{ maxHeight: '42vh' }}>

        {/* Cards — scrollable area above the buttons */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pt-2 flex flex-col items-center gap-1">
          {/* Hand */}
          {hasHand && (
            <motion.div
              className="w-full"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            >
              <Hand
                cards={you.hand}
                selectedIds={selectedCardIds}
                onToggleCard={onToggleCard}
                disabled={!isYourTurn}
              />
            </motion.div>
          )}

          {/* Table cards (face-down + face-up stacked) */}
          {(() => {
            const isPlayingFaceUp = !hasHand && hasFaceUp;
            const isPlayingFaceDown = !hasHand && !hasFaceUp && hasFaceDown;

            const handSelectedRank = selectedCardIds.size > 0
              ? you.hand.find(c => selectedCardIds.has(c.id))?.rank ?? null
              : null;

            if (!hasFaceDown && !hasFaceUp) return null;

            return (
              <div className="flex justify-center items-center">
                <div className="flex gap-2">
                  {Array.from({ length: Math.max(you.faceDownCount, you.faceUp.length) }).map((_, i) => {
                    const hasFD = i < you.faceDownCount;
                    const faceUpCard = you.faceUp[i];
                    const isCrossSourcePlay = hasHand && isYourTurn && faceUpCard != null && handSelectedRank === faceUpCard.rank;
                    const isFaceUpPlayable = (isPlayingFaceUp && faceUpCard) || isCrossSourcePlay;
                    const isFaceDownPlayable = isPlayingFaceDown && hasFD;

                    return (
                      <div key={i} className="relative" style={{ width: 48, height: hasFD && faceUpCard ? 82 : 64 }}>
                        {hasFD && (
                          <div className="absolute top-0 left-0" style={{ zIndex: 1 }}>
                            <Card
                              small
                              index={i}
                              onClick={isFaceDownPlayable && isYourTurn ? () => onPlayFaceDown(you.faceDownIds[i]) : undefined}
                            />
                          </div>
                        )}
                        {faceUpCard && (
                          <div className="absolute left-0" style={{ top: hasFD ? 16 : 0, zIndex: 2 }}>
                            <Card
                              card={faceUpCard}
                              small
                              disabled={!isFaceUpPlayable || !isYourTurn}
                              selected={isFaceUpPlayable ? selectedCardIds?.has(faceUpCard.id) : false}
                              onClick={isFaceUpPlayable && isYourTurn ? () => onToggleCard(faceUpCard.id, faceUpCard) : undefined}
                              index={i}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Action buttons — always visible, pinned to bottom of panel */}
        {isYourTurn && !isFinished && (
          <div
            className="flex-shrink-0 flex justify-center gap-3 px-4 py-3"
            style={{ background: 'linear-gradient(to bottom, transparent, #08080d 40%)' }}
          >
            {selectedCardIds.size > 0 && (
              <motion.button
                className="px-6 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm
                  hover:shadow-[0_4px_24px_rgba(108,92,231,0.3)] transition-all"
                onClick={onPlayCards}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                Play ({selectedCardIds.size})
              </motion.button>
            )}
            {pileCount > 0 && (
              <button
                className="px-6 py-2.5 rounded-xl bg-transparent border border-border
                  text-text-secondary text-sm font-medium hover:border-border-hover
                  hover:bg-white/[0.02] transition-all"
                onClick={onPickUp}
              >
                Pick Up ({pileCount})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="fixed bottom-2 right-4 z-10 text-text-muted text-[11px] pointer-events-none">
        Press <kbd className="px-1 py-0.5 rounded border border-border text-[10px]">?</kbd> for shortcuts
      </div>
    </div>
  );
}

function getOpponentPositions(count: number): React.CSSProperties[] {
  switch (count) {
    case 1:
      return [{ top: '24px', left: '50%', transform: 'translateX(-50%)' }];
    case 2:
      return [
        { top: '50%', left: '32px', transform: 'translateY(-60%)' },
        { top: '50%', right: '32px', transform: 'translateY(-60%)' },
      ];
    case 3:
      return [
        { top: '24px', left: '25%', transform: 'translateX(-50%)' },
        { top: '24px', right: '25%', transform: 'translateX(50%)' },
        { top: '50%', right: '32px', transform: 'translateY(-60%)' },
      ];
    case 4:
      return [
        { top: '50%', left: '32px', transform: 'translateY(-60%)' },
        { top: '24px', left: '35%', transform: 'translateX(-50%)' },
        { top: '24px', right: '35%', transform: 'translateX(50%)' },
        { top: '50%', right: '32px', transform: 'translateY(-60%)' },
      ];
    case 5:
      return [
        { top: '50%', left: '32px', transform: 'translateY(-60%)' },
        { top: '24px', left: '25%', transform: 'translateX(-50%)' },
        { top: '24px', left: '50%', transform: 'translateX(-50%)' },
        { top: '24px', right: '25%', transform: 'translateX(50%)' },
        { top: '50%', right: '32px', transform: 'translateY(-60%)' },
      ];
    default:
      return [];
  }
}
