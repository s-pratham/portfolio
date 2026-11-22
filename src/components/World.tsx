import { FH, lit, poly, pt, shadow, type V } from "@/lib/iso";

export const GX = 23;
export const GY = 13;
export const FULL_VIEW = { x: -440, y: -170, w: 1200, h: 760 };

type Building = {
  id: string;
  x: number;
  y: number;
  w: number;
  d: number;
  floors: number;
  perUnit?: 1 | 2;
  antenna?: boolean;
  scaffold?: number;
  storefront?: boolean;
  // Small component name shown only while the camera is on its district.
  comp?: string;
};

// Switch AI's flow runner: each step of a flow is a station on a line.
export const FLOW_STEPS = ["trigger", "prefetch", "digest", "explain", "fact check"];

// Switch AI's four improvement loops, with what each has produced so far.
export const LOOPS = [
  { id: "memory", label: "memory: 959 entries", x: 19, y: 0.7 },
  { id: "repair", label: "repair: 22 fixes", x: 21.6, y: 0.7 },
  { id: "gaps", label: "gaps: 54 tool specs", x: 21.6, y: 3.7 },
  { id: "derive", label: "derive: 11 tools", x: 19, y: 3.7 },
];

// Two architecture districts at the back, three standalone projects in front.
export const BUILDINGS: Building[] = [
  // InfraSwitch
  { id: "is-api", comp: "api + dashboard", x: 1, y: 1, w: 2, d: 1.5, floors: 3 },
  { id: "is-db", comp: "release tracker", x: 4.2, y: 1, w: 1.8, d: 1.5, floors: 1, perUnit: 1 },
  { id: "is-consumer", comp: "consumer", x: 7, y: 0.8, w: 1.3, d: 1.3, floors: 7 },
  ...[1, 2.5, 4, 5.5, 7].map((x, i) => ({ id: `is-exec-${i}`, x, y: 4.3, w: 0.9, d: 0.9, floors: 2, perUnit: 1 as const })),
  // Switch AI
  { id: "sa-harness", comp: "harness", x: 12, y: 1, w: 1.5, d: 1.5, floors: 10, antenna: true },
  { id: "sa-memory", comp: "memory", x: 14.8, y: 0.9, w: 2.4, d: 1.6, floors: 3 },
  ...FLOW_STEPS.map((_, i) => ({ id: `sa-f-${i}`, x: 12 + i * 1.45, y: 4.1, w: 0.9, d: 0.9, floors: 1, perUnit: 1 as const })),
  ...LOOPS.map((l) => ({ id: `sa-l-${l.id}`, x: l.x, y: l.y, w: 0.8, d: 0.8, floors: 2, perUnit: 1 as const })),
  // Front row
  { id: "light", x: 2, y: 8.5, w: 2, d: 2, floors: 3, storefront: true },
  { id: "agent-org", x: 11.5, y: 8.5, w: 3, d: 2, floors: 4, perUnit: 1 },
  { id: "civitas", x: 17, y: 8.5, w: 3, d: 2, floors: 4, scaffold: 2 },
];

const byId = (id: string) => BUILDINGS.find((b) => b.id === id)!;

const NOTE = pt([1, 5.7, 0]);
const LOOP_NOTE = pt([19.9, 5.15, 0]);
// Ground text runs along the x axis, like a street name.
const ALONG_X = `rotate(${(Math.atan2(16, 32) * 180) / Math.PI})`;

// Where the camera looks for each chapter: a world point and how many world
// units of width to show.
export const FOCUS: Record<string, { c: V; w: number }> = {
  infra: { c: [4.6, 2.8, 2], w: 1000 },
  "switch-ai": { c: [17, 2.6, 2], w: 1050 },
  light: { c: [5.0, 9.4, 1.2], w: 880 },
  "agent-org": { c: [13, 9.5, 2], w: 580 },
  civitas: { c: [18.5, 9.5, 3.5], w: 560 },
};

