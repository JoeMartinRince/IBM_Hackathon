import { useState, useRef } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Camera,
  ScanLine,
  Lock,
  Clock,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal, StatusBadge } from "@/components/verifex/primitives";
import { CameraScanner } from "@/components/verifex/CameraScanner";
import { shipments, type DocType, type ShipmentDocument } from "@/lib/data";

export const Route = createFileRoute("/_app/verify")({
  head: () => seo("Verify Documents", "Upload and verify export trade documents with AI."),
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();
  const {
    activeShipmentId,
    setActiveShipmentId,
    docs,
    setDocs,
    addDocs,
    currentUser,
    getActiveSlots,
    uploadSlotDocument,
    canStartAnalysis,
    startAiAnalysis,
  } = useDemo();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeShipment = shipments.find((s) => s.id === activeShipmentId) ?? shipments[0]!;
  const slots = getActiveSlots(activeShipment.id);
  const check = canStartAnalysis(activeShipment.id);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newUploaded: ShipmentDocument[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (!f) continue;
      let type: DocType = "Other";
      const name = f.name.toLowerCase();
      let targetSlotId = "";

      if (name.includes("invoice") || name.includes("ci")) {
        type = "Commercial Invoice";
        targetSlotId = "slot-ci";
      } else if (name.includes("packing") || name.includes("pl")) {
        type = "Packing List";
        targetSlotId = "slot-pl";
      } else if (name.includes("shipping") || name.includes("sb")) {
        type = "Shipping Bill";
        targetSlotId = "slot-sb";
      } else if (name.includes("order") || name.includes("po")) {
        type = "Purchase Order";
        targetSlotId = "slot-po";
      } else if (name.includes("cert") || name.includes("mpeda") || name.includes("quality")) {
        type = "Quality Certificate";
        targetSlotId = "slot-qc";
      }

      newUploaded.push({
        id: `doc-${Date.now()}-${i}`,
        filename: f.name,
        type,
        confidence: Math.floor(91 + Math.random() * 8),
        size: `${(f.size / 1024).toFixed(0)} KB`,
      });

      // Synchronize with multi-user document slots
      if (targetSlotId) {
        uploadSlotDocument(activeShipment.id, targetSlotId, {
          name: f.name,
          size: `${(f.size / 1024).toFixed(0)} KB`,
        });
      }
    }

    addDocs(newUploaded);
    toast.success(`Attached ${newUploaded.length} document(s) to collection workspace.`);
  };

  const handleStartVerification = async () => {
    if (!check.canStart && currentUser.role === "ADMIN") {
      toast.error(`Cannot start AI verification: waiting for ${check.missing.join(", ")} (${check.received}/${check.total} received).`);
      return;
    }

    setIsProcessing(true);
    setProcessStep("Extracting OCR & semantic entity vectors…");

    setTimeout(() => {
      setProcessStep("Classifying customs declarations & tariff lines…");
    }, 800);

    setTimeout(() => {
      setProcessStep("Cross-referencing Golden Record & physical plausibility…");
    }, 1600);

    setTimeout(() => {
      setIsProcessing(false);
      navigate({ to: "/results" });
    }, 2400);
  };

  const removeDoc = (id: string) => {
    setDocs(docs.filter((d) => d.id !== id));
  };

  const getDocIcon = (type: DocType, filename: string) => {
    if (filename.endsWith(".xlsx") || filename.endsWith(".xls") || type === "Purchase Order") {
      return FileSpreadsheet;
    }
    if (filename.endsWith(".jpg") || filename.endsWith(".png") || type === "Quality Certificate") {
      return FileImage;
    }
    return FileText;
  };

  // Quick 1-click slot upload helper for assigned users
  const handleQuickUploadAssigned = (slotId: string, docType: string, filename: string) => {
    uploadSlotDocument(activeShipment.id, slotId, {
      name: filename,
      size: "284 KB",
    });
    addDocs([
      {
        id: `doc-${Date.now()}`,
        filename,
        type: docType as DocType,
        confidence: 96,
        size: "284 KB",
      },
    ]);
    toast.success(`Uploaded ${docType} (${filename}) to ${activeShipment.id}`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Multi-Document Ingestion"
        title="Verify Export Documents"
        sub="Multi-user export dossier collection (Commercial Invoice, Packing List, Shipping Bill, PO, Quality Certificate). VERIFAI cross-verifies when all required slots are present."
        right={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Active:</span>
            <select
              value={activeShipmentId}
              onChange={(e) => setActiveShipmentId(e.target.value)}
              className="h-10 rounded-full border bg-card px-4 font-mono text-xs font-semibold outline-none focus:ring-2 focus:ring-ring"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.commodity} ({s.from} → {s.to})
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Role Banner for Department Uploaders */}
      {currentUser.assignedDocType && (
        <Reveal className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                {currentUser.avatar}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  Logged in as {currentUser.name} ({currentUser.roleLabel})
                </div>
                <div className="text-muted-foreground">
                  Assigned Task: Upload official <span className="font-semibold text-primary">{currentUser.assignedDocType}</span> for {activeShipment.id}.
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (!currentUser.assignedDocType) return;
                const assignedType = currentUser.assignedDocType;
                const targetSlot = slots.find((s) => s.type === assignedType);
                if (targetSlot) {
                  const defaultFilename =
                    assignedType === "Shipping Bill"
                      ? "Shipping_Bill_SB4471_CochinCustoms.pdf"
                      : assignedType === "Quality Certificate"
                      ? "MPEDA_Health_Certificate_QC992.pdf"
                      : "Document_Upload.pdf";
                  handleQuickUploadAssigned(targetSlot.id, assignedType, defaultFilename);
                }
              }}
              className="press inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-110"
            >
              <Upload className="size-3.5" />
              Upload {currentUser.assignedDocType}
            </button>
          </div>
        </Reveal>
      )}

      {/* Shipment Header Banner */}
      <Reveal className="surface-ink p-6 md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Target Export Consignment</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-xl md:text-2xl font-bold">{activeShipment.id}</span>
              <span className="rounded-full bg-primary/20 px-3 py-0.5 text-xs font-medium text-primary">
                {activeShipment.category}
              </span>
            </div>
            <div className="mt-2 text-sm text-ink-muted">
              Exporter: <span className="text-ink-foreground font-medium">{activeShipment.exporter}</span> · Consignee:{" "}
              <span className="text-ink-foreground font-medium">{activeShipment.consignee}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-xs text-ink-muted">Route</div>
              <div className="font-semibold">{activeShipment.from} → {activeShipment.to}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div>
              <div className="text-xs text-ink-muted">Dossier Collection</div>
              <div className="font-mono font-bold text-primary">
                {check.received} / {check.total} Received
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* 5-Slot Document Collection Progress Grid */}
      <Reveal delay={0.05} className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold">Document Collection Status (5 Required Slots)</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              check.canStart ? "bg-success-soft text-success" : "bg-warning-soft text-warning"
            }`}>
              {check.canStart ? "5/5 Complete" : `${check.received}/${check.total} Uploaded`}
            </span>
          </div>
          <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
            View Workspace →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {slots.map((slot) => {
            const isUploaded = slot.status === "READY" || slot.status === "CORRECTION_SUBMITTED";
            const isWaiting = slot.status === "WAITING";
            const isCorrection = slot.status === "CORRECTION_REQUESTED";

            return (
              <div
                key={slot.id}
                className={`surface p-3.5 flex flex-col justify-between transition-all ${
                  isUploaded
                    ? "border-success/30 bg-success/5"
                    : isCorrection
                    ? "border-warning/40 bg-warning/5"
                    : "border-border/60 bg-card"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {slot.assignedToUser.team.split(" ")[0]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      isUploaded
                        ? "bg-success-soft text-success"
                        : isCorrection
                        ? "bg-warning-soft text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {slot.status.replace("_", " ")}
                    </span>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-foreground line-clamp-1">{slot.type}</h4>
                  <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
                    <UserCheck className="size-3" />
                    <span className="truncate">{slot.assignedToUser.name}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t text-[11px] flex items-center justify-between">
                  {isUploaded && slot.currentVersion ? (
                    <span className="font-mono text-[10px] text-muted-foreground truncate">
                      v{slot.currentVersion.version} · {slot.currentVersion.fileSize}
                    </span>
                  ) : isWaiting ? (
                    <button
                      onClick={() => {
                        const defaultFilename =
                          slot.type === "Shipping Bill"
                            ? "Shipping_Bill_SB4471_CochinCustoms.pdf"
                            : slot.type === "Quality Certificate"
                            ? "MPEDA_Health_Certificate_QC992.pdf"
                            : `${slot.type.replace(/\s+/g, "_")}.pdf`;
                        handleQuickUploadAssigned(slot.id, slot.type, defaultFilename);
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <Upload className="size-3" /> Upload Slot
                    </button>
                  ) : (
                    <span className="text-warning text-[10px] font-medium">Correction Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {/* Drag & Drop Upload Zone + Camera Scanner */}
      <Reveal delay={0.08}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`surface press group relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
            isDragging ? "border-primary bg-primary/5 scale-[0.99]" : "border-border hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.docx"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex size-16 items-center justify-center rounded-3xl bg-primary-soft text-primary group-hover:scale-110 transition-transform">
            <Upload className="size-8" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Drop trade documents here or choose an ingestion mode</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Supports PDF, Scanned Images (PNG, JPG), Excel (.xlsx), and Word (.docx) up to 25 MB each
          </p>

          {/* Action Buttons: Browse Files & Open Camera Scanner */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="press inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-xs font-semibold hover:border-primary/50"
            >
              <Upload className="size-3.5 text-primary" /> Browse Local Files
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCameraOpen(true);
              }}
              className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
            >
              <Camera className="size-3.5" /> Open Camera Scanner
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Live Scan
              </span>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["Commercial Invoice", "Packing List", "Shipping Bill", "Purchase Order", "Quality Cert", "Origin Cert"].map(
              (badge) => (
                <span key={badge} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {badge}
                </span>
              )
            )}
          </div>
        </div>
      </Reveal>

      {/* Ingested Document Cards */}
      <Reveal delay={0.14} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Attached Trade Documents</h2>
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              {docs.length} files
            </span>
          </div>
          <button
            onClick={() => setDocs([])}
            className="text-xs text-muted-foreground hover:text-critical transition-colors"
          >
            Clear all
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {docs.map((d) => {
              const Icon = getDocIcon(d.type, d.filename);
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="surface relative flex flex-col justify-between p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold" title={d.filename}>
                        {d.filename}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{d.size}</span>
                        <span>·</span>
                        <span className="font-medium text-foreground">{d.type}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDoc(d.id);
                      }}
                      className="text-muted-foreground hover:text-critical"
                      title="Remove"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="size-3.5" />
                      <span>Classified ({d.confidence}%)</span>
                    </div>
                    <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success uppercase">
                      Ready
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </Reveal>

      {/* Primary Verification Action */}
      <Reveal delay={0.2} className="flex flex-col items-center justify-center pt-4">
        {isProcessing ? (
          <div className="surface flex flex-col items-center gap-3 p-8 text-center max-w-md w-full">
            <RefreshCw className="size-8 animate-spin text-primary" />
            <h3 className="font-semibold text-lg">AI Verification Running</h3>
            <p className="text-sm text-muted-foreground animate-pulse">{processStep}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleStartVerification}
              disabled={docs.length === 0 || (!check.canStart && currentUser.role === "ADMIN")}
              className={`press inline-flex items-center gap-3 rounded-full px-8 py-4 font-semibold shadow-[var(--shadow-glow)] transition-all ${
                check.canStart
                  ? "bg-primary text-primary-foreground hover:brightness-105"
                  : "bg-muted text-muted-foreground border cursor-not-allowed opacity-80"
              }`}
            >
              {!check.canStart && currentUser.role === "ADMIN" ? (
                <>
                  <Lock className="size-5 text-muted-foreground" />
                  Waiting for {check.missing.length} Document(s) ({check.received}/{check.total})
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  Run Cross-Document Verification ({docs.length} docs)
                  <ArrowRight className="size-5" />
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground">
              {!check.canStart && currentUser.role === "ADMIN" ? (
                <span className="text-warning">
                  Gated Workflow: Upload {check.missing.join(", ")} before starting AI analysis.
                </span>
              ) : (
                "Cross-checks tariff codes, quantities, weights, container checksum, and regulatory validity."
              )}
            </p>
          </div>
        )}
      </Reveal>

      {/* Real-time Document Camera Scanner Modal */}
      <CameraScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(doc) => {
          addDocs([doc]);
          // Also link to slot if matches doc type
          const targetSlot = slots.find((s) => s.type === doc.type);
          if (targetSlot) {
            uploadSlotDocument(activeShipment.id, targetSlot.id, {
              name: doc.filename,
              size: doc.size,
            });
          }
        }}
        shipmentId={activeShipment.id}
      />
    </div>
  );
}
