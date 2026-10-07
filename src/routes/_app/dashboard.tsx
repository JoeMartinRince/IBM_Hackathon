import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Ship,
  FileStack,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ShieldAlert,
  Clock,
  Sparkles,
  Lock,
  Check,
  RotateCcw,
  FileText,
  Layers,
  Eye,
  Warehouse,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  X,
  FileCheck2,
  ChevronRight,
  Play,
  Send,
  RefreshCw,
  Plus,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { shipments, type DocumentSlot, type DocumentVersion } from "@/lib/data";
import { useDemo } from "@/lib/demo-store";
import { Reveal, ReadinessRing, ShipmentCard, StatTile, StatusBadge, ProgressBar } from "@/components/verifex/primitives";
import { NewConsignmentModal } from "@/components/verifex/NewConsignmentModal";
import { CameraScanner } from "@/components/verifex/CameraScanner";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => seo("Overview", "Current state of your export documentation and multi-user workflow."),
  component: Dashboard,
});

function Dashboard() {
  const {
    currentUser,
    activeShipment,
    activeShipmentId,
    setActiveShipmentId,
    readiness,
    openIssues,
    getActiveSlots,
    canStartAnalysis,
    startAiAnalysis,
    uploadSlotDocument,
    submitCorrection,
    approveCorrection,
    requestCorrection,
    isAnalyzing,
    setIsAnalyzing,
    allUsers,
    setCurrentUser,
    reverify,
    reassignSlot,
  } = useDemo();

  const navigate = useNavigate();
  const slots = getActiveSlots(activeShipmentId);
  const completion = canStartAnalysis(activeShipmentId);

  // Modals state
  const [selectedSlotForUpload, setSelectedSlotForUpload] = useState<DocumentSlot | null>(null);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState("240 KB");
  const [uploadTitle, setUploadTitle] = useState("");
  const [inspectVersionsSlot, setInspectVersionsSlot] = useState<DocumentSlot | null>(null);
  const [showNewConsignmentModal, setShowNewConsignmentModal] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scannedViaCamera, setScannedViaCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analysis progress animation state
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);

  const analysisSteps = [
    "Step 1: Document Semantic Classification",
    "Step 2: Optical Character Recognition (OCR) Stream Processing",
    "Step 3: Structured Field Extraction across 5 Documents",
    "Step 4: Cross-Document Multi-Way Field Alignment",
    "Step 5: Consensus Golden Record Synthesis",
    "Step 6: Discrepancy & Consequence Detection (1,200 vs 1,180 cartons)",
    "Step 7: Statutory Compliance Rules (Section 111(m), SOLAS VGM)",
    "Step 8: Customs Query Risk Simulation (ICEGATE & UAE MoIAT)",
    "Step 9: Export Readiness Scoring Algorithm",
    "Step 10: Cryptographic Verification Certificate Generation",
  ];

  const handleStartAnalysis = async () => {
    if (!completion.canStart) {
      toast.error(`Cannot start AI verification: Waiting for ${completion.missing.join(", ")}`);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStepIndex(0);

    for (let i = 0; i < analysisSteps.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      setAnalysisStepIndex(i + 1);
    }

    await startAiAnalysis(activeShipmentId);
    setIsAnalyzing(false);
    toast.success("AI Analysis Complete! Golden Record and Discrepancies generated.");
    navigate({ to: "/results" });
  };

  const handleConfirmUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForUpload) return;

    const fname = uploadFileName.trim() || `${selectedSlotForUpload.type.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;

    if (isCorrecting) {
      await submitCorrection(activeShipmentId, selectedSlotForUpload.id, {
        name: fname,
        size: uploadFileSize,
      });
      toast.success(`Corrected version of ${selectedSlotForUpload.type} submitted to Admin!`);
    } else {
      await uploadSlotDocument(activeShipmentId, selectedSlotForUpload.id, {
        name: fname,
        size: uploadFileSize,
      });
      toast.success(`${selectedSlotForUpload.type} uploaded successfully and stored under case!`);
    }

    setSelectedSlotForUpload(null);
    setIsCorrecting(false);
    setUploadFileName("");
    setUploadTitle("");
  };

  const myAssignedSlots = slots.filter(
    (s) => s.assignedToUser.id === currentUser.id || s.assignedToUser.role === currentUser.role || (currentUser.assignedDocType && s.type === currentUser.assignedDocType)
  );

  return (
    <div className="space-y-8">
      {/* Role Banner & Persona Context */}
      <Reveal className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Good day, {currentUser.name} 👋
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                currentUser.role === "ADMIN"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-ink text-ink-foreground"
              }`}
            >
              {currentUser.role}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {currentUser.role === "ADMIN"
              ? "Admin Oversight — Central controller of document collection, AI verification gating, and trade clearance."
              : `Document Contributor Portal — Assigned Team: ${currentUser.team}. Upload and reconcile assigned export documents.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowNewConsignmentModal(true)}
            className="press inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="size-3.5" /> New Export Consignment
          </button>

          <div className="rounded-2xl border bg-card p-2 text-xs flex items-center gap-2">
            <span className="text-muted-foreground text-[11px] font-medium hidden sm:inline">Active Case:</span>
            <select
              value={activeShipmentId}
              onChange={(e) => setActiveShipmentId(e.target.value)}
              className="bg-transparent font-mono font-bold text-xs outline-none text-foreground cursor-pointer"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} ({s.commodity})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Reveal>

      {/* RENDER VIEW ACCORDING TO ROLE */}
      {currentUser.role === "ADMIN" ? (
        /* ============================================================ */
        /* A. ADMIN DASHBOARD VIEW                                      */
        /* ============================================================ */
        <div className="space-y-8">
          {/* Top 6 KPI Metrics */}
          <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Active Shipments" value={24} icon={Ship} i={0} />
            <StatTile label="Docs Received" value={23} icon={FileCheck2} i={1} />
            <StatTile label="Pending Docs" value={5} icon={Clock} i={2} />
            <StatTile label="Analysis Pending" value={2} icon={Sparkles} i={3} />
            <StatTile label="Critical Issues" value={3} icon={AlertTriangle} i={4} />
            <StatTile label="Verified Shipments" value={18} icon={CheckCircle2} i={5} />
          </Reveal>

          {/* Dedicated Document Collection Workspace Card */}
          <Reveal delay={0.06} className="surface p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Document Collection Workspace
                </div>
                <h2 className="text-xl font-bold mt-1 text-foreground flex items-center gap-2">
                  <FileStack className="size-5 text-primary" />
                  Case {activeShipment.id}: {activeShipment.commodity}
                </h2>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {activeShipment.from} → {activeShipment.to} · Exporter: {activeShipment.exporter}
                </div>
              </div>

              {/* Document Completion Counter & Gating Status */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-foreground">
                    {completion.received} / {completion.total}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-semibold">
                    Documents Received
                  </div>
                </div>

                <div className="w-24">
                  <ProgressBar value={(completion.received / completion.total) * 100} />
                </div>
              </div>
            </div>

            {/* Gating Callout Banner */}
            <div
              className={`rounded-2xl p-4 text-xs border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                completion.canStart
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-500/10 border-amber-500/25 text-amber-900 dark:text-amber-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {completion.canStart ? (
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {completion.canStart
                      ? "ALL DOCUMENTS RECEIVED (5/5 READY)"
                      : `Waiting for Required Documents (${completion.total - completion.received} Missing)`}
                  </div>
                  <p className="mt-0.5 opacity-90 leading-relaxed">
                    {completion.canStart
                      ? "All 5 export documents have been uploaded across Finance, Warehouse, Customs Broker, Buyer, and Quality teams. AI verification is unlocked."
                      : `Still waiting for: ${completion.missing.join(", ")}. Admin cannot trigger verification until all 5 documents are available.`}
                  </p>
                </div>
              </div>

              {/* Start AI Analysis Button (Gated) */}
              <button
                type="button"
                disabled={!completion.canStart || isAnalyzing}
                onClick={handleStartAnalysis}
                className={`press inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs font-bold transition-all shadow-md shrink-0 ${
                  completion.canStart
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105 animate-pulse"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                }`}
              >
                {completion.canStart ? (
                  <Sparkles className="size-4" />
                ) : (
                  <Lock className="size-4" />
                )}
                {isAnalyzing ? "Processing AI Analysis…" : "START AI ANALYSIS"}
              </button>
            </div>

            {/* 5 Required Document Slots Grid */}
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((slot) => {
                const isReady = slot.status === "READY";
                const isWaiting = slot.status === "WAITING";
                const isCorrReq = slot.status === "CORRECTION_REQUESTED";
                const isCorrSub = slot.status === "CORRECTION_SUBMITTED";

                return (
                  <div
                    key={slot.id}
                    className="rounded-2xl border bg-card p-4 space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{slot.type}</h4>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span>Assigned:</span>
                            <select
                              value={slot.assignedToUser.id}
                              onChange={(e) => {
                                reassignSlot(activeShipmentId, slot.id, e.target.value);
                                const u = allUsers.find((x) => x.id === e.target.value);
                                toast.success(`Reassigned ${slot.type} to ${u?.name || "specialist"}`);
                              }}
                              className="font-semibold text-foreground bg-transparent border-b border-border/40 pb-0.5 outline-none hover:border-primary text-[11px] cursor-pointer"
                              title="Click to reassign document responsibility"
                            >
                              {allUsers.filter((u) => u.role !== "ADMIN").map((u) => (
                                <option key={u.id} value={u.id} className="bg-card text-foreground">
                                  {u.name} ({u.roleLabel})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isReady
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : isCorrReq
                              ? "bg-critical/10 text-critical border-critical/20 animate-pulse"
                              : isCorrSub
                              ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}
                        >
                          {isReady
                            ? "READY"
                            : isCorrReq
                            ? "CORRECTION REQ"
                            : isCorrSub
                            ? "CORRECTION SUBMITTED"
                            : "WAITING"}
                        </span>
                      </div>

                      {/* Version & Metadata */}
                      {slot.currentVersion ? (
                        <div className="rounded-xl bg-muted/40 p-2.5 text-[11px] space-y-1">
                          <div className="flex items-center justify-between font-mono font-semibold text-foreground truncate">
                            <span className="truncate">{slot.currentVersion.filename}</span>
                            <span className="bg-primary/10 text-primary px-1.5 py-0.2 rounded text-[10px]">
                              V{slot.currentVersion.version}
                            </span>
                          </div>
                          <div className="text-muted-foreground flex items-center justify-between text-[10px]">
                            <span>By: {slot.currentVersion.uploadedBy}</span>
                            <span>{slot.currentVersion.uploadedAt.split(",")[0]}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed p-3 text-[11px] text-muted-foreground text-center">
                          Awaiting upload from {slot.assignedToUser.roleLabel}
                        </div>
                      )}

                      {/* Correction Submitted Banner for Admin */}
                      {isCorrSub && (
                        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5 text-xs text-blue-800 dark:text-blue-300 space-y-2">
                          <div className="font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-blue-600" /> Corrected version submitted!
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              await approveCorrection(activeShipmentId, slot.id);
                              await reverify();
                              toast.success(`Correction for ${slot.type} approved! Re-verified to 100% readiness.`);
                            }}
                            className="press w-full rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white hover:brightness-110"
                          >
                            Approve Correction & Re-verify
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      {slot.versions.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setInspectVersionsSlot(slot)}
                          className="text-primary hover:underline font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Eye className="size-3" /> History ({slot.versions.length} ver)
                        </button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">No uploads</span>
                      )}

                      {/* Admin upload on behalf or request correction */}
                      <div className="flex items-center gap-1.5">
                        {isReady && !isCorrReq && (
                          <button
                            type="button"
                            onClick={() => {
                              requestCorrection(
                                activeShipmentId,
                                slot.id,
                                `Please verify carton quantity and specification in ${slot.type}.`
                              );
                              toast.info(`Correction requested from ${slot.assignedToUser.name}`);
                            }}
                            className="press rounded-full border border-critical/30 px-2.5 py-1 text-[10px] font-semibold text-critical hover:bg-critical/10"
                          >
                            Request Fix
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSlotForUpload(slot);
                            setIsCorrecting(false);
                            setUploadTitle(`${slot.type} — Case ${activeShipmentId}`);
                          }}
                          className="press rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground hover:bg-muted/80 flex items-center gap-1"
                        >
                          <Upload className="size-2.5" />
                          {slot.currentVersion ? "Upload V" + (slot.versions.length + 1) : "Upload"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Shipment Verification Queue Table */}
          <Reveal delay={0.1} className="surface p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Ship className="size-5 text-primary" /> Shipment Verification Queue
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track document collection completeness across all registered Kerala export consignments.
                </p>
              </div>
              <Link to="/shipments" className="text-xs font-semibold text-primary hover:underline">
                View All Shipments →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b bg-muted/20 text-muted-foreground font-semibold">
                    <th className="py-3 px-3">Shipment</th>
                    <th className="py-3 px-3">Commodity</th>
                    <th className="py-3 px-3">Collection Progress</th>
                    <th className="py-3 px-3">Readiness</th>
                    <th className="py-3 px-3">Verification Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {shipments.map((s) => {
                    const sSlots = getActiveSlots(s.id);
                    const sComp = canStartAnalysis(s.id);
                    const isSelected = s.id === activeShipmentId;

                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-muted/20 transition-colors ${
                          isSelected ? "bg-primary/5 font-medium" : ""
                        }`}
                      >
                        <td className="py-3.5 px-3 font-mono font-bold text-foreground">
                          {s.id}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-foreground">{s.commodity}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {s.from} → {s.to}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[11px]">
                              {sComp.received}/{sComp.total}
                            </span>
                            <div className="w-16">
                              <ProgressBar value={(sComp.received / sComp.total) * 100} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`font-mono font-bold ${
                              s.readiness >= 100 ? "text-emerald-600" : "text-primary"
                            }`}
                          >
                            {s.readiness}%
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              sComp.canStart
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}
                          >
                            {sComp.canStart ? "Ready for Analysis" : "Awaiting Documents"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveShipmentId(s.id);
                              if (sComp.canStart) {
                                handleStartAnalysis();
                              } else {
                                toast.info(`Viewing document collection for ${s.id}`);
                              }
                            }}
                            className={`press inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                              sComp.canStart
                                ? "bg-primary text-primary-foreground shadow-xs hover:brightness-105"
                                : "border bg-card text-foreground hover:border-primary/50"
                            }`}
                          >
                            {sComp.canStart ? "Analyze" : "View"}
                            <ChevronRight className="size-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      ) : (
        /* ============================================================ */
        /* B. DOCUMENT USER DASHBOARD VIEW (Normal Contributor)         */
        /* ============================================================ */
        <div className="space-y-6">
          <Reveal className="surface-ink p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                  Department Assignment Portal
                </div>
                <h2 className="text-2xl font-bold mt-1 text-white">
                  {currentUser.team}
                </h2>
                <div className="text-xs text-ink-muted mt-1">
                  You are authorized to generate, upload, and correct:{" "}
                  <strong className="text-primary font-bold">{currentUser.assignedDocType}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/20 text-primary border border-primary/30 px-3 py-1 text-xs font-bold">
                  {currentUser.roleLabel}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Assigned Document Tasks List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="size-5 text-primary" /> My Assigned Document Tasks
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              {myAssignedSlots.map((slot) => {
                const isReady = slot.status === "READY";
                const isWaiting = slot.status === "WAITING";
                const isCorrReq = slot.status === "CORRECTION_REQUESTED";
                const isCorrSub = slot.status === "CORRECTION_SUBMITTED";

                return (
                  <Reveal key={slot.id} className="surface p-6 space-y-4 border-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-xs text-primary font-bold">
                          {slot.shipmentId}
                        </div>
                        <h4 className="text-lg font-bold text-foreground mt-0.5">
                          {slot.type}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Commodity: {activeShipment.commodity} ({activeShipment.from} → {activeShipment.to})
                        </div>
                      </div>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          isReady
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : isCorrReq
                            ? "bg-critical/10 text-critical border-critical/30 animate-pulse"
                            : isCorrSub
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}
                      >
                        {isReady
                          ? "UPLOADED ✓"
                          : isCorrReq
                          ? "CORRECTION REQUESTED"
                          : isCorrSub
                          ? "CORRECTION SUBMITTED"
                          : "UPLOAD REQUIRED"}
                      </span>
                    </div>

                    {/* Correction Requested Banner */}
                    {isCorrReq && (
                      <div className="rounded-2xl bg-critical/10 border border-critical/20 p-4 text-xs text-critical space-y-2">
                        <div className="font-bold flex items-center gap-2">
                          <AlertTriangle className="size-4 text-critical shrink-0" />
                          Admin Correction Request
                        </div>
                        <p className="leading-relaxed text-foreground font-medium">
                          "{slot.correctionRequest?.reason}"
                        </p>
                        <div className="text-[11px] opacity-75">
                          Requested by {slot.correctionRequest?.requestedBy} · {slot.correctionRequest?.requestedAt}
                        </div>
                      </div>
                    )}

                    {/* Current file state */}
                    {slot.currentVersion ? (
                      <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1">
                        <div className="font-semibold text-foreground flex items-center justify-between font-mono">
                          <span>{slot.currentVersion.filename}</span>
                          <span className="text-[10px] bg-card px-2 py-0.5 rounded border">
                            V{slot.currentVersion.version} · {slot.currentVersion.fileSize}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Uploaded: {slot.currentVersion.uploadedAt}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed p-4 text-xs text-muted-foreground text-center">
                        No document uploaded yet for this consignment.
                      </div>
                    )}

                    {/* User Action Button */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="text-[11px] text-muted-foreground">
                        {isReady
                          ? "Waiting for Admin verification."
                          : isCorrReq
                          ? "Action required to proceed."
                          : "Upload required export document."}
                      </div>

                      {isCorrReq ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlotForUpload(slot);
                              setIsCorrecting(true);
                              setUploadFileName(`Packing_List_Reconciled_V2.pdf`);
                              setUploadTitle(`Corrected ${slot.type} — Case ${slot.shipmentId}`);
                              setIsCameraOpen(true);
                            }}
                            className="press rounded-full bg-critical/10 border border-critical/30 px-3.5 py-2.5 text-xs font-bold text-critical hover:bg-critical/20 flex items-center gap-1.5"
                          >
                            <Camera className="size-3.5" />
                            Scan V2
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlotForUpload(slot);
                              setIsCorrecting(true);
                              setUploadFileName(`Packing_List_Reconciled_V2.pdf`);
                              setUploadTitle(`Corrected ${slot.type} — Case ${slot.shipmentId}`);
                            }}
                            className="press rounded-full bg-critical px-4 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-110 flex items-center gap-1.5"
                          >
                            <RotateCcw className="size-3.5" />
                            Upload V2
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlotForUpload(slot);
                              setIsCorrecting(false);
                              setUploadTitle(`${slot.type} — Case ${slot.shipmentId}`);
                              setIsCameraOpen(true);
                            }}
                            className="press rounded-full bg-primary/10 border border-primary/30 px-3.5 py-2.5 text-xs font-bold text-primary hover:bg-primary/20 flex items-center gap-1.5"
                          >
                            <Camera className="size-3.5" />
                            Scan
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSlotForUpload(slot);
                              setIsCorrecting(false);
                              setUploadTitle(`${slot.type} — Case ${slot.shipmentId}`);
                            }}
                            className="press rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105 flex items-center gap-1.5"
                          >
                            <Upload className="size-3.5" />
                            {isReady ? "New Version" : "Upload"}
                          </button>
                        </div>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 10-STEP AI ANALYSIS PROCESSING MODAL                         */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface max-w-lg w-full p-6 sm:p-8 space-y-6 text-foreground"
            >
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground animate-spin">
                  <Sparkles className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">VERIFEX AI Analysis Engine</h3>
                  <div className="text-xs text-muted-foreground font-mono">
                    Analyzing 5/5 Documents for {activeShipmentId}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {analysisSteps.map((step, idx) => {
                  const isDone = idx < analysisStepIndex;
                  const isCurrent = idx === analysisStepIndex;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs transition-all ${
                        isDone
                          ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold"
                          : isCurrent
                          ? "bg-primary/10 text-primary font-bold animate-pulse"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      <div className="size-4 shrink-0 flex items-center justify-center">
                        {isDone ? (
                          <Check className="size-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <RefreshCw className="size-3.5 animate-spin text-primary" />
                        ) : (
                          <div className="size-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <span className="truncate">{step}</span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-muted-foreground text-center pt-2">
                Cross-reconciling Finance, Warehouse, Customs Broker, Buyer, and Quality certificates…
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* DOCUMENT UPLOAD MODAL                                        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedSlotForUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {isCorrecting ? "Upload Corrected Version" : "Upload Document"}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    Slot: {selectedSlotForUpload.type} ({selectedSlotForUpload.shipmentId})
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSlotForUpload(null)}
                  className="rounded-full p-1.5 hover:bg-muted text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleConfirmUpload} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-muted-foreground">Document Title</label>
                  <input
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder={`${selectedSlotForUpload.type} — Reference`}
                    className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground">File Name</label>
                  <input
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    placeholder={`${selectedSlotForUpload.type.replace(/\s+/g, "_")}_V${selectedSlotForUpload.versions.length + 1}.pdf`}
                    className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* File Input & Drag & Drop Zone with Camera Scanner */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFileName(file.name);
                      setUploadFileSize(`${(file.size / 1024).toFixed(0)} KB`);
                      setScannedViaCamera(false);
                      toast.success(`Selected file: ${file.name}`);
                    }
                  }}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-primary/30 p-6 text-center space-y-3 bg-primary/5 cursor-pointer hover:border-primary/60 transition-all"
                >
                  <div className="flex size-11 mx-auto items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      Drag and drop file here, or click to browse
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Supported: PDF, JPG, PNG, XLSX, DOCX (Max 25MB)
                    </div>
                  </div>

                  {/* Dual Ingestion Options: Browse Files OR Live Camera Scanner */}
                  <div
                    className="flex flex-wrap items-center justify-center gap-2 pt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="press inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50"
                    >
                      <Upload className="size-3.5 text-primary" /> Browse File
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCameraOpen(true)}
                      className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
                    >
                      <Camera className="size-3.5" /> Open Camera Scanner
                      <span className="rounded-full bg-white/25 px-1.5 py-0.2 text-[9px] uppercase font-bold tracking-wider">
                        Live
                      </span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <div className="text-[11px] font-mono text-primary font-bold">
                      File selected: {uploadFileName || "default_export_document.pdf"} ({uploadFileSize})
                    </div>
                    {scannedViaCamera && (
                      <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" /> Captured from Camera Scanner (OCR 97%)
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 p-3 text-[11px] space-y-1 text-muted-foreground">
                  <div><strong>Uploader:</strong> {currentUser.name} ({currentUser.roleLabel})</div>
                  <div><strong>Destination Case:</strong> {selectedSlotForUpload.shipmentId}</div>
                  <div><strong>Next Version:</strong> V{selectedSlotForUpload.versions.length + 1}</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSlotForUpload(null)}
                    className="press rounded-full border px-4 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="press rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:brightness-105"
                  >
                    Confirm & Store Document
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* VERSION HISTORY INSPECTION MODAL                             */}
      {/* ============================================================ */}
      <AnimatePresence>
        {inspectVersionsSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface max-w-lg w-full p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Version History: {inspectVersionsSlot.type}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    Shipment: {inspectVersionsSlot.shipmentId} · Total: {inspectVersionsSlot.versions.length} versions
                  </div>
                </div>
                <button
                  onClick={() => setInspectVersionsSlot(null)}
                  className="rounded-full p-1.5 hover:bg-muted text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {inspectVersionsSlot.versions.map((ver) => (
                  <div
                    key={ver.version}
                    className="rounded-xl border bg-card p-3.5 text-xs space-y-2 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold font-mono text-sm text-foreground flex items-center gap-2">
                        <span>Version {ver.version}</span>
                        {ver.version === inspectVersionsSlot.currentVersion?.version && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            Active / Approved
                          </span>
                        )}
                      </div>
                      <span className="text-muted-foreground text-[11px] font-mono">{ver.fileSize}</span>
                    </div>

                    <div className="font-mono text-[11px] text-muted-foreground truncate">
                      {ver.filename}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                      <span>Uploaded by: <strong className="text-foreground">{ver.uploadedBy}</strong> ({ver.uploadedByRole})</span>
                      <span>{ver.uploadedAt}</span>
                    </div>

                    {ver.notes && (
                      <div className="text-[11px] text-primary bg-primary/5 p-2 rounded-lg">
                        Note: {ver.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setInspectVersionsSlot(null)}
                  className="press rounded-full bg-ink px-5 py-2 text-xs font-semibold text-ink-foreground"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Export Consignment Modal */}
      <NewConsignmentModal
        isOpen={showNewConsignmentModal}
        onClose={() => setShowNewConsignmentModal(false)}
      />

      {/* Real-time Document Camera Scanner Modal */}
      {selectedSlotForUpload && (
        <CameraScanner
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(doc) => {
            setUploadFileName(doc.filename);
            setUploadFileSize(doc.size);
            setScannedViaCamera(true);
            setIsCameraOpen(false);
            toast.success(`Scanned document captured: ${doc.filename} (${doc.size})`);
          }}
          shipmentId={selectedSlotForUpload.shipmentId}
        />
      )}
    </div>
  );
}