// Within the Switch AI chapter the camera visits each pillar in turn; `at` is
// how far through the chapter each shot begins.
export const BEATS: Record<string, { c: V; w: number; at: number }[]> = {
  "switch-ai": [
    { c: [13.2, 1.9, 4.5], w: 780, at: 0.2 },
    { c: [16, 1.7, 1.5], w: 760, at: 0.4 },
    { c: [14.9, 4.6, 0.5], w: 820, at: 0.58 },
    { c: [20.7, 2.6, 1], w: 800, at: 0.76 },
  ],
};

// The labels shown on the overview, one per project.
const DISTRICT_LABELS = [
  { id: "infra", anchor: "is-consumer", label: "infra-switch", sub: "workflow platform" },
  { id: "switch-ai", anchor: "sa-harness", label: "switch-ai", sub: "500+ users" },
  { id: "light", anchor: "light", label: "light", sub: "vibe-code legacy UI" },
  { id: "agent-org", anchor: "agent-org", label: "agent-org", sub: "an org run by agents" },
  { id: "civitas", anchor: "civitas", label: "civitas", sub: "under construction" },
];

// Ground outlines for the two architecture districts.
const DISTRICTS = [
  { id: "infra", x: 0.5, y: 0.3, w: 8.4, d: 5.4 },
  { id: "switch-ai", x: 11.1, y: 0.3, w: 11.8, d: 5.4 },
];

const PODS: [number, number][] = [];
for (const y of [8.6, 9.6]) for (const x of [5.2, 6.1, 7, 7.9, 8.8]) PODS.push([x, y]);

// The path a request takes through each district, building by building.
export const FLOWS: Record<string, string[]> = {
  infra: ["is-api", "is-db", "is-consumer", "is-exec-2", "is-db"],
  "sa-flows": FLOW_STEPS.map((_, i) => `sa-f-${i}`),
  "sa-loop": [...LOOPS.map((l) => `sa-l-${l.id}`), `sa-l-${LOOPS[0].id}`],
};

export function roof(id: string, lift = 0.35): [number, number] {
  const b = byId(id);
  return pt([b.x + b.w / 2, b.y + b.d / 2, b.floors + lift]);
}

// One window per agent in the agent-org office, bottom floor first.
export const ORG_ROLES = [
  "dev-1", "dev-2", "dev-3", "dev-4", "dev-5",
  "dev-6", "review-1", "review-2", "qa-1", "qa-2",
  "qa-3", "secops-1", "secops-2", "devops-1", "devops-2",
  "research-1", "research-2", "research-3", "lead", "em",
];

export function orgWindowCenter(role: string): [number, number] {
  const b = byId("agent-org");
  const k = ORG_ROLES.indexOf(role);
  const f = Math.floor(k / 5);
  const n = k % 5;
  const z = f + 0.52;
  return n < b.d ? pt([b.x + b.w, b.y + n + 0.5, z]) : pt([b.x + (n - b.d) + 0.5, b.y + b.d, z]);
}

