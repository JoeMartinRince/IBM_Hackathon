import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Ship,
  CheckSquare,
  Square,
  CheckCircle2,
  MinusCircle,
  Sparkles,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useDemo } from "@/lib/demo-store";
import type { DocType } from "@/lib/data";
import { CameraScanner } from "./CameraScanner";

interface NewConsignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (shipmentId: string) => void;
}

const DOCUMENT_OPTIONS: {
  type: DocType;
  role: string;
  officer: string;
  defaultChecked: boolean;
}[] = [
  {
    type: "Commercial Invoice",
    role: "Finance Team",
    officer: "Rahul Nair",
    defaultChecked: true,
  },
  {
    type: "Packing List",
    role: "Warehouse Team",
    officer: "Akhil Varma",
    defaultChecked: true,
  },
  {
    type: "Purchase Order",
    role: "Buyer / Procurement",
    officer: "Tariq Al-Mansoor",
    defaultChecked: true,
  },
  {
    type: "Shipping Bill",
    role: "Customs Broker (CHA)",
    officer: "Kavitha Menon",
    defaultChecked: false,
  },
  {
    type: "Quality Certificate",
    role: "Inspection Agency",
    officer: "Dr. Ananya Pillai",
    defaultChecked: false,
  },
];

export function NewConsignmentModal({ isOpen, onClose, onCreated }: NewConsignmentModalProps) {
  const navigate = useNavigate();
  const { createConsignment } = useDemo();

  const [exporter, setExporter] = useState("ABC Seafood");
  const [destination, setDestination] = useState("Dubai");
  const [product, setProduct] = useState("Frozen Shrimp");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeScanType, setActiveScanType] = useState<DocType | null>(null);
  const [scannedDocs, setScannedDocs] = useState<
    Record<string, { filename: string; fileSize: string }>
  >({});

  const [selectedDocs, setSelectedDocs] = useState<Record<DocType, boolean>>({
    "Commercial Invoice": true,
    "Packing List": true,
    "Purchase Order": true,
    "Shipping Bill": false,
    "Quality Certificate": false,
    Other: false,
  });

  const toggleDoc = (type: DocType) => {
    setSelectedDocs((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const requiredCount = DOCUMENT_OPTIONS.filter((d) => selectedDocs[d.type]).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedList = DOCUMENT_OPTIONS.filter((d) => selectedDocs[d.type]).map((d) => d.type);
    if (selectedList.length === 0) {
      toast.error("Please select at least 1 required document for this export consignment.");
      return;
    }

    const shipmentId = createConsignment({
      exporter: exporter.trim() || "ABC Seafood",
      destination: destination.trim() || "Dubai",
      commodity: product.trim() || "Frozen Shrimp",
      category: "Seafood",
      selectedDocTypes: selectedList,
      scannedDocs,
    });

    toast.success(
      `Consignment ${shipmentId} registered! ${selectedList.length} mandatory document(s) configured (${5 - selectedList.length} exempt).`,
      { icon: <Sparkles className="size-4 text-emerald-500" /> },
    );

    onClose();
    if (onCreated) {
      onCreated(shipmentId);
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Scrollable Backdrop Container to handle small viewports without overflow cutoff */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-3 sm:p-4 md:p-6 backdrop-blur-sm flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="surface max-w-lg w-full max-h-[90vh] my-auto flex flex-col p-5 sm:p-6 shadow-2xl border border-border rounded-2xl overflow-hidden"
        >
          {/* Header - Pinned at top */}
          <div className="flex items-center justify-between border-b pb-3.5 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Ship className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight">
                  New Export Consignment
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Register shipment and configure mandatory document requirements
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Close"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form - Scrollable Body with Pinned Actions */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs"
          >
            {/* Scrollable Body Container */}
            <div className="overflow-y-auto flex-1 pr-1.5 space-y-4 custom-scrollbar py-3">
              {/* Consignment Metadata */}
              <div className="space-y-3 rounded-2xl bg-muted/40 p-3.5 border border-border/50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Exporter
                    </label>
                    <input
                      required
                      value={exporter}
                      onChange={(e) => setExporter(e.target.value)}
                      className="h-9 w-full rounded-xl border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. ABC Seafood"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      Destination
                    </label>
                    <input
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="h-9 w-full rounded-xl border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g. Dubai"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Product
                  </label>
                  <input
                    required
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="h-9 w-full rounded-xl border bg-card px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. Frozen Shrimp"
                  />
                </div>
              </div>

              {/* Select Required Documents Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Select Required Documents
                  </span>
                  <span className="text-[11px] text-muted-foreground">Mandatory vs Exempt</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ticked documents are <strong>mandatory</strong> for customs clearance. Unticked
                  documents are <strong>exempt (not required)</strong> for this consignment.
                </p>

                <div className="space-y-2 rounded-2xl border bg-card p-3">
                  {DOCUMENT_OPTIONS.map((doc) => {
                    const isChecked = selectedDocs[doc.type];
                    const scanned = scannedDocs[doc.type];

                    return (
                      <div
                        key={doc.type}
                        onClick={() => toggleDoc(doc.type)}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isChecked
                            ? "bg-primary/5 border-primary/30 text-foreground"
                            : "bg-background/40 border-border/60 text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChecked ? (
                            <CheckSquare className="size-4 text-primary shrink-0" />
                          ) : (
                            <Square className="size-4 text-muted-foreground shrink-0" />
                          )}
                          <div>
                            <div
                              className={`font-semibold text-xs flex items-center gap-2 ${isChecked ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              <span>{doc.type}</span>
                              {scanned && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  📷 Scanned
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {isChecked ? (
                                <span>
                                  Mandatory for customs · Assigned: {doc.role} ({doc.officer})
                                </span>
                              ) : (
                                <span className="italic">
                                  Exempt · Not needed for this consignment
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveScanType(doc.type);
                              setIsCameraOpen(true);
                            }}
                            className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title={`Scan ${doc.type} using device camera`}
                          >
                            <Camera className="size-3.5" />
                          </button>

                          {isChecked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/25">
                              <CheckCircle2 className="size-3" /> REQUIRED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground border border-border/50">
                              <MinusCircle className="size-3" /> EXEMPT
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px] text-muted-foreground">
                    Optional live optical capture:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const firstDoc =
                        DOCUMENT_OPTIONS.find((d) => selectedDocs[d.type])?.type ||
                        "Commercial Invoice";
                      setActiveScanType(firstDoc);
                      setIsCameraOpen(true);
                    }}
                    className="press inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-[11px] font-semibold text-primary hover:border-primary/50 shadow-2xs cursor-pointer"
                  >
                    <Camera className="size-3.5" /> Open Camera Scanner
                  </button>
                </div>
              </div>

              {/* Requirements Summary Banner */}
              <div className="rounded-2xl bg-primary/10 border border-primary/20 py-3 px-4 text-center">
                <div className="font-mono text-xs sm:text-sm font-black tracking-widest text-primary uppercase">
                  {requiredCount} REQUIRED DOCUMENTS SELECTED
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {requiredCount} document(s) marked mandatory for customs verification ·{" "}
                  {5 - requiredCount} document(s) exempt
                </p>
              </div>
            </div>

            {/* Pinned Action Buttons - Always visible at bottom */}
            <div className="shrink-0 pt-3 border-t space-y-2 bg-card">
              <button
                type="submit"
                className="w-full press rounded-full bg-primary py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="size-4" />[ SUBMIT FOR VERIFICATION ]
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border bg-card py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Real-time Document Camera Scanner Modal */}
      <CameraScanner
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setActiveScanType(null);
        }}
        onCapture={(scanned) => {
          const target = activeScanType || scanned.type;
          setSelectedDocs((prev) => ({
            ...prev,
            [target]: true,
          }));
          setScannedDocs((prev) => ({
            ...prev,
            [target]: { filename: scanned.filename, fileSize: scanned.size },
          }));
          setIsCameraOpen(false);
          setActiveScanType(null);
          toast.success(`Scanned and attached ${target} (${scanned.filename}) via camera!`);
        }}
        shipmentId="EXP-ABC-2026-001"
      />
    </AnimatePresence>
  );
}
