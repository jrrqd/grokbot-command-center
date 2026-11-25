"use client";

import { motion } from "framer-motion";
import { Command, Menu, Radio, Sparkles } from "lucide-react";
import clsx from "clsx";
import type { ModuleId } from "@/lib/types";
import { commandCenterConfig } from "@/config/command-center.config";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import ThemeToggle from "@/components/ThemeToggle";
import LangToggle from "@/components/LangToggle";
import { Button, Chip } from "@/components/ui";
import { useState } from "react";

const TAB_ORDER: ModuleId[] = [
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

export default function Header() {
  const {
    lang,
    activeTab,
    setActiveTab,
    setCmdkOpen,
    setTourOpen,
    state,
  } = useCommandCenter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { brand } = commandCenterConfig;
  const tabs = TAB_ORDER.filter((id) => commandCenterConfig.modules[id]);

  return (
    <header
      className="sticky top-[3px] z-50 glass border-b border-line"
      data-tour="header"
    >
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2.5 sm:px-5">
        <div className="flex items-center gap-2.5 shrink-0" data-tour="brand">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-sm font-black text-accent border border-accent/30"
            whileHover={{ scale: 1.05 }}
          >
            {brand.logoText}
          </motion.div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-bold tracking-tight">{brand.name}</p>
            <p className="text-[10px] text-muted">{t(lang, "app.tagline")}</p>
          </div>
        </div>

        <nav
          className="hidden lg:flex flex-1 items-center gap-1 overflow-x-auto px-2"
          data-tour="tabs"
          aria-label="Modules"
        >
          {tabs.map((id) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={clsx(
                  "relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  active ? "text-text" : "text-muted hover:text-text",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-lg bg-accent/12 border border-accent/25"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{t(lang, `tabs.${id}`)}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex flex-1 lg:flex-none items-center justify-end gap-1.5 sm:gap-2">
          <Chip tone="success" pulse className="hidden md:inline-flex">
            <Radio className="h-3 w-3" />
            LIVE
          </Chip>
          {state.demo && (
            <Chip tone="wait" className="hidden sm:inline-flex">
              {t(lang, "app.demoBadge")}
            </Chip>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => setCmdkOpen(true)}
            data-tour="cmdk"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t(lang, "buttons.cmdk")}</span>
            <kbd className="hidden md:inline rounded border border-line bg-surface px-1 text-[10px] text-muted">
              ⌘K
            </kbd>
          </Button>
          <LangToggle />
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTourOpen(true)}
            className="hidden sm:inline-flex"
            data-tour="tour-btn"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t(lang, "buttons.tour")}
          </Button>
          <button
            type="button"
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-line"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-line px-3 py-2 flex flex-wrap gap-1">
          {tabs.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveTab(id);
                setMobileOpen(false);
              }}
              className={clsx(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium border",
                activeTab === id
                  ? "border-accent/40 bg-accent/10"
                  : "border-line text-muted",
              )}
            >
              {t(lang, `tabs.${id}`)}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}