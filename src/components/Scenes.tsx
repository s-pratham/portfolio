import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Panels that play beside each building. They are static markup in their final
// state; Story.tsx drives them from scroll.

type Step = { name: string; detail: string };

function FlowSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="flow-steps">
      {steps.map((s, i) => (
        <li key={s.name} className="fs">
          <span className="fs-n">{i + 1}</span>
          <span className="fs-name">{s.name}</span>
          <span className="fs-detail">{s.detail}</span>
        </li>
      ))}
    </ol>
  );
}

const RELEASE_STATES = ["PENDING_APPROVAL", "APPROVED", "SCHEDULED", "IN_PROGRESS", "COMPLETED"];

const INFRA_FLOW: Step[] = [
  { name: "api", detail: "Someone picks a workflow and its inputs: product, service, cell, environment. Policy picks the approvers; MFA, and Slack works too." },
  { name: "postgres", detail: "The release becomes a row in the release tracker. The database is the bus: there is no broker." },
  { name: "consumer", detail: "Picks up scheduled releases and walks the stages: precheck, execute, validate, then next or rollback. Stagger goes a percentage at a time." },
  { name: "executor", detail: "Each stage's script runs on the executor for the target account or cluster, and reports back." },
  { name: "postgres", detail: "The result lands on the release. 17 states cover pause, abort, reschedule and stagger." },
];

export function InfraScene() {
  return (
    <div className="scene scene-flow">
      <header className="sc-head">
        <span>one release</span>
        <span className="sc-dim">route53 record upsert</span>
      </header>
      <ol className="states">
        {RELEASE_STATES.map((s) => (
          <li key={s} className="state">
            {s}
          </li>
        ))}
      </ol>
      <FlowSteps steps={INFRA_FLOW} />
      <p className="sc-foot">Recipes chain workflows into a DAG. Stack creation builds a whole cell from its template that way.</p>
    </div>
  );
}

type Row = [string, string];

function Rows({ rows }: { rows: Row[] }) {
  return (
    <ol className="pl-rows">
      {rows.map(([k, v]) => (
        <li key={k} className="pl-row">
          <span className="pl-k">{k}</span>
          <span className="pl-v">{v}</span>
        </li>
      ))}
    </ol>
  );
}

