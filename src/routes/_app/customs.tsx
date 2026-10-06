import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldAlert,
  HelpCircle,
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { riskQuestions } from "@/lib/data";

export const Route = createFileRoute("/_app/customs")({
  head: () => seo("Customs Risk", "Simulated customs query analysis and pre-submission risk assessment."),
  component: CustomsRiskPage,
});

function CustomsRiskPage() {
  const { isResolved, activeShipment } = useDemo();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pre-Submission Intelligence"
        title="Customs Query Simulator"
        sub="Simulates questions customs inspectors are likely to ask based on historical audit trends and document discrepancies. AI-assisted pre-submission risk simulation."
        right={
          <Link
            to="/results"
            className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
          >
            Fix Discrepancies <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      {/* Risk Assessment Banner */}
      <Reveal className="surface-ink p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Customs Port Audit Simulation</div>
            <div className="font-mono text-2xl font-bold">{activeShipment.id}</div>
            <div className="text-sm text-ink-muted">
              Destination Authority: <span className="text-ink-foreground font-semibold">Dubai Customs / UAE Port Control</span>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center sm:text-right">
            <div className="text-xs text-ink-muted">Clearance Hold Risk</div>
            <div className="mt-1 font-mono text-3xl font-bold text-primary">Pre-Screened</div>
            <div className="text-[11px] text-ink-muted mt-0.5">3 Potential Queries Projected</div>
          </div>
        </div>
      </Reveal>

      {/* Projected Customs Questions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HelpCircle className="size-5 text-primary" />
          Simulated Customs Inspector Queries
        </h2>

        <div className="grid gap-4">
          {riskQuestions.map((q, idx) => {
            const resolved = q.issueId && isResolved(q.issueId);
            return (
              <Reveal key={q.id} delay={idx * 0.06} className="surface p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-muted-foreground">QUERY #{q.id}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                          resolved
                            ? "bg-success-soft text-success"
                            : q.level === "High"
                            ? "bg-critical-soft text-critical"
                            : "bg-warning-soft text-warning"
                        }`}
                      >
                        {resolved ? "Risk Mitigated" : `${q.level} Probability`}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-foreground">"{q.q}"</h3>
                    <p className="text-sm text-muted-foreground">{q.reason}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="text-muted-foreground font-medium">Scrutinized Docs:</span>
                      {q.docs.map((doc) => (
                        <span key={doc} className="rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs">
                          {doc}
                        </span>
                      ))}
                    </div>

                    <div className="rounded-xl border bg-muted/30 p-3 text-xs space-y-1">
                      <div className="font-semibold text-foreground">Recommended Exporter Response:</div>
                      <div className="text-muted-foreground">{q.action}</div>
                    </div>
                  </div>

                  <div className="pt-2 md:pt-0 shrink-0">
                    {resolved ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-4 py-2 text-xs font-semibold text-success">
                        <CheckCircle2 className="size-4" /> Issue Reconciled
                      </span>
                    ) : (
                      <Link
                        to="/results"
                        className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground hover:brightness-125"
                      >
                        Resolve Discrepancy <ArrowRight className="size-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
