import type { ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid, Ship, ScanSearch, AlertTriangle, Database, ShieldAlert, FileText, BarChart3,
  Settings, Bell, Search, Sparkles, Home, User, Brain, ShieldCheck, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/demo-store";
import { notifications } from "@/lib/data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navItems = [
  { to: "/dashboard", key: "overview", label: "Overview", icon: LayoutGrid },
  { to: "/shipments", key: "shipments", label: "Shipments", icon: Ship },
  { to: "/verify", key: "verify", label: "Verify Documents", icon: ScanSearch },
  { to: "/issues", key: "discrepancies", label: "Discrepancies", icon: AlertTriangle },
  { to: "/golden-record", key: "goldenRecord", label: "Golden Record", icon: Database },
  { to: "/customs", key: "customsRisk", label: "Customs Risk", icon: ShieldAlert },
  { to: "/intelligence", key: "aiIntelligence", label: "AI Intelligence", icon: Brain },
  { to: "/assistant", key: "askShipment", label: "Ask Shipment", icon: Sparkles },
  { to: "/report", key: "reports", label: "Reports", icon: FileText },
  { to: "/insights", key: "insights", label: "Insights", icon: BarChart3 },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-ink text-ink-foreground">
        <ShieldCheck className="size-5 text-primary" />
      </div>
      {!compact && <span className="font-semibold tracking-tight">VERIF<span className="text-primary">AI</span></span>}
    </Link>
  );
}

function Sidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useDemo();

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-sidebar p-3 md:flex md:w-[76px] lg:w-64 lg:p-4">
      <div className="flex h-12 items-center px-1.5 lg:px-2">
        <span className="lg:hidden"><Logo compact /></span>
        <span className="hidden lg:block"><Logo /></span>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto">
        {navItems.map((n) => {
          const active = path.startsWith(n.to);
          const translatedLabel = t(n.key) || n.label;
          return (
            <Link
              key={n.to}
              to={n.to}
              title={translatedLabel}
              className={cn(
                "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors justify-center lg:justify-start",
                active ? "text-ink-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl bg-ink"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <n.icon className={cn("relative size-[18px]", active && "text-primary")} />
              <span className="relative hidden lg:inline truncate">{translatedLabel}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t pt-3">
        <Link
          to="/settings"
          title="Settings"
          className="flex items-center justify-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent lg:justify-start"
        >
          <Settings className="size-[18px]" /><span className="hidden lg:inline">{t("settings")}</span>
        </Link>
        <Link to="/settings" className="flex items-center justify-center gap-3 rounded-2xl p-2 hover:bg-sidebar-accent lg:justify-start">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">AJ</div>
          <div className="hidden lg:block">
            <div className="text-sm font-medium">Alwin Joseph</div>
            <div className="text-xs text-muted-foreground">Documentation Lead</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function TopBar() {
  const { setNotifOpen, lang, setLang, mode, setMode } = useDemo();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate({ to: "/shipments", search: { search: query.trim() } as any });
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:px-8">
      <div className="md:hidden"><Logo compact /></div>
      <form onSubmit={handleSearch} className="relative hidden flex-1 sm:block md:max-w-md">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shipments, documents, HS codes…"
          className="h-11 w-full rounded-full border bg-card pl-11 pr-4 text-xs outline-none focus:ring-2 focus:ring-ring"
        />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setMode(mode === "DEMO" ? "LIVE" : "DEMO")}
          title="Click to toggle between DEMO MODE and LIVE MODE"
          className={cn(
            "press hidden rounded-full px-3 py-1.5 text-xs font-bold transition-all sm:inline-flex items-center gap-1.5",
            mode === "DEMO"
              ? "bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground"
              : "bg-ink text-ink-foreground hover:brightness-125"
          )}
        >
          <Zap className="size-3" />
          {mode === "DEMO" ? "Demo Mode" : "Live Mode"}
        </button>
        <div className="flex rounded-full border bg-card p-1 text-xs">
          {(["EN", "ML", "HI"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={cn("rounded-full px-2.5 py-1 font-medium transition-colors", lang === l ? "bg-ink text-ink-foreground" : "text-muted-foreground")}
            >
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => setNotifOpen(true)} aria-label="Notifications" className="press relative flex size-11 items-center justify-center rounded-full border bg-card">
          <Bell className="size-[18px]" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-card" />
        </button>
      </div>
    </header>
  );
}

function MobileNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/shipments", label: "Shipments", icon: Ship },
    { to: "/verify", label: "Verify", icon: ScanSearch, center: true },
    { to: "/insights", label: "Insights", icon: BarChart3 },
    { to: "/settings", label: "Profile", icon: User },
  ] as const;
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full bg-ink px-2 py-2 text-ink-foreground shadow-[var(--shadow-float)] md:hidden">
      {items.map((it) => {
        const active = path.startsWith(it.to);
        if ("center" in it) return (
          <Link key={it.to} to={it.to} aria-label="Verify" className="press -mt-7 flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)] ring-4 ring-background">
            <it.icon className="size-6" />
          </Link>
        );
        return (
          <Link key={it.to} to={it.to} className={cn("flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]", active ? "text-ink-foreground" : "text-ink-muted")}>
            <it.icon className={cn("size-5", active && "text-primary")} />{it.label}
          </Link>
        );
      })}
    </nav>
  );
}

const toneDot = { critical: "bg-critical", warning: "bg-warning", success: "bg-success" };
function NotificationDrawer() {
  const { notifOpen, setNotifOpen, openIssues, activeShipment } = useDemo();
  return (
    <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
      <SheetContent className="w-full border-l-0 bg-background p-0 sm:max-w-sm">
        <SheetHeader className="p-6 pb-2"><SheetTitle className="text-2xl">Notifications</SheetTitle></SheetHeader>
        <div className="flex flex-col gap-3 p-4">
          <div className="surface p-4 flex gap-3 border-l-4 border-l-primary">
            <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{openIssues} open issues detected</div>
              <div className="text-xs text-muted-foreground">{activeShipment.id} · {activeShipment.commodity}</div>
            </div>
            <span className="text-xs text-muted-foreground">Now</span>
          </div>
          {notifications.map((n, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="surface flex gap-3 p-4">
              <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", toneDot[n.tone])} />
              <div className="flex-1"><div className="text-sm font-medium">{n.title}</div><div className="text-xs text-muted-foreground">{n.sub}</div></div>
              <span className="text-xs text-muted-foreground">{n.time}</span>
            </motion.div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <TopBar />
        <main className="mx-auto max-w-6xl px-4 pb-32 pt-2 md:px-8 md:pb-16">{children}</main>
      </div>
      <MobileNav />
      <NotificationDrawer />
    </div>
  );
}
