import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import {
  discrepancies,
  demoDocuments,
  shipments,
  demoUsers,
  initialDocumentSlots,
  type ShipmentDocument,
  type Shipment,
  type DemoUser,
  type DocumentSlot,
  type DocumentVersion,
  type DocType,
  type SlotStatus,
} from "./data";
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
  geminiApiKey: string;
  setGeminiApiKey: (k: string) => void;
  t: (key: string) => string;
  reset: () => void;

  // Multi-user & Workflow additions
  currentUser: DemoUser;
  setCurrentUser: (u: DemoUser) => void;
  allUsers: DemoUser[];
  documentSlots: Record<string, DocumentSlot[]>;
  getActiveSlots: (shipmentId?: string) => DocumentSlot[];
  uploadSlotDocument: (
    shipmentId: string,
    slotId: string,
    file: { name: string; size: string },
    notes?: string,
  ) => Promise<void>;
  requestCorrection: (shipmentId: string, slotId: string, reason: string) => Promise<void>;
  submitCorrection: (
    shipmentId: string,
    slotId: string,
    file: { name: string; size: string },
  ) => Promise<void>;
  approveCorrection: (shipmentId: string, slotId: string) => Promise<void>;
  startAiAnalysis: (shipmentId: string) => Promise<boolean>;
  canStartAnalysis: (shipmentId?: string) => {
    canStart: boolean;
    received: number;
    total: number;
    missing: string[];
  };
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;
  analysisCompleted: Record<string, boolean>;
  reassignSlot: (shipmentId: string, slotId: string, userId: string) => void;
  goldenOverrides: Record<string, string>;
  setGoldenOverride: (fieldLabel: string, value: string, reason?: string) => void;
  ignoreDiscrepancy: (id: string, reason: string) => Promise<void>;
  createConsignment: (data: {
    id?: string | undefined;
    exporter: string;
    destination: string;
    commodity: string;
    category?: Shipment["category"] | undefined;
    selectedDocTypes: DocType[];
    scannedDocs?: Record<string, { filename: string; fileSize: string }> | undefined;
  }) => string;
}

const Ctx = createContext<DemoState | null>(null);
const BASE = 84;

