import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  Globe,
  Fish,
  Leaf,
  CircleDot,
  Sprout,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { commodityRules, destinationRules } from "@/lib/data";

export const Route = createFileRoute("/_app/intelligence")({
  head: () => seo("AI Intelligence", "Export regulatory rules and destination trade requirements."),
  component: IntelligencePage,
});

function IntelligencePage() {
  const [selectedDestination, setSelectedDestination] = useState<string>("UAE");

  const icons = {
    Seafood: Fish,
    Spices: Leaf,
    Rubber: CircleDot,
    Agriculture: Sprout,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Rule Engine & Protocols"
        title="AI Intelligence & Trade Rules"
        sub="Configurable compliance protocols covering Kerala export commodities and destination customs authority requirements."
      />

      {/* Kerala Commodity Rules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="size-5 text-primary" /> Kerala Commodity Regulatory Frameworks
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(commodityRules).map(([cat, rules], idx) => {
            const Icon = icons[cat as keyof typeof icons] || Leaf;
            return (
              <Reveal key={cat} delay={idx * 0.05} className="surface p-6 space-y-3">
                <div className="flex items-center gap-3 border-b pb-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{cat} Exports</h3>
                    <div className="text-xs text-muted-foreground">{rules.length} mandatory checkpoints</div>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  {rules.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="size-3.5 text-success shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Destination Country Compliance */}
      <Reveal delay={0.15} className="surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="size-5 text-primary" /> Destination Country Import Checklists
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specific certificate and labeling requirements enforced by foreign customs authorities.
            </p>
          </div>

          <div className="flex rounded-full border bg-card p-1 text-xs">
            {Object.keys(destinationRules).map((dest) => (
              <button
                key={dest}
                onClick={() => setSelectedDestination(dest)}
                className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                  selectedDestination === dest ? "bg-ink text-ink-foreground" : "text-muted-foreground"
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="font-semibold text-sm">
            Target Requirements for: <span className="text-primary">{selectedDestination}</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
            {destinationRules[selectedDestination]?.map((rule, idx) => (
              <div key={idx} className="rounded-xl border bg-card p-3 flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span className="font-medium text-foreground">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground">
          <strong>Notice:</strong> These compliance assistance rules are pre-submission verification aids and do not constitute guaranteed legal advice. Official bilateral protocols may be updated by regulatory boards.
        </div>
      </Reveal>
    </div>
  );
}
