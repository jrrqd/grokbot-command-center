"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { commandCenterConfig } from "@/config/command-center.config";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import type { ReportStatus } from "@/lib/types";
import { Chip, EmptyState, Panel } from "@/components/ui";

const tone: Record<ReportStatus, "success" | "info" | "warning" | "danger"> = {
  ok: "success",
  info: "info",
  warning: "warning",
  error: "danger",
};

export default function Reports() {
  const { state, lang } = useCommandCenter();
  const [bot, setBot] = useState<string>("all");
  const [status, setStatus] = useState<ReportStatus | "all">("all");

  const filtered = useMemo(() => {
    return state.reports.reports.filter((r) => {
      if (bot !== "all" && r.bot !== bot) return false;
      if (status !== "all" && r.status !== status) return false;
      return true;
    });
  }, [state.reports.reports, bot, status]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold">{t(lang, "tabs.reports")}</h1>

      <Panel className="flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
          value={bot}
          onChange={(e) => setBot(e.target.value)}
        >
          <option value="all">All bots</option>
          {commandCenterConfig.bots.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as ReportStatus | "all")}
        >
          <option value="all">All statuses</option>
          {(["ok", "info", "warning", "error"] as ReportStatus[]).map((s) => (
            <option key={s} value={s}>
              {t(lang, `reports.status.${s}`)}
            </option>
          ))}
        </select>
      </Panel>

      {filtered.length === 0 ? (
        <EmptyState title={t(lang, "empty.reports")} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Panel className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Chip tone={tone[r.status]}>{t(lang, `reports.status.${r.status}`)}</Chip>
                    <span className="text-xs text-muted uppercase">{r.bot}</span>
                  </div>
                  <h3 className="mt-2 font-semibold">{r.title}</h3>
                  <p className="text-sm text-muted mt-1">{r.summary}</p>
                  <time className="text-xs text-muted mt-2 block">
                    {new Date(r.timestamp).toLocaleString()}
                  </time>
                </div>
                {r.link && (
                  <a
                    href={r.link}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </Panel>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}