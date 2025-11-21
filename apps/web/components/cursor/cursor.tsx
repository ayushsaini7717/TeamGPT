import { MousePointer2 } from "lucide-react";

type Props = {
  color: string;
  x: number;
  y: number;
  name?: string;
};

export default function Cursor({ color, x, y, name }: Props) {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-50 transition-transform duration-100 ease-linear"
      style={{
        transform: `translateX(${x}px) translateY(${y}px)`,
      }}
    >
      <MousePointer2
        className="h-5 w-5"
        style={{ fill: color, color: color }}
      />
      {/* Optional: Show name tag next to cursor */}
      {name && (
        <div
          className="absolute left-5 top-2 rounded-full px-2 py-0.5 text-xs text-white opacity-80"
          style={{ backgroundColor: color }}
        >
          {name}
        </div>
      )}
    </div>
  );
}