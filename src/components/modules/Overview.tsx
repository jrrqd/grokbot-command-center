"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { commandCenterConfig } from "@/config/command-center.config";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import { Chip, MetricCard, Panel } from "@/components/ui";
import type { AreaId } from "@/lib/types";

export default function Overview() {
  const { state, lang } = useCommandCenter();

  const metrics = useMemo(() => {
    const waiting = state.projects.projects.filter((p) =>
      /wait/i.test(p.status),
    ).length;
    const pipeline = state.content.items.filter((c) => c.status !== "posted").length;
    const today = new Date().toDateString();
    const reportsToday = state.reports.reports.filter(
      (r) => new Date(r.timestamp).toDateString() === today,
    ).length;
    const deadlines = state.projects.projects.filter((p) => p.deadline_warning).length;
    return {
      active: state.projects.projects.length,
      waiting,
      pipeline,
      reportsToday,
      deadlines,
    };
  }, [state]);

  const byArea = useMemo(() => {
    const map = new Map<AreaId, number>();
    for (const p of state.projects.projects) {
      map.set(p.area, (map.get(p.area) ?? 0) + 1);
    }
    return commandCenterConfig.areas.map((a) => ({
      ...a,
      count: map.get(a.id) ?? 0,
    }));
  }, [state.projects.projects]);

  const statuses = commandCenterConfig.contentStatuses;
  const pipelineTrack = statuses.map((s) => ({
    ...s,
    count: state.content.items.filter((i) => i.status === s.id).length,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t(lang, "tabs.overview")}</h1>
        <p className="text-sm text-muted mt-1">{t(lang, "app.tagline")}</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t(lang, "kpi.projectsActive")}
          value={metrics.active}
          accent="#38bdf8"
        />
        <MetricCard
          label={t(lang, "kpi.projectsWaiting")}
          value={metrics.waiting}
          accent="#f59e0b"
        />
        <MetricCard
          label={t(lang, "kpi.contentPipeline")}
          value={metrics.pipeline}
          accent="#a78bfa"
        />
        <MetricCard
          label={t(lang, "kpi.reportsToday")}
          value={metrics.reportsToday}
          accent="#22d3ee"
        />
      </section>

      <Panel data-tour="agent-pulse">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold">{t(lang, "kpi.agentsOnline")}</h2>
          <Chip tone="success" pulse>
            {commandCenterConfig.bots.filter((b) => b.ingest).length} /{" "}
            {commandCenterConfig.bots.length}
          </Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          {commandCenterConfig.bots.map((bot) => (
            <motion.div
              key={bot.id}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 rounded-lg border border-line bg-surface2/60 px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-ok pulse-live" />
              <span className="text-sm font-medium">{bot.name}</span>
              <span className="text-xs text-muted">{bot.role}</span>
            </motion.div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="text-sm font-semibold mb-3">Content pipeline</h2>
          <div className="space-y-2">
            {pipelineTrack.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <Chip tone={s.tone} className="min-w-[120px] justify-center">
                  {s.label[lang]}
                </Chip>
                <div className="flex-1 h-2 rounded-full bg-surface2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-accent/70"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, s.count * 25 + (s.count ? 15 : 0))}%`,
                    }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted w-6 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-sm font-semibold mb-3">Projects by area</h2>
          <div className="grid gap-2">
            {byArea.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
              >
                <span className="text-sm">{a.label[lang]}</span>
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: a.color }}
                >
                  {a.count}
                </span>
              </div>
            ))}
          </div>
          {metrics.deadlines > 0 && (
            <p className="mt-3 text-xs text-warn">
              {t(lang, "kpi.deadlinesSoon")}: {metrics.deadlines}
            </p>
          )}
        </Panel>
      </div>
    </motion.div>
  );
}