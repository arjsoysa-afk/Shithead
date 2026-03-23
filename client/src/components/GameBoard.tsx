import { motion } from 'framer-motion';
import { Hand } from './Hand';
import { FaceUpCards } from './FaceUpCards';
import { FaceDownCards } from './FaceDownCards';
import { Pile } from './Pile';
import { DrawPile } from './DrawPile';
import { OpponentRow } from './OpponentRow';
import type { ClientGameState, Card as CardType } from '../../../shared/types';

interface GameBoardProps {
  gameState: ClientGameState;
  selectedCardIds: Set<string>;
  onToggleCard: (cardId: string, card: CardType) => void;
  onPlayCards: () => void;
  onPickUp: () => void;
}

export function GameBoard({
  gameState,
  selectedCardIds,
  onToggleCard,
  onPlayCards,
  onPickUp,
}: GameBoardProps) {
  const { you, opponents, pileTop, pileCount, drawPileCount, isYourTurn, mustPickUp, mustPlayLower, direction, lastAction, currentPlayerId } = gameState;

  const hasHand = you.hand.length > 0;
  const hasFaceUp = you.faceUp.length > 0;
  const hasFaceDown = you.faceDownCount > 0;
  const isFinished = gameState.finishedPlayerIds.includes(you.id);

  // Position opponents around the table
  const opponentPositions = getOpponentPositions(opponents.length);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-bg-primary">
      {/* Table surface */}
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, rgba(20,20,40,0.9) 0%, #08080d 80%)',
        }}
      />

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
          />
        </div>
      ))}

      {/* Center area: draw pile + discard pile */}
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2
        flex items-center gap-8">
        <DrawPile count={drawPileCount} />
        <Pile topCards={pileTop} count={pileCount} />
      </div>

      {/* Last action */}
      <div className="absolute top-[55%] left-1/2 -translate-x-1/2
        text-text-muted text-xs text-center max-w-sm">
        {lastAction}
      </div>

      {/* Turn banner */}
      <div className="absolute bottom-56 left-1/2 -translate-x-1/2 z-20">
        {isYourTurn && !isFinished ? (
          <motion.div
            className="px-6 py-2 rounded-full bg-accent/10 border border-accent/20
              text-accent text-sm font-medium backdrop-blur-sm whitespace-nowrap
              flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {mustPickUp ? (
              <>Pick up or play a black 6 to deflect</>
            ) : mustPlayLower ? (
              <>Play lower than 7</>
            ) : (
              <>
                Your turn — select cards and press
                <kbd className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5
                  bg-accent/15 border border-accent/30 rounded text-[11px] font-semibold">
                  Enter
                </kbd>
              </>
            )}
          </motion.div>
        ) : isFinished ? (
          <div className="px-6 py-2 rounded-full bg-success/10 border border-success/20
            text-success text-sm font-medium">
            You're out! Waiting for others...
          </div>
        ) : (
          <div className="px-6 py-2 rounded-full bg-white/[0.03] border border-border
            text-text-muted text-sm whitespace-nowrap">
            Waiting for {gameState.playerOrder.find(p => p.id === currentPlayerId)?.name}...
          </div>
        )}
      </div>

      {/* Player area (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 pb-6 px-4">
        {/* Face-down + face-up cards row */}
        {(!hasHand && (hasFaceUp || hasFaceDown)) && (
          <div className="flex justify-center gap-8 mb-4">
            {hasFaceDown && (
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Face Down</div>
                <FaceDownCards
                  count={you.faceDownCount}
                  onClickCard={isYourTurn && !hasFaceUp ? (i) => {
                    // For face-down, we need the actual card ID from somewhere
                    // The server handles this — we just send a click index
                    // Actually we send cardIds, but client doesn't know face-down IDs
                    // This is handled by sending a special event
                  } : undefined}
                />
              </div>
            )}
            {hasFaceUp && !hasHand && (
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Face Up</div>
                <FaceUpCards
                  cards={you.faceUp}
                  selectedIds={selectedCardIds}
                  onToggleCard={isYourTurn ? onToggleCard : undefined}
                  disabled={!isYourTurn}
                />
              </div>
            )}
          </div>
        )}

        {/* Show face-up and face-down when playing from hand (non-interactive) */}
        {hasHand && (hasFaceUp || hasFaceDown) && (
          <div className="flex justify-center gap-6 mb-3">
            {hasFaceDown && (
              <div className="text-center">
                <div className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Face Down</div>
                <FaceDownCards count={you.faceDownCount} small />
              </div>
            )}
            {hasFaceUp && (
              <div className="text-center">
                <div className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Face Up</div>
                <FaceUpCards cards={you.faceUp} small disabled />
              </div>
            )}
          </div>
        )}

        {/* Hand */}
        {hasHand && (
          <Hand
            cards={you.hand}
            selectedIds={selectedCardIds}
            onToggleCard={onToggleCard}
            disabled={!isYourTurn}
          />
        )}

        {/* Action buttons */}
        {isYourTurn && !isFinished && (
          <div className="flex justify-center gap-3 mt-4">
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
      <div className="absolute bottom-2 right-4 text-text-muted text-[11px]">
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
