import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { PeriodKey, Scope } from "@/services/odooService";

interface AppState {
  scope: Scope;
  setScope: (s: Scope) => void;
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
  user: { name: string; email: string; role: string };
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState<Scope>("all");
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const value = useMemo(
    () => ({
      scope,
      setScope,
      period,
      setPeriod,
      user: { name: "Direction Mitsuki", email: "direction@mitsuki.ma", role: "Direction" },
    }),
    [scope, period],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