function Floor({ b, f, className = "c-floor" }: { b: Building; f: number; className?: string }) {
  const { x, y, w, d } = b;
  const z0 = f;
  const z1 = f + 1;
  const spans = b.perUnit === 1 ? [[0.22, 0.78]] : [[0.2, 0.42], [0.58, 0.8]];
  const wins: { pts: string; on: boolean; agent?: string }[] = [];
  let n = 0;
  for (let j = 0; j < Math.max(1, Math.floor(d)); j++) {
    for (const [a, c] of spans) {
      wins.push({
        pts: poly([x + w, y + j + a, z0 + 0.3], [x + w, y + j + c, z0 + 0.3], [x + w, y + j + c, z0 + 0.75], [x + w, y + j + a, z0 + 0.75]),
        on: lit(f * 3.1 + j * 0.7 + a + x * 0.3),
        agent: b.id === "agent-org" ? ORG_ROLES[f * 5 + n] : undefined,
      });
      n++;
    }
  }
  const glass = b.storefront && f === 0;
  for (let i = 0; i < Math.max(1, Math.floor(w)) && !glass; i++) {
    for (const [a, c] of spans) {
      wins.push({
        pts: poly([x + i + a, y + d, z0 + 0.3], [x + i + c, y + d, z0 + 0.3], [x + i + c, y + d, z0 + 0.75], [x + i + a, y + d, z0 + 0.75]),
        on: lit(f * 1.7 + i * 1.3 + c + y * 0.5),
        agent: b.id === "agent-org" ? ORG_ROLES[f * 5 + n] : undefined,
      });
      n++;
    }
  }
  return (
    <g className={className} data-f={f}>
      <polygon className="f-left" points={poly([x, y + d, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x, y + d, z1])} />
      <polygon className="f-right" points={poly([x + w, y, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x + w, y, z1])} />
      <polygon className="f-top" points={poly([x, y, z1], [x + w, y, z1], [x + w, y + d, z1], [x, y + d, z1])} />
      {glass && (
        <polygon
          className="c-glass"
          points={poly([x + 0.15, y + d, 0.15], [x + w - 0.15, y + d, 0.15], [x + w - 0.15, y + d, 0.85], [x + 0.15, y + d, 0.85])}
        />
      )}
      {wins.map((wn, k) => (
        <polygon key={k} className={wn.on ? "c-win is-lit" : "c-win"} data-agent={wn.agent} points={wn.pts} />
      ))}
    </g>
  );
}

function Box({ x, y, w, d, h, className }: { x: number; y: number; w: number; d: number; h: number; className: string }) {
  return (
    <g className={className}>
      <polygon className="f-left" points={poly([x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h])} />
      <polygon className="f-right" points={poly([x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h])} />
      <polygon className="f-top" points={poly([x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h])} />
    </g>
  );
}

function Extras({ b }: { b: Building }) {
  const { x, y, w, d, floors } = b;
  if (b.antenna) {
    const [cx, cy] = pt([x + w / 2, y + d / 2, floors]);
    return (
      <g className="c-extra">
        <line x1={cx} y1={cy} x2={cx} y2={cy - FH * 2} />
        <circle className="c-beacon" cx={cx} cy={cy - FH * 2} r={3} />
      </g>
    );
  }
  if (b.scaffold) {
    const z0 = floors;
    const z1 = floors + b.scaffold;
    const top = z1 + 3;
    const mx = x + w + 0.5;
    const my = y + 0.4;
    const [ax, ay0] = pt([mx, my, 0]);
    const [, ay1] = pt([mx, my, top]);
    const [jx, jy] = pt([x + 0.2, my, top]);
    const [kx, ky] = pt([mx + 1, my, top]);
    const [hx, hy] = pt([x + 0.8, my, top]);
    return (
      <>
        {Array.from({ length: b.scaffold }, (_, k) => (
          <Floor key={k} b={b} f={floors + k} className="c-floor civ-new" />
        ))}
        <g className="c-extra">
          <g className="c-scaffold">
            <polygon points={poly([x, y + d, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x, y + d, z1])} />
            <polygon points={poly([x + w, y, z0], [x + w, y + d, z0], [x + w, y + d, z1], [x + w, y, z1])} />
            <polygon points={poly([x, y, z1], [x + w, y, z1], [x + w, y + d, z1], [x, y + d, z1])} />
          </g>
          <line x1={ax} y1={ay0} x2={ax} y2={ay1} />
          <line x1={jx} y1={jy} x2={kx} y2={ky} />
          <line className="c-hook" x1={hx} y1={hy} x2={hx} y2={hy + FH * 2.4} />
        </g>
      </>
    );
  }
  return null;
}

function Chip({ x, y, label, sub, className, dataFor }: { x: number; y: number; label: string; sub?: string; className: string; dataFor: string }) {
  const width = Math.max(label.length, sub?.length ?? 0) * 7 + 18;
  const h = sub ? 32 : 19;
  const cy = y - 28;
  return (
    <g className={className} data-for={dataFor}>
      <line x1={x} y1={y - 2} x2={x} y2={cy} />
      <rect x={x - width / 2} y={cy - h} width={width} height={h} rx={2} />
      <text x={x - width / 2 + 8} y={sub ? cy - 18 : cy - 6}>{label}</text>
      {sub && (
        <text className="c-sub" x={x - width / 2 + 8} y={cy - 6}>
          {sub}
        </text>
      )}
    </g>
  );
}

