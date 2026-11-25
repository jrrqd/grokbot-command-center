"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { CommandCenterState, Lang, ModuleId, RoleId, ThemeMode } from "@/lib/types";
import { commandCenterConfig } from "@/config/command-center.config";
import { saveLocalState } from "@/lib/store";

export interface CommandCenterContextValue {
  state: CommandCenterState;
  setState: React.Dispatch<React.SetStateAction<CommandCenterState>>;
  lang: Lang;
  setLang: (lang: Lang) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  activeTab: ModuleId;
  setActiveTab: (tab: ModuleId) => void;
  tourOpen: boolean;
  setTourOpen: (open: boolean) => void;
  cmdkOpen: boolean;
  setCmdkOpen: (open: boolean) => void;
  apiOffline: boolean;
  persist: () => void;
  can: (module: ModuleId, action: keyof import("@/lib/types").ModulePermissions) => boolean;
}

const CommandCenterContext = createContext<CommandCenterContextValue | null>(null);

export function CommandCenterProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: Omit<CommandCenterContextValue, "persist" | "can">;
}) {
  const persist = useCallback(() => {
    saveLocalState(value.state);
  }, [value.state]);

  const can = useCallback(
    (module: ModuleId, action: keyof import("@/lib/types").ModulePermissions) => {
      const role = commandCenterConfig.rbac.roles.find((r) => r.id === value.state.role);
      return role?.permissions[module]?.[action] ?? false;
    },
    [value.state.role],
  );

  const full = useMemo(
    () => ({ ...value, persist, can }),
    [value, persist, can],
  );

  return (
    <CommandCenterContext.Provider value={full}>{children}</CommandCenterContext.Provider>
  );
}

export function useCommandCenter(): CommandCenterContextValue {
  const ctx = useContext(CommandCenterContext);
  if (!ctx) throw new Error("useCommandCenter must be used within CommandCenterProvider");
  return ctx;
}

export function useRole(): RoleId {
  return useCommandCenter().state.role;
}