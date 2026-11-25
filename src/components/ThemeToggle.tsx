"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import type { ThemeMode } from "@/lib/types";
import { t } from "@/lib/i18n";
import { useCommandCenter } from "@/lib/context";
import clsx from "clsx";

const cycle: ThemeMode[] = ["auto", "light", "dark"];

const icons = { auto: Monitor, light: Sun, dark: Moon } as const;

export default function ThemeToggle() {
  const { theme, setTheme, lang } = useCommandCenter();

  const next = () => {
    const i = cycle.indexOf(theme);
    setTheme(cycle[(i + 1) % cycle.length]);
  };

  const Icon = icons[theme];

  return (
    <button
      type="button"
      onClick={next}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface2/80 hover:bg-surface2 transition"
      title={t(lang, `theme.${theme}`)}
      aria-label={t(lang, "buttons.theme")}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className={clsx("h-4 w-4", theme === "light" && "text-warn")} />
      </motion.div>
    </button>
  );
}