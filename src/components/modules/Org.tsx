"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bot, User, Wand2 } from "lucide-react";
import { useCommandCenter } from "@/lib/context";
import { t } from "@/lib/i18n";
import type { OrgNode, OrgNodeKind } from "@/lib/types";
import { Button, EmptyState, Panel } from "@/components/ui";
import { saveLocalState } from "@/lib/store";

export default function OrgModule() {
  const { state, setState, lang, can } = useCommandCenter();
  const deptKey = Object.keys(state.org.depts)[0] ?? "ops";
  const dept = state.org.depts[deptKey];
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState({ label: "", holder: "", kind: "human" as OrgNodeKind });

  const edges = useMemo(() => dept?.edges ?? [], [dept]);

  const addNode = () => {
    if (!dept || !draft.label.trim()) return;
    const node: OrgNode = {
      id: `n-${Date.now()}`,
      label: draft.label,
      holder: draft.holder || draft.label,
      kind: draft.kind,
      x: 120 + Math.random() * 200,
      y: 80 + Math.random() * 120,
    };
    setState((s) => ({
      ...s,
      org: {
        ...s.org,
        depts: {
          ...s.org.depts,
          [deptKey]: { ...dept, nodes: [...dept.nodes, node] },
        },
      },
    }));
    saveLocalState(state);
    setDraft({ label: "", holder: "", kind: "human" });
  };

  if (!dept) {
    return <EmptyState title={t(lang, "empty.org")} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <motion.div>
          <h1 className="text-2xl font-bold">{t(lang, "tabs.org")}</h1>
          <p className="text-sm text-muted">
            {dept.label} · {state.org.status ?? "draft"}
          </p>
        </motion.div>
        <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Wand2 className="h-3.5 w-3.5" />
          Prompt CoS
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel className="relative min-h-[360px] overflow-hidden p-0">
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            {edges.map((e) => {
              const from = dept.nodes.find((n) => n.id === e.from);
              const to = dept.nodes.find((n) => n.id === e.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`${e.from}-${e.to}`}
                  x1={from.x + 60}
                  y1={from.y + 28}
                  x2={to.x + 60}
                  y2={to.y + 28}
                  stroke="var(--line)"
                  strokeWidth={2}
                />
              );
            })}
          </svg>
          {dept.nodes.map((n) => (
            <motion.div
              key={n.id}
              drag={can("org", "update")}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                setState((s) => {
                  const d = s.org.depts[deptKey];
                  return {
                    ...s,
                    org: {
                      ...s.org,
                      depts: {
                        ...s.org.depts,
                        [deptKey]: {
                          ...d,
                          nodes: d.nodes.map((node) =>
                            node.id === n.id
                              ? { ...node, x: n.x + info.offset.x, y: n.y + info.offset.y }
                              : node,
                          ),
                        },
                      },
                    },
                  };
                });
              }}
              className="absolute w-[120px] rounded-lg border border-line glass p-2 cursor-grab active:cursor-grabbing"
              style={{ left: n.x, top: n.y }}
            >
              <div className="flex items-center gap-1 text-xs font-semibold">
                {n.kind === "agent" ? (
                  <Bot className="h-3 w-3 text-accent" />
                ) : (
                  <User className="h-3 w-3" />
                )}
                {n.label}
              </div>
              <p className="text-[10px] text-muted mt-1">{n.holder}</p>
            </motion.div>
          ))}
        </Panel>

        {can("org", "create") && (
          <Panel>
            <h2 className="text-sm font-semibold mb-3">Add node</h2>
            <input
              className="w-full mb-2 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
              placeholder="Label"
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            />
            <input
              className="w-full mb-2 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
              placeholder="Holder"
              value={draft.holder}
              onChange={(e) => setDraft({ ...draft, holder: e.target.value })}
            />
            <select
              className="w-full mb-3 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value as OrgNodeKind })}
            >
              <option value="human">Human</option>
              <option value="agent">Agent</option>
            </select>
            <Button variant="primary" className="w-full" onClick={addNode}>
              {t(lang, "buttons.add")}
            </Button>
          </Panel>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Panel className="max-w-lg w-full">
            <h3 className="font-semibold">Chief of Staff prompt</h3>
            <pre className="mt-3 text-xs bg-surface2 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {`You are the Chief of Staff agent for this Command Center.
Prioritize projects marked "Waiting", summarize bot reports daily,
and never advance content past plan approval without human sign-off.`}
            </pre>
            <Button className="mt-3" onClick={() => setModalOpen(false)}>
              {t(lang, "buttons.close")}
            </Button>
          </Panel>
        </div>
      )}
    </motion.div>
  );
}