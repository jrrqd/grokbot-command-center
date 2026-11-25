"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { commandCenterConfig } from "@/config/command-center.config";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import type { AreaId, Project } from "@/lib/types";
import { Button, Chip, Drawer, EmptyState, Panel } from "@/components/ui";
import { saveLocalState } from "@/lib/store";

export default function ProjectsModule() {
  const { state, setState, lang, can } = useCommandCenter();
  const [area, setArea] = useState<AreaId | "all">("all");
  const [statusQ, setStatusQ] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");
  const [selected, setSelected] = useState<Project | null>(null);
  const [note, setNote] = useState("");

  const filtered = useMemo(() => {
    return state.projects.projects.filter((p) => {
      if (area !== "all" && p.area !== area) return false;
      if (statusQ && !p.status.toLowerCase().includes(statusQ.toLowerCase())) return false;
      return true;
    });
  }, [state.projects.projects, area, statusQ]);

  const submitRespond = async () => {
    if (!selected || !note.trim()) return;
    const body = { projectId: selected.id, note };
    if (state.demo) {
      setState((s) => ({
        ...s,
        projects: {
          ...s.projects,
          projects: s.projects.projects.map((p) =>
            p.id === selected.id
              ? { ...p, next_step: note, updated: new Date().toISOString() }
              : p,
          ),
        },
      }));
      const next = { ...state };
      saveLocalState(next);
    } else {
      try {
        await fetch("/api/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch {
        /* offline */
      }
    }
    setNote("");
    setSelected(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <motion.div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t(lang, "tabs.projects")}</h1>
          <p className="text-sm text-muted">{t(lang, "misc.updated", { when: state.projects.updated_label ?? "—" })}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "table" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            Table
          </Button>
          <Button
            variant={view === "cards" ? "primary" : "outline"}
            size="sm"
            onClick={() => setView("cards")}
          >
            Cards
          </Button>
        </div>
      </motion.div>

      <Panel className="flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
          value={area}
          onChange={(e) => setArea(e.target.value as AreaId | "all")}
        >
          <option value="all">All areas</option>
          {commandCenterConfig.areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label[lang]}
            </option>
          ))}
        </select>
        <input
          className="flex-1 min-w-[140px] rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
          placeholder="Filter status…"
          value={statusQ}
          onChange={(e) => setStatusQ(e.target.value)}
        />
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState title={t(lang, "empty.projects")} />
      ) : view === "table" ? (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="p-3 font-semibold">Project</th>
                <th className="p-3 font-semibold">Area</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Owner</th>
                <th className="p-3 font-semibold">Next</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const areaDef = commandCenterConfig.areas.find((a) => a.id === p.area);
                return (
                  <tr key={p.id} className="border-b border-line/60 hover:bg-surface2/50">
                    <td className="p-3 font-medium">
                      {p.project}
                      {p.deadline_warning && (
                        <Chip tone="warning" className="ml-2">
                          !
                        </Chip>
                      )}
                    </td>
                    <td className="p-3">
                      <span style={{ color: areaDef?.color }}>{areaDef?.label[lang]}</span>
                    </td>
                    <td className="p-3">{p.status}</td>
                    <td className="p-3 text-muted">{p.owner}</td>
                    <td className="p-3 text-muted max-w-[200px] truncate">{p.next_step}</td>
                    <td className="p-3">
                      {can("projects", "update") && (
                        <Button size="sm" variant="ghost" onClick={() => setSelected(p)}>
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Panel key={p.id} className="hover:border-accent/30 transition">
              <h3 className="font-semibold text-sm">{p.project}</h3>
              <p className="text-xs text-muted mt-1">{p.status}</p>
              <p className="text-xs mt-2">{p.next_step}</p>
              {can("projects", "update") && (
                <Button className="mt-3" size="sm" onClick={() => setSelected(p)}>
                  Respond
                </Button>
              )}
            </Panel>
          ))}
        </div>
      )}

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.project ?? "Respond"}
      >
        <textarea
          className="w-full min-h-[120px] rounded-lg border border-line bg-surface p-3 text-sm"
          placeholder="Your response…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <Button className="mt-3" variant="primary" onClick={() => void submitRespond()}>
          {t(lang, "buttons.submit")}
        </Button>
      </Drawer>
    </motion.div>
  );
}