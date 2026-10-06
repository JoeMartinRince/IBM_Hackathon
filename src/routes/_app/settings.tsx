import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  User,
  Shield,
  Sliders,
  Globe,
  RotateCcw,
  CheckCircle2,
  Building,
  Mail,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import type { Language } from "@/lib/i18n";

export const Route = createFileRoute("/_app/settings")({
  head: () => seo("Settings", "Manage profile, organization, roles, and execution mode."),
  component: SettingsPage,
});

function SettingsPage() {
  const { lang, setLang, mode, setMode, reset } = useDemo();
  const [role, setRole] = useState("Documentation Team");
  const [name, setName] = useState("Alwin Joseph");
  const [org, setOrg] = useState("Malabar Marine Products Consortium, Cochin");

  const roles = [
    "Exporter",
    "Customs Broker",
    "Freight Forwarder",
    "Documentation Team",
    "Government/Admin",
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile settings updated successfully!");
  };

  const handleReset = () => {
    reset();
    toast.info("Demo state reset to original baseline!");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Preferences & Configuration"
        title="Settings & Profile"
        sub="Manage user roles, operational modes, multilingual preferences, and trade documentation parameters."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <Reveal className="surface p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4 border-b pb-6">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-primary text-xl font-bold text-primary-foreground">
              AJ
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{name}</h2>
              <div className="text-sm text-muted-foreground">{role} · {org}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Mail className="size-3.5" /> alwinjosegeorge2028@cs.sjcetpalai.ac.in
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border bg-card px-4 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border bg-card px-4 text-xs outline-none focus:ring-2 focus:ring-ring"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-muted-foreground">Organization / Export House</label>
              <input
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border bg-card px-4 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </Reveal>

        {/* Execution Mode (Demo vs Live) */}
        <Reveal delay={0.08} className="surface p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Zap className="size-5 text-primary" /> Application Execution Mode
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Switch between offline instant hackathon DEMO MODE and real LIVE MODE backend pipeline.
              </p>
            </div>

            <div className="flex rounded-full border bg-card p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode("DEMO")}
                className={`rounded-full px-4 py-1.5 font-bold transition-colors ${
                  mode === "DEMO" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                DEMO MODE
              </button>
              <button
                type="button"
                onClick={() => setMode("LIVE")}
                className={`rounded-full px-4 py-1.5 font-bold transition-colors ${
                  mode === "LIVE" ? "bg-ink text-ink-foreground" : "text-muted-foreground"
                }`}
              >
                LIVE MODE
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4 text-xs space-y-2">
            <div className="font-semibold text-foreground">
              Current Mode: <span className="text-primary font-bold">{mode}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {mode === "DEMO"
                ? "DEMO MODE runs with high-fidelity pre-computed Kerala trade documents, instant validation, and zero external cloud costs. Perfect for presentation to hackathon judges."
                : "LIVE MODE connects to the Express API on port 3001, handles actual file ingestion with Multer, executes multi-format text parsing, and persists records in PostgreSQL."}
            </p>
          </div>
        </Reveal>

        {/* Language Selection */}
        <Reveal delay={0.14} className="surface p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Globe className="size-5 text-primary" /> User Interface Language
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Support for English, Malayalam (മലയാളം), and Hindi (हिंदी).
              </p>
            </div>

            <div className="flex rounded-full border bg-card p-1 text-xs">
              {(["EN", "ML", "HI"] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-full px-4 py-1.5 font-bold transition-colors ${
                    lang === l ? "bg-ink text-ink-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l === "EN" ? "English" : l === "ML" ? "മലയാളം" : "हिंदी"}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="press inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 text-xs font-semibold hover:border-critical hover:text-critical"
          >
            <RotateCcw className="size-3.5" /> Reset Demo State
          </button>

          <button
            type="submit"
            className="press rounded-full bg-primary px-8 py-3 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
