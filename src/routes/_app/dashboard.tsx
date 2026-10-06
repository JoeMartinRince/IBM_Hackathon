import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Ship, FileStack, AlertTriangle, CheckCircle2, Upload, ShieldAlert } from "lucide-react";
import { seo } from "@/lib/seo";
import { shipments } from "@/lib/data";
import { useDemo } from "@/lib/demo-store";
import { Reveal, ReadinessRing, ShipmentCard, StatTile, StatusBadge } from "@/components/verifex/primitives";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => seo("Overview", "Current state of your export documentation."),
  component: Dashboard,
});

function Dashboard() {
  const { readiness, openIssues, activeShipment } = useDemo();
  return (
    <div>
      <Reveal className="mb-6">
        <h1 className="text-3xl font-semibold md:text-4xl">Good evening, Alwin 👋</h1>
        <p className="mt-2 text-muted-foreground">Here's the current state of your export documentation.</p>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Reveal className="surface-ink p-6 md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">Active Shipment</div>
              <div className="mt-1 font-mono text-xl md:text-2xl">{activeShipment.id}</div>
              <div className="mt-4 text-2xl font-semibold">{activeShipment.commodity}</div>
              <div className="text-ink-muted">{activeShipment.from} → {activeShipment.to}</div>
              <div className="mt-5 flex items-center gap-3">
                <StatusBadge status={readiness >= 100 ? "ready" : "review"} />
                <span className="text-sm text-ink-muted">{openIssues} open issues</span>
              </div>
            </div>
            <ReadinessRing value={readiness} size={150} dark label="Readiness" />
          </div>
          <Link to={readiness >= 100 ? "/readiness" : "/results"} className="press mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)]">
            {readiness >= 100 ? "View Readiness" : "Continue Verification"} <ArrowRight className="size-4" />
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-4">
          <Link to="/verify" className="surface press flex flex-col justify-between p-5 hover:shadow-[var(--shadow-float)]">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Upload className="size-5" /></div>
            <div className="mt-6 font-semibold leading-tight">New<br />Verification</div>
          </Link>
          <Link to="/customs" className="surface press flex flex-col justify-between p-5 hover:shadow-[var(--shadow-float)]">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-ink text-ink-foreground"><ShieldAlert className="size-5" /></div>
            <div className="mt-6 font-semibold leading-tight">Customs<br />Risk</div>
          </Link>
          <Link to="/assistant" className="surface press col-span-2 flex items-center justify-between p-5">
            <div><div className="eyebrow">Ask your shipment</div><div className="mt-1 font-medium">"What should I fix first?"</div></div>
            <ArrowRight className="size-5 text-primary" />
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Active Shipments" value={24} icon={Ship} i={0} />
        <StatTile label="Docs Processed" value={186} icon={FileStack} i={1} />
        <StatTile label="Issues Detected" value={17} icon={AlertTriangle} i={2} />
        <StatTile label="Ready to Export" value={82} suffix="%" icon={CheckCircle2} i={3} />
      </div>

      <div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent shipments</h2>
        <Link to="/shipments" className="text-sm text-muted-foreground hover:text-foreground">See all</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shipments.slice(0, 3).map((s, i) => <ShipmentCard key={s.id} s={s} i={i} readiness={s.id === "EXP-KL-2026-1042" ? readiness : undefined} />)}
      </div>
    </div>
  );
}
