import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  Edit2,
  X,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { goldenRecord as initialGoldenRecord } from "@/lib/data";

export const Route = createFileRoute("/_app/golden-record")({
  head: () => seo("Golden Record", "Consensus single source of truth across all export documents."),
  component: GoldenRecordPage,
});

function GoldenRecordPage() {
  const { isResolved, activeShipment } = useDemo();
  const [selectedField, setSelectedField] = useState<{ label: string; value: string } | null>(null);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Consensus Master Record"
        title="Golden Record"
        sub="The verified single source of truth for shipment. Attributes are reconciled across all submitted trade documents with confidence scores."
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
                const hasConflict = field.issueId && !isResolved(field.issueId);
                return (
                  <div
                    key={field.label}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border p-3.5 transition-colors ${
                      hasConflict ? "border-critical/40 bg-critical/5" : "bg-card hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="text-[11px] font-medium text-muted-foreground">{field.label}</div>
                      <div className="font-mono text-sm font-bold text-foreground mt-0.5">{field.value}</div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {hasConflict ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-critical-soft px-2.5 py-1 text-[11px] font-bold text-critical">
                          <AlertTriangle className="size-3" /> Conflict Detected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                          <Check className="size-3" /> Confirmed ({field.sources} docs)
                        </span>
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
    </div>
  );
}
