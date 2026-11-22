"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useGSAP } from "@gsap/react";
import World, { BEATS, FLOWS, FOCUS, FULL_VIEW, LOOPS, orgWindowCenter, roof } from "@/components/World";
import { SCENES } from "@/components/Scenes";
import { person, projects } from "@/content";
import { pt, type V } from "@/lib/iso";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin);

// The model's two lights: warm windows, and cobalt for whatever is live.
const SIGNAL = "#2f45ff";
const GLOW = "#ffb347";

// Each chapter lights the model against its own ground colour.
const GROUNDS: Record<string, string> = {
  hero: "#d9d4cb",
  infra: "#c6d0d9",
  "switch-ai": "#cbd4c2",
  light: "#e2d2bf",
  "agent-org": "#dac9c5",
  civitas: "#d8cdac",
  end: "#d9d4cb",
};
const DESKTOP = "(min-width: 900px)";

type Sel = (s: string) => Element[];
type SceneFn = (tl: gsap.core.Timeline, p: Sel, w: Sel) => void;

// A chapter's timeline runs 0..1 over its scroll range: the camera flies in
// over the first quarter, the scene plays from AT to AT + SPAN.
const AT = 0.25;

// Phones: how many screens of scrolling each pinned panel holds for.
const PHONE_HOLD: Record<string, number> = { infra: 1.5, "switch-ai": 3, light: 1.2, "agent-org": 1.4, civitas: 0.8 };
const SPAN = 0.65;

type Shot = { x: number; y: number; w: number; h: number };
type Target = string | { c: V; w: number };

function camera(svg: SVGSVGElement, target: Target, mobile: boolean): Shot {
  const r = svg.getBoundingClientRect();
  const aspect = r.width > 0 ? r.height / r.width : 0.6;
  let cx: number;
  let cy: number;
  let w: number;
  let fx = 0.5;
  let fy = 0.5;
  if (target === "hero" || target === "end") {
    cx = FULL_VIEW.x + FULL_VIEW.w / 2;
    cy = FULL_VIEW.y + FULL_VIEW.h / 2;
    w = mobile ? FULL_VIEW.w * 0.98 : target === "hero" ? FULL_VIEW.w * 1.45 : FULL_VIEW.w * 1.2;
    if (!mobile) fx = target === "hero" ? 0.7 : 0.68;
    w = Math.max(w, (FULL_VIEW.h * 1.05) / aspect);
  } else {
    const f = typeof target === "string" ? FOCUS[target] : target;
    [cx, cy] = pt(f.c);
    w = f.w * (mobile ? 0.62 : 1);
    if (mobile) fy = 0.52;
  }
  const h = w * aspect;
  return { x: cx - fx * w, y: cy - fy * h, w, h };
}

const SIGNAL_INK = "#ffffff";
// A roof the request has reached is lit white; the cobalt path shows the route.
const VISITED = "#ffffff";
const lightUp = { fill: GLOW, fillOpacity: 1 };
const lit = { backgroundColor: SIGNAL, borderColor: SIGNAL, color: SIGNAL_INK };

// Walks a packet along a path building by building, drawing each link as it
// goes and lighting the matching row of the panel, if there is one.
function flow(
  tl: gsap.core.Timeline,
  w: Sel,
  id: string,
  opts: {
    rows?: Element[];
    rowOf?: (number | null)[];
    at?: number;
    span?: number;
    onHop?: (i: number, at: number, slot: number) => void;
  } = {},
) {
  const { rows = [], rowOf = [], at: start = AT, span = SPAN, onHop } = opts;
  const hops = FLOWS[id];
  const q = gsap.utils.selector(w(`.flow[data-flow="${id}"]`)[0]);
  const packet = q(".packet");
  const links = q(".flow-link");
  const [x0, y0] = roof(hops[0]);
  if (rows.length) gsap.set(rows, { opacity: 0.55 });
  gsap.set(links, { autoAlpha: 0 });
  gsap.set(packet, { autoAlpha: 0, attr: { cx: x0, cy: y0 } });
  tl.to(packet, { autoAlpha: 1, duration: 0.01 }, start);
  const slot = span / hops.length;
  hops.forEach((h, i) => {
    const t = start + i * slot;
    const arrive = i > 0 ? t + slot * 0.5 : t;
    if (i > 0) {
      const [x, y] = roof(h);
      tl.to(links[i - 1], { autoAlpha: 1, duration: slot * 0.3 }, t);
      tl.to(packet, { attr: { cx: x, cy: y }, duration: slot * 0.5, ease: "power2.inOut" }, t);
    }
    tl.to(w(`[data-b="${h}"] .f-top`), { fill: VISITED, duration: 0.01 }, arrive);
    const r = rowOf[i];
    if (r !== null && r !== undefined && rows[r]) {
      tl.to(rows[r], { opacity: 1, duration: 0.01 }, arrive);
      const n = gsap.utils.selector(rows[r])(".fs-n");
      if (n.length) tl.to(n, { ...lit, duration: 0.01 }, arrive);
    }
    onHop?.(i, arrive, slot);
  });
}

