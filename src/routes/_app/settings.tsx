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
  Key,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { assistantService } from "@/lib/services/api";
import type { Language } from "@/lib/i18n";

export const Route = createFileRoute("/_app/settings")({
  head: () => seo("Settings", "Manage profile, organization, roles, Gemini AI, and execution mode."),
  component: SettingsPage,
});

function SettingsPage() {
  const { lang, setLang, mode, setMode, reset, geminiApiKey, setGeminiApiKey } = useDemo();
  const [role, setRole] = useState("Documentation Team");
  const [name, setName] = useState("Alwin Joseph");
  const [org, setOrg] = useState("Malabar Marine Products Consortium, Cochin");

  const [tempKey, setTempKey] = useState(geminiApiKey);
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ valid: boolean; message: string; model?: string } | null>(null);

  const roles = [
    "Exporter",
    "Customs Broker",
    "Freight Forwarder",
    "Documentation Team",
    "Government/Admin",
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempKey.trim() !== geminiApiKey) {
      setGeminiApiKey(tempKey.trim());
    }
    toast.success("Profile and settings updated successfully!");
  };

  const handleTestKey = async () => {
    if (!tempKey.trim()) return;
    setTestingKey(true);
    setKeyTestResult(null);
    try {
      const res = await assistantService.testGeminiKey(tempKey.trim());
      if (res.valid) {
        setKeyTestResult({ valid: true, message: res.message || "Key verified successfully!", model: res.model });
        toast.success("Gemini API key is active and responding!");
      } else {
        setKeyTestResult({ valid: false, message: res.message || "Failed to validate key" });
        toast.error(res.message || "Key validation failed");
      }
    } catch (err: any) {
      setKeyTestResult({ valid: false, message: err.message || "Network error connecting to API" });
      toast.error(err.message || "Network error connecting to Google AI");
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveKey = () => {
    setGeminiApiKey(tempKey.trim());
    toast.success("Gemini API Key saved to your browser session!");
  };

  const handleClearKey = () => {
    setTempKey("");
    setGeminiApiKey("");
    setKeyTestResult(null);
    toast.info("Gemini API Key cleared. VERIFAI reverted to Deterministic Trade Engine.");
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
        sub="Manage user roles, operational modes, Google Gemini AI integration, multilingual preferences, and trade documentation parameters."
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
        <Reveal delay={0.06} className="surface p-6 sm:p-8 space-y-4">
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

        {/* Google Gemini AI Configuration */}
        <Reveal delay={0.1} className="surface p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> Google Gemini API Configuration
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Connect your Google Gemini key for live generative reasoning grounded in export documents.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  geminiApiKey
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                }`}
              >
                <span className={`size-2 rounded-full ${geminiApiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                {geminiApiKey ? "Live Gemini Active" : "Deterministic Engine"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Key className="size-3.5 text-primary" /> Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                >
                  Get free key from Google AI Studio <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    value={tempKey}
                    onChange={(e) => {
                      setTempKey(e.target.value);
                      setKeyTestResult(null);
                    }}
                    placeholder="AIzaSy..."
                    className="h-11 w-full rounded-2xl border bg-card px-4 pr-10 text-xs font-mono outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!tempKey.trim() || testingKey}
                    onClick={handleTestKey}
                    className="press inline-flex items-center gap-1.5 rounded-full border bg-card px-4 h-11 text-xs font-semibold hover:border-primary disabled:opacity-40"
                  >
                    {testingKey ? (
                      <RefreshCw className="size-3.5 animate-spin text-primary" />
                    ) : (
                      <CheckCircle2 className="size-3.5 text-primary" />
                    )}
                    {testingKey ? "Testing…" : "Test Key"}
                  </button>

                  <button
                    type="button"
                    disabled={tempKey === geminiApiKey}
                    onClick={handleSaveKey}
                    className="press rounded-full bg-primary px-5 h-11 text-xs font-bold text-primary-foreground hover:brightness-105 disabled:opacity-40"
                  >
                    Save Key
                  </button>

                  {geminiApiKey && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="press rounded-full border border-critical/30 bg-card px-3.5 h-11 text-xs font-semibold text-critical hover:bg-critical/10"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {keyTestResult && (
              <div
                className={`rounded-2xl p-3.5 text-xs border flex items-start gap-2.5 ${
                  keyTestResult.valid
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                    : "bg-critical/10 border-critical/20 text-critical"
                }`}
              >
                {keyTestResult.valid ? (
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <RotateCcw className="size-4 shrink-0 mt-0.5 text-critical" />
                )}
                <div>
                  <div className="font-semibold">{keyTestResult.message}</div>
                  {keyTestResult.model && (
                    <div className="text-[11px] opacity-80 mt-0.5 font-mono">
                      Connected Model: {keyTestResult.model}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-2xl border bg-muted/20 p-4 text-xs space-y-2">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="size-3.5 text-primary" /> How Gemini Works in VERIFAI
              </div>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside leading-relaxed text-[11px]">
                <li>
                  <strong>Document Lineage Grounded:</strong> Prompts are injected with the 5 core documents (Commercial Invoice, Packing List, Shipping Bill, Purchase Order, Quality Certificate) and their respective team ownership (Finance, Warehouse, Customs Broker).
                </li>
                <li>
                  <strong>Consequence Matrix:</strong> Grounded in statutory penalties (Section 111(m)), short-shipment claims, freight disputes, and LC amendment risks.
                </li>
                <li>
                  <strong>Zero-Config Offline Fallback:</strong> If no API key is provided, VERIFAI automatically runs its deterministic trade engine with pre-computed Golden Record answers.
                </li>
              </ul>
            </div>
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
