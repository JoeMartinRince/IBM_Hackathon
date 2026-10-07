import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  AlertTriangle,
  QrCode,
  FileText,
  Download,
  Share2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal, ReadinessRing, StatusBadge } from "@/components/verifex/primitives";
import { MockQR } from "@/components/verifex/QRCode";

export const Route = createFileRoute("/_app/readiness")({
  head: () =>
    seo("Export Readiness", "Deterministic export readiness checklist and verified QR code."),
  component: ReadinessPage,
});

function ReadinessPage() {
  const { readiness, openIssues, isResolved, activeShipment } = useDemo();

  const isQtyResolved = isResolved("qty");
  const isHsResolved = isResolved("hs");
  const isCertResolved = isResolved("cert");

  const token = "vfx_token_kl2026_1042_verified";
  const publicVerifyUrl = `/verify-status/${token}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.origin + publicVerifyUrl);
    toast.success("Public verification link copied to clipboard!");
  };

  const checklistItems = [
    {
      label: "Document Set Completeness",
      desc: "Commercial Invoice, Packing List, Shipping Bill, PO, and Quality Certificate present.",
      status: "PASS",
    },
    {
      label: "Product Description Consistency",
      desc: "Frozen Shrimp 21/25 specification matches across all trade documents.",
      status: "PASS",
    },
    {
      label: "Carton & Package Quantity Consistency",
      desc: isQtyResolved
        ? "Reconciled to 1,200 cartons across all documents."
        : "Invoice (1,200) disagrees with Packing List (1,180).",
      status: isQtyResolved ? "PASS" : "FAIL",
    },
    {
      label: "Weight & Physical Plausibility",
      desc: "Gross weight (13,450 KG) exceeds net weight (12,000 KG); unit weight confirmed.",
      status: "PASS",
    },
    {
      label: "HS Code Tariff Line Alignment",
      desc: isHsResolved
        ? "HS code 030617 correctly aligned across all export declarations."
        : "Shipping Bill specifies 030616 while Invoice states 030617.",
      status: isHsResolved ? "PASS" : "FAIL",
    },
    {
      label: "Party & Exporter Identification",
      desc: "Malabar Ocean Foods Pvt Ltd and Gulf Fresh Trading LLC verified against trade registry.",
      status: "PASS",
    },
    {
      label: "Export Chronology & Date Logic",
      desc: "PO date precedes Invoice date; sailing date matches port gate window.",
      status: "PASS",
    },
    {
      label: "Regulatory Certificate Validity",
      desc: isCertResolved
        ? "Renewed certificate attached; valid through Jan 2027."
        : "MPEDA health certificate expires within 48h of vessel sailing date.",
      status: isCertResolved ? "PASS" : "WARNING",
    },
    {
      label: "ISO Container Checksum",
      desc: "MSKU 482915-3 passed ISO 6346 check digit algorithm; seal ML-2209184 recorded.",
      status: "PASS",
    },
    {
      label: "Destination Port Compliance",
      desc: "UAE Jebel Ali import guidelines (COO, Halal, English/Arabic labeling) verified.",
      status: "PASS",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Compliance Clearance"
        title="Export Readiness & Verified QR"
        sub="Deterministic 10-point clearance evaluation. Shipments with 100% readiness generate an tamper-evident verification token and port authority QR code."
        right={
          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="press inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2.5 text-xs font-semibold hover:border-primary/50"
            >
              <FileText className="size-3.5" /> View Official Report
            </Link>
          </div>
        }
      />

      {/* Main Readiness Score Banner */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Reveal className="surface-ink p-6 md:p-8 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                Consignment Readiness Audit
              </div>
              <div className="mt-1 font-mono text-2xl md:text-3xl font-bold">
                {activeShipment.id}
              </div>
              <div className="mt-2 text-lg font-semibold">{activeShipment.commodity}</div>
              <div className="text-sm text-ink-muted">
                {activeShipment.from} → {activeShipment.to}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <StatusBadge status={readiness >= 100 ? "ready" : "review"} />
                <span className="text-xs text-ink-muted">
                  {readiness >= 100
                    ? "10/10 Verification Checks Passed"
                    : `${openIssues} Action Items Remaining`}
                </span>
              </div>
            </div>

            <ReadinessRing value={readiness} size={160} dark label="Readiness" />
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-ink-muted">
              {readiness >= 100 ? (
                <span className="text-success font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="size-4" /> Ready for customs Let Export Order (LEO)
                </span>
              ) : (
                <span>Resolve all discrepancies on the Results page to reach 100% Ready.</span>
              )}
            </div>
            {readiness < 100 ? (
              <Link
                to="/results"
                className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]"
              >
                Resolve Remaining Issues <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <Link
                to="/report"
                className="press inline-flex items-center gap-2 rounded-full bg-success px-5 py-2.5 text-xs font-semibold text-success-foreground"
              >
                Download Verification Certificate <ArrowRight className="size-3.5" />
              </Link>
            )}
          </div>
        </Reveal>

        {/* Verified QR Card */}
        <Reveal
          delay={0.08}
          className="surface p-6 flex flex-col items-center justify-between text-center"
        >
          <div>
            <div className="eyebrow">Digital Integrity Seal</div>
            <h3 className="mt-1 font-semibold text-lg">Verified Port Gate QR</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Scan with mobile to authenticate shipment clearance without disclosing private
              commercial pricing.
            </p>
          </div>

          <div className="my-4 rounded-3xl bg-muted/40 p-4 ring-1 ring-border">
            <MockQR seed={activeShipment.id + readiness} size={180} />
          </div>

          <div className="w-full space-y-2">
            <div className="font-mono text-xs text-muted-foreground truncate">{token}</div>
            <div className="flex gap-2">
              <button
                onClick={copyUrl}
                className="press flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border bg-card py-2 text-xs font-semibold hover:bg-muted"
              >
                <Share2 className="size-3.5" /> Copy Link
              </button>
              <Link
                to="/verify-status/$token"
                params={{ token }}
                className="press flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink text-ink-foreground py-2 text-xs font-semibold hover:brightness-125"
              >
                <ExternalLink className="size-3.5" /> Open Public Page
              </Link>
            </div>
          </div>
        </Reveal>
      </div>

      {/* 10-Point Readiness Checklist */}
      <Reveal delay={0.14} className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          10-Point Export Readiness Checklist
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {checklistItems.map((item, idx) => (
            <div key={idx} className="surface flex items-start gap-3.5 p-4">
              <div
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  item.status === "PASS"
                    ? "bg-success-soft text-success"
                    : item.status === "WARNING"
                      ? "bg-warning-soft text-warning"
                      : "bg-critical-soft text-critical"
                }`}
              >
                {item.status === "PASS" ? "✓" : "!"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      item.status === "PASS"
                        ? "bg-success-soft text-success"
                        : item.status === "WARNING"
                          ? "bg-warning-soft text-warning"
                          : "bg-critical-soft text-critical"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
