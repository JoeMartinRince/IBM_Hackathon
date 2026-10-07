import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { BarChart3, Anchor, Clock, TrendingUp, FileCheck, ShieldAlert } from "lucide-react";
import { seo } from "@/lib/seo";
import { PageHeader, Reveal, StatTile } from "@/components/verifex/primitives";
import { insightsData } from "@/lib/data";

export const Route = createFileRoute("/_app/insights")({
  head: () =>
    seo(
      "Kerala Export Intelligence",
      "Aggregated compliance trends for Cochin and Vizhinjam ports.",
    ),
  component: InsightsPage,
});

const PIE_COLORS = [
  "oklch(0.68 0.19 40)",
  "oklch(0.6 0.15 152)",
  "oklch(0.205 0 0)",
  "oklch(0.72 0.16 70)",
  "oklch(0.58 0.14 250)",
];

function InsightsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Kerala Maritime Intelligence"
        title="Kerala Export Intelligence"
        sub="Aggregated trade documentation benchmarks and customs clearance metrics across Cochin Sea Port and Vizhinjam International Transshipment Terminal."
      />

      {/* Top Level Metric Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Docs Inspected" value={186} icon={FileCheck} i={0} />
        <StatTile label="Time Saved / Ship" value={4.2} suffix="h" icon={Clock} i={1} />
        <StatTile label="Cochin Sea Readiness" value={81} suffix="%" icon={Anchor} i={2} />
        <StatTile label="Vizhinjam Transshipment" value={88} suffix="%" icon={TrendingUp} i={3} />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Discrepancy Breakdown */}
        <Reveal className="surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-semibold text-lg">Top Documentation Error Types</h3>
              <p className="text-xs text-muted-foreground">
                Historical distribution across Kerala export filings
              </p>
            </div>
            <ShieldAlert className="size-5 text-primary" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={insightsData.issues}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.68 0.19 40)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Reveal>

        {/* Commodity Distribution */}
        <Reveal delay={0.08} className="surface p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-semibold text-lg">Commodity Volume Distribution</h3>
              <p className="text-xs text-muted-foreground">
                Seafood, Spices, Rubber, and Agro exports
              </p>
            </div>
            <BarChart3 className="size-5 text-primary" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={insightsData.commodities}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {insightsData.commodities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Reveal>

        {/* Readiness Trend Over Months */}
        <Reveal delay={0.14} className="surface p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-semibold text-lg">First-Pass Export Readiness Trend (2026)</h3>
              <p className="text-xs text-muted-foreground">
                Percentage of shipments cleared without port customs queries
              </p>
            </div>
            <TrendingUp className="size-5 text-success" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={insightsData.readiness}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="m" tick={{ fontSize: 12 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="oklch(0.6 0.15 152)"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "oklch(0.6 0.15 152)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
