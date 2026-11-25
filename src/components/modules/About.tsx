"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { commandCenterConfig } from "@/config/command-center.config";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import { Button, Panel } from "@/components/ui";

const SHOWCASE = [
  {
    src: "/showcase/ops-dashboard.png",
    label: "Ops Dashboard",
    caption: "Self-hosted portfolio, content gates & bot reports",
  },
  {
    src: "/showcase/patra-command-center.png",
    label: "Patra Niaga CC",
    caption: "Mission Control KPIs, pipeline & agent fleet",
  },
  {
    src: "/showcase/patra-org.png",
    label: "Org canvas",
    caption: "Human + Grokbot hierarchy with CoS prompts",
  },
] as const;

const AGENT_PROMPT = `Open this Grokbot Command Center template and run the grill-me onboarding from AGENTS.md / .cursor/skills/customize-command-center/SKILL.md.

Keep asking 1–2 focused questions at a time until you have:
1) Task & monitoring categories (domains, status pipelines, SLAs/KPIs)
2) RBAC (single vs multi-user, roles, auth mode)
3) CRUD & write-back per module
4) Grokbot fleet (roster, schedules, ingest keys, webhook)
5) Brand, language, enabled modules, and deploy target (Vercel / Docker / Cursor-local)

Then present a configuration blueprint for my confirmation before editing command-center.config.ts or seed data.`;

const MODULES = [
  "overview",
  "projects",
  "reports",
  "content",
  "org",
  "schedules",
  "docs",
  "inbox",
  "about",
] as const;

export default function About() {
  const { lang } = useCommandCenter();
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(AGENT_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-3xl"
    >
      <div>
        <h1 className="text-2xl font-bold">{t(lang, "about.title")}</h1>
        <p className="mt-2 text-muted leading-relaxed">{t(lang, "about.lead")}</p>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted mb-3">
          Real-world heritage
        </h2>
        <p className="text-sm text-muted mb-3 leading-relaxed">
          This template merges patterns proven in a private Ops Dashboard (VPS +
          Grokbot webhook/ingest) and the Patra Niaga Command Center (Vercel
          preview with Mission Control UX). Screenshots below use sanitized /
          workshop sample data.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {SHOWCASE.map((item) => (
            <Panel key={item.src} className="p-2 overflow-hidden">
              <div className="relative aspect-video rounded-lg bg-surface2 overflow-hidden border border-[var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.label}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-[var(--text)]">
                {item.label}
              </p>
              <p className="text-[11px] text-muted leading-snug">{item.caption}</p>
            </Panel>
          ))}
        </div>
      </section>

      <Panel>
        <h2 className="font-semibold mb-3">Architecture</h2>
        <pre className="text-xs font-mono leading-relaxed text-muted overflow-x-auto">
{`┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Browser UI │────▶│  /api/state  │────▶│  KV / Files │
│  (modules)  │     │  /api/respond│     │  or Demo LS │
└──────┬──────┘     └──────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ingest POST
│ Grokbot     │◀──────────────────── Bots (Lucius, Ichi, …)
│ webhooks    │
└─────────────┘`}
        </pre>
      </Panel>

      <Panel>
        <h2 className="font-semibold mb-2">Module directory</h2>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {MODULES.filter((m) => commandCenterConfig.modules[m]).map((m) => (
            <li key={m} className="rounded-lg border border-line px-3 py-2">
              <span className="font-medium">{t(lang, `tabs.${m}`)}</span>
              <span className="block text-xs text-muted mt-0.5">
                CRUD: {commandCenterConfig.crud[m]}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <h2 className="font-semibold mb-2">AI agent customization</h2>
        <p className="text-sm text-muted mb-3">{t(lang, "about.agentOnboarding")}</p>
        <pre className="text-xs bg-surface2 rounded-lg p-3 whitespace-pre-wrap">{AGENT_PROMPT}</pre>
        <Button className="mt-3" size="sm" onClick={() => void copyPrompt()}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          Copy prompt
        </Button>
      </Panel>

      <Panel>
        <h2 className="font-semibold mb-2">RBAC & CRUD</h2>
        <ul className="text-sm text-muted space-y-2 list-disc pl-5">
          <li>
            Roles: <code className="text-[var(--accent)]">admin</code>,{" "}
            <code className="text-[var(--accent)]">approver</code>,{" "}
            <code className="text-[var(--accent)]">operator</code>,{" "}
            <code className="text-[var(--accent)]">viewer</code> with per-module
            view/create/update/delete/approve.
          </li>
          <li>
            CRUD policies: <code>read_only</code>, <code>draft_only</code>,{" "}
            <code>full_crud</code>, <code>gated_approval</code> — set in{" "}
            <code>command-center.config.ts</code>.
          </li>
          <li>
            Content 2-gate pipeline: plan approval → creative review →{" "}
            <code>posted</code> with https URL.
          </li>
        </ul>
      </Panel>

      <Panel>
        <h2 className="font-semibold mb-2">Deployment & security</h2>
        <ul className="text-sm text-muted space-y-2 list-disc pl-5">
          <li>Vercel 1-click, Docker Compose, or Cursor-local (`npm run dev`).</li>
          <li>
            Optional Basic Auth via <code>COMMAND_CENTER_PASSWORD</code>; ingest
            uses SHA-256 bot keys (<code>GROKBOT_KEYS_JSON</code>).
          </li>
          <li>
            Webhook forward: <code>GROKBOT_WEBHOOK_URL</code> + Bearer /{" "}
            <code>X-Automation-Key</code> (apply-first, non-blocking).
          </li>
          <li>Demo mode persists to localStorage key <code>gbcc-store-v1</code>.</li>
          <li>Never commit live secrets — use <code>.env.example</code> +{" "}
            <code>npm run generate-bot-key</code>.</li>
        </ul>
        <p className="mt-3 text-xs">{t(lang, "about.stack")} · {t(lang, "about.license")}</p>
      </Panel>
    </motion.div>
  );
}