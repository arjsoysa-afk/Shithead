import { Card } from './Card';
import type { Card as CardType } from '../../../shared/types';

interface FaceUpCardsProps {
  cards: CardType[];
  selectedIds?: Set<string>;
  onToggleCard?: (cardId: string, card: CardType) => void;
  disabled?: boolean;
  small?: boolean;
}

export function FaceUpCards({ cards, selectedIds, onToggleCard, disabled, small }: FaceUpCardsProps) {
  return (
    <div className="flex gap-1">
      {cards.map((card, i) => (
        <Card
          key={card.id}
          card={card}
          small={small}
          selected={selectedIds?.has(card.id)}
          disabled={disabled}
          onClick={onToggleCard ? () => onToggleCard(card.id, card) : undefined}
          index={i}
        />
      ))}
    </div>
  );
}
