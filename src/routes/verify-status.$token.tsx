import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Anchor,
  FileCheck,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { MockQR } from "@/components/verifex/QRCode";

export const Route = createFileRoute("/verify-status/$token")({
  head: () => seo("Export Verification Authenticity", "Public verification portal for verified export consignments."),
  component: PublicVerifyStatusPage,
});

function PublicVerifyStatusPage() {
  const { token } = Route.useParams();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-ink text-ink-foreground">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <span className="font-semibold tracking-tight text-lg">
              VERIF<span className="text-primary">AI</span>
            </span>
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
            <CheckCircle2 className="size-3.5" /> Authenticated
          </span>
        </div>

        {/* Main Certificate Card */}
        <div className="surface p-8 space-y-6 border-t-4 border-t-primary shadow-[var(--shadow-float)]">
          <div className="text-center space-y-2 border-b pb-6">
            <div className="eyebrow text-primary">Official Trade Verification</div>
            <h1 className="text-2xl font-bold tracking-tight">Export Clearance Authenticity</h1>
            <p className="text-xs text-muted-foreground">
              Verified by VERIFAI Engine · Kerala Maritime Trade Authority
            </p>
          </div>

          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="rounded-3xl bg-muted/40 p-3 ring-1 ring-border">
              <MockQR seed={token} size={130} />
            </div>
            <div className="font-mono text-xs text-muted-foreground font-semibold">{token}</div>
          </div>

          {/* Verification Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl border bg-muted/20 p-3.5">
              <div className="text-muted-foreground uppercase text-[10px] font-semibold">Shipment Ref</div>
              <div className="font-mono font-bold text-sm text-foreground mt-0.5">EXP-KL-2026-1042</div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-3.5">
              <div className="text-muted-foreground uppercase text-[10px] font-semibold">Readiness Score</div>
              <div className="font-mono font-bold text-sm text-success mt-0.5">100% READY</div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-3.5">
              <div className="text-muted-foreground uppercase text-[10px] font-semibold">Commodity</div>
              <div className="font-semibold text-foreground mt-0.5">Frozen Shrimp 21/25</div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-3.5">
              <div className="text-muted-foreground uppercase text-[10px] font-semibold">Origin Port</div>
              <div className="font-semibold text-foreground mt-0.5">Cochin (INCOK)</div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-3.5 col-span-2">
              <div className="text-muted-foreground uppercase text-[10px] font-semibold">Registered Exporter</div>
              <div className="font-semibold text-foreground mt-0.5">Malabar Ocean Foods Pvt Ltd, Cochin</div>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-3.5 col-span-2">
              <div className="text-muted-foreground uppercase text-[10px] font-semibold">Destination Port</div>
              <div className="font-semibold text-foreground mt-0.5">Jebel Ali Port, Dubai, UAE</div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground flex items-start gap-2.5">
            <Lock className="size-4 shrink-0 mt-0.5 text-foreground" />
            <div>
              <strong>Privacy Protection Notice:</strong> In accordance with maritime trade security regulations, commercial unit prices, total contract value, and banking parameters are redacted from public token verification.
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/dashboard"
              className="press inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" /> Return to VERIFAI Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