const scenes: Record<string, SceneFn> = {
  infra(tl, p, w) {
    const states = p(".state");
    const cs = getComputedStyle(states[0]);
    const idle = { backgroundColor: cs.backgroundColor, borderColor: cs.borderColor, color: cs.color };
    const state = (k: number, at: number) => {
      if (k > 0) tl.to(states[k - 1], { ...idle, duration: 0.01 }, at);
      tl.to(states[k], { ...lit, duration: 0.01 }, at);
    };
    gsap.set(w('.stage-chip[data-set="is-consumer"]'), { autoAlpha: 0 });
    tl.to(w('[data-b^="is-"] .c-win'), { fillOpacity: 0.12, duration: 0.08 }, 0.1);
    flow(tl, w, "infra", { rows: p(".fs"), rowOf: [0, 1, 2, 3, 4], onHop: (i, at, slot) => {
      if (i === 0) {
        state(0, at);
        state(1, at + slot * 0.5);
      }
      if (i === 1) state(2, at);
      if (i === 2) {
        state(3, at);
        [[0, 1], [2, 3, 4], [5, 6]].forEach((band, k) => {
          tl.to(w(`.stage-chip[data-set="is-consumer"]`)[k], { autoAlpha: 1, duration: 0.01 }, at + k * (slot / 3));
          band.forEach((f) =>
            tl.to(w(`[data-b="is-consumer"] .c-floor[data-f="${f}"] .c-win`), { ...lightUp, duration: 0.01 }, at + k * (slot / 3)),
          );
        });
      }
      if (i === 3) tl.to(w('[data-b="is-exec-2"] .c-win'), { ...lightUp, duration: 0.02 }, at);
      if (i === 4) state(4, at);
    } });
    tl.to(w('.stage-chip[data-set="is-consumer"]'), { autoAlpha: 0, duration: 0.03 }, 0.96);
  },

  // Four pillars, one per camera beat: the harness, memory, flows and the
  // improvement loops. Each beat swaps the panel's page and plays in the city.
  "switch-ai"(tl, p, w) {
    const pages = p(".pillar");
    const tabs = p(".ptab");
    const cs = getComputedStyle(tabs[0]);
    const idle = { backgroundColor: cs.backgroundColor, borderColor: cs.borderColor, color: cs.color };
    const on = lit;
    const beat = BEATS["switch-ai"].map((b) => b.at + 0.03);
    const len = 0.15;
    const page = (k: number) => gsap.utils.selector(pages[k]);
    gsap.set(pages.slice(1), { autoAlpha: 0 });
    gsap.set(p(".pl-row"), { opacity: 0.55 });
    gsap.set(p(".bar-fill, .bar-old"), { scaleX: 0 });
    gsap.set(p(".budget-head"), { left: "0%" });
    gsap.set(w('.stage-chip[data-set="sa-harness"], .mem-chip, .loop-chip'), { autoAlpha: 0 });
    tl.to(w('[data-b^="sa-"] .c-win'), { fillOpacity: 0.12, duration: 0.06 }, 0.1);
    tl.to(tabs[0], { ...on, duration: 0.01 }, 0.15);

    beat.forEach((t, k) => {
      if (k > 0) {
        tl.to(pages[k - 1], { autoAlpha: 0, duration: 0.01 }, t - 0.02);
        tl.to(tabs[k - 1], { ...idle, duration: 0.01 }, t - 0.02);
        // Swap in the same instant, so there is no scroll position where
        // neither page shows.
        tl.to(pages[k], { autoAlpha: 1, duration: 0.01 }, t - 0.02);
        tl.to(tabs[k], { ...on, duration: 0.01 }, t - 0.02);
      }
      const rows = page(k)(".pl-row");
      const slot = (len * 0.8) / rows.length;
      rows.forEach((r, i) => tl.to(r, { opacity: 1, duration: 0.005 }, t + i * slot));
      tl.to(page(k)(".bar-fill, .bar-old"), { scaleX: 1, duration: len * 0.5, stagger: len * 0.08 }, t + len * 0.5);
    });

    // Harness: its floors are the five stages, bottom to top.
    const bands = [[0, 1], [2, 3, 4], [5, 6], [7, 8], [9]];
    const chips = w('.stage-chip[data-set="sa-harness"]');
    bands.forEach((band, k) => {
      const t = beat[0] + k * (len / 5);
      tl.to(chips[k], { autoAlpha: 1, duration: 0.005 }, t);
      band.forEach((f) => tl.to(w(`[data-b="sa-harness"] .c-floor[data-f="${f}"] .c-win`), { ...lightUp, duration: 0.005 }, t));
    });
    tl.to(p(".budget-head"), { left: "85%", duration: len, ease: "none" }, beat[0]);
    tl.to(chips, { autoAlpha: 0, duration: 0.01 }, beat[1] - 0.02);

    // Memory: everything, then a shortlist, then the few that enter the turn.
    const wins = w('[data-b="sa-memory"] .c-win');
    const memChips = w(".mem-chip");
    const keep = new Set([1, 4, 7, 10, 13, 16]);
    tl.to(memChips[0], { autoAlpha: 1, duration: 0.005 }, beat[1]);
    tl.to(wins, { ...lightUp, duration: 0.005, stagger: 0.002 }, beat[1] + 0.02);
    tl.to(memChips[0], { autoAlpha: 0, duration: 0.005 }, beat[1] + len * 0.4);
    tl.to(memChips[1], { autoAlpha: 1, duration: 0.005 }, beat[1] + len * 0.4);
    tl.to(wins.filter((_, i) => !keep.has(i)), { fillOpacity: 0.12, duration: 0.005, stagger: 0.002 }, beat[1] + len * 0.6);
    tl.to(memChips[1], { autoAlpha: 0, duration: 0.005 }, beat[1] + len * 0.75);
    tl.to(memChips[2], { autoAlpha: 1, duration: 0.005 }, beat[1] + len * 0.75);
    tl.to(memChips[2], { autoAlpha: 0, duration: 0.01 }, beat[2] - 0.02);

    // Flows: a release moves down the line of stations.
    flow(tl, w, "sa-flows", { at: beat[2], span: len });

    // Self-improvement: a record goes round the four loops.
    const loopChips = w(".loop-chip");
    flow(tl, w, "sa-loop", {
      at: beat[3],
      span: len,
      onHop: (i, at) => {
        if (i < LOOPS.length) {
          tl.to(loopChips[i], { autoAlpha: 1, duration: 0.005 }, at);
          tl.to(w(`[data-b="sa-l-${LOOPS[i].id}"] .c-win`), { ...lightUp, duration: 0.005 }, at);
        }
      },
    });
    tl.to(loopChips, { autoAlpha: 0, duration: 0.02 }, 0.96);
  },

  light(tl, p, w) {
    gsap.set(w(".pod-light"), { opacity: 0.18 });
    gsap.set(p(".cursor"), { autoAlpha: 0, x: -140, y: 90 });
    gsap.set([p(".pick-box"), p(".bubble-q")], { autoAlpha: 0 });
    gsap.set(p(".pv-filter"), { autoAlpha: 0, height: 0, marginBottom: 0 });
    gsap.set(p(".packet"), { autoAlpha: 0, y: 16 });
    tl.to(w(".pod-light"), { opacity: 1, fill: GLOW, duration: 0.02, stagger: 0.012 }, AT - 0.08);
    tl.to(p(".cursor"), { autoAlpha: 1, duration: 0.02 }, AT);
    tl.to(p(".cursor"), { x: 0, y: 0, duration: 0.12, ease: "power2.inOut" }, AT);
    tl.to(p(".pick-box"), { autoAlpha: 1, duration: 0.03 }, AT + 0.12);
    tl.to(p(".bubble-q"), { autoAlpha: 1, duration: 0.04 }, AT + 0.18);
    tl.to(w('[data-b="light"] .c-glass'), { fill: GLOW, fillOpacity: 0.7, duration: 0.05 }, AT + 0.22);
    tl.to(p(".pv-filter"), { autoAlpha: 1, height: "auto", marginBottom: 8, duration: 0.08 }, AT + 0.3);
    tl.to([p(".pick-box"), p(".cursor")], { autoAlpha: 0, duration: 0.03 }, AT + 0.38);
    tl.to(p(".packet"), { autoAlpha: 1, y: 0, duration: 0.06 }, AT + 0.46);
    tl.to(p(".packet-pr"), { ...lit, duration: 0.03 }, AT + 0.58);
  },

  "agent-org"(tl, p, w) {
    const msgs = p(".msg");
    const pipe = p(".pipe-step");
    const ticket = w(".ticket");
    const route = ["lead", "dev-3", "review-1", "devops-1", "qa-2", "em"];
    const stage = [0, 2, 3, 4, 5, 5];
    gsap.set(msgs, { autoAlpha: 0, y: 8 });
    const [lx, ly] = orgWindowCenter("lead");
    gsap.set(ticket, { attr: { cx: lx, cy: ly }, autoAlpha: 0 });
    const cs = getComputedStyle(pipe[0]);
    const idle = { backgroundColor: cs.backgroundColor, borderColor: cs.borderColor, color: cs.color };
    tl.to(w('[data-b="agent-org"] .c-win'), { fillOpacity: 0.12, duration: 0.06 }, 0.12);
    tl.to(ticket, { autoAlpha: 1, duration: 0.02 }, AT);
    const slot = SPAN / route.length;
    route.forEach((role, i) => {
      const t = AT + i * slot;
      const [cx, cy] = orgWindowCenter(role);
      if (i > 0) tl.to(ticket, { attr: { cx, cy }, duration: slot * 0.4, ease: "power2.inOut" }, t);
      tl.to(w(`.c-win[data-agent="${role}"]`), { ...lightUp, duration: 0.02 }, t + slot * 0.4);
      tl.to(msgs[i], { autoAlpha: 1, y: 0, duration: 0.03 }, t + slot * 0.4);
      if (i === 0 || stage[i] !== stage[i - 1]) {
        if (i > 0) tl.to(pipe[stage[i - 1]], { ...idle, duration: 0.02 }, t + slot * 0.4);
        tl.to(pipe[stage[i]], { ...lit, duration: 0.02 }, t + slot * 0.4);
      }
    });
  },

  civitas(tl, p, w) {
    gsap.set(p(".civ-log li"), { autoAlpha: 0, x: -8 });
    const hook = w('[data-b="civitas"] .c-hook')[0];
    const y2 = Number(hook?.getAttribute("y2") ?? 0);
    tl.to(w('[data-b="civitas"] .c-hook'), { attr: { y2: y2 + 40 }, duration: 0.08 }, AT);
    tl.to(w('[data-b="civitas"] .civ-new'), { opacity: 1, duration: 0.06, stagger: 0.1 }, AT + 0.06);
    tl.to(w('[data-b="civitas"] .c-scaffold'), { opacity: 0, duration: 0.08 }, AT + 0.2);
    tl.to(w('[data-b="civitas"] .c-hook'), { attr: { y2 }, duration: 0.08 }, AT + 0.24);
    tl.to(p(".civ-log li"), { autoAlpha: 1, x: 0, duration: 0.04, stagger: 0.1 }, AT + 0.3);
    tl.to(w('[data-b="civitas"] .c-win'), { ...lightUp, duration: 0.03, stagger: { amount: 0.15, from: "random" } }, AT + 0.3);
  },
};

