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
  AlertTriangle,
  FileText,
  Warehouse,
  Briefcase,
  Users,
  Layers,
  Scale,
  Calendar,
  AlertOctagon,
  ArrowRight,
  Shield,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { commodityRules, destinationRules } from "@/lib/data";

export const Route = createFileRoute("/_app/intelligence")({
  head: () =>
    seo(
      "AI Intelligence",
      "Export regulatory frameworks, document lineage, and discrepancy consequence matrix.",
    ),
  component: IntelligencePage,
});

export const documentLineage = [
  {
    doc: "Commercial Invoice",
    owner: "Finance Team",
    icon: Briefcase,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    role: "Generates the commercial valuation, unit prices, payment terms, and declared currency.",
    keyFields: ["Invoice Number", "Total Value", "Incoterms", "Buyer & Seller Entities"],
  },
  {
    doc: "Packing List",
    owner: "Warehouse Team",
    icon: Warehouse,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    role: "Generates physical package counts, gross weight, net weight, tare, and carton dimensions.",
    keyFields: ["Package Count", "Gross Weight", "Net Weight", "Container Packing"],
  },
  {
    doc: "Shipping Bill",
    owner: "Customs Broker / CHA",
    icon: ShieldCheck,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    role: "Prepares statutory ICEGATE customs declaration, HS tariff lines, and duty drawback schedules.",
    keyFields: ["Shipping Bill Number", "HS Tariff Code", "Port of Loading (INCOK)", "FOB Value"],
  },
  {
    doc: "Purchase Order",
    owner: "Overseas Buyer",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    role: "Contractual purchase authorization establishing agreed specifications and order delivery windows.",
    keyFields: ["PO Number", "Contract Date", "Agreed Unit Rate", "Delivery Deadline"],
  },
  {
    doc: "Quality Certificate",
    owner: "Statutory Agency (MPEDA / Spices Board)",
    icon: Shield,
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    role: "Authoritative health/phytosanitary inspection validating export grade, temperature, and lab purity.",
    keyFields: ["Certificate Number", "Lab Test Date", "Validity Expiry", "Sampling Lot ID"],
  },
];

export const consequenceMatrix = [
  {
    discrepancy: "Quantity Mismatch",
    example: "Invoice 1,200 cartons vs Packing List 1,180 cartons",
    docs: "Invoice ↔ Packing List",
    consequence:
      "Short-shipment insurance claim, physical re-inspection at port gate, demurrage costs.",
    severity: "CRITICAL",
    icon: Layers,
    color: "text-critical",
  },
  {
    discrepancy: "Product Description",
    example: "'Frozen Shrimp' vs 'Frozen Prawn'",
    docs: "Invoice ↔ Shipping Bill",
    consequence: "HS code conflict, customs query hold, classification misdeclaration query.",
    severity: "HIGH",
    icon: FileText,
    color: "text-amber-500",
  },
  {
    discrepancy: "HS Code Conflict",
    example: "Invoice 0306.17 vs Shipping Bill 0306.16",
    docs: "Invoice ↔ Shipping Bill",
    consequence:
      "Duty rate recalculation, customs penalty under Section 111(m) of the Indian Customs Act.",
    severity: "CRITICAL",
    icon: Scale,
    color: "text-critical",
  },
  {
    discrepancy: "Weight Variance",
    example: "Gross weight 18,000 kg vs 17,850 kg",
    docs: "Packing List ↔ Shipping Bill",
    consequence:
      "Ocean carrier freight billing dispute, SOLAS VGM terminal gate turn-around penalty.",
    severity: "MEDIUM",
    icon: Scale,
    color: "text-amber-500",
  },
  {
    discrepancy: "Date Mismatch",
    example: "PO date 12-Aug vs Actual ship date 15-Aug",
    docs: "PO ↔ Bill of Lading",
    consequence:
      "Letter of Credit (LC) amendment required, banking discrepancy fee, payment deferral.",
    severity: "HIGH",
    icon: Calendar,
    color: "text-primary",
  },
];

export const targetPersonas = [
  {
    title: "Exporters (Primary)",
    subtitle: "Seafood Processors, Spice Houses, Rubber Planters",
    benefit:
      "Verify 100% data consistency before container leaves factory premises to prevent expensive port demurrage and shipment rejection.",
  },
  {
    title: "Customs Brokers (CHA)",
    subtitle: "Authorized Customs Clearance Agents",
    benefit:
      "Automate cross-checking of client documents against ICEGATE Shipping Bill to eliminate Section 111(m) penalty liabilities.",
  },
  {
    title: "Export Documentation Teams",
    subtitle: "Back-Office Operational Specialists",
    benefit:
      "Replace manual 30-minute 5-document manual cross-checking with 8-second multi-document AI consensus verification.",
  },
  {
    title: "Freight Forwarders",
    subtitle: "Ocean & Air Logistics Coordinators",
    benefit:
      "Ensure SOLAS VGM weights, container stuffing carton totals, and commodity descriptions match carrier manifests.",
  },
];

