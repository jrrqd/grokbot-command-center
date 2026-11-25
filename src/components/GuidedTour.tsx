"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import { Button } from "@/components/ui";

const STEPS: Array<{
  title: string;
  bodyKey: string;
  vars?: Record<string, string>;
  tab?: import("@/lib/types").ModuleId;
}> = [
  { title: "tour.welcome.title", bodyKey: "tour.welcome.body" },
  { title: "tour.overview.title", bodyKey: "tour.overview.body", tab: "overview" },
  {
    title: "tabs.projects",
    bodyKey: "tour.overview.body",
    tab: "projects",
  },
  {
    title: "tour.cmdk.title",
    bodyKey: "tour.cmdk.body",
    vars: { shortcut: "⌘K" },
  },
  { title: "tour.content.title", bodyKey: "tour.content.body", tab: "content" },
  { title: "tour.org.title", bodyKey: "tour.org.body", tab: "org" },
  {
    title: "tabs.inbox",
    bodyKey: "tour.overview.body",
    tab: "inbox",
  },
  { title: "tour.done.title", bodyKey: "tour.done.body", tab: "overview" },
];

export default function GuidedTour() {
  const { tourOpen, setTourOpen, lang, setActiveTab, setState, persist } = useCommandCenter();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!tourOpen) setStep(0);
  }, [tourOpen]);

  useEffect(() => {
    if (!tourOpen) return;
    const cfg = STEPS[step];
    if (cfg.tab) setActiveTab(cfg.tab);
  }, [step, tourOpen, setActiveTab]);

  const finish = () => {
    setState((s) => ({ ...s, tour_done: true }));
    persist();
    setTourOpen(false);
  };

  const cfg = STEPS[step];
  const title = cfg.title.startsWith("tabs.")
    ? t(lang, cfg.title as "tabs.overview")
    : t(lang, cfg.title as "tour.welcome.title");

  return (
    <AnimatePresence>
      {tourOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={finish}
          />
          <motion.div
            className="fixed bottom-6 left-1/2 z-[81] w-[min(420px,calc(100%-2rem))] -translate-x-1/2 rounded-xl border border-line glass p-5 shadow-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              {step + 1} / {STEPS.length}
            </p>
            <h3 className="mt-1 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {t(lang, cfg.bodyKey as "tour.welcome.body", cfg.vars)}
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              {step > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
                  {t(lang, "buttons.back")}
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button variant="primary" size="sm" onClick={() => setStep((s) => s + 1)}>
                  {t(lang, "buttons.next")}
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={finish}>
                  {t(lang, "buttons.finish")}
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}