function Bars({ bars, unit }: { bars: [string, number, number?][]; unit: string }) {
  const max = Math.max(...bars.flatMap(([, a, b]) => [a, b ?? 0]));
  return (
    <div className="bars">
      {bars.map(([label, value, old]) => (
        <div key={label} className="bar-row">
          <span className="bar-label">{label}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${(value / max) * 100}%` }} />
            {old !== undefined && <span className="bar-old" style={{ width: `${(old / max) * 100}%` }} />}
          </span>
          <span className="bar-val">
            {value}
            {unit}
            {old !== undefined && <i> vs {old}{unit}</i>}
          </span>
        </div>
      ))}
    </div>
  );
}

export const PILLARS = ["Harness", "Memory", "Flows", "Self-improvement"];

export function SwitchScene() {
  return (
    <div className="scene scene-switch">
      <ol className="ptabs">
        {PILLARS.map((t) => (
          <li key={t} className="ptab">
            {t}
          </li>
        ))}
      </ol>
      <div className="pages">
        <section className="pillar" data-p="harness" data-title="Harness">
          <p className="pl-lede">The model only proposes the next step. Code decides what it sees, what may run, and what reaches you.</p>
          <Rows
            rows={[
              ["prepare", "Lease the session; put the clock, page and memory on the message."],
              ["investigate", "Model and tools loop, calls in one step run in parallel. The draft stays hidden."],
              ["check", "Code compares the draft with the evidence: targets, names, sources, counts."],
              ["write", "One step with no tools writes the answer at your depth."],
              ["save", "Mark what it could not verify, save the record, release the lease."],
            ]}
          />
          <div className="budget" aria-label="510 seconds to investigate and answer, 90 seconds to wrap up">
            <span className="budget-main">investigate and answer 510 s</span>
            <span className="budget-wrap">wrap-up 90 s</span>
            <span className="budget-head" aria-hidden="true" />
          </div>
          <p className="pl-note">Results over 2 KB are parked whole; the model sees a view chosen for the question. Nothing is lost to a size limit.</p>
        </section>

        <section className="pillar" data-p="memory" data-title="Memory">
          <p className="pl-lede">Memory holds how things work, never what is true right now. Live values are always read with a tool.</p>
          <Rows
            rows={[
              ["959", "entries: everything memory knows"],
              ["30", "shortlisted: full text keeps exact names, vectors add paraphrases"],
              ["6", "kept: a small model says yes or no to each"],
              ["+1 hop", "linked neighbours come along"],
              ["~800", "tokens enter the turn, within 4 seconds"],
            ]}
          />
          <Bars bars={[["full text", 81], ["vectors", 84], ["both", 90]]} unit="%" />
          <p className="pl-note">Share of relevant entries found, 240 questions. Entries are promoted by outcomes.</p>
        </section>

        <section className="pillar" data-p="flows" data-title="Flows">
          <p className="pl-lede">A job with a known shape is a YAML file and a skill. Code gathers the facts; the model only explains them.</p>
          <Rows
            rows={[
              ["trigger", "InfraSwitch calls one endpoint; the release status picks the variant."],
              ["prefetch", "Fixed tool calls, no model. A step missing its input is skipped and recorded."],
              ["digest", "Code folds each large result to what this job needs."],
              ["explain", "One model call over the evidence."],
              ["fact check", "Codes, routes and ids absent from the evidence are flagged."],
            ]}
          />
          <Bars bars={[["p50", 7.4, 8.5], ["p95", 12.2, 17.1]]} unit=" s" />
          <p className="pl-note">Release summaries, 44 releases, new flow vs the old prompt. Seven flows run this way today.</p>
        </section>

        <section className="pillar" data-p="loops" data-title="Self-improvement">
          <p className="pl-lede">Every turn leaves a full record. Four loops turn those records into knowledge, fixes and new tools.</p>
          <Rows
            rows={[
              ["memory", "959 entries and 1,033 links, from sessions that went quiet."],
              ["repair", "22 fixes drafted: same tool, same error, 3 sessions in 30 days."],
              ["derive", "11 derived tools, each answering in one call what took eight."],
              ["gaps", "54 tool specs from actions people asked for that no tool could do."],
            ]}
          />
          <p className="pl-note">
            A loop can only propose; an admin decides. When the model judged its own lessons, 319 of 358 looked verified,
            wrong ones included. Credit now comes from outcomes.
          </p>
        </section>
      </div>
    </div>
  );
}

export function LightScene() {
  return (
    <div className="scene scene-light">
      <div className="pv">
        <div className="pv-bar">
          <span>preview</span>
          <span className="sc-dim">switchboard, legacy ReScript</span>
        </div>
        <div className="pv-body">
          <div className="pv-nav" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="pv-main">
            <p className="pv-title">Releases</p>
            <div className="pv-filter">
              <span className="is-on">All</span>
              <span>Running</span>
              <span>Failed</span>
            </div>
            <div className="pv-table">
              {[
                ["payments-api", "Running"],
                ["checkout-web", "Done"],
                ["ledger-sync", "Failed"],
                ["cart", "Done"],
              ].map(([svc, st]) => (
                <div key={svc} className="pv-row">
                  <span>{svc}</span>
                  <span className={`pv-st pv-${st.toLowerCase()}`}>{st}</span>
                </div>
              ))}
              <div className="pick-box" aria-hidden="true">
                <span className="pick-tag">ReleaseTable in ReleaseViews.res</span>
              </div>
            </div>
          </div>
          <svg className="cursor" viewBox="0 0 16 20" aria-hidden="true">
            <path d="M1 1 L1 16 L5 12 L8 19 L11 18 L8 11 L14 11 Z" />
          </svg>
        </div>
      </div>
      <p className="bubble bubble-q">Add a status filter above this table</p>
      <div className="packet">
        <span className="packet-branch">light/conv-7f2a</span>
        <span>+24 −6 in 2 files</span>
        <span>rescript build passed</span>
        <span className="packet-pr">Create PR</span>
      </div>
    </div>
  );
}

const PIPELINE = ["todo", "in progress", "code review", "ci", "qa", "done"];

const THREAD = [
  { who: "lead", text: "T12 is yours, dev-3. Reviewer review-1, tester qa-2." },
  { who: "dev-3", text: "Pushed to org/T12. Moving it to code review." },
  { who: "review-1", text: "Approved. Checked all 4 callers listed in the RFC." },
  { who: "devops-1", text: "CI green in a clean environment." },
  { who: "qa-2", text: "Ran each caller against the migrated test DB. Done." },
  { who: "em", text: "Standup: T12 done, T13 in review, nothing blocked." },
];

export function OrgScene() {
  return (
    <div className="scene scene-org">
      <ol className="pipe">
        {PIPELINE.map((p) => (
          <li key={p} className="pipe-step">
            {p}
          </li>
        ))}
      </ol>
      <header className="sc-head">
        <span># t12-status-filter</span>
        <span className="sc-dim">thread</span>
      </header>
      <ol className="thread">
        {THREAD.map((m, i) => (
          <li key={i} className="msg">
            <span className="msg-av" aria-hidden="true">
              {m.who.replace(/[^a-z0-9]/g, "").slice(0, 2)}
            </span>
            <span className="msg-who">{m.who}</span>
            <span className="msg-text">{m.text}</span>
          </li>
        ))}
      </ol>
      <p className="sc-foot">A replay of one ticket. The ticket in the office is the same one, moving window to window.</p>
    </div>
  );
}

const CIVITAS_ALT =
  "The Civitas city client: towers for deployments with lit windows for ready replicas, a crane over a tower running a validate stage, and an alert marker on one service.";

// The screenshot opens full size on click; Escape, the backdrop or the close
// button returns. Rendered on <body> so the panel's transforms can't clip it.
function Zoom({ onClose }: { onClose: () => void }) {
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div className="zoom" role="dialog" aria-modal="true" aria-label="Civitas screenshot" onClick={onClose}>
      {/* The original file, not a resized copy: this is the close-up view. */}
      <div className="zoom-frame" ref={frame} onClick={(e) => e.stopPropagation()}>
        <Image
          src="/civitas-city.png"
          alt={CIVITAS_ALT}
          width={1440}
          height={810}
          unoptimized
          // On a phone the picture is wider than the screen: start on its middle.
          onLoad={() => {
            const f = frame.current;
            if (f) f.scrollLeft = (f.scrollWidth - f.clientWidth) / 2;
          }}
        />
      </div>
      <span className="zoom-hint">Swipe to pan</span>
      <button type="button" className="zoom-close" onClick={onClose} autoFocus>
        Close
      </button>
    </div>,
    document.body,
  );
}

export function CivitasScene() {
  const [open, setOpen] = useState(false);
  return (
    <div className="scene scene-civitas">
      <button type="button" className="shot-open" onClick={() => setOpen(true)} aria-label="View the Civitas screenshot full size">
        <Image src="/civitas-city.png" alt={CIVITAS_ALT} width={1440} height={810} sizes="(min-width: 900px) 460px, 100vw" />
        <span className="shot-hint">View full size</span>
      </button>
      {open && <Zoom onClose={() => setOpen(false)} />}
      <ol className="civ-log">
        <li>
          <span>plan</span>scale payments-api 4 to 6, approved
        </li>
        <li>
          <span>effect</span>k8s Deployment patch, in plan
        </li>
        <li className="is-refused">
          <span>effect</span>s3 delete, not in plan, refused
        </li>
      </ol>
      <p className="sc-foot">The real Civitas client. Floors are replicas, lit windows are ready pods, a crane is a running workflow.</p>
    </div>
  );
}

export const SCENES: Record<string, () => React.JSX.Element> = {
  infra: InfraScene,
  "switch-ai": SwitchScene,
  light: LightScene,
  "agent-org": OrgScene,
  civitas: CivitasScene,
};
