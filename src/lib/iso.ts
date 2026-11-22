// Isometric projection, same axes as the Civitas renderer: x runs right-down,
// y runs left-down, z is height in floors.
export const TW = 32;
export const TH = 16;
export const FH = 15;

export type V = [number, number, number];

export const pt = ([x, y, z]: V): [number, number] => [(x - y) * TW, (x + y) * TH - z * FH];

export const poly = (...vs: V[]) =>
  vs.map((v) => pt(v).map((n) => +n.toFixed(2)).join(",")).join(" ");

// Deterministic "lit" pattern so server and client render the same windows.
export const lit = (seed: number, threshold = 0.66) =>
  ((Math.abs(Math.round(seed * 1000)) * 9301 + 49297) % 233280) / 233280 > threshold;

// One sun for the whole model, high on the left: a box of height h throws its
// shadow this far along the ground per floor.
const SUN: [number, number] = [0.42, 0.16];

// The ground shadow of a box, as the hull of its footprint and the footprint
// pushed away from the sun.
export function shadow(x: number, y: number, w: number, d: number, h: number): string {
  const [sx, sy] = [SUN[0] * h, SUN[1] * h];
  const pts: [number, number][] = [];
  for (const [px, py] of [[x, y], [x + w, y], [x + w, y + d], [x, y + d]]) {
    pts.push([px, py], [px + sx, py + sy]);
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: [number, number][]) => {
    const out: [number, number][] = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  const hull = [...half(pts), ...half([...pts].reverse())];
  return poly(...hull.map(([hx, hy]) => [hx, hy, 0] as V));
}
