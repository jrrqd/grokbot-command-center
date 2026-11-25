"use client";

import { useCommandCenter } from "@/lib/context";
import type { Lang } from "@/lib/types";
import { t } from "@/lib/i18n";
import clsx from "clsx";

export default function LangToggle() {
  const { lang, setLang } = useCommandCenter();

  const toggle = () => setLang(lang === "en" ? "id" : "en");

  return (
    <button
      type="button"
      onClick={toggle}
      className={clsx(
        "h-9 min-w-[2.75rem] rounded-lg border border-line bg-surface2/80 px-2 text-xs font-bold tracking-wide hover:bg-surface2 transition",
      )}
      aria-label={t(lang, "buttons.language")}
    >
      {lang === "en" ? "EN" : "ID"}
    </button>
  );
}