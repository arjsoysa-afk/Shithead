import { Card } from './Card';
import type { Card as CardType } from '../../../shared/types';

interface HandProps {
  cards: CardType[];
  selectedIds: Set<string>;
  onToggleCard: (cardId: string, card: CardType) => void;
  disabled?: boolean;
}

export function Hand({ cards, selectedIds, onToggleCard, disabled }: HandProps) {
  if (cards.length === 0) return null;

  return (
    <div className="flex justify-center items-end">
      <div className="flex" style={{ gap: cards.length > 8 ? '-12px' : '-8px' }}>
        {cards.map((card, i) => (
          <div
            key={card.id}
            style={{
              marginLeft: i === 0 ? 0 : cards.length > 8 ? -12 : -8,
              zIndex: selectedIds.has(card.id) ? 50 : i,
            }}
          >
            <Card
              card={card}
              selected={selectedIds.has(card.id)}
              disabled={disabled}
              onClick={() => onToggleCard(card.id, card)}
              index={i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
