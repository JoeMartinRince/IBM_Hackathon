import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Scale,
  Hash,
  FileWarning,
  ShieldCheck,
  Sparkles,
  Database,
  ShieldAlert,
} from "lucide-react";
import { Logo } from "@/components/verifex/AppShell";
import { ReadinessRing, StatusBadge } from "@/components/verifex/primitives";
import hero from "@/assets/hero-docs.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VERIFAI — Verify Every Export Before It Ships" },
      {
        name: "description",
        content:
          "AI-powered export document intelligence that finds inconsistencies, predicts customs queries and tells you when a shipment is ready.",
      },
      { property: "og:title", content: "VERIFAI — Verify Every Export Before It Ships" },
      { property: "og:description", content: "Don't just detect errors. Prevent export delays." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const floats = [
  {
    icon: Scale,
    label: "Quantity mismatch",
    sub: "Invoice vs Packing List",
    cls: "left-[-6%] top-[12%]",
    tone: "bg-critical-soft text-critical",
    d: 0.5,
  },
  {
    icon: Hash,
    label: "HS Code mismatch",
    sub: "030617 ≠ 030616",
    cls: "right-[-8%] top-[38%]",
    tone: "bg-warning-soft text-warning",
    d: 0.65,
  },
  {
    icon: FileWarning,
    label: "Certificate expiring",
    sub: "2 days of margin",
    cls: "left-[2%] bottom-[-4%]",
    tone: "bg-info-soft text-info",
    d: 0.8,
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        <Link
          to="/dashboard"
          className="press rounded-full border bg-card px-4 py-2 text-sm font-medium"
        >
          Open app
        </Link>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-8 lg:grid-cols-[1.05fr_1fr] lg:pt-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium"
          >
            <Sparkles className="size-3.5 text-primary" /> Don't just detect errors. Prevent export
            delays.
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 text-5xl font-semibold leading-[1.02] md:text-7xl"
          >
            Verify every export <span className="text-primary">before</span> it ships.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 max-w-lg text-lg text-muted-foreground"
          >
            AI-powered document intelligence that finds inconsistencies, predicts customs queries,
            and tells you when a shipment is truly ready.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link
              to="/verify"
              className="press inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
            >
              Start Verification <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/dashboard"
              className="press inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-ink-foreground"
            >
              <Play className="size-4" /> Explore Demo
            </Link>
          </motion.div>
          <div className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {[
              ["186", "docs processed"],
              ["72%", "fewer queries"],
              ["4.2h", "saved / shipment"],
            ].map(([v, l]) => (
              <div key={l}>
                <div className="num text-2xl font-semibold">{v}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="surface-ink relative p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                  Shipment
                </div>
                <div className="mt-1 font-mono text-lg">EXP-KL-2026-1042</div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-primary">
                  Seafood Export
                </div>
                <div className="text-xl font-semibold">Cochin → Dubai</div>
              </div>
              <ReadinessRing value={84} size={110} stroke={10} dark label="Readiness" />
            </div>
            <img
              src={hero}
              alt="Verified export documents and container"
              width={1024}
              height={1024}
              className="mx-auto -my-2 w-64 drop-shadow-2xl"
            />
            <div className="flex items-center justify-between rounded-2xl bg-ink-soft p-4">
              <StatusBadge status="review" />
              <span className="text-sm text-ink-muted">3 issues detected</span>
            </div>
          </motion.div>
          {floats.map((f) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
              transition={{
                delay: f.d,
                y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: f.d },
              }}
              className={`surface absolute hidden items-center gap-3 p-3 pr-5 shadow-[var(--shadow-float)] sm:flex ${f.cls}`}
            >
              <div className={`flex size-9 items-center justify-center rounded-xl ${f.tone}`}>
                <f.icon className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">1 {f.label}</div>
                <div className="text-xs text-muted-foreground">{f.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              i: Database,
              t: "Golden Record",
              d: "One verified source of truth built from every document in the shipment.",
            },
            {
              i: ShieldCheck,
              t: "Cross-document checks",
              d: "Quantities, weights, HS codes and parties compared field by field.",
            },
            {
              i: ShieldAlert,
              t: "Customs query simulator",
              d: "See the questions an officer would ask — before you submit.",
            },
          ].map((c) => (
            <div key={c.t} className="surface p-6">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <c.i className="size-5" />
              </div>
              <div className="mt-5 text-lg font-semibold">{c.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
