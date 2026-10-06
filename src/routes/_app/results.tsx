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
} from "lucide-react";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal, ReadinessRing, StatusBadge, Chip } from "@/components/verifex/primitives";
import { discrepancies, comparisonFields, type Discrepancy } from "@/lib/data";

export const Route = createFileRoute("/_app/results")({
  head: () => seo("Verification Results", "Cross-document verification analysis and discrepancy detection."),
  component: ResultsPage,
});

function ResultsPage() {
  const { readiness, openIssues, resolve, isResolved, activeShipment, reverify } = useDemo();
  const [inspectModal, setInspectModal] = useState<Discrepancy | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [reverifying, setReverifying] = useState(false);

  const handleApplyFix = async (id: string) => {
    setResolvingId(id);
    await resolve(id);
    setTimeout(() => setResolvingId(null), 500);
  };

  const handleReverify = async () => {
    setReverifying(true);
    await reverify();
    setTimeout(() => setReverifying(false), 900);
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
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Consignment Verification Report</div>
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
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ReadinessRing value={readiness} size={150} dark label="Readiness" />
            <span className="text-[11px] text-ink-muted font-medium">
              {readiness >= 100 ? "Ready for Port Gate" : "Action Required"}
            </span>
          </div>
        </div>
      </Reveal>

      {/* Discrepancies Action Cards */}
      <Reveal delay={0.08} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">Detected Discrepancies & Suggested Fixes</h2>
            <span className="rounded-full bg-critical-soft px-2.5 py-0.5 text-xs font-bold text-critical">
              {openIssues} Open
            </span>
          </div>
          <Link to="/issues" className="text-xs text-muted-foreground hover:text-foreground">
            View Issue Board →
          </Link>
        </div>

        <div className="grid gap-4">
          {discrepancies.map((d) => {
            const resolved = isResolved(d.id);
            return (
              <motion.div
                key={d.id}
                layout
                className={`surface p-5 transition-all ${
                  resolved ? "border-success/30 bg-success/5 opacity-80" : "hover:shadow-[var(--shadow-float)]"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <Chip tone={resolved ? "verified" : d.severity}>{resolved ? "Resolved" : d.severity}</Chip>
                      <h3 className="text-base font-semibold">{d.title}</h3>
                      <span className="font-mono text-xs text-muted-foreground">({d.difference})</span>
                    </div>

                    <p className="text-sm text-muted-foreground">{d.explanation}</p>

                    <div className="grid grid-cols-2 gap-3 pt-2 sm:max-w-md">
                      <div className="rounded-xl border bg-card p-2.5 text-xs">
                        <div className="text-[10px] text-muted-foreground font-medium">{d.left.doc}</div>
                        <div className="font-semibold">{d.left.value}</div>
                      </div>
                      <div className="rounded-xl border bg-card p-2.5 text-xs">
                        <div className="text-[10px] text-muted-foreground font-medium">{d.right.doc}</div>
                        <div className={`font-semibold ${resolved ? "text-success" : "text-critical"}`}>
                          {resolved ? d.left.value : d.right.value}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 pt-2 md:pt-0">
                    <button
                      onClick={() => setInspectModal(d)}
                      className="press inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-xs font-medium hover:bg-muted"
                    >
                      <Eye className="size-3.5" />
                      Inspect Evidence
                    </button>

                    {resolved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1.5 text-xs font-semibold text-success">
                        <Check className="size-3.5" /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyFix(d.id)}
                        disabled={resolvingId === d.id}
                        className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground shadow-sm hover:brightness-125"
                      >
                        <Wand2 className="size-3.5 text-primary" />
                        {resolvingId === d.id ? "Applying…" : d.fixLabel}
                      </button>
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
              Compares commercial invoice (CI), packing list (PL), shipping bill (SB), and purchase order (PO).
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
                  <th className="p-4 font-semibold">Commercial Invoice</th>
                  <th className="p-4 font-semibold">Packing List</th>
                  <th className="p-4 font-semibold">Shipping Bill</th>
                  <th className="p-4 font-semibold">Purchase Order</th>
                  <th className="p-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparisonFields.map((row, idx) => {
                  const hasOpenIssue = row.issueId && !isResolved(row.issueId);
                  const displayStatus = hasOpenIssue ? row.status : "verified";
                  const plValue = row.issueId === "qty" && isResolved("qty") ? "1,200 cartons" : row.values.PL || "—";
                  const sbValue = row.issueId === "hs" && isResolved("hs") ? "030617" : row.values.SB || "—";

                  return (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium">{row.field}</td>
                      <td className="p-4 font-mono text-xs">{row.values.CI || "—"}</td>
                      <td className={`p-4 font-mono text-xs ${hasOpenIssue && row.issueId === "qty" ? "text-critical font-bold" : ""}`}>
                        {plValue}
                      </td>
                      <td className={`p-4 font-mono text-xs ${hasOpenIssue && row.issueId === "hs" ? "text-critical font-bold" : ""}`}>
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
                  <h3 className="font-semibold text-lg">Source Evidence Viewer</h3>
                </div>
                <button onClick={() => setInspectModal(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Source Document</div>
                  <div className="font-semibold text-base">{inspectModal.evidence.source}</div>
                </div>

                <div className="rounded-2xl border bg-muted/40 p-4 font-mono text-xs text-foreground space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-sans">Extracted Raw Text Snippet</div>
                  <div className="font-bold text-critical">"{inspectModal.evidence.value}"</div>
                  <p className="mt-2 text-muted-foreground text-[11px] font-sans">
                    Rule applied: <span className="font-medium text-foreground">{inspectModal.evidence.rule}</span>
                  </p>
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
    </div>
  );
}
