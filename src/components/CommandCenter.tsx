"use client";

import { useCallback, useEffect, useState } from "react";
import type { CommandCenterState, Lang, ModuleId, ThemeMode } from "@/lib/types";
import { commandCenterConfig } from "@/config/command-center.config";
import { seedState } from "@/data/seed";
import { t } from "@/lib/i18n";
import {
  applyTheme,
  CC_DEMO,
  loadLocalState,
  mergeWithSeed,
  saveLocalState,
  setTabHash,
  tabFromHash,
} from "@/lib/store";
import { CommandCenterProvider } from "@/lib/context";
import Header from "@/components/Header";
import CommandPalette from "@/components/CommandPalette";
import GuidedTour from "@/components/GuidedTour";
import Overview from "@/components/modules/Overview";
import Projects from "@/components/modules/Projects";
import Reports from "@/components/modules/Reports";
import Content from "@/components/modules/Content";
import Org from "@/components/modules/Org";
import Schedules from "@/components/modules/Schedules";
import Docs from "@/components/modules/Docs";
import Inbox from "@/components/modules/Inbox";
import About from "@/components/modules/About";
import { Chip } from "@/components/ui";

const MODULES: Record<ModuleId, React.ComponentType> = {
  overview: Overview,
  projects: Projects,
  reports: Reports,
  content: Content,
  org: Org,
  schedules: Schedules,
  docs: Docs,
  inbox: Inbox,
  about: About,
};

function parseTab(hash: string): ModuleId {
  const id = hash as ModuleId;
  if (id in MODULES && commandCenterConfig.modules[id]) return id;
  return "overview";
}

export default function CommandCenter() {
  const [state, setState] = useState<CommandCenterState>(seedState);
  const [lang, setLang] = useState<Lang>(commandCenterConfig.defaultLang);
  const [theme, setTheme] = useState<ThemeMode>(seedState.theme);
  const [activeTab, setActiveTabState] = useState<ModuleId>("overview");
  const [tourOpen, setTourOpen] = useState(false);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [apiOffline, setApiOffline] = useState(false);
  const [ready, setReady] = useState(false);

  const setActiveTab = useCallback((tab: ModuleId) => {
    setActiveTabState(tab);
    setTabHash(tab);
  }, []);

  useEffect(() => {
    const init = async () => {
      let next = loadLocalState() ?? mergeWithSeed(null);
      if (!CC_DEMO) {
        try {
          const res = await fetch("/api/state");
          if (res.ok) {
            const data = (await res.json()) as Partial<CommandCenterState>;
            next = mergeWithSeed(data);
            setApiOffline(false);
          } else {
            setApiOffline(true);
          }
        } catch {
          setApiOffline(true);
        }
      } else {
        setApiOffline(true);
      }
      setState(next);
      setLang(next.lang);
      setTheme(next.theme);
      setActiveTabState(parseTab(tabFromHash()));
      if (!next.tour_done && commandCenterConfig.customized === false) {
        setTourOpen(true);
      }
      setReady(true);
    };
    void init();
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    setState((s) => {
      const next = { ...s, lang, theme };
      saveLocalState(next);
      return next;
    });
  }, [lang, theme]);

  useEffect(() => {
    const onHash = () => setActiveTabState(parseTab(tabFromHash()));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdkOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Active = MODULES[activeTab];

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted text-sm">
        {t(lang, "misc.loading")}
      </div>
    );
  }

  return (
    <CommandCenterProvider
      value={{
        state,
        setState,
        lang,
        setLang,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        tourOpen,
        setTourOpen,
        cmdkOpen,
        setCmdkOpen,
        apiOffline,
      }}
    >
      <div className="min-h-dvh flex flex-col">
        <Header />
        {(apiOffline || state.demo) && (
          <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-5 pt-2 flex flex-wrap gap-2">
            {state.demo && (
              <Chip tone="info">{t(lang, "banner.demo")}</Chip>
            )}
            {apiOffline && (
              <Chip tone="warning">{t(lang, "banner.offline")}</Chip>
            )}
            {!commandCenterConfig.customized && (
              <Chip tone="wait">{t(lang, "banner.uncustomized")}</Chip>
            )}
          </div>
        )}
        <main className="flex-1 mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-5 sm:py-6">
          <div data-module={activeTab}>
            <Active />
          </div>
        </main>
      </div>
      <CommandPalette />
      <GuidedTour />
    </CommandCenterProvider>
  );
}