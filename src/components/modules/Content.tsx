"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Columns, List } from "lucide-react";
import { commandCenterConfig } from "@/config/command-center.config";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import type { ContentItem, ContentStatus } from "@/lib/types";
import { Button, Chip, EmptyState, Panel } from "@/components/ui";
import { saveLocalState } from "@/lib/store";

const KANBAN_COLS: ContentStatus[] = [
  "draft",
  "awaiting_approval",
  "approved",
  "creative_review",
  "creative_approved",
  "posted",
];

function gateActions(status: ContentStatus): Array<"approve" | "request_changes" | "approve_creative" | "request_creative_changes"> {
  if (status === "awaiting_approval" || status === "needs_feedback")
    return ["approve", "request_changes"];
  if (status === "creative_review" || status === "creative_changes")
    return ["approve_creative", "request_creative_changes"];
  return [];
}

export default function ContentModule() {
  const { state, setState, lang, can } = useCommandCenter();
  const [mode, setMode] = useState<"kanban" | "list">("kanban");

  const applyAction = (item: ContentItem, action: string) => {
    let nextStatus = item.status;
    if (action === "approve") nextStatus = "approved";
    if (action === "request_changes") nextStatus = "needs_feedback";
    if (action === "approve_creative") nextStatus = "creative_approved";
    if (action === "request_creative_changes") nextStatus = "creative_changes";

    setState((s) => ({
      ...s,
      content: {
        ...s.content,
        items: s.content.items.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: nextStatus,
                updated: new Date().toISOString(),
                feedback: [
                  ...i.feedback,
                  {
                    action_id: crypto.randomUUID(),
                    action,
                    note: "",
                    at: new Date().toISOString(),
                  },
                ],
              }
            : i,
        ),
      },
    }));
    saveLocalState(state);
  };

  const defFor = (id: ContentStatus) =>
    commandCenterConfig.contentStatuses.find((s) => s.id === id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <motion.div className="flex flex-wrap justify-between gap-3 items-center">
        <div>
          <h1 className="text-2xl font-bold">{t(lang, "tabs.content")}</h1>
          <Chip tone="info" className="mt-2">
            {t(lang, "banner.contentGated")}
          </Chip>
        </div>
        <motion.div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "kanban" ? "primary" : "outline"}
            onClick={() => setMode("kanban")}
          >
            <Columns className="h-3.5 w-3.5" /> Kanban
          </Button>
          <Button
            size="sm"
            variant={mode === "list" ? "primary" : "outline"}
            onClick={() => setMode("list")}
          >
            <List className="h-3.5 w-3.5" /> List
          </Button>
        </motion.div>
      </motion.div>

      {state.content.items.length === 0 ? (
        <EmptyState title={t(lang, "empty.content")} />
      ) : mode === "kanban" ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {KANBAN_COLS.map((col) => {
            const items = state.content.items.filter((i) => i.status === col);
            const def = defFor(col);
            return (
              <div key={col} className="min-w-[220px] flex-1">
                <Chip tone={def?.tone ?? "muted"} className="mb-2 w-full justify-center">
                  {def?.label[lang]} ({items.length})
                </Chip>
                <div className="space-y-2">
                  {items.map((item) => (
                    <Panel key={item.id} glass={false} className="p-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted mt-1">{item.platform} · {item.planned_date}</p>
                      {can("content", "approve") &&
                        gateActions(item.status).map((a) => (
                          <Button
                            key={a}
                            size="sm"
                            className="mt-2 w-full"
                            variant={a.includes("approve") ? "primary" : "outline"}
                            onClick={() => applyAction(item, a)}
                          >
                            {t(lang, `content.action.${a}`)}
                          </Button>
                        ))}
                    </Panel>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Panel className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-line">
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Platform</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.content.items.map((item) => {
                const def = defFor(item.status);
                return (
                  <tr key={item.id} className="border-b border-line/60">
                    <td className="p-3 font-medium">{item.title}</td>
                    <td className="p-3">
                      <Chip tone={def?.tone ?? "muted"}>{def?.label[lang]}</Chip>
                    </td>
                    <td className="p-3">{item.platform}</td>
                    <td className="p-3 flex flex-wrap gap-1">
                      {gateActions(item.status).map((a) => (
                        <Button key={a} size="sm" onClick={() => applyAction(item, a)}>
                          {t(lang, `content.action.${a}`)}
                        </Button>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}
    </motion.div>
  );
}