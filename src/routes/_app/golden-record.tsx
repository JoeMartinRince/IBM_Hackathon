import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Check,
  Edit2,
  X,
  History,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { goldenRecord as initialGoldenRecord } from "@/lib/data";

export const Route = createFileRoute("/_app/golden-record")({
  head: () => seo("Golden Record", "Consensus single source of truth across all export documents."),
  component: GoldenRecordPage,
});

function GoldenRecordPage() {
  const { isResolved, resolve, activeShipment, currentUser, goldenOverrides, setGoldenOverride } = useDemo();
  const [overrideModal, setOverrideModal] = useState<{ label: string; currentVal: string; issueId?: string | undefined } | null>(null);
  const [overrideValue, setOverrideValue] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const handleOpenOverride = (label: string, currentVal: string, issueId?: string) => {
    setOverrideModal({ label, currentVal, issueId });
    setOverrideValue(currentVal);
    setOverrideReason(`Verified physical evidence in consultation with port authority for ${label}.`);
  };

  const handleSaveOverride = async () => {
    if (!overrideModal) return;
    setGoldenOverride(overrideModal.label, overrideValue, overrideReason);
    if (overrideModal.issueId) {
      await resolve(overrideModal.issueId);
    }
    toast.success(`Golden Record overridden for ${overrideModal.label}: "${overrideValue}". Audit trail recorded.`);
    setOverrideModal(null);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Consensus Master Record"
        title="Golden Record"
        sub="The verified single source of truth for the export dossier. Attributes are cross-reconciled with confidence scores, source traceability, and audited Admin overrides."
        right={
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> Consensus Validated
            </span>
          </div>
        }
      />

      {/* Overview Banner */}
      <Reveal className="surface-ink p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Master Shipment Identifier</div>
            <div className="mt-1 font-mono text-2xl md:text-3xl font-bold">{activeShipment.id}</div>
            <div className="mt-2 text-sm text-ink-muted">
              {activeShipment.exporter} → {activeShipment.consignee}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-right">
            <div className="text-xs text-ink-muted">Reconciliation Status</div>
            <div className="mt-1 text-xl font-bold text-success flex items-center justify-end gap-1.5">
              <CheckCircle2 className="size-5" /> 18 Attributes Reconciled
            </div>
          </div>
        </div>
      </Reveal>

      {/* Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {initialGoldenRecord.map((sec, idx) => (
          <Reveal key={sec.section} delay={idx * 0.05} className="surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                {sec.section}
              </h3>
              <span className="text-xs text-muted-foreground">{sec.fields.length} attributes</span>
            </div>

            <div className="space-y-3">
              {sec.fields.map((field) => {
                const isOverridden = Boolean(goldenOverrides[field.label]);
                const displayValue = goldenOverrides[field.label] || field.value;
                const hasConflict = !isOverridden && field.issueId && !isResolved(field.issueId);

                return (
                  <div
                    key={field.label}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border p-3.5 transition-colors ${
                      hasConflict
                        ? "border-critical/40 bg-critical/5"
                        : isOverridden
                        ? "border-primary/40 bg-primary/5"
                        : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground">{field.label}</div>
                      <div className="font-mono text-sm font-bold text-foreground mt-0.5">{displayValue}</div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {isOverridden ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary">
                          <Edit2 className="size-3" /> Admin Overridden
                        </span>
                      ) : hasConflict ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-critical-soft px-2.5 py-1 text-[11px] font-bold text-critical">
                          <AlertTriangle className="size-3" /> Conflict
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                          <Check className="size-3" /> Confirmed ({field.sources} docs)
                        </span>
                      )}

                      {/* Admin Override Action */}
                      {currentUser.role === "ADMIN" && (
                        <button
                          onClick={() => handleOpenOverride(field.label, displayValue, field.issueId)}
                          className="press inline-flex items-center gap-1 rounded-full border bg-card px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                          title="Manually override this attribute in Golden Record"
                        >
                          <Edit2 className="size-2.5" /> Override
                        </button>
                      )}

                      <span className="font-mono text-xs text-muted-foreground">{field.confidence}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        ))}
      </div>

      {/* Admin Manual Override Modal */}
      <AnimatePresence>
        {overrideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="surface max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <Edit2 className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">Override Golden Record Value</h3>
                </div>
                <button onClick={() => setOverrideModal(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Target Attribute</div>
                  <div className="font-bold text-base text-foreground">{overrideModal.label}</div>
                  <div className="text-xs text-muted-foreground">Shipment: {activeShipment.id}</div>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">New Reconciled Value:</label>
                  <input
                    type="text"
                    value={overrideValue}
                    onChange={(e) => setOverrideValue(e.target.value)}
                    className="w-full rounded-xl border bg-card p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Audit Justification Reason:</label>
                  <textarea
                    rows={3}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full rounded-xl border bg-card p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setOverrideModal(null)}
                  className="rounded-full border bg-card px-4 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOverride}
                  className="press rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
                >
                  Confirm & Audit Override
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
