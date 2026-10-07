import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Wand2,
  Eye,
  FileText,
  X,
  Filter,
  Check,
  Send,
  Upload,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal, Chip } from "@/components/verifex/primitives";
import { discrepancies, type Discrepancy } from "@/lib/data";

export const Route = createFileRoute("/_app/issues")({
  head: () => seo("Discrepancies", "Detected inconsistencies and regulatory compliance issues."),
  component: IssuesPage,
});

function IssuesPage() {
  const {
    resolve,
    isResolved,
    openIssues,
    activeShipment,
    getActiveSlots,
    requestCorrection,
    submitCorrection,
    approveCorrection,
    reverify,
  } = useDemo();

  const [filterSev, setFilterSev] = useState<string>("all");
  const [inspectModal, setInspectModal] = useState<Discrepancy | null>(null);

  // Correction workflow states
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState(
    "Commercial Invoice declares 1,200 cartons, but Packing List specifies 1,180 cartons. Please recount the Willingdon Island warehouse lot and upload revised Packing List."
  );
  const [uploadV2ModalOpen, setUploadV2ModalOpen] = useState(false);
  const [v2Filename, setV2Filename] = useState("Packing_List_V2_Corrected_1200ctns.pdf");

  const slots = getActiveSlots(activeShipment.id);
  const plSlot = slots.find((s) => s.id.includes("pl") || s.type.toLowerCase().includes("packing"));

  const filtered = discrepancies.filter((d) => {
    if (filterSev === "all") return true;
    return d.severity === filterSev;
  });

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
    toast.success("Correction approved! Quantity aligned to 1,200 cartons across all documents.");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance & Consistency"
        title="Discrepancies Board"
        sub="Every detected mismatch across trade documents with calculated risk severity, source evidence, and multi-user resolution workflow."
        right={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Filter className="size-3.5" /> Filter:
            </span>
            <div className="flex rounded-full border bg-card p-1 text-xs">
              {(["all", "critical", "major", "warning"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSev(s)}
                  className={`rounded-full px-3 py-1 font-medium capitalize transition-colors ${
                    filterSev === s ? "bg-ink text-ink-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid gap-4">
        {filtered.map((d) => {
          const resolved = isResolved(d.id);
          const isQtyIssue = d.id === "qty";

          return (
            <Reveal key={d.id} className="surface p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Chip tone={resolved ? "verified" : d.severity}>{resolved ? "Resolved" : d.severity}</Chip>
                    <h3 className="text-lg font-semibold">{d.title}</h3>
                    <span className="font-mono text-xs text-muted-foreground">({d.difference})</span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{d.explanation}</p>

                  {/* 3-Way Cross Check Comparison for Quantity */}
                  {isQtyIssue ? (
                    <div className="space-y-2 pt-1 max-w-2xl">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Cross-Document Provenance & Declarations
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="rounded-xl border bg-card p-3 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                            <span>Commercial Invoice</span>
                            <span className="font-mono">v1</span>
                          </div>
                          <div className="mt-1 font-mono text-sm font-bold text-foreground">1,200 cartons</div>
                          <div className="mt-1 text-[10px] text-muted-foreground truncate">Finance (Rahul Nair)</div>
                        </div>

                        <div className={`rounded-xl border p-3 text-xs ${
                          resolved
                            ? "border-success/40 bg-success/5"
                            : plSlot?.status === "CORRECTION_SUBMITTED"
                            ? "border-primary/40 bg-primary/5"
                            : "border-critical/30 bg-card"
                        }`}>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                            <span>Packing List</span>
                            <span className="font-mono">{plSlot && plSlot.versions.length > 1 ? `v${plSlot.versions.length}` : "v1"}</span>
                          </div>
                          <div className={`mt-1 font-mono text-sm font-bold ${
                            resolved ? "text-success" : plSlot?.status === "CORRECTION_SUBMITTED" ? "text-primary" : "text-critical"
                          }`}>
                            {resolved || plSlot?.status === "CORRECTION_SUBMITTED" ? "1,200 cartons" : "1,180 cartons"}
                          </div>
                          <div className="mt-1 text-[10px] text-muted-foreground truncate">Warehouse (Akhil Varma)</div>
                        </div>

                        <div className="rounded-xl border bg-card p-3 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                            <span>Shipping Bill</span>
                            <span className="font-mono">v1</span>
                          </div>
                          <div className="mt-1 font-mono text-sm font-bold text-foreground">1,200 cartons</div>
                          <div className="mt-1 text-[10px] text-muted-foreground truncate">Customs Broker (Kavitha)</div>
                        </div>
                      </div>

                      {/* Interactive alerts */}
                      {!resolved && plSlot?.status === "CORRECTION_REQUESTED" && (
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="size-4 shrink-0 text-warning" />
                            <div>
                              <span className="font-bold text-foreground">Correction In-Progress:</span>{" "}
                              <span className="text-muted-foreground">{plSlot.correctionRequest?.reason}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setUploadV2ModalOpen(true)}
                            className="press shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
                          >
                            Upload V2
                          </button>
                        </div>
                      )}

                      {!resolved && plSlot?.status === "CORRECTION_SUBMITTED" && (
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs">
                          <div className="flex items-center gap-2">
                            <Sparkles className="size-4 shrink-0 text-primary" />
                            <div>
                              <span className="font-bold text-foreground">Packing List V2 Ready:</span>{" "}
                              <span className="text-muted-foreground">Adjusted to 1,200 cartons by Warehouse. Ready for approval.</span>
                            </div>
                          </div>
                          <button
                            onClick={handleApproveCorrection}
                            className="press shrink-0 rounded-full bg-success px-4 py-1 text-xs font-bold text-white hover:brightness-110"
                          >
                            Approve Correction
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 max-w-lg pt-1">
                      <div className="rounded-2xl border bg-muted/30 p-3.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {d.left.doc}
                        </div>
                        <div className="mt-1 font-mono text-sm font-bold text-foreground">{d.left.value}</div>
                      </div>
                      <div className="rounded-2xl border bg-muted/30 p-3.5">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {d.right.doc}
                        </div>
                        <div className={`mt-1 font-mono text-sm font-bold ${resolved ? "text-success" : "text-critical"}`}>
                          {resolved ? d.left.value : d.right.value}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-1">
                    <span className="font-medium text-foreground">Required Action:</span> {d.action}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => setInspectModal(d)}
                    className="press inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-xs font-semibold hover:bg-muted"
                  >
                    <Eye className="size-3.5" /> Inspect Evidence
                  </button>

                  {resolved ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-4 py-2 text-xs font-semibold text-success">
                      <Check className="size-4" /> Issue Resolved
                    </span>
                  ) : isQtyIssue && plSlot?.status === "CORRECTION_SUBMITTED" ? (
                    <button
                      onClick={handleApproveCorrection}
                      className="press inline-flex items-center gap-2 rounded-full bg-success px-5 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110"
                    >
                      <CheckCircle2 className="size-4" /> Approve V2
                    </button>
                  ) : isQtyIssue && plSlot?.status !== "CORRECTION_REQUESTED" ? (
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => setRequestModalOpen(true)}
                        className="press inline-flex items-center gap-1.5 rounded-full bg-warning-soft text-warning border border-warning/30 px-3.5 py-2 text-xs font-semibold hover:bg-warning/20"
                      >
                        <Send className="size-3.5" /> Request Correction
                      </button>
                      <button
                        onClick={() => resolve(d.id)}
                        className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-ink-foreground shadow-sm hover:brightness-125"
                      >
                        <Wand2 className="size-3 text-primary" /> Auto-Fix
                      </button>
                    </div>
                  ) : isQtyIssue && plSlot?.status === "CORRECTION_REQUESTED" ? (
                    <button
                      onClick={() => setUploadV2ModalOpen(true)}
                      className="press inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:brightness-110"
                    >
                      <Upload className="size-3.5" /> Upload V2
                    </button>
                  ) : (
                    <button
                      onClick={() => resolve(d.id)}
                      className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                    >
                      <Wand2 className="size-3.5" /> {d.fixLabel}
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

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
                <button onClick={() => setRequestModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1">
                  <div className="font-semibold text-foreground">Target Slot: Packing List</div>
                  <div className="text-muted-foreground">Assigned to: Akhil Varma (Warehouse Team)</div>
                  <div className="text-muted-foreground">Shipment: <span className="font-mono">{activeShipment.id}</span></div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">
                    Correction Notice & Instructions:
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
                <button onClick={() => setUploadV2ModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl bg-success-soft p-3 text-xs text-success space-y-1">
                  <div className="font-semibold">Reconciliation Note:</div>
                  <div>Warehouse lot recounted. Quantity updated to 1,200 cartons to align with Commercial Invoice.</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">File Name:</label>
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

      {/* Inspect Evidence Modal */}
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
                  <h3 className="font-semibold text-lg">Source Evidence Details</h3>
                </div>
                <button onClick={() => setInspectModal(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Document Source</div>
                  <div className="font-semibold text-base">{inspectModal.evidence.source}</div>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-4 font-mono text-xs text-foreground space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-sans">Extracted Raw Text Snippet</div>
                  <div className="font-bold text-critical">"{inspectModal.evidence.value}"</div>
                  <p className="mt-2 text-muted-foreground text-[11px] font-sans">
                    Verification Rule: <span className="font-medium text-foreground">{inspectModal.evidence.rule}</span>
                  </p>
                </div>

                <div className="rounded-2xl border bg-card p-3 space-y-2 text-xs">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-primary" /> Department Audit Trail
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-muted-foreground">Responsible Unit:</span>{" "}
                      <span className="font-medium text-foreground">
                        {inspectModal.id === "qty" ? "Warehouse Logistics" : inspectModal.id === "hs" ? "Customs Clearance (CHA)" : "Quality Authority"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recorded Sign-off:</span>{" "}
                      <span className="font-medium text-foreground">
                        {inspectModal.id === "qty" ? "Akhil Varma" : inspectModal.id === "hs" ? "Kavitha Menon" : "Dr. Ananya Pillai"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Confidence: {inspectModal.evidence.confidence}%</span>
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
                      resolve(inspectModal.id);
                      setInspectModal(null);
                    }}
                    className="press rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                  >
                    Resolve Discrepancy
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
