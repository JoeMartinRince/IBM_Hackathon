import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { discrepancies, demoDocuments, shipments, type ShipmentDocument, type Shipment } from "./data";
import { translations, type Language } from "./i18n";
import { verificationService } from "./services/api";

interface DemoState {
  activeShipmentId: string;
  setActiveShipmentId: (id: string) => void;
  activeShipment: Shipment;
  resolved: string[];
  resolve: (id: string) => Promise<void>;
  reverify: () => Promise<void>;
  readiness: number;
  openIssues: number;
  isResolved: (id: string) => boolean;
  docs: ShipmentDocument[];
  setDocs: (d: ShipmentDocument[]) => void;
  addDocs: (d: ShipmentDocument[]) => void;
  notifOpen: boolean;
  setNotifOpen: (v: boolean) => void;
  lang: Language;
  setLang: (l: Language) => void;
  mode: "DEMO" | "LIVE";
  setMode: (m: "DEMO" | "LIVE") => void;
  t: (key: string) => string;
  reset: () => void;
}

const Ctx = createContext<DemoState | null>(null);
const BASE = 84;

export function DemoProvider({ children }: { children: ReactNode }) {
  const [activeShipmentId, setActiveShipmentId] = useState<string>("EXP-KL-2026-1042");
  const [resolved, setResolved] = useState<string[]>([]);
  const [docs, setDocs] = useState<ShipmentDocument[]>(demoDocuments);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lang, setLang] = useState<Language>("EN");
  const [mode, setMode] = useState<"DEMO" | "LIVE">("DEMO");

  const activeShipment = useMemo(() => {
    return shipments.find((s) => s.id === activeShipmentId) || shipments[0];
  }, [activeShipmentId]);

  const readiness = useMemo(() => {
    const boost = discrepancies
      .filter((d) => resolved.includes(d.id))
      .reduce((a, d) => a + d.weight, 0);
    return Math.min(100, BASE + boost);
  }, [resolved]);

  const resolve = async (id: string) => {
    setResolved((r) => (r.includes(id) ? r : [...r, id]));
    try {
      await verificationService.resolveDiscrepancy(id, "Alwin Joseph");
    } catch {
      // Local optimistic update handles offline/demo mode smoothly
    }
  };

  const reverify = async () => {
    try {
      await verificationService.reverify(activeShipmentId);
    } catch {
      // Offline fallback
    }
  };

  const addDocs = (newDocs: ShipmentDocument[]) => {
    setDocs((prev) => [...prev, ...newDocs]);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  const reset = () => {
    setResolved([]);
    setDocs(demoDocuments);
  };

  const value: DemoState = {
    activeShipmentId,
    setActiveShipmentId,
    activeShipment,
    resolved,
    resolve,
    reverify,
    readiness,
    openIssues: Math.max(0, discrepancies.length - resolved.length),
    isResolved: (id) => resolved.includes(id),
    docs,
    setDocs,
    addDocs,
    notifOpen,
    setNotifOpen,
    lang,
    setLang,
    mode,
    setMode,
    t,
    reset,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDemo must be used within DemoProvider");
  return c;
}