function IntelligencePage() {
  const [selectedDestination, setSelectedDestination] = useState<string>("UAE");

  const icons = {
    Seafood: Fish,
    Spices: Leaf,
    Rubber: CircleDot,
    Agriculture: Sprout,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <PageHeader
        eyebrow="Rule Engine & Protocols"
        title="AI Intelligence & Trade Matrix"
        sub="The multi-document lineage, statutory discrepancy consequence matrix, and Kerala export regulatory frameworks."
      />

      {/* 1. Five Core Documents & Lineage */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <FileText className="size-5 text-primary" /> The 5 Core Export Documents & Ownership
              Lineage
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cross-reconciliation matrix across the 3 generative teams, buyer authorization, and
              statutory testing authority.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit">
            Deterministic + Gemini Grounded
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {documentLineage.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal
                key={item.doc}
                delay={idx * 0.04}
                className="surface p-5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-foreground">{item.doc}</h3>
                      <span
                        className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}
                      >
                        Generated by: {item.owner}
                      </span>
                    </div>
                    <div className="flex size-9 items-center justify-center rounded-2xl bg-muted/60 text-foreground shrink-0">
                      <Icon className="size-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.role}</p>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Verified Critical Fields
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {item.keyFields.map((f, fi) => (
                      <span
                        key={fi}
                        className="text-[10px] font-mono rounded bg-card px-1.5 py-0.5 border text-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* 2. Discrepancy & Consequence Matrix */}
      <Reveal delay={0.1} className="surface p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <AlertOctagon className="size-5 text-critical" /> Discrepancy & Operational
              Consequence Matrix
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              The statutory impact and financial penalties triggered when cross-document
              inconsistencies occur.
            </p>
          </div>
          <div className="text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border">
            Indian Customs Act · SOLAS VGM · UCP 600
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground font-semibold">
                <th className="py-3 px-3 rounded-l-xl">Discrepancy Type</th>
                <th className="py-3 px-3">Example Conflict</th>
                <th className="py-3 px-3">Conflicting Documents</th>
                <th className="py-3 px-3">Statutory & Operational Consequence</th>
                <th className="py-3 px-3 rounded-r-xl">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {consequenceMatrix.map((c, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-foreground">
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2 rounded-full ${c.severity === "CRITICAL" ? "bg-critical animate-pulse" : "bg-amber-500"}`}
                      />
                      {c.discrepancy}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-muted-foreground text-[11px]">
                    {c.example}
                  </td>
                  <td className="py-3.5 px-3 text-muted-foreground font-medium">{c.docs}</td>
                  <td className="py-3.5 px-3 font-medium text-foreground max-w-xs">
                    {c.consequence}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.severity === "CRITICAL"
                          ? "bg-critical/10 text-critical border border-critical/20"
                          : c.severity === "HIGH"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      }`}
                    >
                      {c.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* 3. Target Beneficiaries & Operational Personas */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Users className="size-5 text-primary" /> Target Users & Operational Benefits
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Who uses VERIFAI across the Kerala export supply chain and what risks are eliminated.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {targetPersonas.map((p, idx) => (
            <Reveal key={p.title} delay={idx * 0.05} className="surface p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground">{p.title}</h3>
                <span className="text-[10px] font-mono text-muted-foreground">
                  User Persona {idx + 1}
                </span>
              </div>
              <div className="text-xs font-medium text-primary">{p.subtitle}</div>
              <p className="text-xs text-muted-foreground leading-relaxed pt-1">{p.benefit}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 4. Kerala Commodity Rules */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
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
                    <div className="text-xs text-muted-foreground">
                      {rules.length} mandatory checkpoints
                    </div>
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

      {/* 5. Destination Country Compliance */}
      <Reveal delay={0.15} className="surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Globe className="size-5 text-primary" /> Destination Country Import Checklists
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specific certificate and labeling requirements enforced by foreign customs
              authorities.
            </p>
          </div>

          <div className="flex rounded-full border bg-card p-1 text-xs">
            {Object.keys(destinationRules).map((dest) => (
              <button
                key={dest}
                onClick={() => setSelectedDestination(dest)}
                className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                  selectedDestination === dest
                    ? "bg-ink text-ink-foreground"
                    : "text-muted-foreground"
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
          <strong>Notice:</strong> These compliance assistance rules are pre-submission verification
          aids and do not constitute guaranteed legal advice. Official bilateral protocols may be
          updated by regulatory boards.
        </div>
      </Reveal>
    </div>
  );
}
