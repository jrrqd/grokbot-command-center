import type { CommandCenterState, Lang, ThemeMode } from "@/lib/types";
import { seedState } from "@/data/seed";

export const STORE_KEY = "gbcc-store-v1";

export function mergeWithSeed(partial?: Partial<CommandCenterState> | null): CommandCenterState {
  if (!partial) return structuredClone(seedState);
  return {
    ...seedState,
    ...partial,
    projects: { ...seedState.projects, ...partial.projects, projects: partial.projects?.projects ?? seedState.projects.projects },
    content: { ...seedState.content, ...partial.content, items: partial.content?.items ?? seedState.content.items },
    reports: { ...seedState.reports, ...partial.reports, reports: partial.reports?.reports ?? seedState.reports.reports },
    org: { ...seedState.org, ...partial.org, depts: partial.org?.depts ?? seedState.org.depts },
    sops: { ...seedState.sops, ...partial.sops, items: partial.sops?.items ?? seedState.sops.items },
    schedules: { ...seedState.schedules, ...partial.schedules, items: partial.schedules?.items ?? seedState.schedules.items },
    docs: { ...seedState.docs, ...partial.docs, sections: partial.docs?.sections ?? seedState.docs.sections },
    inbox: partial.inbox ?? seedState.inbox,
  };
}

export function loadLocalState(): CommandCenterState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return mergeWithSeed(JSON.parse(raw) as Partial<CommandCenterState>);
  } catch {
    return null;
  }
}

export function saveLocalState(state: CommandCenterState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  if (theme === "light") root.classList.add("light");
  else if (theme === "dark") root.classList.add("dark");
}

export function tabFromHash(): string {
  if (typeof window === "undefined") return "overview";
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "overview";
}

export function setTabHash(tab: string): void {
  if (typeof window === "undefined") return;
  const next = `#${tab}`;
  if (window.location.hash !== next) {
    window.history.replaceState(null, "", next);
  }
}

export const CC_DEMO =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_CC_DEMO === "1" || process.env.CC_DEMO === "1");

export function defaultLang(): Lang {
  return seedState.lang;
}