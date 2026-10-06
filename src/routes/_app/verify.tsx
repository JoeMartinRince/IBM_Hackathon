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
} from "lucide-react";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { CameraScanner } from "@/components/verifex/CameraScanner";
import { shipments, type DocType, type ShipmentDocument } from "@/lib/data";

export const Route = createFileRoute("/_app/verify")({
  head: () => seo("Verify Documents", "Upload and verify export trade documents with AI."),
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();
  const { activeShipmentId, setActiveShipmentId, docs, setDocs, addDocs, t } = useDemo();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeShipment = shipments.find((s) => s.id === activeShipmentId) || shipments[0];

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newUploaded: ShipmentDocument[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      let type: DocType = "Other";
      const name = f.name.toLowerCase();
      if (name.includes("invoice") || name.includes("ci")) type = "Commercial Invoice";
      else if (name.includes("packing") || name.includes("pl")) type = "Packing List";
      else if (name.includes("shipping") || name.includes("sb")) type = "Shipping Bill";
      else if (name.includes("order") || name.includes("po")) type = "Purchase Order";
      else if (name.includes("cert") || name.includes("mpeda")) type = "Quality Certificate";

      newUploaded.push({
        id: `doc-${Date.now()}-${i}`,
        filename: f.name,
        type,
        confidence: Math.floor(91 + Math.random() * 8),
        size: `${(f.size / 1024).toFixed(0)} KB`,
      });
    }

    addDocs(newUploaded);
  };

  const handleStartVerification = () => {
    setIsProcessing(true);
    setProcessStep("Extracting OCR & text streams…");

    setTimeout(() => {
      setProcessStep("Classifying document semantics…");
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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Multi-Document Ingestion"
        title="Verify Export Documents"
        sub="Upload your export dossier (Commercial Invoice, Packing List, Shipping Bill, PO, Quality Certificate). VERIFAI will automatically extract, classify, and cross-verify."
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
              <div className="text-xs text-ink-muted">Declared Value</div>
              <div className="font-mono font-semibold">{activeShipment.value}</div>
            </div>
          </div>
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
              disabled={docs.length === 0}
              className="press inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105 disabled:opacity-50"
            >
              <Sparkles className="size-5" />
              Run Cross-Document Verification ({docs.length} docs)
              <ArrowRight className="size-5" />
            </button>
            <p className="text-xs text-muted-foreground">
              Cross-checks tariff codes, quantities, weights, container checksum, and regulatory validity.
            </p>
          </div>
        )}
      </Reveal>

      {/* Real-time Document Camera Scanner Modal */}
      <CameraScanner
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(doc) => addDocs([doc])}
        shipmentId={activeShipment.id}
      />
    </div>
  );
}
