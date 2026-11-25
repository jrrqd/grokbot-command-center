"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import type { SopItem } from "@/lib/types";
import { Button, EmptyState, Panel } from "@/components/ui";
import { saveLocalState } from "@/lib/store";

export default function Docs() {
  const { state, setState, lang, can } = useCommandCenter();
  const [activeSop, setActiveSop] = useState<SopItem | null>(
    state.sops.items[0] ?? null,
  );
  const [sectionId, setSectionId] = useState(state.docs.sections[0]?.id ?? "");
  const [editSteps, setEditSteps] = useState(activeSop?.steps ?? "");

  const section = state.docs.sections.find((s) => s.id === sectionId);

  const saveSop = () => {
    if (!activeSop || !can("docs", "update")) return;
    setState((s) => ({
      ...s,
      sops: {
        ...s.sops,
        items: s.sops.items.map((item) =>
          item.id === activeSop.id ? { ...item, steps: editSteps } : item,
        ),
      },
    }));
    saveLocalState(state);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold">{t(lang, "tabs.docs")}</h1>

      <motion.div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Panel className="space-y-1 p-2">
          <p className="px-2 py-1 text-xs font-bold text-muted uppercase">SOPs</p>
          {state.sops.items.length === 0 ? (
            <EmptyState title={t(lang, "empty.docs")} />
          ) : (
            state.sops.items.map((sop) => (
              <button
                key={sop.id}
                type="button"
                onClick={() => {
                  setActiveSop(sop);
                  setEditSteps(sop.steps);
                }}
                className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                  activeSop?.id === sop.id ? "bg-accent/15" : "hover:bg-surface2"
                }`}
              >
                {sop.title}
              </button>
            ))
          )}
          <p className="px-2 pt-3 text-xs font-bold text-muted uppercase">Guide</p>
          {state.docs.sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSectionId(s.id)}
              className={`w-full rounded-lg px-2 py-2 text-left text-sm ${
                sectionId === s.id ? "bg-accent/15" : "hover:bg-surface2"
              }`}
            >
              {lang === "en" && s.heading_en ? s.heading_en : s.heading}
            </button>
          ))}
        </Panel>

        <Panel>
          {activeSop && (
            <motion.div className="mb-6">
              <h2 className="font-semibold">{activeSop.title}</h2>
              <p className="text-sm text-muted mt-1">{activeSop.summary}</p>
              <textarea
                className="mt-3 w-full min-h-[160px] rounded-lg border border-line bg-surface p-3 text-sm font-mono"
                value={editSteps}
                onChange={(e) => setEditSteps(e.target.value)}
                readOnly={!can("docs", "update")}
              />
              {can("docs", "update") && (
                <Button className="mt-2" variant="primary" onClick={saveSop}>
                  {t(lang, "buttons.save")}
                </Button>
              )}
            </motion.div>
          )}

          {section && (
            <div>
              <h2 className="font-semibold">
                {lang === "en" && section.heading_en ? section.heading_en : section.heading}
              </h2>
              {section.blocks.map((block, i) => (
                <div key={i} className="mt-3 text-sm text-muted leading-relaxed">
                  {block.type === "text" &&
                    (lang === "en" && block.text_en ? block.text_en : block.text)}
                  {block.type === "list" && (
                    <ul className="list-disc pl-5">
                      {(lang === "id" ? block.items : block.items).map((li, j) => (
                        <li key={j}>{li}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </motion.div>
    </motion.div>
  );
}