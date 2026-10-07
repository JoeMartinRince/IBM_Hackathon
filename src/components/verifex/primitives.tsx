import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion, animate } from "framer-motion";
import { ArrowRight, Fish, Leaf, CircleDot, Sprout, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shipment, ShipmentStatus, Severity, FieldStatus } from "@/lib/data";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({
  to,
  suffix = "",
  duration = 1.1,
}: {
  to: number;
  suffix?: string | undefined;
  duration?: number;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, to, { duration, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [to, duration]);
  return (
    <>
      {v.toLocaleString()}
      {suffix}
    </>
  );
}

export function PageHeader({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow?: string;
  title: ReactNode;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <Reveal className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
        {sub && <p className="mt-2 max-w-xl text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </Reveal>
  );
}

const statusMap: Record<ShipmentStatus, { label: string; cls: string }> = {
  ready: { label: "Ready", cls: "bg-success-soft text-success" },
  review: { label: "Review Required", cls: "bg-warning-soft text-warning" },
  critical: { label: "Critical Review", cls: "bg-critical-soft text-critical" },
  archived: { label: "Archived", cls: "bg-muted text-muted-foreground" },
};
export function StatusBadge({ status, className }: { status: ShipmentStatus; className?: string }) {
  const s = statusMap[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        s.cls,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

const sevMap: Record<Severity | FieldStatus, string> = {
  critical: "bg-critical-soft text-critical",
  major: "bg-warning-soft text-warning",
  warning: "bg-info-soft text-info",
  verified: "bg-success-soft text-success",
};
export function Chip({
  tone,
  children,
  className,
}: {
  tone: Severity | FieldStatus;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        sevMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ReadinessRing({
  value,
  size = 140,
  stroke = 12,
  dark = false,
  label = "Ready",
}: {
  value: number;
  size?: number;
  stroke?: number;
  dark?: boolean;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color =
    value >= 100 ? "var(--success)" : value >= 80 ? "var(--primary)" : "var(--critical)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke={dark ? "oklch(1 0 0 / 0.1)" : "var(--muted)"}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (value / 100) * c }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num font-semibold" style={{ fontSize: size * 0.24 }}>
          <CountUp to={value} suffix="%" />
        </span>
        <span
          className={cn(
            "text-[10px] uppercase tracking-widest",
            dark ? "text-ink-muted" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const color = value >= 100 ? "bg-success" : value >= 80 ? "bg-primary" : "bg-critical";
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}

const thumbIcon = { Seafood: Fish, Spices: Leaf, Rubber: CircleDot, Agriculture: Sprout };
const thumbCls = {
  Seafood: "bg-primary-soft text-primary",
  Spices: "bg-success-soft text-success",
  Rubber: "bg-ink text-ink-foreground",
  Agriculture: "bg-warning-soft text-warning",
};
export function CommodityThumb({
  category,
  className,
}: {
  category: Shipment["category"];
  className?: string;
}) {
  const I = thumbIcon[category];
  return (
    <div
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-2xl",
        thumbCls[category],
        className,
      )}
    >
      <I className="size-5" />
    </div>
  );
}

export function ShipmentCard({
  s,
  readiness,
  i = 0,
}: {
  s: Shipment;
  readiness?: number | undefined;
  i?: number;
}) {
  const r = readiness ?? s.readiness;
  const status = r >= 100 && s.status !== "archived" ? "ready" : s.status;
  return (
    <Reveal delay={i * 0.05}>
      <Link
        to="/results"
        className="surface press group block p-5 hover:shadow-[var(--shadow-float)]"
      >
        <div className="flex items-start gap-4">
          <CommodityThumb category={s.category} />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-xs text-muted-foreground">{s.id}</div>
            <div className="truncate font-semibold">{s.commodity}</div>
            <div className="text-sm text-muted-foreground">
              {s.from} → {s.to}
            </div>
          </div>
          <div className="num text-2xl font-semibold">{r}%</div>
        </div>
        <ProgressBar value={r} className="mt-4" />
        <div className="mt-4 flex items-center justify-between">
          <StatusBadge status={status} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {s.issues > 0 && r < 100 && (
              <>
                <AlertTriangle className="size-3" /> {s.issues} issues ·{" "}
              </>
            )}
            {s.updated}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export function StatTile({
  label,
  value,
  suffix,
  icon: I,
  i = 0,
}: {
  label: string;
  value: number;
  suffix?: string | undefined;
  icon: React.ComponentType<{ className?: string }>;
  i?: number;
}) {
  return (
    <Reveal delay={0.1 + i * 0.05} className="surface p-5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <div className="flex size-8 items-center justify-center rounded-full bg-muted">
          <I className="size-4" />
        </div>
      </div>
      <div className="num mt-3 text-4xl font-semibold">
        <CountUp to={value} suffix={suffix} />
      </div>
    </Reveal>
  );
}
