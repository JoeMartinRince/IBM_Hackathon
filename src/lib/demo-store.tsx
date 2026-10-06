import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { discrepancies, type ShipmentDocument } from "./data";

interface DemoState {
  resolved: string[];
  resolve: (id: string) => void;
  readiness: number;
  openIssues: number;
  isResolved: (id: string) => boolean;
  docs: ShipmentDocument[];
  setDocs: (d: ShipmentDocument[]) => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  lang: "EN" | "ML" | "HI";
  setLang: (l: "EN" | "ML" | "HI") => void;
  reset: () => void;
}

const Ctx = createContext<DemoState | null>(null);
const BASE = 84;

export function DemoProvider({ children }: { children: ReactNode }) {
  const [resolved, setResolved] = useState<string[]>([]);
  const [docs, setDocs] = useState<ShipmentDocument[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "ML" | "HI">("EN");

  const value = useMemo<DemoState>(() => {
    const readiness = BASE + discrepancies.filter((d) => resolved.includes(d.id)).reduce((a, d) => a + d.weight, 0);
    return {
      resolved,
      resolve: (id) => setResolved((r) => (r.includes(id) ? r : [...r, id])),
      readiness,
      openIssues: discrepancies.length - resolved.length,
      isResolved: (id) => resolved.includes(id),
      docs,
      setDocs,
      notifOpen,
      setNotifOpen,
      lang,
      setLang,
      reset: () => { setResolved([]); setDocs([]); },
    };
  }, [resolved, docs, notifOpen, lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDemo must be used within DemoProvider");
  return c;
}
