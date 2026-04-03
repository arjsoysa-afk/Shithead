import { Card } from './Card';

interface DrawPileProps {
  count: number;
}

export function DrawPile({ count }: DrawPileProps) {
  if (count === 0) return null;

  return (
    <div className="relative w-[88px] h-[124px]">
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
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-sm font-medium text-center"
        style={{ fontFamily: "'CyberSlash', sans-serif", color: '#bf5af2', textShadow: '0 0 8px rgba(191,90,242,0.5)' }}>
        {count}
      </div>
    </div>
  );
}
