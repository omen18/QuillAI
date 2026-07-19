import { useRef, useState } from "react";

export interface MonthPoint {
  key: string;
  label: string;
  revenue: number;
}

const W = 560;
const H = 260;
const PAD = { top: 24, right: 8, bottom: 28, left: 44 };

function niceTicks(max: number): number[] {
  if (max <= 0) return [0];
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(v);
  return ticks;
}

const usd0 = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function RevenueChart({ data }: { data: MonthPoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const ticks = niceTicks(max);
  const yMax = ticks[ticks.length - 1];
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const band = plotW / data.length;
  const barW = Math.min(24, band * 0.55);
  const peakIdx = data.reduce((best, d, i) => (d.revenue > data[best].revenue ? i : best), 0);

  const y = (v: number) => PAD.top + plotH * (1 - v / yMax);

  const onMove = (e: React.PointerEvent, i: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    setHover({ i, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="chart-wrap" ref={wrapRef}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue by month">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)}
              stroke={t === 0 ? "var(--baseline)" : "var(--gridline)"}
              strokeWidth={1}
            />
            <text className="axis-label" x={PAD.left - 8} y={y(t) + 3.5} textAnchor="end">
              {t >= 1000 ? `$${(t / 1000).toLocaleString("en-US")}k` : `$${t}`}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const cx = PAD.left + band * i + band / 2;
          const barH = Math.max(0, plotH * (d.revenue / yMax));
          const top = y(d.revenue);
          const r = Math.min(4, barH);
          const dimmed = hover !== null && hover.i !== i;
          return (
            <g key={d.key}>
              {/* rounded data-end at the top, square at the baseline */}
              <path
                d={`M ${cx - barW / 2} ${top + r}
                    a ${r} ${r} 0 0 1 ${r} ${-r}
                    h ${barW - 2 * r}
                    a ${r} ${r} 0 0 1 ${r} ${r}
                    v ${barH - r}
                    h ${-barW} z`}
                fill="var(--series-1)"
                opacity={dimmed ? 0.45 : 1}
              />
              {i === peakIdx && (
                <text className="direct-label" x={cx} y={top - 6} textAnchor="middle">
                  {usd0(d.revenue)}
                </text>
              )}
              <text
                className="axis-label"
                x={cx}
                y={H - PAD.bottom + 16}
                textAnchor="middle"
              >
                {data.length > 6 ? d.label.split(" ")[0] : d.label}
              </text>
              {/* hit target wider than the mark */}
              <rect
                x={PAD.left + band * i} y={PAD.top} width={band} height={plotH}
                fill="transparent"
                onPointerMove={(e) => onMove(e, i)}
                onPointerLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {hover && (
        <div
          className="tooltip"
          style={{
            left: Math.min(hover.x + 12, (wrapRef.current?.clientWidth ?? W) - 130),
            top: hover.y - 48,
          }}
        >
          <div className="tt-value">{usd0(data[hover.i].revenue)}</div>
          <div className="tt-label">{data[hover.i].label}</div>
        </div>
      )}
    </div>
  );
}
