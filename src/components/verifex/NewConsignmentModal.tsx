import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ship, CheckSquare, Square, CheckCircle2, Clock, Sparkles, Camera } from "lucide-react";
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

const DOCUMENT_OPTIONS: { type: DocType; role: string; officer: string; defaultChecked: boolean; sampleFile: string }[] = [
  {
    type: "Commercial Invoice",
    role: "Finance Team",
    officer: "Rahul Nair",
    defaultChecked: true,
    sampleFile: "Commercial_Invoice_ABC_INV992.pdf",
  },
  {
    type: "Packing List",
    role: "Warehouse Team",
    officer: "Akhil Varma",
    defaultChecked: true,
    sampleFile: "Packing_List_ABC_W102.pdf (1,180 cartons)",
  },
  {
    type: "Purchase Order",
    role: "Buyer / Procurement",
    officer: "Tariq Al-Mansoor",
    defaultChecked: true,
    sampleFile: "PO_ABC_2291.xlsx",
  },
  {
    type: "Shipping Bill",
    role: "Customs Broker (CHA)",
    officer: "Kavitha Menon",
    defaultChecked: false,
    sampleFile: "Awaiting filing with ICEGATE",
  },
  {
    type: "Quality Certificate",
    role: "Inspection Agency",
    officer: "Dr. Ananya Pillai",
    defaultChecked: false,
    sampleFile: "Awaiting MPEDA lab certificate",
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

  const [selectedDocs, setSelectedDocs] = useState<Record<DocType, boolean>>({
    "Commercial Invoice": true,
    "Packing List": true,
    "Purchase Order": true,
    "Shipping Bill": false,
    "Quality Certificate": false,
    "Other": false,
  });

  const toggleDoc = (type: DocType) => {
    setSelectedDocs((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const uploadedCount = DOCUMENT_OPTIONS.filter((d) => selectedDocs[d.type]).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedList = DOCUMENT_OPTIONS.filter((d) => selectedDocs[d.type]).map((d) => d.type);
    const shipmentId = createConsignment({
      exporter: exporter.trim() || "ABC Seafood",
      destination: destination.trim() || "Dubai",
      commodity: product.trim() || "Frozen Shrimp",
      category: "Seafood",
      selectedDocTypes: selectedList,
    });

    if (selectedList.length === 5) {
      toast.success(
        `Consignment ${shipmentId} created with all 5 documents! READY for AI verification.`,
        { icon: <Sparkles className="size-4 text-emerald-500" /> }
      );
    } else {
      const missing = DOCUMENT_OPTIONS.filter((d) => !selectedDocs[d.type]).map((d) => `${d.type} (${d.role})`);
      toast.info(
        `Consignment ${shipmentId} registered (${selectedList.length}/5 received). Waiting for ${missing.join(", ")} before AI verification can start.`,
        { duration: 5500 }
      );
    }

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="surface max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Ship className="size-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground tracking-tight">
                  New Export Consignment
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Register shipment and track multi-party document collection
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

            {/* Select / Upload Documents Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Select / Upload Documents
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Assigned Teams & Ingestion Status
                </span>
              </div>

              <div className="space-y-2 rounded-2xl border bg-card p-3">
                {DOCUMENT_OPTIONS.map((doc) => {
                  const isChecked = selectedDocs[doc.type];
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
                          <div className={`font-semibold text-xs ${isChecked ? "text-foreground" : "text-muted-foreground"}`}>
                            {doc.type}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {doc.role} ({doc.officer}) · <span className="font-mono">{doc.sampleFile}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
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
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="size-3" /> Uploaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            <Clock className="size-3" /> Waiting
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const firstUnchecked = DOCUMENT_OPTIONS.find((d) => !selectedDocs[d.type])?.type || "Shipping Bill";
                    setActiveScanType(firstUnchecked);
                    setIsCameraOpen(true);
                  }}
                  className="press inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-[11px] font-semibold text-primary hover:border-primary/50 shadow-2xs"
                >
                  <Camera className="size-3.5" /> Open Camera Scanner
                </button>
              </div>
            </div>

            {/* Live Uploaded Counter Banner */}
            <div className="rounded-2xl bg-primary/10 border border-primary/20 py-3 px-4 text-center">
              <div className="font-mono text-xs sm:text-sm font-black tracking-widest text-primary uppercase">
                {uploadedCount} DOCUMENTS UPLOADED
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {uploadedCount === 5
                  ? "5 / 5 Complete — Ready for Instant AI Multi-Document Verification"
                  : `${uploadedCount} / 5 received — AI analysis will be gated until remaining ${5 - uploadedCount} document(s) arrive`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full press rounded-full bg-primary py-3.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Sparkles className="size-4" />
                [ SUBMIT FOR VERIFICATION ]
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border bg-card py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
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
          setIsCameraOpen(false);
          setActiveScanType(null);
          toast.success(`Scanned and attached ${target} (${scanned.filename}) via camera!`);
        }}
        shipmentId="EXP-ABC-2026-001"
      />
    </AnimatePresence>
  );
}
