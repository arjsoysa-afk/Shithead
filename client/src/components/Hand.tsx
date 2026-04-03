import { useRef, useEffect, useState } from 'react';
import { Card } from './Card';
import type { Card as CardType } from '../../../shared/types';

interface HandProps {
  cards: CardType[];
  selectedIds: Set<string>;
  onToggleCard: (cardId: string, card: CardType) => void;
  disabled?: boolean;
}

const CARD_WIDTH = 88;
const OVERLAP = 10;

export function Hand({ cards, selectedIds, onToggleCard, disabled }: HandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxPerRow, setMaxPerRow] = useState(Infinity);

  useEffect(() => {
    function calcMax() {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.offsetWidth - 32; // 16px padding each side
      // First card is full width, each subsequent overlaps
      const max = Math.max(1, Math.floor((availableWidth - CARD_WIDTH) / (CARD_WIDTH - OVERLAP)) + 1);
      setMaxPerRow(max);
    }

    calcMax();
    window.addEventListener('resize', calcMax);
    return () => window.removeEventListener('resize', calcMax);
  }, [cards.length]);

  if (cards.length === 0) return null;

  // Split cards into rows if they won't fit
  const rows: CardType[][] = [];
  for (let i = 0; i < cards.length; i += maxPerRow) {
    rows.push(cards.slice(i, i + maxPerRow));
  }

  // Track global index for z-index ordering
  let globalIndex = 0;

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center gap-2">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex justify-center items-end">
          <div className="flex">
            {row.map((card, i) => {
              const idx = globalIndex++;
              return (
                <div
                  key={card.id}
                  style={{
                    marginLeft: i === 0 ? 0 : -OVERLAP,
                    zIndex: selectedIds.has(card.id) ? 50 : idx,
                  }}
                >
                  <Card
                    card={card}
                    selected={selectedIds.has(card.id)}
                    disabled={disabled}
                    onClick={() => onToggleCard(card.id, card)}
                    index={idx}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
