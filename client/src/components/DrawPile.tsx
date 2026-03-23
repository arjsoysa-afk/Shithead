import { Card } from './Card';

interface DrawPileProps {
  count: number;
}

export function DrawPile({ count }: DrawPileProps) {
  if (count === 0) return null;

  return (
    <div className="relative w-[72px] h-[100px]">
      {/* Stack effect */}
      {count >= 3 && (
        <div className="absolute top-[-4px] left-[2px]">
          <Card />
        </div>
      )}
      {count >= 2 && (
        <div className="absolute top-[-2px] left-[1px]">
          <Card />
        </div>
      )}
      <div className="absolute top-0 left-0">
        <Card />
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-text-muted text-[11px] whitespace-nowrap">
        {count} left
      </div>
    </div>
  );
}
