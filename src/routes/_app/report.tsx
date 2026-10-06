import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Anchor,
  QrCode,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { MockQR } from "@/components/verifex/QRCode";

export const Route = createFileRoute("/_app/report")({
  head: () => seo("Verification Report", "Official export document verification report and certificate."),
  component: ReportPage,
});

function ReportPage() {
  const { readiness, activeShipment, docs } = useDemo();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Official Documentation"
        title="Verification Report"
        sub="Comprehensive export clearance certificate with cross-document reconciliation and cryptographic integrity seal."
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="press inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-xs font-semibold hover:border-primary/50"
            >
              <Printer className="size-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={handlePrint}
              className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
            >
              <Download className="size-3.5" /> Download Report
            </button>
          </div>
        }
      />

      {/* Official Certificate Paper Layout */}
      <Reveal className="surface p-8 sm:p-12 space-y-8 print:shadow-none print:border-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
              <ShieldCheck className="size-6" />
              VERIF<span className="text-foreground">AI</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Kerala Export Verification & Trade Compliance Authority · KeralAI 2026
            </div>
            <div className="mt-3 font-mono text-sm text-foreground">
              CERTIFICATE REF: <span className="font-bold">VERIFAI-CERT-{activeShipment.id}-2026</span>
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-3xl font-extrabold text-foreground">{readiness}%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
              Readiness Score
            </div>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-0.5 text-xs font-bold text-success">
              <CheckCircle2 className="size-3" /> VERIFIED DOSSIER
            </div>
          </div>
        </div>

        {/* Consignment Particulars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="rounded-2xl border p-3.5 bg-muted/20">
            <div className="text-muted-foreground uppercase font-semibold text-[10px]">Shipment ID</div>
            <div className="font-mono font-bold text-sm mt-0.5">{activeShipment.id}</div>
          </div>
          <div className="rounded-2xl border p-3.5 bg-muted/20">
            <div className="text-muted-foreground uppercase font-semibold text-[10px]">Commodity</div>
            <div className="font-bold text-sm mt-0.5">{activeShipment.commodity}</div>
          </div>
          <div className="rounded-2xl border p-3.5 bg-muted/20">
            <div className="text-muted-foreground uppercase font-semibold text-[10px]">Port of Loading</div>
            <div className="font-bold text-sm mt-0.5">{activeShipment.from} (INCOK)</div>
          </div>
          <div className="rounded-2xl border p-3.5 bg-muted/20">
            <div className="text-muted-foreground uppercase font-semibold text-[10px]">Destination Port</div>
            <div className="font-bold text-sm mt-0.5">{activeShipment.to}</div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border p-4 bg-card">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Registered Exporter</div>
            <div className="font-bold text-sm text-foreground mt-1">{activeShipment.exporter}</div>
            <div className="text-muted-foreground mt-0.5">IEC: 1004819201 · Cochin Port, Kerala, India</div>
          </div>
          <div className="rounded-2xl border p-4 bg-card">
            <div className="text-[10px] uppercase font-semibold text-muted-foreground">Buyer / Consignee</div>
            <div className="font-bold text-sm text-foreground mt-1">{activeShipment.consignee}</div>
            <div className="text-muted-foreground mt-0.5">Al Ras, Deira, Dubai, United Arab Emirates</div>
          </div>
        </div>

        {/* Verified Documents Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Audited Trade Documents ({docs.length})
          </h4>
          <div className="rounded-2xl border overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  <th className="p-3 font-semibold">Document Name</th>
                  <th className="p-3 font-semibold">Classification</th>
                  <th className="p-3 font-semibold">Confidence</th>
                  <th className="p-3 font-semibold text-right">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td className="p-3 font-mono">{d.filename}</td>
                    <td className="p-3 font-semibold">{d.type}</td>
                    <td className="p-3 font-mono">{d.confidence}%</td>
                    <td className="p-3 text-right text-success font-semibold">✓ Verified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification QR & Seals */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border bg-muted/40 p-2">
              <MockQR seed={activeShipment.id + readiness} size={90} />
            </div>
            <div>
              <div className="font-semibold text-sm">Authenticity QR Code</div>
              <div className="text-muted-foreground mt-0.5">Scan to verify Let Export Order readiness online.</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">
                TIMESTAMP: {new Date().toISOString()}
              </div>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-bold text-sm uppercase tracking-wider text-foreground">
              VERIFAI EXPORT INSPECTION SEAL
            </div>
            <div className="text-muted-foreground mt-0.5">Government of Kerala Trade Protocol v2.4</div>
            <div className="font-mono text-[11px] text-primary font-bold mt-1">STATUS: COMPLIANCE CLEARED</div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
