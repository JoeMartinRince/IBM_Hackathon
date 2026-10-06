import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Mail, Lock, ArrowRight, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => seo("Login", "Sign in to VERIFEX AI export document verification system."),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("alwinjosegeorge2028@cs.sjcetpalai.ac.in");
  const [password, setPassword] = useState("••••••••••••");
  const [role, setRole] = useState("Documentation Team");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Welcome back, ${email.split("@")[0]}! Signed in as ${role}.`);
    navigate({ to: "/dashboard" });
  };

  const fillDemo = (demoRole: string) => {
    setRole(demoRole);
    toast.info(`Switched credentials to ${demoRole}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-ink text-ink-foreground">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            VERIFEX<span className="text-primary"> AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Sign in to your export workspace</h2>
        <p className="text-xs text-muted-foreground">
          KeralAI Hackathon 2026 · Challenge 3: Export Document Verification System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="surface p-8 space-y-6 shadow-[var(--shadow-float)]">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-muted-foreground">Email Address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-2xl border bg-card pl-10 pr-4 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-2xl border bg-card pl-10 pr-4 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground">Select Operating Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 h-11 w-full rounded-2xl border bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-ring font-medium"
              >
                <option value="Documentation Team">Documentation Team</option>
                <option value="Exporter">Exporter</option>
                <option value="Customs Broker">Customs Broker</option>
                <option value="Freight Forwarder">Freight Forwarder</option>
                <option value="Government/Admin">Government / Port Authority</option>
              </select>
            </div>

            <button
              type="submit"
              className="press mt-2 w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
            >
              Sign In to Workspace <ArrowRight className="size-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="border-t pt-4 space-y-2 text-center">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              1-Click Demo Profiles
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {["Documentation Team", "Customs Broker", "Government/Admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => fillDemo(r)}
                  className="rounded-full border bg-muted/40 px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