export default function Story() {
  const root = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useGSAP(
    () => {
      const svg = svgRef.current!;
      const w = gsap.utils.selector(svg);
      const mm = gsap.matchMedia();

      mm.add(
        { desktop: DESKTOP, mobile: "(max-width: 899px)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const { mobile, reduce } = ctx.conditions as { mobile: boolean; reduce: boolean };
          // The camera is a plain object that timelines animate; one ticker
          // writes it to the viewBox. A jump blends from the shot on screen
          // into the live camera, so it can start from wherever you are.
          const shot = (t: Target) => camera(svg, t, mobile);
          const camState: Shot = shot("hero");
          const blend = { k: 1, from: { ...camState } };
          let onScreen = { ...camState };
          const render = () => {
            const { k, from } = blend;
            onScreen = {
              x: from.x + (camState.x - from.x) * k,
              y: from.y + (camState.y - from.y) * k,
              w: from.w + (camState.w - from.w) * k,
              h: from.h + (camState.h - from.h) * k,
            };
            svg.setAttribute("viewBox", `${onScreen.x.toFixed(1)} ${onScreen.y.toFixed(1)} ${onScreen.w.toFixed(1)} ${onScreen.h.toFixed(1)}`);
          };
          render();
          gsap.ticker.add(render);
          // Shown only once the camera is placed, so a reload never flashes the
          // server-rendered framing before the intro starts.
          gsap.set(svg, { visibility: "visible" });

          const story = root.current!;
          gsap.set(document.documentElement, { "--ground": GROUNDS.hero });

          let intro: gsap.core.Timeline | null = null;
          if (!reduce && window.scrollY < 10) {
            // The opening: the city builds itself as soon as the page loads.
            intro = gsap
              .timeline({ defaults: { ease: "power3.out" } })
              .from(w(".c-grid line"), { opacity: 0, duration: 0.4, stagger: { amount: 0.3 } }, 0)
              .from(w(".c-road"), { opacity: 0, duration: 0.4 }, 0.15)
              .from(w(".c-floor:not(.civ-new)"), { opacity: 0, y: 10, duration: 0.3, stagger: { amount: 0.8 } }, 0.25)
              .from(w(".shadows polygon"), { opacity: 0, duration: 0.6, stagger: { amount: 0.8 } }, 0.35)
              .from([w(".c-extra"), w(".c-box"), w(".c-districts")], { opacity: 0, duration: 0.3, stagger: { amount: 0.3 } }, 0.9)
              .from(w(".c-win.is-lit"), { opacity: 0, duration: 0.2, stagger: { amount: 0.4, from: "random" } }, 1.1)
              .from(w(".labels .c-label"), { opacity: 0, y: 6, duration: 0.35, stagger: 0.06 }, 1.3);
          }

          // The landing page owns the name and the project list; the header
          // stays empty until you scroll, then the name shrinks up into it and
          // the index hands over to the nav.
          const top = document.querySelector<HTMLElement>(".top")!;
          const topName = top.querySelector<HTMLElement>(".top-name")!;
          const navLinks = top.querySelectorAll<HTMLElement>("nav a");
          const hero = story.querySelector<HTMLElement>(".chapter-hero")!;
          const heroName = hero.querySelector<HTMLElement>("h1")!;
          const heroRest = hero.querySelectorAll<HTMLElement>(".kicker, .hero-line, .hero-hint");
          const heroIndex = hero.querySelectorAll<HTMLElement>(".index li");
          gsap.set([topName, ...navLinks], { autoAlpha: 0 });
          if (mobile || reduce) {
            ScrollTrigger.create({
              trigger: heroName,
              start: mobile ? "bottom top+=120" : "top top",
              onEnter: () => gsap.to(topName, { autoAlpha: 1, duration: reduce ? 0 : 0.3 }),
              onLeaveBack: () => gsap.to(topName, { autoAlpha: 0, duration: reduce ? 0 : 0.3 }),
            });
            if (reduce) gsap.set(navLinks, { autoAlpha: 1 });
          } else {
            const travel = () => window.innerHeight * 0.5;
            const docBox = (el: HTMLElement) => {
              let x = 0;
              let y = 0;
              for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
                x += n.offsetLeft;
                y += n.offsetTop;
              }
              return { x, y };
            };
            const fontPx = (el: HTMLElement) => parseFloat(getComputedStyle(el).fontSize);
            gsap
              .timeline({
                scrollTrigger: { trigger: hero, start: "top top", end: () => `+=${travel()}`, scrub: 0.4, invalidateOnRefresh: true },
              })
              .to(
                heroName,
                {
                  x: () => topName.getBoundingClientRect().left - docBox(heroName).x,
                  y: () => topName.getBoundingClientRect().top - (docBox(heroName).y - travel()),
                  scale: () => fontPx(topName) / fontPx(heroName),
                  transformOrigin: "0 0",
                  ease: "power1.in",
                  duration: 1,
                },
                0,
              )
              .to(heroRest, { autoAlpha: 0, y: -24, duration: 0.5 }, 0)
              .to(heroIndex, { autoAlpha: 0, y: -36, duration: 0.4, stagger: 0.05 }, 0.1)
              .to(hero.querySelector(".index"), { autoAlpha: 0, duration: 0.2 }, 0.45)
              .to(top, { "--top-bg": 1, duration: 0.3 }, 0.45)
              .fromTo(navLinks, { y: -8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05, immediateRender: false }, 0.45)
              .to(heroName, { autoAlpha: 0, duration: 0.1 }, 0.9)
              .to(topName, { autoAlpha: 1, duration: 0.1 }, 0.9);
          }

          const ids = [...projects.map((p) => p.id), "end"];

          const chapterOf = (id: string) => root.current!.querySelector<HTMLElement>(`[data-chapter="${id}"]`)!;
          const labels = w(".labels");
          const scrim = story.querySelector<HTMLElement>(".scrim")!;
          gsap.set(scrim, { autoAlpha: 0 });
          const comps = (id: string) => w(`.comp[data-for="${id}"]`);
          gsap.set(w(".comp"), { autoAlpha: 0 });

          // Shows the overview labels or one district's component labels.
          const dress = (id: string, instant = false) => {
            gsap.to(labels, { autoAlpha: id === "hero" || id === "end" ? 1 : 0, duration: instant ? 0 : 0.3 });
            gsap.to(w(".comp"), { autoAlpha: 0, duration: instant ? 0 : 0.2 });
            if (comps(id).length) gsap.to(comps(id), { autoAlpha: 1, duration: instant ? 0 : 0.3, delay: instant ? 0 : 0.5 });
          };

          // The camera. On desktop it is one timeline scrubbed across the whole
          // story, so scrolling back and forth always lands on the right shot.
          // Chapter heights are in vh, so these proportions survive a resize.
          // On narrow screens and with reduced motion it flies between shots.
          // On desktop the camera is one timeline scrubbed across the whole
          // story, so scrolling back and forth always lands on the right shot.
          // Chapter heights are in vh, so these proportions survive a resize.
          // On narrow screens and with reduced motion it flies between shots.
          const to = (t: Target) => ({
            x: () => shot(t).x,
            y: () => shot(t).y,
            w: () => shot(t).w,
            h: () => shot(t).h,
          });
          let jumping = false;
          // True while a link jump is gliding; the snap stands down so its own
          // scroll tween cannot replace the glide.
          let gliding = false;
          let stopSnap = () => {};
          const fly = (id: string) => {
            gsap.to(camState, { ...shot(id), duration: reduce || jumping ? 0 : 0.9, ease: "power2.inOut", overwrite: true });
            gsap.to(document.documentElement, { "--ground": GROUNDS[id], duration: reduce || jumping ? 0 : 0.9 });
            gsap.to(scrim, { autoAlpha: id === "hero" ? 0 : 1, duration: reduce || jumping ? 0 : 0.4 });
            dress(id, reduce || jumping);
          };
          if (!mobile && !reduce) {
            const chapters = root.current!.querySelector<HTMLElement>(".chapters")!;
            const total = chapters.offsetHeight - window.innerHeight;
            // Each handover between projects, as a window of the story's
            // progress: from the moment the next chapter enters (the previous
            // text still in place) to the moment its text docks at the top.
            // Stopping inside one carries on once the old text is 40% lifted,
            // and settles back otherwise; reading a scene never snaps.
            const handovers = (): [number, number][] =>
              ids.map((id) => {
                const ch = chapterOf(id);
                const dock = parseFloat(getComputedStyle(ch.querySelector(".card")!).top) || 0;
                return [(ch.offsetTop - window.innerHeight) / total, (ch.offsetTop - dock) / total];
              });
            const camTl = gsap.timeline({
              scrollTrigger: {
                trigger: chapters,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            });
            ids.forEach((id, i) => {
              const ch = chapterOf(id);
              const at = (ch.offsetTop - window.innerHeight) / total;
              const dur = (0.25 * ch.offsetHeight) / total;
              camTl.to(camState, { ...to(id), duration: dur, ease: "power2.inOut" }, at);
              camTl.to(document.documentElement, { "--ground": GROUNDS[id], duration: dur, ease: "none" }, at);
              (BEATS[id] ?? []).forEach((b) => {
                const bAt = (ch.offsetTop - window.innerHeight + b.at * ch.offsetHeight) / total;
                camTl.to(camState, { ...to(b), duration: dur * 0.35, ease: "power2.inOut" }, bAt);
              });
              if (i === 0) {
                camTl.to(labels, { autoAlpha: 0, duration: dur * 0.4 }, at);
                camTl.to(scrim, { autoAlpha: 1, duration: dur * 0.4 }, at);
              }
              if (i > 0) camTl.to(comps(ids[i - 1]), { autoAlpha: 0, duration: dur * 0.3 }, at);
              if (comps(id).length) camTl.to(comps(id), { autoAlpha: 1, duration: dur * 0.3 }, at + dur * 0.7);
              if (id === "end") camTl.to(labels, { autoAlpha: 1, duration: dur * 0.4 }, at + dur * 0.6);
            });
            camTl.set({}, {}, 1);

            // The handover snap: about a tenth of a second after the last
            // scroll movement, finish or undo the handover you stopped in.
            let idle = 0;
            let lastY = window.scrollY;
            let dir = 1;
            let snapping: gsap.core.Tween | null = null;
            const snapNow = () => {
              const st = camTl.scrollTrigger!;
              const v = (window.scrollY - st.start) / (st.end - st.start);
              const f = handovers().find(([a, b]) => v > a && v < b);
              if (!f) return;
              const k = (v - f[0]) / (f[1] - f[0]);
              const to = (dir > 0 ? k > 0.4 : k > 0.6) ? f[1] : f[0];
              const y = st.start + to * (st.end - st.start);
              snapping = gsap.to(window, {
                scrollTo: { y, autoKill: true },
                duration: gsap.utils.clamp(0.5, 1, Math.abs(y - window.scrollY) / 1000),
                ease: "power2.out",
                onComplete: () => (snapping = null),
                onInterrupt: () => (snapping = null),
              });
            };
            const onScroll = () => {
              const y = window.scrollY;
              if (y !== lastY) dir = y > lastY ? 1 : -1;
              lastY = y;
              if (snapping || gliding) return;
              window.clearTimeout(idle);
              idle = window.setTimeout(snapNow, 70);
            };
            window.addEventListener("scroll", onScroll, { passive: true });
            stopSnap = () => {
              window.clearTimeout(idle);
              snapping?.kill();
              window.removeEventListener("scroll", onScroll);
            };
          } else {
            ids.forEach((id, i) =>
              ScrollTrigger.create({
                trigger: chapterOf(id),
                start: mobile ? "top 55%" : "top 60%",
                onEnter: () => fly(id),
                onLeaveBack: () => fly(i === 0 ? "hero" : ids[i - 1]),
              }),
            );
          }

          // In-page links: the page skips the chapters in between and glides
          // through the destination one so its scene plays as if scrolled,
          // while the camera blends from the current shot into the live one.
          const settle = () => {
            ScrollTrigger.update();
            // Scrubbed triggers smooth with a tween; plain scrub (true) has none.
            ScrollTrigger.getAll().forEach((st) => {
              const t = st.getTween?.();
              if (t && typeof t.progress === "function") t.progress(1);
            });
          };
          let glide: gsap.core.Tween | null = null;

          // A jump to a project that isn't next door: a snapshot of the text
          // you were on stays on screen and is pushed up by the destination's
          // text exactly like a normal handover, while the chapter that
          // really sits before the destination is kept out of sight.
          const lineSel = ".kicker, h2, .card-summary, .card-points li, .stack";
          let ghost: HTMLElement | null = null;
          let ghostPanel: HTMLElement | null = null;
          let ghostLines: { el: HTMLElement; off: number; h: number }[] = [];
          let ghostTop = 0;
          let ghostDock = 0;
          let ghostDest: HTMLElement | null = null;
          let hidden: HTMLElement[] = [];
          const snapshot = (src: HTMLElement) => {
            const r = src.getBoundingClientRect();
            const copy = src.cloneNode(true) as HTMLElement;
            copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
            copy.setAttribute("aria-hidden", "true");
            Object.assign(copy.style, {
              position: "fixed",
              top: `${r.top}px`,
              left: `${r.left}px`,
              width: `${r.width}px`,
              margin: "0",
              transform: "none",
              pointerEvents: "none",
              zIndex: "1",
            });
            document.body.appendChild(copy);
            return copy;
          };
          const moveGhost = () => {
            if (!ghost || !ghostDest) return;
            const destTop = ghostDest.getBoundingClientRect().top;
            const top = Math.min(ghostTop, destTop - ghost.offsetHeight - 40);
            ghost.style.top = `${top}px`;
            for (const l of ghostLines) {
              const lineTop = top + l.off;
              l.el.style.opacity = String(gsap.utils.clamp(0, 1, (lineTop - (ghostDock - l.h * 0.8)) / (l.h * 0.8)));
            }
          };
          const clearGhost = () => {
            gsap.ticker.remove(moveGhost);
            ghost?.remove();
            ghostPanel?.remove();
            ghost = ghostPanel = ghostDest = null;
            hidden.forEach((h) => h.classList.remove("is-suppressed"));
            hidden = [];
          };
          const makeGhost = (destId: string) => {
            const story = root.current!;
            // The text docked on screen now, and the scene panel showing.
            let cur: HTMLElement | null = null;
            let curTop = -Infinity;
            story.querySelectorAll<HTMLElement>(".chapter:not(.chapter-hero) .card").forEach((c) => {
              const r = c.getBoundingClientRect();
              const dock = parseFloat(getComputedStyle(c).top) || 0;
              if (r.top <= dock + 2 && r.bottom > 120 && r.top > curTop) {
                cur = c;
                curTop = r.top;
              }
            });
            const destIdx = ids.indexOf(destId);
            const before = destIdx > 0 ? chapterOf(ids[destIdx - 1]) : null;
            const beforeCard = before?.querySelector<HTMLElement>(".card") ?? null;
            const destCard = chapterOf(destId).querySelector<HTMLElement>(".card");
            // Next door, or already there: the real handover shows it.
            if (!cur || cur === beforeCard || cur === destCard || !destCard) return;
            const curEl = cur as HTMLElement;
            ghostDock = parseFloat(getComputedStyle(curEl).top) || 0;
            ghostTop = curEl.getBoundingClientRect().top;
            ghost = snapshot(curEl);
            ghostLines = [...ghost.querySelectorAll<HTMLElement>(lineSel)].map((el) => ({
              el,
              off: el.offsetTop,
              h: el.offsetHeight,
            }));
            ghostDest = destCard;
            const shownPanel = [...story.querySelectorAll<HTMLElement>(".panel")].find(
              (pn) => parseFloat(getComputedStyle(pn).opacity) > 0.5,
            );
            if (shownPanel) {
              ghostPanel = snapshot(shownPanel);
              ghostPanel.style.zIndex = "0";
              gsap.to(ghostPanel, { autoAlpha: 0, y: -24, duration: 0.45, ease: "power1.in" });
            }
            if (before && !before.classList.contains("chapter-hero")) {
              const beforeId = ids[destIdx - 1];
              const beforePanel = story.querySelector<HTMLElement>(`.panel[data-panel="${beforeId}"]`);
              hidden = [beforeCard, beforePanel].filter((h): h is HTMLElement => !!h);
              hidden.forEach((h) => h.classList.add("is-suppressed"));
            }
            gsap.ticker.add(moveGhost);
          };

          const endGlide = () => gsap.delayedCall(0.4, () => (gliding = false));
          const stopGlide = () => {
            clearGhost();
            glide?.kill();
            endGlide();
          };
          const userScroll = ["wheel", "touchstart", "keydown"] as const;
          userScroll.forEach((ev) => window.addEventListener(ev, stopGlide, { passive: true }));
          const onClick = (e: MouseEvent) => {
            const a = (e.target as Element).closest?.('a[href^="#"]');
            if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
            const id = a.getAttribute("href")!.slice(1);
            const el = id ? document.getElementById(id) : null;
            if (id && !el) return;
            e.preventDefault();
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY;
              const y = window.scrollY;
              const here = mobile
                ? y >= top - window.innerHeight * 0.6 && y < top + el.offsetHeight - window.innerHeight * 0.6
                : y >= top - window.innerHeight * 0.75 && y < top + el.offsetHeight - window.innerHeight;
              if (here) return;
            } else if (window.scrollY < window.innerHeight * 0.3) {
              return;
            }
            stopGlide();
            gsap.killTweensOf(window);
            gsap.killTweensOf(blend);
            intro?.progress(1);
            history.replaceState(null, "", id ? `#${id}` : window.location.pathname);

            let from = 0;
            let target = 0;
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY;
              const topH = document.querySelector<HTMLElement>(".top")!.offsetHeight;
              from = Math.max(0, mobile ? top - window.innerHeight * 0.64 : top - window.innerHeight);
              // Never start a jump inside the landing handover, or the name
              // would grow back and shrink into the header again.
              if (!mobile && !reduce) from = Math.max(from, window.innerHeight * 0.5 + 2);
              target = mobile ? top - topH - 8 : top - window.innerHeight + el.offsetHeight * 0.9;
            }

            gliding = true;
            const shotNow = { ...onScreen };
            if (el && !mobile && !reduce) makeGhost(id === "contact" ? "end" : id);
            jumping = true;
            window.scrollTo({ top: reduce ? target : from, behavior: "instant" });
            settle();
            jumping = false;
            if (reduce) {
              endGlide();
              return;
            }

            blend.from = shotNow;
            blend.k = 0;
            gsap.to(blend, { k: 1, duration: 1.3, ease: "power2.inOut" });
            if (target > from) {
              glide = gsap.to(window, {
                scrollTo: { y: target, autoKill: false },
                duration: Math.min(4, (target - from) / 1000 + 0.6),
                ease: "power1.inOut",
                onComplete: () => {
                  clearGhost();
                  endGlide();
                },
              });
            } else {
              endGlide();
            }
          };
          document.addEventListener("click", onClick);

          // As a chapter's text lifts off, each line fades only when it reaches
          // the header band; everything below stays fully readable.
          if (!mobile) {
            projects.forEach((p) => {
              const ch = chapterOf(p.id);
              const card = ch.querySelector<HTMLElement>(".card")!;
              const dock = () => parseFloat(getComputedStyle(card).top) || 0;
              const parts = card.querySelectorAll<HTMLElement>(".kicker, h2, .card-summary, .card-points li, .stack");
              parts.forEach((el) => {
                // Where this line sits inside the card, so we know how far the
                // card has lifted when the line reaches the dock line.
                const off = () => el.getBoundingClientRect().top - card.getBoundingClientRect().top;
                gsap.fromTo(
                  el,
                  { autoAlpha: 1 },
                  {
                    autoAlpha: 0,
                    ease: "none",
                    immediateRender: false,
                    scrollTrigger: {
                      trigger: ch,
                      start: () => `bottom top+=${dock() + card.offsetHeight - off()}`,
                      end: () => `bottom top+=${dock() + card.offsetHeight - off() - el.offsetHeight * 0.8}`,
                      scrub: true,
                      invalidateOnRefresh: true,
                    },
                  },
                );
              });
            });
          }

          // On phones the text scrolls up above the pinned city; each line
          // (and each part of a panel) fades as it reaches the header.
          if (mobile && !reduce) {
            const topH = () => document.querySelector<HTMLElement>(".top")!.offsetHeight;
            story
              .querySelectorAll<HTMLElement>(
                ".chapter:not(.chapter-hero) :is(.kicker, h2, .card-summary, .card-points li, .stack, .contacts li)",
              )
              .forEach((el) =>
                gsap.fromTo(
                  el,
                  { autoAlpha: 1 },
                  {
                    autoAlpha: 0,
                    ease: "none",
                    immediateRender: false,
                    scrollTrigger: {
                      trigger: el,
                      start: () => `top top+=${topH() + 24}`,
                      end: () => `top top+=${topH() - Math.min(el.offsetHeight, 60) * 0.8}`,
                      scrub: true,
                      invalidateOnRefresh: true,
                    },
                  },
                ),
              );
            // The panel's white sheet itself leaves with its last rows.
            story.querySelectorAll<HTMLElement>(".m-panel .scene").forEach((sheet) =>
              gsap.fromTo(
                sheet,
                { autoAlpha: 1 },
                {
                  autoAlpha: 0,
                  ease: "none",
                  immediateRender: false,
                  scrollTrigger: {
                    trigger: sheet,
                    // The sheet is inside a pinned panel: measure after the pin.
                    pinnedContainer: sheet.closest(".m-panel"),
                    start: () => `bottom top+=${topH() + 70}`,
                    end: () => `bottom top+=${topH()}`,
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
                },
              ),
            );
          }

          // Phones: a panel taller than the space between the header and the
          // city is scaled down so it is whole while pinned.
          if (mobile && !reduce) {
            const fit = () => {
              const topH = document.querySelector<HTMLElement>(".top")!.offsetHeight;
              const room = window.innerHeight - topH - story.querySelector<HTMLElement>(".stage")!.offsetHeight - 24;
              story.querySelectorAll<HTMLElement>(".m-panel").forEach((mp) => {
                const sc = mp.querySelector<HTMLElement>(".scene")!;
                sc.style.transform = "";
                mp.style.height = "";
                const k = Math.min(1, room / sc.offsetHeight);
                if (k < 1) {
                  sc.style.transform = `scale(${k.toFixed(3)})`;
                  mp.style.height = `${Math.ceil(sc.offsetHeight * k)}px`;
                }
              });
            };
            fit();
            ScrollTrigger.addEventListener("refreshInit", fit);
          }

          for (const id of ids) {
            const chapter = chapterOf(id);
            const panel = mobile
              ? chapter.querySelector(".m-panel")
              : root.current!.querySelector(`.panel[data-panel="${id}"]`);
            const tl = gsap.timeline({ paused: reduce });

            if (panel && !mobile) {
              tl.fromTo(panel, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.06, immediateRender: false }, 0.18);
              tl.to(panel, { autoAlpha: 0, y: -24, duration: 0.05 }, 0.95);
            }
            if (id === "end") {
              tl.to(w(".c-win"), { ...lightUp, duration: 0.05, stagger: { amount: 0.4, from: "random" } }, 0.2);
              tl.to(w('.stage-chip[data-set="is-consumer"]'), { autoAlpha: 1, duration: 0.05 }, 0.25);
            } else if (panel) {
              scenes[id](tl, gsap.utils.selector(panel), w);
            }
            tl.set({}, {}, 1);

            const range = mobile
              ? { start: "top 64%", end: "bottom 64%" }
              : { start: "top bottom", end: "bottom bottom" };
            if (reduce) {
              ScrollTrigger.create({
                trigger: chapter,
                ...range,
                onEnter: () => tl.progress(0.9),
                onEnterBack: () => tl.progress(0.9),
                onLeaveBack: () => tl.progress(0),
              });
            } else {
              if (mobile && panel) {
                // Phones: like desktop, the panel holds still while scrolling
                // plays its scene. It pins under the header, the scene scrubs
                // over the pin, then it scrolls away.
                const topH = document.querySelector<HTMLElement>(".top")!.offsetHeight;
                const hold = PHONE_HOLD[id] ?? 1.2;
                ScrollTrigger.create({
                  trigger: panel,
                  start: `top top+=${topH + 8}`,
                  end: () => `+=${window.innerHeight * hold}`,
                  pin: true,
                  refreshPriority: 1,
                  animation: tl.tweenFromTo(AT - 0.03, 1, { ease: "none", paused: true }),
                  scrub: 0.4,
                });
              } else {
                ScrollTrigger.create({ trigger: chapter, ...range, animation: tl, scrub: 0.6 });
              }
            }
          }
          ScrollTrigger.sort();
          return () => {
            document.removeEventListener("click", onClick);
            userScroll.forEach((ev) => window.removeEventListener(ev, stopGlide));
            gsap.ticker.remove(render);
            stopSnap();
          };
        },
      );
    },
    { scope: root },
  );

  // Each row shows what it is and the value itself; empty ones are hidden.
  const contacts = [
    { kind: "LinkedIn", href: person.linkedin, value: person.linkedin.replace(/^https?:\/\/(www\.)?/, "") },
    { kind: "Phone", href: person.phone && `tel:${person.phone.replace(/[^+\d]/g, "")}`, value: person.phone },
    { kind: "Email", href: person.email && `mailto:${person.email}`, value: person.email },
    { kind: "GitHub", href: person.github, value: person.github.replace(/^https?:\/\/(www\.)?/, "") },
    { kind: "Résumé", href: person.resume, value: "Download PDF" },
  ].filter((c) => c.href);

  return (
    <div className="story" ref={root}>
      <div className="m-fade" aria-hidden="true" />
      <div className="stage">
        <svg ref={svgRef} className="world" viewBox={`${FULL_VIEW.x} ${FULL_VIEW.y} ${FULL_VIEW.w} ${FULL_VIEW.h}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label="A scale model of a city. Each district or building is one of the projects on this page.">
          <World active={active} onActive={setActive} />
        </svg>
        <div className="scrim" aria-hidden="true" />
        <div className="atmos" aria-hidden="true" />
        <div className="panels" aria-hidden="true">
          {projects.map((p) => {
            const Scene = SCENES[p.id];
            return (
              <div key={p.id} className="panel" data-panel={p.id}>
                <Scene />
              </div>
            );
          })}
        </div>
      </div>

      <div className="chapters">
        <section className="chapter chapter-hero" aria-labelledby="hero-title">
          <div className="card card-hero">
            <p className="kicker">{person.role}</p>
            <h1 id="hero-title">{person.name}</h1>
            <p className="hero-line">I build infrastructure automation that plans, gets approved, and proves what it changed.</p>
            <p className="hero-hint">Each building on this model is something I built. Scroll to walk through it, or pick one.</p>
            <ol className="index">
              {projects.map((p) => (
                <li key={p.id}>
                  <a
                    href={`#${p.id}`}
                    className={active === p.id ? "is-active" : undefined}
                    onMouseEnter={() => setActive(p.id)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(p.id)}
                    onBlur={() => setActive(null)}
                  >
                    <span>{p.title}</span>
                    <span>{p.context}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {projects.map((p) => {
          const Scene = SCENES[p.id];
          return (
            <section key={p.id} id={p.id} className="chapter" data-chapter={p.id} aria-labelledby={`${p.id}-title`}>
              <div className="card">
                <p className="kicker">{p.context}</p>
                <h2 id={`${p.id}-title`}>{p.title}</h2>
                <p className="card-summary">{p.summary}</p>
                <ul className="card-points">
                  {p.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <ul className="stack" aria-label="Stack">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="m-panel">
                <Scene />
              </div>
            </section>
          );
        })}

        <section id="contact" className="chapter chapter-end" data-chapter="end" aria-labelledby="end-title">
          <div className="card card-end">
            <p className="kicker">Contact</p>
            <h2 id="end-title">Let&rsquo;s talk.</h2>
            <ul className="contacts">
              {contacts.map((c) => (
                <li key={c.kind}>
                  <span>{c.kind}</span>
                  <a href={c.href} {...(c.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
                    {c.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