export function DemoProvider({ children }: { children: ReactNode }) {
  const [activeShipmentId, setActiveShipmentId] = useState<string>("VFX-2026-001");
  const [resolved, setResolved] = useState<string[]>([]);
  const [docs, setDocs] = useState<ShipmentDocument[]>(demoDocuments);
  const [notifOpen, setNotifOpen] = useState(false);
  const [lang, setLang] = useState<Language>("EN");
  const [mode, setMode] = useState<"DEMO" | "LIVE">("DEMO");
  const [currentUser, setCurrentUser] = useState<DemoUser>(demoUsers[0]!); // Alwin Joseph (ADMIN)
  const [documentSlots, setDocumentSlots] = useState<Record<string, DocumentSlot[]>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("verifai_document_slots");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialDocumentSlots;
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState<Record<string, boolean>>({
    "VFX-2026-001": false,
    "EXP-KL-2026-1042": false,
  });

  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("verifai_gemini_key") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("verifai_document_slots", JSON.stringify(documentSlots));
    }
  }, [documentSlots]);

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    if (typeof window !== "undefined") {
      localStorage.setItem("verifai_gemini_key", key);
    }
  };

  const activeShipment = useMemo(() => {
    return shipments.find((s) => s.id === activeShipmentId) ?? shipments[0]!;
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
      await verificationService.resolveDiscrepancy(id, currentUser.name);
    } catch {
      // Offline fallback
    }
  };

  const reverify = async () => {
    try {
      await verificationService.reverify(activeShipmentId);
    } catch {
      // Offline fallback
    }
    const currentSlots = getActiveSlots(activeShipmentId);
    const plSlot = currentSlots.find(
      (s) => s.id.includes("pl") || s.type.toLowerCase().includes("packing"),
    );
    if ((plSlot?.status === "READY" && plSlot.versions.length > 1) || resolved.includes("qty")) {
      setResolved(["qty", "hs", "cert"]);
    }
  };

  const addDocs = (newDocs: ShipmentDocument[]) => {
    setDocs((prev) => [...prev, ...newDocs]);
  };

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  const getActiveSlots = (shipmentId?: string): DocumentSlot[] => {
    const id = shipmentId || activeShipmentId;
    return (
      documentSlots[id] || initialDocumentSlots[id] || initialDocumentSlots["VFX-2026-001"] || []
    );
  };

  const canStartAnalysis = (shipmentId?: string) => {
    const slots = getActiveSlots(shipmentId);
    const requiredSlots = slots.filter((s) => s.required);
    const missing = requiredSlots
      .filter((s) => s.status === "WAITING" || s.versions.length === 0)
      .map((s) => s.type);
    const received = requiredSlots.length - missing.length;
    return {
      canStart: missing.length === 0,
      received,
      total: requiredSlots.length,
      missing,
    };
  };

  const uploadSlotDocument = async (
    shipmentId: string,
    slotId: string,
    file: { name: string; size: string },
    notes?: string,
  ) => {
    setDocumentSlots((prev) => {
      const currentList =
        prev[shipmentId] ??
        initialDocumentSlots[shipmentId] ??
        initialDocumentSlots["VFX-2026-001"] ??
        [];
      const updatedList = currentList.map((slot) => {
        if (slot.id === slotId || slot.type.toLowerCase() === slotId.toLowerCase()) {
          const nextVer = (slot.versions?.length || 0) + 1;
          const newVersion: DocumentVersion = {
            version: nextVer,
            filename: file.name,
            fileSize: file.size,
            uploadedBy: currentUser.name,
            uploadedByRole: currentUser.roleLabel,
            uploadedAt: new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "APPROVED",
            notes,
            provenance: {
              source: slot.type,
              version: nextVer,
              team: currentUser.team,
              uploader: currentUser.name,
              timestamp: new Date().toISOString(),
              pageCount: 1,
            },
          };

          return {
            ...slot,
            status: "READY" as const,
            versions: [...slot.versions, newVersion],
            currentVersion: newVersion,
          };
        }
        return slot;
      });

      return { ...prev, [shipmentId]: updatedList };
    });

    try {
      await fetch(`/api/shipments/${shipmentId}/slots/${slotId}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          file_size: file.size,
          uploader: currentUser.name,
          role: currentUser.team,
          notes,
        }),
      });
    } catch {}
  };

  const requestCorrection = async (shipmentId: string, slotId: string, reason: string) => {
    setDocumentSlots((prev) => {
      const currentList =
        prev[shipmentId] ??
        initialDocumentSlots[shipmentId] ??
        initialDocumentSlots["VFX-2026-001"] ??
        [];
      const updatedList = currentList.map((slot) => {
        if (slot.id === slotId || slot.type.toLowerCase() === slotId.toLowerCase()) {
          return {
            ...slot,
            status: "CORRECTION_REQUESTED" as const,
            correctionRequest: {
              id: `corr-${Date.now()}`,
              slotId: slot.id,
              discrepancyTitle: "Quantity / Value Discrepancy",
              reason,
              requestedBy: currentUser.name,
              requestedAt: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              assignedTo: slot.assignedToUser.name,
              assignedRole: slot.assignedToUser.role,
              status: "PENDING" as const,
            },
          };
        }
        return slot;
      });
      return { ...prev, [shipmentId]: updatedList };
    });

    try {
      await fetch(`/api/shipments/${shipmentId}/slots/${slotId}/request-correction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, requested_by: currentUser.name }),
      });
    } catch {}
  };

  const submitCorrection = async (
    shipmentId: string,
    slotId: string,
    file: { name: string; size: string },
  ) => {
    setDocumentSlots((prev) => {
      const currentList =
        prev[shipmentId] ??
        initialDocumentSlots[shipmentId] ??
        initialDocumentSlots["VFX-2026-001"] ??
        [];
      const updatedList = currentList.map((slot) => {
        if (slot.id === slotId || slot.type.toLowerCase() === slotId.toLowerCase()) {
          const nextVer = (slot.versions?.length || 0) + 1;
          const newVersion: DocumentVersion = {
            version: nextVer,
            filename: file.name,
            fileSize: file.size,
            uploadedBy: currentUser.name,
            uploadedByRole: currentUser.roleLabel,
            uploadedAt: new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "UPLOADED",
            notes: "Corrected version uploaded per Admin review request",
            provenance: {
              source: slot.type,
              version: nextVer,
              team: currentUser.team,
              uploader: currentUser.name,
              timestamp: new Date().toISOString(),
              pageCount: 1,
            },
          };

          return {
            ...slot,
            status: "CORRECTION_SUBMITTED" as const,
            versions: [...slot.versions, newVersion],
            currentVersion: newVersion,
            correctionRequest: slot.correctionRequest
              ? {
                  ...slot.correctionRequest,
                  status: "SUBMITTED" as const,
                  submittedVersion: nextVer,
                  submittedAt: new Date().toISOString(),
                }
              : undefined,
          };
        }
        return slot;
      });
      return { ...prev, [shipmentId]: updatedList };
    });

    try {
      await fetch(`/api/shipments/${shipmentId}/slots/${slotId}/submit-correction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          file_size: file.size,
          uploader: currentUser.name,
          role: currentUser.team,
        }),
      });
    } catch {}
  };

  const approveCorrection = async (shipmentId: string, slotId: string) => {
    setDocumentSlots((prev) => {
      const currentList =
        prev[shipmentId] ??
        initialDocumentSlots[shipmentId] ??
        initialDocumentSlots["VFX-2026-001"] ??
        [];
      const updatedList = currentList.map((slot) => {
        if (slot.id === slotId || slot.type.toLowerCase() === slotId.toLowerCase()) {
          return {
            ...slot,
            status: "READY" as const,
            currentVersion: slot.currentVersion
              ? { ...slot.currentVersion, status: "APPROVED" as const }
              : undefined,
            correctionRequest: slot.correctionRequest
              ? { ...slot.correctionRequest, status: "APPROVED" as const }
              : undefined,
          };
        }
        return slot;
      });
      return { ...prev, [shipmentId]: updatedList };
    });

    // Auto-resolve quantity mismatch when Packing List correction is approved!
    if (slotId.includes("pl") || slotId.toLowerCase().includes("packing")) {
      await resolve("qty");
      setResolved(["qty", "hs", "cert"]);
    }

    try {
      await fetch(`/api/shipments/${shipmentId}/slots/${slotId}/approve-correction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved_by: currentUser.name }),
      });
    } catch {}
  };

  const startAiAnalysis = async (shipmentId: string): Promise<boolean> => {
    const check = canStartAnalysis(shipmentId);
    if (!check.canStart) {
      return false;
    }

    setIsAnalyzing(true);
    try {
      await fetch(`/api/shipments/${shipmentId}/start-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_name: currentUser.name }),
      });
    } catch {}

    setAnalysisCompleted((prev) => ({ ...prev, [shipmentId]: true }));
    return true;
  };

  const [goldenOverrides, setGoldenOverrides] = useState<Record<string, string>>({});

  const setGoldenOverride = (fieldLabel: string, value: string, _reason?: string) => {
    setGoldenOverrides((prev) => ({ ...prev, [fieldLabel]: value }));
  };

  const reassignSlot = (shipmentId: string, slotId: string, userId: string) => {
    const targetUser = demoUsers.find((u) => u.id === userId);
    if (!targetUser) return;

    setDocumentSlots((prev) => {
      const currentList =
        prev[shipmentId] ??
        initialDocumentSlots[shipmentId] ??
        initialDocumentSlots["VFX-2026-001"] ??
        [];
      const updatedList = currentList.map((slot) => {
        if (slot.id === slotId || slot.type.toLowerCase() === slotId.toLowerCase()) {
          return {
            ...slot,
            assignedToUser: targetUser,
          };
        }
        return slot;
      });
      return { ...prev, [shipmentId]: updatedList };
    });
  };

  const ignoreDiscrepancy = async (id: string, _reason: string) => {
    setResolved((r) => (r.includes(id) ? r : [...r, id]));
  };

  const reset = () => {
    setResolved([]);
    setDocs(demoDocuments);
    setDocumentSlots(initialDocumentSlots);
    setGoldenOverrides({});
    setAnalysisCompleted({ "VFX-2026-001": false, "EXP-KL-2026-1042": false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("verifai_document_slots");
    }
  };

  const createConsignment = (data: {
    id?: string | undefined;
    exporter: string;
    destination: string;
    commodity: string;
    category?: Shipment["category"] | undefined;
    selectedDocTypes: DocType[];
    scannedDocs?: Record<string, { filename: string; fileSize: string }> | undefined;
  }): string => {
    const id = data.id || `EXP-ABC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const category: Shipment["category"] = data.category || "Seafood";

    const defaultAssignments: Record<DocType, { user: DemoUser; filename: string; size: string }> =
      {
        "Commercial Invoice": {
          user: demoUsers[1]!,
          filename: `Commercial_Invoice_${data.exporter.replace(/\s+/g, "_")}_INV902.pdf`,
          size: "248 KB",
        },
        "Packing List": {
          user: demoUsers[2]!,
          filename: `Packing_List_${data.exporter.replace(/\s+/g, "_")}_PL102.pdf`,
          size: "186 KB",
        },
        "Purchase Order": {
          user: demoUsers[4]!,
          filename: `Purchase_Order_${data.exporter.replace(/\s+/g, "_")}_PO881.xlsx`,
          size: "64 KB",
        },
        "Shipping Bill": {
          user: demoUsers[3]!,
          filename: `Shipping_Bill_SB4471.pdf`,
          size: "312 KB",
        },
        "Quality Certificate": {
          user: demoUsers[5]!,
          filename: `MPEDA_Quality_Cert_QC992.pdf`,
          size: "1.2 MB",
        },
        Other: {
          user: demoUsers[0]!,
          filename: "Document.pdf",
          size: "100 KB",
        },
      };

    const targetTypes: DocType[] = [
      "Commercial Invoice",
      "Packing List",
      "Shipping Bill",
      "Purchase Order",
      "Quality Certificate",
    ];

    const newSlots: DocumentSlot[] = targetTypes.map((type) => {
      const isSelected = data.selectedDocTypes.includes(type);
      const assign = defaultAssignments[type]!;
      const slotId = `slot-${type.toLowerCase().slice(0, 2)}-${id}`;
      const scanned = data.scannedDocs?.[type];

      if (isSelected) {
        const ver = {
          version: 1,
          filename: scanned?.filename || assign.filename,
          fileSize: scanned?.fileSize || assign.size,
          uploadedBy: assign.user.name,
          uploadedByRole: assign.user.roleLabel,
          uploadedAt: "07 Oct 2026, 10:45 AM",
          status: "APPROVED" as const,
          provenance: {
            source: type,
            version: 1,
            team: assign.user.team,
            uploader: assign.user.name,
            timestamp: "07 Oct 2026, 10:45 AM",
            pageCount: 1,
          },
        };
        return {
          id: slotId,
          shipmentId: id,
          type,
          required: true,
          assignedToUser: assign.user,
          status: "READY" as SlotStatus,
          versions: [ver],
          currentVersion: ver,
        };
      } else {
        return {
          id: slotId,
          shipmentId: id,
          type,
          required: false, // NOT REQUIRED (EXEMPT from verification)
          assignedToUser: assign.user,
          status: "WAITING" as SlotStatus,
          versions: [],
        };
      }
    });

    const newShipment: Shipment = {
      id,
      commodity: data.commodity,
      category,
      from: "Cochin Port (INCOK)",
      to: data.destination,
      readiness: 100, // All required docs are configured and ready for AI verification
      status: "ready",
      issues: 0,
      updated: "Just now",
      exporter: data.exporter,
      consignee: "Gulf Fresh Trading LLC, Dubai",
      value: "USD 128,000",
    };

    const existingIdx = shipments.findIndex((s) => s.id === id);
    if (existingIdx >= 0) {
      shipments[existingIdx] = newShipment;
    } else {
      shipments.unshift(newShipment);
    }

    setDocumentSlots((prev) => ({
      ...prev,
      [id]: newSlots,
    }));
    setActiveShipmentId(id);
    return id;
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
    geminiApiKey,
    setGeminiApiKey,
    t,
    reset,
    currentUser,
    setCurrentUser,
    allUsers: demoUsers,
    documentSlots,
    getActiveSlots,
    uploadSlotDocument,
    requestCorrection,
    submitCorrection,
    approveCorrection,
    startAiAnalysis,
    canStartAnalysis,
    isAnalyzing,
    setIsAnalyzing,
    analysisCompleted,
    reassignSlot,
    goldenOverrides,
    setGoldenOverride,
    ignoreDiscrepancy,
    createConsignment,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDemo must be used within DemoProvider");
  return c;
}
