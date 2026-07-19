import { useRef, useState } from "react";

export interface CustomerRow {
  name: string;
  revenue: number;
  count: number;
}

const W = 400;
const ROW_H = 34;
const PAD = { top: 4, right: 64, bottom: 4, left: 108 };
const BAR_H = 14;

const usd0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function TopCustomersChart({ data }: { data: CustomerRow[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

  const H = PAD.top + PAD.bottom + ROW_H * data.length;
  const plotW = W - PAD.left - PAD.right;
  const max = Math.max(...data.map((d) => d.revenue), 1);

  const onMove = (e: React.PointerEvent, i: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    setHover({ i, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="chart-wrap" ref={wrapRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Top customers by revenue">
        {data.map((d, i) => {
          const cy = PAD.top + ROW_H * i + ROW_H / 2;
          const w = Math.max(2, plotW * (d.revenue / max));
          const r = 4;
          const dimmed = hover !== null && hover.i !== i;
          return (
            <g key={d.name}>
              <text
                className="axis-label"
                x={PAD.left - 10}
                y={cy + 3.5}
                textAnchor="end"
              >
                {d.name}
              </text>
              {/* square at the left baseline, 4px rounded data-end on the right */}
              <path
                d={`M ${PAD.left} ${cy - BAR_H / 2}
                    h ${w - r}
                    a ${r} ${r} 0 0 1 ${r} ${r}
                    v ${BAR_H - 2 * r}
                    a ${r} ${r} 0 0 1 ${-r} ${r}
                    h ${-(w - r)} z`}
                fill="var(--series-1)"
                opacity={dimmed ? 0.45 : 1}
              />
              <text
                className="direct-label"
                x={PAD.left + w + 8}
                y={cy + 3.5}
              >
                {usd0(d.revenue)}
              </text>
              <rect
                x={0} y={PAD.top + ROW_H * i} width={W} height={ROW_H}
                fill="transparent"
                onPointerMove={(e) => onMove(e, i)}
                onPointerLeave={() => setHover(null)}
              />
            </g>
          );
        })}
        <line
          x1={PAD.left} x2={PAD.left}
          y1={PAD.top} y2={H - PAD.bottom}
          stroke="var(--baseline)" strokeWidth={1}
        />
      </svg>

      {hover && (
        <div
          className="tooltip"
          style={{
            left: Math.min(hover.x + 12, (wrapRef.current?.clientWidth ?? W) - 140),
            top: hover.y - 52,
          }}
        >
          <div className="tt-value">{usd0(data[hover.i].revenue)}</div>
          <div className="tt-label">
            {data[hover.i].name} · {data[hover.i].count} orders
          </div>
        </div>
      )}
    </div>
  );
}
