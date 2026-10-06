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
} from "lucide-react";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal, Chip } from "@/components/verifex/primitives";
import { discrepancies, type Discrepancy, type Severity } from "@/lib/data";

export const Route = createFileRoute("/_app/issues")({
  head: () => seo("Discrepancies", "Detected inconsistencies and regulatory compliance issues."),
  component: IssuesPage,
});

function IssuesPage() {
  const { resolve, isResolved, openIssues } = useDemo();
  const [filterSev, setFilterSev] = useState<string>("all");
  const [inspectModal, setInspectModal] = useState<Discrepancy | null>(null);

  const filtered = discrepancies.filter((d) => {
    if (filterSev === "all") return true;
    return d.severity === filterSev;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance & Consistency"
        title="Discrepancies Board"
        sub="Every detected mismatch across trade documents with calculated risk severity, source evidence, and 1-click resolution."
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

                  <div className="text-xs text-muted-foreground pt-1">
                    <span className="font-medium text-foreground">Action:</span> {d.action}
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

                <div className="rounded-2xl border bg-muted/40 p-4 font-mono text-xs space-y-1">
                  <div className="text-[10px] uppercase text-muted-foreground font-sans">Document OCR / Text Extract</div>
                  <div className="font-bold text-critical">"{inspectModal.evidence.value}"</div>
                  <p className="mt-2 text-muted-foreground text-[11px] font-sans">
                    Verification Rule: <span className="font-medium text-foreground">{inspectModal.evidence.rule}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>Confidence: {inspectModal.evidence.confidence}%</span>
                  <span>Impact on Readiness: +{inspectModal.weight}%</span>
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
