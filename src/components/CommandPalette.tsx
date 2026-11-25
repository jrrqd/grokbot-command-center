"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { ModuleId } from "@/lib/types";
import { commandCenterConfig } from "@/config/command-center.config";
import { fuzzyFilter } from "@/lib/fuzzy";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";

type CmdItem = {
  id: string;
  label: string;
  group: string;
  run: () => void;
};

export default function CommandPalette() {
  const {
    cmdkOpen,
    setCmdkOpen,
    lang,
    setActiveTab,
    setLang,
    setTheme,
    theme,
    setTourOpen,
    state,
    setState,
    persist,
  } = useCommandCenter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<CmdItem[]>(() => {
    const nav: ModuleId[] = [
      "overview",
      "projects",
      "reports",
      "content",
      "org",
      "schedules",
      "docs",
      "inbox",
      "about",
    ];
    const list: CmdItem[] = nav
      .filter((m) => commandCenterConfig.modules[m])
      .map((m) => ({
        id: `go-${m}`,
        label: t(lang, `cmdk.go.${m}`),
        group: t(lang, "cmdk.group.navigation"),
        run: () => setActiveTab(m),
      }));

    list.push(
      {
        id: "demo",
        label: t(lang, "cmdk.action.demoToggle"),
        group: t(lang, "cmdk.group.actions"),
        run: () => {
          setState((s) => ({ ...s, demo: !s.demo }));
          persist();
        },
      },
      {
        id: "lang-en",
        label: t(lang, "cmdk.action.langEn"),
        group: t(lang, "cmdk.group.settings"),
        run: () => setLang("en"),
      },
      {
        id: "lang-id",
        label: t(lang, "cmdk.action.langId"),
        group: t(lang, "cmdk.group.settings"),
        run: () => setLang("id"),
      },
      {
        id: "theme",
        label: t(lang, "cmdk.action.themeCycle"),
        group: t(lang, "cmdk.group.settings"),
        run: () => {
          const order = ["auto", "light", "dark"] as const;
          const i = order.indexOf(theme);
          setTheme(order[(i + 1) % order.length]);
        },
      },
      {
        id: "tour",
        label: t(lang, "cmdk.action.tour"),
        group: t(lang, "cmdk.group.actions"),
        run: () => setTourOpen(true),
      },
    );

    state.projects.projects.forEach((p) => {
      list.push({
        id: `proj-${p.id}`,
        label: p.project,
        group: t(lang, "tabs.projects"),
        run: () => setActiveTab("projects"),
      });
    });

    commandCenterConfig.bots.forEach((b) => {
      list.push({
        id: `bot-${b.id}`,
        label: `${b.name} — ${b.role}`,
        group: t(lang, "tabs.reports"),
        run: () => setActiveTab("reports"),
      });
    });

    state.sops.items.forEach((s) => {
      list.push({
        id: `sop-${s.id}`,
        label: s.title,
        group: t(lang, "tabs.docs"),
        run: () => setActiveTab("docs"),
      });
    });

    return list;
  }, [
    lang,
    persist,
    setActiveTab,
    setLang,
    setState,
    setTheme,
    setTourOpen,
    state.projects.projects,
    state.sops.items,
    theme,
  ]);

  const filtered = useMemo(
    () => fuzzyFilter(items, query, (i) => i.label),
    [items, query],
  );

  const close = useCallback(() => {
    setCmdkOpen(false);
    setQuery("");
    setActive(0);
  }, [setCmdkOpen]);

  const runActive = useCallback(() => {
    const item = filtered[active];
    if (!item) return;
    item.run();
    close();
  }, [active, close, filtered]);

  useEffect(() => {
    if (cmdkOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [cmdkOpen]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!cmdkOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        runActive();
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cmdkOpen, close, filtered.length, runActive]);

  const groups = useMemo(() => {
    const map = new Map<string, CmdItem[]>();
    for (const item of filtered) {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    }
    return map;
  }, [filtered]);

  let flatIndex = -1;

  return (
    <AnimatePresence>
      {cmdkOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal
            className="fixed left-1/2 top-[12%] z-[71] w-[min(560px,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-line glass shadow-lg"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
          >
            <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
              <Search className="h-4 w-4 text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(lang, "cmdk.placeholder")}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
            <ul className="max-h-[min(360px,50vh)] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted">
                  {t(lang, "cmdk.noResults")}
                </li>
              )}
              {[...groups.entries()].map(([group, groupItems]) => (
                <li key={group}>
                  <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {group}
                  </p>
                  <ul>
                    {groupItems.map((item) => {
                      flatIndex += 1;
                      const idx = flatIndex;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            className={clsx(
                              "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                              idx === active ? "bg-accent/15 text-text" : "hover:bg-surface2",
                            )}
                            onMouseEnter={() => setActive(idx)}
                            onClick={() => {
                              item.run();
                              close();
                            }}
                          >
                            {item.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}