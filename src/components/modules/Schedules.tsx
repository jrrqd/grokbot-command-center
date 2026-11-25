"use client";

import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useCommandCenter } from "@/lib/context";
import { t } from "@/lib/i18n";
import { Button, Chip, EmptyState, Panel } from "@/components/ui";
import { saveLocalState } from "@/lib/store";

export default function Schedules() {
  const { state, setState, lang, can } = useCommandCenter();

  const toggle = (id: string) => {
    setState((s) => ({
      ...s,
      schedules: {
        ...s.schedules,
        items: s.schedules.items.map((item) =>
          item.id === id
            ? {
                ...item,
                status: item.status === "active" ? "paused" : "active",
              }
            : item,
        ),
      },
    }));
    saveLocalState(state);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold">{t(lang, "tabs.schedules")}</h1>

      {state.schedules.items.length === 0 ? (
        <EmptyState title={t(lang, "empty.schedules")} />
      ) : (
        <>
          <Panel className="hidden md:block overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-line">
                  <th className="p-3">Time</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Routine</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Status</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {state.schedules.items.map((item) => (
                  <tr key={item.id} className="border-b border-line/60">
                    <td className="p-3 font-mono text-xs">{item.time}</td>
                    <td className="p-3">{item.days}</td>
                    <td className="p-3 font-medium">{item.routine}</td>
                    <td className="p-3">{item.owner}</td>
                    <td className="p-3">
                      <Chip tone={item.status === "active" ? "success" : "wait"}>
                        {item.status}
                      </Chip>
                    </td>
                    <td className="p-3">
                      {can("schedules", "update") && (
                        <Button size="sm" variant="ghost" onClick={() => toggle(item.id)}>
                          {item.status === "active" ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <div className="md:hidden space-y-2">
            {state.schedules.items.map((item, i) => (
              <Panel key={item.id}>
                <div className="flex justify-between">
                  <span className="font-mono text-xs">{item.time}</span>
                  <Chip tone={item.status === "active" ? "success" : "wait"}>
                    {item.status}
                  </Chip>
                </div>
                <p className="font-medium mt-2">{item.routine}</p>
                <p className="text-xs text-muted">{item.days} · {item.owner}</p>
                {i < state.schedules.items.length - 1 && (
                  <div className="ml-3 mt-3 h-4 border-l-2 border-dashed border-line" />
                )}
              </Panel>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}