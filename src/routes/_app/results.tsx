import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Eye,
  Wand2,
  FileText,
  RotateCcw,
  Check,
  X,
  Database,
  Send,
  Upload,
  Clock,
  UserCheck,
  ShieldCheck,
  History,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import {
  PageHeader,
  Reveal,
  ReadinessRing,
  StatusBadge,
  Chip,
} from "@/components/verifex/primitives";
import { discrepancies, comparisonFields, type Discrepancy } from "@/lib/data";

export const Route = createFileRoute("/_app/results")({
  head: () =>
    seo("Verification Results", "Cross-document verification analysis and discrepancy detection."),
  component: ResultsPage,
});

function ResultsPage() {
  const {
    readiness,
    openIssues,
    resolve,
    isResolved,
    activeShipment,
    reverify,
    currentUser,
    getActiveSlots,
    requestCorrection,
    submitCorrection,
    approveCorrection,
    ignoreDiscrepancy,
  } = useDemo();

  const [inspectModal, setInspectModal] = useState<Discrepancy | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [reverifying, setReverifying] = useState(false);
  const [ignoreModal, setIgnoreModal] = useState<Discrepancy | null>(null);
  const [ignoreReason, setIgnoreReason] = useState("");

  // Correction workflow modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState(
    "Commercial Invoice declares 1,200 cartons, but Packing List specifies 1,180 cartons. Please recount the Willingdon Island warehouse lot and upload a revised Packing List (1,200 cartons).",
  );
  const [uploadV2ModalOpen, setUploadV2ModalOpen] = useState(false);
  const [v2Filename, setV2Filename] = useState("Packing_List_V2_Corrected_1200ctns.pdf");

  const slots = getActiveSlots(activeShipment.id);
  const plSlot = slots.find((s) => s.id.includes("pl") || s.type.toLowerCase().includes("packing"));

  const handleApplyFix = async (id: string) => {
    setResolvingId(id);
    await resolve(id);
    toast.success("Discrepancy resolved successfully.");
    setTimeout(() => setResolvingId(null), 500);
  };

  const handleReverify = async () => {
    setReverifying(true);
    await reverify();
    toast.success("Cross-document verification re-evaluated.");
    setTimeout(() => setReverifying(false), 900);
  };

  const handleSendCorrectionRequest = async () => {
    if (!plSlot) return;
    await requestCorrection(activeShipment.id, plSlot.id, correctionReason);
    setRequestModalOpen(false);
    toast.info("Correction request sent to Warehouse team (Akhil Varma).");
  };

  const handleSubmitV2 = async () => {
    if (!plSlot) return;
    await submitCorrection(activeShipment.id, plSlot.id, {
      name: v2Filename,
      size: "194 KB",
    });
    setUploadV2ModalOpen(false);
    toast.success("Packing List V2 (1,200 cartons) submitted. Awaiting Admin approval.");
  };

  const handleApproveCorrection = async () => {
    if (!plSlot) return;
    await approveCorrection(activeShipment.id, plSlot.id);
    await reverify();
    toast.success(
      "Correction approved! Quantity aligned to 1,200 cartons. Readiness is now 100% READY.",
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Verification Workspace"
        title="Verification Results"
        sub="Cross-document comparison across Commercial Invoice, Packing List, Shipping Bill, and Purchase Order."
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={handleReverify}
              className="press inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-xs font-semibold hover:border-primary/50"
            >
              <RotateCcw className={`size-3.5 ${reverifying ? "animate-spin text-primary" : ""}`} />
              Re-Verify
            </button>
            <Link
              to="/readiness"
              className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              Export Readiness <ArrowRight className="size-3.5" />
            </Link>
          </div>
        }
      />

      {/* Hero Overview Banner */}
      <Reveal className="surface-ink p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              Consignment Verification Report
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="font-mono text-xl md:text-3xl font-bold">{activeShipment.id}</span>
              <StatusBadge status={readiness >= 100 ? "ready" : "review"} />
            </div>
            <div className="mt-3 text-lg font-semibold">{activeShipment.commodity}</div>
            <div className="text-sm text-ink-muted">
              {activeShipment.from} → {activeShipment.to} · {activeShipment.exporter}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-ink-muted">
              <span>{openIssues} unresolved discrepancies</span>
              <span>·</span>
              <span>12 cross-checked data points</span>
              <span>·</span>
              <span className="text-primary font-medium">5/5 Documents Audited</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ReadinessRing value={readiness} size={150} dark label="Readiness" />
            <span className="text-[11px] text-ink-muted font-medium">
              {readiness >= 100 ? "100% Ready for Port Gate" : "Action Required"}
            </span>
          </div>
        </div>
      </Reveal>

      {/* Discrepancies Action Cards */}
      <Reveal delay={0.08} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Detected Discrepancies & Suggested Fixes</h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                openIssues > 0 ? "bg-critical-soft text-critical" : "bg-success-soft text-success"
              }`}
            >
              {openIssues > 0 ? `${openIssues} Open` : "All Resolved"}
            </span>
          </div>
          <Link to="/issues" className="text-xs text-muted-foreground hover:text-foreground">
            View Issue Board →
          </Link>
        </div>

        <div className="grid gap-4">
          {discrepancies.map((d) => {
            const resolved = isResolved(d.id);
            const isQtyIssue = d.id === "qty";

            return (
              <motion.div
                key={d.id}
                layout
                className={`surface p-5 transition-all ${
                  resolved
                    ? "border-success/30 bg-success/5 opacity-80"
                    : "hover:shadow-[var(--shadow-float)]"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Chip tone={resolved ? "verified" : d.severity}>
                        {resolved ? "Resolved" : d.severity}
                      </Chip>
                      <h3 className="text-base font-semibold">{d.title}</h3>
                      <span className="font-mono text-xs text-muted-foreground">
                        ({d.difference})
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">{d.explanation}</p>

                    {/* 3-Way Cross Check Comparison for Quantity */}
                    {isQtyIssue ? (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          3-Way Cross-Document Provenance
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {/* Commercial Invoice */}
                          <div className="rounded-xl border bg-card p-3 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                              <span>Commercial Invoice</span>
                              <span className="font-mono">v1</span>
                            </div>
                            <div className="mt-1 font-mono text-sm font-bold text-foreground">
                              1,200 cartons
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground truncate">
                              Finance Team (Rahul Nair)
                            </div>
                          </div>

                          {/* Packing List */}
                          <div
                            className={`rounded-xl border p-3 text-xs ${
                              resolved
                                ? "border-success/40 bg-success/5"
                                : plSlot?.status === "CORRECTION_SUBMITTED"
                                  ? "border-primary/40 bg-primary/5"
                                  : "border-critical/30 bg-card"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                              <span>Packing List</span>
                              <span className="font-mono">
                                {plSlot && plSlot.versions.length > 1
                                  ? `v${plSlot.versions.length}`
                                  : "v1"}
                              </span>
                            </div>
                            <div
                              className={`mt-1 font-mono text-sm font-bold ${
                                resolved
                                  ? "text-success"
                                  : plSlot?.status === "CORRECTION_SUBMITTED"
                                    ? "text-primary"
                                    : "text-critical"
                              }`}
                            >
                              {resolved || plSlot?.status === "CORRECTION_SUBMITTED"
                                ? "1,200 cartons"
                                : "1,180 cartons"}
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground truncate">
                              Warehouse (Akhil Varma)
                            </div>
                          </div>

                          {/* Shipping Bill */}
                          <div className="rounded-xl border bg-card p-3 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                              <span>Shipping Bill</span>
                              <span className="font-mono">v1</span>
                            </div>
                            <div className="mt-1 font-mono text-sm font-bold text-foreground">
                              1,200 cartons
                            </div>
                            <div className="mt-1 text-[10px] text-muted-foreground truncate">
                              Customs Broker (Kavitha)
                            </div>
                          </div>
                        </div>

                        {/* Interactive Workflow Banner for Packing List correction */}
                        {!resolved && plSlot?.status === "CORRECTION_REQUESTED" && (
                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-warning-foreground">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="size-4 shrink-0 text-warning mt-0.5" />
                              <div>
                                <span className="font-bold">Correction Requested by Admin:</span>{" "}
                                <span className="text-muted-foreground">
                                  {plSlot.correctionRequest?.reason}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setUploadV2ModalOpen(true)}
                              className="press shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm"
                            >
                              <Upload className="size-3.5" /> Upload V2 (Warehouse)
                            </button>
                          </div>
                        )}

                        {!resolved && plSlot?.status === "CORRECTION_SUBMITTED" && (
                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs">
                            <div className="flex items-start gap-2">
                              <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
                              <div>
                                <span className="font-bold text-foreground">
                                  Corrected Packing List V2 Uploaded:
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  Warehouse reconciled lot to 1,200 cartons. Pending Admin
                                  verification approval.
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={handleApproveCorrection}
                              className="press shrink-0 inline-flex items-center gap-1.5 rounded-full bg-success px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110"
                            >
                              <CheckCircle2 className="size-3.5" /> Approve & Re-Verify
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pt-2 sm:max-w-md">
                        <div className="rounded-xl border bg-card p-2.5 text-xs">
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {d.left.doc}
                          </div>
                          <div className="font-semibold">{d.left.value}</div>
                        </div>
                        <div className="rounded-xl border bg-card p-2.5 text-xs">
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {d.right.doc}
                          </div>
                          <div
                            className={`font-semibold ${resolved ? "text-success" : "text-critical"}`}
                          >
                            {resolved ? d.left.value : d.right.value}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 pt-2 md:pt-0 shrink-0">
                    <button
                      onClick={() => setInspectModal(d)}
                      className="press inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted"
                    >
                      <Eye className="size-3.5" />
                      Inspect Evidence
                    </button>

                    {resolved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
                        <Check className="size-3.5" /> Resolved
                      </span>
                    ) : isQtyIssue && plSlot?.status === "CORRECTION_SUBMITTED" ? (
                      <button
                        onClick={handleApproveCorrection}
                        className="press inline-flex items-center gap-1.5 rounded-full bg-success px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
                      >
                        <CheckCircle2 className="size-3.5" />
                        Approve V2
                      </button>
                    ) : isQtyIssue && plSlot?.status !== "CORRECTION_REQUESTED" ? (
                      <div className="flex flex-col gap-2 items-end">
                        <button
                          onClick={() => setRequestModalOpen(true)}
                          className="press inline-flex items-center gap-1.5 rounded-full bg-warning-soft text-warning border border-warning/30 px-3.5 py-2 text-xs font-semibold hover:bg-warning/20"
                        >
                          <Send className="size-3.5" />
                          Request Correction
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setIgnoreModal(d);
                              setIgnoreReason(
                                "Customer waiver granted for 20-carton container shipment variance.",
                              );
                            }}
                            className="text-[10px] text-muted-foreground hover:text-foreground font-medium underline"
                          >
                            Ignore with Reason
                          </button>
                          <button
                            onClick={() => handleApplyFix(d.id)}
                            disabled={resolvingId === d.id}
                            className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-ink-foreground shadow-sm hover:brightness-125"
                          >
                            <Wand2 className="size-3 text-primary" />
                            1-Click Auto-Fix
                          </button>
                        </div>
                      </div>
                    ) : isQtyIssue && plSlot?.status === "CORRECTION_REQUESTED" ? (
                      <button
                        onClick={() => setUploadV2ModalOpen(true)}
                        className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-110"
                      >
                        <Upload className="size-3.5" />
                        Upload V2
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1 items-end">
                        <button
                          onClick={() => handleApplyFix(d.id)}
                          disabled={resolvingId === d.id}
                          className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground shadow-sm hover:brightness-125"
                        >
                          <Wand2 className="size-3.5 text-primary" />
                          {resolvingId === d.id ? "Applying…" : d.fixLabel}
                        </button>
                        <button
                          onClick={() => {
                            setIgnoreModal(d);
                            setIgnoreReason(
                              "Clerical variation within permissible statutory boundary.",
                            );
                          }}
                          className="text-[10px] text-muted-foreground hover:text-foreground font-medium underline"
                        >
                          Ignore with Reason
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Reveal>

      {/* Cross-Document Comparison Matrix */}
      <Reveal delay={0.16} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Document Cross-Reference Matrix</h2>
            <p className="text-xs text-muted-foreground">
              Compares Commercial Invoice (CI), Packing List (PL), Shipping Bill (SB), and Purchase
              Order (PO).
            </p>
          </div>
          <Link to="/golden-record" className="text-xs text-muted-foreground hover:text-foreground">
            Open Golden Record →
          </Link>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4 font-semibold">Attribute</th>
                  <th className="p-4 font-semibold">Commercial Invoice (Finance)</th>
                  <th className="p-4 font-semibold">Packing List (Warehouse)</th>
                  <th className="p-4 font-semibold">Shipping Bill (Broker)</th>
                  <th className="p-4 font-semibold">Purchase Order (Buyer)</th>
                  <th className="p-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisonFields.map((row, idx) => {
                  const hasOpenIssue = row.issueId && !isResolved(row.issueId);
                  const displayStatus = hasOpenIssue ? row.status : "verified";
                  const plValue =
                    row.issueId === "qty" && isResolved("qty")
                      ? "1,200 cartons"
                      : row.values.PL || "—";
                  const sbValue =
                    row.issueId === "hs" && isResolved("hs") ? "030617" : row.values.SB || "—";

                  return (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{row.field}</td>
                      <td className="p-4 font-mono text-xs">{row.values.CI || "—"}</td>
                      <td
                        className={`p-4 font-mono text-xs ${hasOpenIssue && row.issueId === "qty" ? "text-critical font-bold" : ""}`}
                      >
                        {plValue}
                      </td>
                      <td
                        className={`p-4 font-mono text-xs ${hasOpenIssue && row.issueId === "hs" ? "text-critical font-bold" : ""}`}
                      >
                        {sbValue}
                      </td>
                      <td className="p-4 font-mono text-xs">{row.values.PO || "—"}</td>
                      <td className="p-4 text-right">
                        <Chip tone={displayStatus}>{displayStatus}</Chip>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* Admin Request Correction Modal */}
      <AnimatePresence>
        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="surface max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Send className="size-5 text-warning" />
                  <h3 className="font-semibold text-lg">Request Document Correction</h3>
                </div>
                <button
                  onClick={() => setRequestModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1">
                  <div className="font-semibold text-foreground">Target Document Slot:</div>
                  <div className="text-muted-foreground">
                    Packing List (Assigned to Akhil Varma — Warehouse Team)
                  </div>
                  <div className="text-muted-foreground">
                    Shipment: <span className="font-mono font-medium">{activeShipment.id}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Reason / Instructions for Warehouse:
                  </label>
                  <textarea
                    rows={4}
                    value={correctionReason}
                    onChange={(e) => setCorrectionReason(e.target.value)}
                    className="w-full rounded-xl border bg-card p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setRequestModalOpen(false)}
                  className="rounded-full border bg-card px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendCorrectionRequest}
                  className="press rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Send Correction Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Warehouse Upload V2 Modal */}
      <AnimatePresence>
        {uploadV2ModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="surface max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Upload className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">Upload Corrected Packing List V2</h3>
                </div>
                <button
                  onClick={() => setUploadV2ModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-success-soft p-3 text-xs text-success space-y-1">
                  <div className="font-semibold">Reconciliation Note:</div>
                  <div>
                    Warehouse lot recounted. Quantity adjusted to match Commercial Invoice (1,200
                    cartons).
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    File Name:
                  </label>
                  <input
                    type="text"
                    value={v2Filename}
                    onChange={(e) => setV2Filename(e.target.value)}
                    className="w-full rounded-xl border bg-card p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setUploadV2ModalOpen(false)}
                  className="rounded-full border bg-card px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitV2}
                  className="press rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Submit Version 2 for Approval
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Evidence Viewer Modal */}
      <AnimatePresence>
        {inspectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="surface max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">Source Evidence & Provenance</h3>
                </div>
                <button
                  onClick={() => setInspectModal(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    Source Document
                  </div>
                  <div className="font-semibold text-base">{inspectModal.evidence.source}</div>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-4 font-mono text-xs text-foreground space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-sans">
                    Extracted Raw Text Snippet
                  </div>
                  <div className="font-bold text-critical">"{inspectModal.evidence.value}"</div>
                  <p className="mt-2 text-muted-foreground text-[11px] font-sans">
                    Rule applied:{" "}
                    <span className="font-medium text-foreground">
                      {inspectModal.evidence.rule}
                    </span>
                  </p>
                </div>

                {/* Provenance Audit Details */}
                <div className="rounded-2xl border bg-card p-3 space-y-2 text-xs">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-primary" /> Tamper-Evident Provenance
                    Trail
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Assigned Team:</span>{" "}
                      <span className="font-medium text-foreground">
                        {inspectModal.id === "qty"
                          ? "Warehouse Logistics"
                          : inspectModal.id === "hs"
                            ? "Customs Broker (CHA)"
                            : "MPEDA Inspection"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Sign-off Officer:</span>{" "}
                      <span className="font-medium text-foreground">
                        {inspectModal.id === "qty"
                          ? "Akhil Varma"
                          : inspectModal.id === "hs"
                            ? "Kavitha Menon"
                            : "Dr. Ananya Pillai"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Audit Record:</span>{" "}
                      <span className="font-mono text-[10px] text-muted-foreground">
                        SHA256:7f9b8c...a449 (Immutable)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>OCR Confidence: {inspectModal.evidence.confidence}%</span>
                  <span>Rule Severity: {inspectModal.severity.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setInspectModal(null)}
                  className="rounded-full border bg-card px-4 py-2 text-xs font-semibold"
                >
                  Close
                </button>
                {!isResolved(inspectModal.id) && (
                  <button
                    onClick={() => {
                      handleApplyFix(inspectModal.id);
                      setInspectModal(null);
                    }}
                    className="press rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                  >
                    Apply Fix Now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ignore Discrepancy Modal */}
      <AnimatePresence>
        {ignoreModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="surface max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="size-5 text-warning" />
                  <h3 className="font-semibold text-lg">Ignore Discrepancy with Reason</h3>
                </div>
                <button
                  onClick={() => setIgnoreModal(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-muted/40 p-3 text-xs">
                  <span className="font-semibold">{ignoreModal.title}</span> (
                  {ignoreModal.difference})
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Compliance Justification / Waiver Reason (Mandatory Audit):
                  </label>
                  <textarea
                    rows={3}
                    value={ignoreReason}
                    onChange={(e) => setIgnoreReason(e.target.value)}
                    className="w-full rounded-xl border bg-card p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Explain why this mismatch is safely ignored..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setIgnoreModal(null)}
                  className="rounded-full border bg-card px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await ignoreDiscrepancy(ignoreModal.id, ignoreReason);
                    toast.info(`Discrepancy "${ignoreModal.title}" ignored with logged reason.`);
                    setIgnoreModal(null);
                  }}
                  className="press rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Confirm Waiver & Log Audit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