// Stage markers beside a tower: which floors belong to which stage.
const STAGE_SETS: Record<string, { id: string; z: number }[]> = {
  "is-consumer": [
    { id: "precheck", z: 1 },
    { id: "execute", z: 3.5 },
    { id: "validate", z: 6 },
  ],
  "sa-harness": [
    { id: "prepare", z: 1 },
    { id: "investigate", z: 3.5 },
    { id: "check", z: 5.5 },
    { id: "write", z: 7.5 },
    { id: "save", z: 9.5 },
  ],
};

// Memory narrows what it knows to what one turn needs.
const MEM_STEPS = ["959 entries", "30 shortlisted", "6 kept, ~800 tokens"];

export default function World({ active, onActive }: { active: string | null; onActive: (id: string | null) => void }) {
  const lines: [number, number, number, number][] = [];
  for (let i = 0; i <= GX; i++) lines.push([...pt([i, 0, 0]), ...pt([i, GY, 0])]);
  for (let j = 0; j <= GY; j++) lines.push([...pt([0, j, 0]), ...pt([GX, j, 0])]);

  const district = (id: string) => (id.startsWith("is-") ? "infra" : id.startsWith("sa-") ? "switch-ai" : id);
  const memory = byId("sa-memory");
  const [mx, my] = pt([memory.x + memory.w / 2, memory.y + memory.d / 2, memory.floors]);

  return (
    <>
      <g className="c-grid">
        {lines.map(([x1, y1, x2, y2], k) => (
          <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      <g className="c-road">
        <polygon points={poly([0, 6.4, 0], [GX, 6.4, 0], [GX, 7.2, 0], [0, 7.2, 0])} />
        <polygon points={poly([9.8, 0, 0], [10.5, 0, 0], [10.5, GY, 0], [9.8, GY, 0])} />
      </g>
      <g className="c-districts">
        {DISTRICTS.map((d) => {
          return (
            <g key={d.id} className="c-district" data-district={d.id}>
              <polygon points={poly([d.x, d.y, 0], [d.x + d.w, d.y, 0], [d.x + d.w, d.y + d.d, 0], [d.x, d.y + d.d, 0])} />
            </g>
          );
        })}
        <text className="c-note" transform={`translate(${NOTE[0]} ${NOTE[1]}) ${ALONG_X}`}>
          one executor per cloud account or cluster
        </text>
      </g>

      <g className="shadows">
        {BUILDINGS.map((b) => (
          <polygon key={b.id} points={shadow(b.x, b.y, b.w, b.d, b.floors + (b.antenna ? 1 : 0))} />
        ))}
        {PODS.map(([x, y], k) => (
          <polygon key={`p${k}`} points={shadow(x, y, 0.6, 0.6, 0.8)} />
        ))}
      </g>

      {BUILDINGS.map((b) => {
        const d = district(b.id);
        return (
          <a
            key={b.id}
            href={`#${d}`}
            data-b={b.id}
            data-district={d}
            className={active === d ? "c-bldg is-active" : "c-bldg"}
            onMouseEnter={() => onActive(d)}
            onMouseLeave={() => onActive(null)}
            onFocus={() => onActive(d)}
            onBlur={() => onActive(null)}
          >
            {Array.from({ length: b.floors }, (_, f) => (
              <Floor key={f} b={b} f={f} />
            ))}
            <Extras b={b} />
          </a>
        );
      })}

      <g className="loop-ring">
        <polygon points={poly(...LOOPS.map((l) => [l.x + 0.4, l.y + 0.4, 0] as V))} />
      </g>
      <g className="ground-notes">
        {FLOW_STEPS.map((n, i) => {
          const [x, y] = pt([12 + i * 1.45, 5.25, 0]);
          return (
            <text key={n} className="comp" data-for="switch-ai" transform={`translate(${x} ${y}) ${ALONG_X}`}>
              {n}
            </text>
          );
        })}
      </g>

      <g className="pods">
        {PODS.map(([x, y], k) => {
          const [wx, wy] = pt([x + 0.3, y + 0.6, 0.4]);
          return (
            <g key={k} className="pod">
              <Box x={x} y={y} w={0.6} d={0.6} h={0.8} className="c-box" />
              <circle className="pod-light" cx={wx} cy={wy} r={2.6} />
            </g>
          );
        })}
      </g>

      {Object.entries(FLOWS).map(([flow, hops]) => (
        <g key={flow} className="flow" data-flow={flow}>
          {hops.slice(1).map((id, i) => {
            const [x1, y1] = roof(hops[i]);
            const [x2, y2] = roof(id);
            return <line key={i} className="flow-link" data-i={i + 1} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
          <circle className="packet" r={5} cx={roof(hops[0])[0]} cy={roof(hops[0])[1]} />
        </g>
      ))}
      <circle className="ticket" r={5} cx={0} cy={0} />

      <g className="stage-chips">
        {Object.entries(STAGE_SETS).map(([bid, stages]) => {
          const b = byId(bid);
          // The harness has neighbours on its right, so its markers go left.
          const left = bid === "sa-harness";
          return stages.map((st) => {
            const [x0, y0] = left ? pt([b.x, b.y + b.d, st.z]) : pt([b.x + b.w, b.y, st.z]);
            const width = st.id.length * 6 + 12;
            const dir = left ? -1 : 1;
            const rx = left ? x0 - 14 - width : x0 + 14;
            return (
              <g key={st.id} className="stage-chip" data-set={bid} data-stage={st.id}>
                <line x1={x0 + 2 * dir} y1={y0} x2={x0 + 14 * dir} y2={y0} />
                <rect x={rx} y={y0 - 8} width={width} height={16} rx={2} />
                <text x={rx + 6} y={y0 + 3}>{st.id}</text>
              </g>
            );
          });
        })}
      </g>

      <g className="mem-chips">
        {MEM_STEPS.map((m, k) => (
          <Chip key={m} x={mx} y={my - 34} label={m} className="mem-chip" dataFor={String(k)} />
        ))}
      </g>

      <g className="loop-chips">
        {LOOPS.map((l) => {
          const [x, y] = pt([l.x + 0.4, l.y + 0.4, 2]);
          return <Chip key={l.id} x={x} y={y} label={l.label} className="loop-chip" dataFor={l.id} />;
        })}
      </g>

      <g className="comps">
        {BUILDINGS.filter((b) => b.comp).map((b) => {
          const top = b.floors + (b.antenna ? 2 : 0);
          const [ax, ay] = pt([b.x + b.w / 2, b.y + b.d / 2, top]);
          return <Chip key={b.id} x={ax} y={ay} label={b.comp!} className="comp" dataFor={district(b.id)} />;
        })}
        <Chip x={roof("sa-f-2", 0)[0]} y={roof("sa-f-2", 0)[1]} label="flows" className="comp" dataFor="switch-ai" />
        <text className="comp ground-label" data-for="switch-ai" transform={`translate(${LOOP_NOTE[0]} ${LOOP_NOTE[1]}) ${ALONG_X}`}>
          self-improvement loops
        </text>
      </g>

      <g className="labels">
        {DISTRICT_LABELS.map((l) => {
          const b = byId(l.anchor);
          const top = b.floors + (b.scaffold ?? 0) + (b.antenna ? 2 : 0);
          const [ax, ay] = pt([b.x + b.w / 2, b.y + b.d / 2, top]);
          return (
            <Chip
              key={l.id}
              x={ax}
              y={ay}
              label={l.label}
              sub={l.sub}
              className={active === l.id ? "c-label is-active" : "c-label"}
              dataFor={l.id}
            />
          );
        })}
      </g>
    </>
  );
}
