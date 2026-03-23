import { Card } from './Card';

interface FaceDownCardsProps {
  count: number;
  small?: boolean;
  onClickCard?: (index: number) => void;
  cardIds?: string[];
}

export function FaceDownCards({ count, small, onClickCard, cardIds }: FaceDownCardsProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={cardIds?.[i] ?? `fd-${i}`}
          small={small}
          onClick={onClickCard ? () => onClickCard(i) : undefined}
          index={i}
        />
      ))}
    </div>
  );
}
