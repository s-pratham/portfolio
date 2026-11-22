// Everything a visitor reads lives here. Empty links are hidden.
export const person = {
  name: "Prathamesh Sonawane",
  role: "Software developer at Juspay",
  linkedin: "https://www.linkedin.com/in/prathameshsonawane03",
  phone: "+91 81779 42021",
  email: "prathameshsonawane12345@gmail.com",
  github: "",
  resume: "", // e.g. "/resume.pdf" after dropping the file in public/
};

export type Project = {
  id: string;
  title: string;
  context: string;
  stack: string[];
  summary: string;
  points: string[];
};

export const projects: Project[] = [
  {
    id: "infra",
    title: "InfraSwitch",
    context: "Juspay, where I build infra automation",
    stack: ["Haskell", "Postgres", "ReScript", "Python", "AWS", "GCP", "Kubernetes"],
    summary:
      "How Juspay changes its payments infrastructure safely. Every change, from a DNS record to a whole new cell, is a workflow run as a release: requested, approved, scheduled, then executed stage by stage in the target account, with a way back.",
    points: [
      "100+ workflows across AWS, GCP and Kubernetes, each a chain of precheck, execute and validate stages with next and rollback paths.",
      "Approvals by policy: multi-approval, MFA, Slack, and RBAC on who may run what.",
      "Recipes chain workflows into a DAG; stack creation builds a whole cell from a cell template.",
      "Stagger rollouts, schedules, pause, abort and reschedule: 17 release states, all kept in Postgres.",
    ],
  },
  {
    id: "switch-ai",
    title: "Switch AI",
    context: "Juspay, used by 500+ engineers",
    stack: ["Python", "Postgres", "pgvector", "Valkey", "Kubernetes", "infra-mcp", "Slack"],
    summary:
      "An agent that answers infrastructure questions from dashboards and Slack. It reads live systems and source code, checks its own draft against the evidence, and gets better with every conversation.",
    points: [
      "Harness: the model only proposes the next step. Code decides what it sees, what may run, and what reaches the person asking.",
      "Memory: holds how things work, never what is true now. Entries earn their place from outcomes.",
      "Flows: a job with a known shape is a YAML file and a skill, so there is no agent loop to wander.",
      "Self-improvement: four loops turn real usage into knowledge, fixes and new tools. An admin decides.",
    ],
  },
  {
    id: "light",
    title: "Light",
    context: "Juspay, internal tool",
    stack: ["React", "TypeScript", "FastAPI", "Claude Code", "Vite", "ReScript", "EKS", "Pomerium"],
    summary:
      "Like Lovable, but for frontend work on a legacy codebase. You chat with an agent that edits the real repository, watch the change in a live preview, and review it before it becomes a pull request.",
    points: [
      "Click any component in the preview and the agent gets its source file, so you can point at what you mean.",
      "Every conversation works on its own branch, with a review packet and a one-click PR.",
      "Multi-user on EKS: one pod per user behind SSO, scaled to zero when idle. 15 concurrent users verified.",
    ],
  },
  {
    id: "agent-org",
    title: "agent-org",
    context: "Side project",
    stack: ["Python", "SQLite", "git worktrees", "HTML", "LLM agents"],
    summary:
      "A Slack-like workspace built for agents. Twenty of them run like an engineering org, and I sit in as the CEO: I give a goal and make the decisions, and they do the rest locally.",
    points: [
      "Eight roles, from engineering manager and tech lead to reviewers, QA, SecOps and DevOps.",
      "Projects move from intake to RFC, plan, build, integration and handover. Only the assigned role can move a ticket to its next stage.",
      "A dashboard for tracks, decisions waiting on me, escalations and ideas. The output is one tested commit, never a push.",
    ],
  },
  {
    id: "civitas",
    title: "Civitas",
    context: "Side project",
    stack: ["Rust", "WebAssembly", "Cedar", "Postgres", "AWS", "GCP", "Kubernetes"],
    summary:
      "An infrastructure automation framework where governance can't be bypassed from inside a workflow, with an isometric city on top that renders your infrastructure as it runs. This page's city is drawn the same way.",
    points: [
      "Author code never holds credentials. The only path to a cloud is a handle the engine issues for that run.",
      "A workflow plans before it runs, and the plan is what gets approved. Effects outside the plan are refused.",
      "Fifteen Rust crates and seven decision records. Policy in Cedar, third-party workflows as WebAssembly, state folded from an append-only ledger.",
    ],
  },
];

export const principles = [
  {
    title: "Measure before shipping",
    body: "No change to Switch AI's memory goes out without an A/B against the current code, on replayed tool results so only the change differs.",
  },
  {
    title: "Code decides, the model proposes",
    body: "Whether it's an approval gate or an agent's answer, the guarantees live in code.",
  },
  {
    title: "Agree on the design first",
    body: "For anything new I write the decisions down and settle them with the people who'll live with it, then build.",
  },
];
