// Deterministic mock QR pattern (visual only).
export function MockQR({ seed, size = 220 }: { seed: string; size?: number }) {
  const n = 25;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => (h = (h * 1103515245 + 12345) >>> 0) / 4294967296;
  const F: [number, number][] = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ];
  const finder = (x: number, y: number) =>
    F.some(([fx, fy]) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7);
  const finderOn = (x: number, y: number) => {
    for (const [fx, fy] of F) {
      const dx = x - fx,
        dy = y - fy;
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
        const edge = dx === 0 || dy === 0 || dx === 6 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        return edge || core;
      }
    }
    return false;
  };
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const center = x >= 10 && x <= 14 && y >= 10 && y <= 14;
      if (finder(x, y) ? finderOn(x, y) : !center && rand() > 0.52) cells.push([x, y]);
    }
  const c = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-ink">
      {cells.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x * c}
          y={y * c}
          width={c * 0.92}
          height={c * 0.92}
          rx={c * 0.25}
          fill="currentColor"
        />
      ))}
      <rect x={10.5 * c} y={10.5 * c} width={4 * c} height={4 * c} rx={c} fill="var(--primary)" />
      <path
        d={`M${11.6 * c} ${12.5 * c} l${0.8 * c} ${0.8 * c} l${1.5 * c} ${-1.6 * c}`}
        stroke="var(--primary-foreground)"
        strokeWidth={c * 0.45}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
