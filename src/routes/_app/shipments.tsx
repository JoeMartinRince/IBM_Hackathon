import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  Ship,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal, StatusBadge, ProgressBar, CommodityThumb } from "@/components/verifex/primitives";
import { shipments, type Shipment } from "@/lib/data";
import { NewConsignmentModal } from "@/components/verifex/NewConsignmentModal";

export const Route = createFileRoute("/_app/shipments")({
  head: () => seo("Shipments", "Manage and inspect export consignments and verification status."),
  component: ShipmentsPage,
});

function ShipmentsPage() {
  const navigate = useNavigate();
  const { setActiveShipmentId, activeShipmentId, readiness } = useDemo();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filtered = shipments.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.commodity.toLowerCase().includes(search.toLowerCase()) ||
      s.exporter.toLowerCase().includes(search.toLowerCase()) ||
      s.consignee.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === "all" || s.category === categoryFilter;
    const matchesStat = statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesCat && matchesStat;
  });

  const handleSelectShipment = (id: string) => {
    setActiveShipmentId(id);
    navigate({ to: "/results" });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Export Consignment Registry"
        title="Shipments Directory"
        sub="Search and monitor verification readiness across all maritime consignments departing Cochin and Vizhinjam ports."
        right={
          <button
            onClick={() => setShowCreateModal(true)}
            className="press inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-105"
          >
            <Plus className="size-4" /> New Export Consignment
          </button>
        }
      />

      {/* Search and Filters Bar */}
      <Reveal className="surface p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Shipment ID, Commodity, Exporter, Consignee…"
            className="h-11 w-full rounded-full border bg-card pl-11 pr-4 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 rounded-full border bg-card px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Commodities</option>
            <option value="Seafood">Seafood</option>
            <option value="Spices">Spices</option>
            <option value="Rubber">Rubber</option>
            <option value="Agriculture">Agriculture</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-full border bg-card px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="ready">Ready (100%)</option>
            <option value="review">Review Required</option>
            <option value="critical">Critical Review</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Reveal>

      {/* Shipment Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s, idx) => {
          const r = s.id === "EXP-KL-2026-1042" ? readiness : s.readiness;
          const status = r >= 100 && s.status !== "archived" ? "ready" : s.status;
          const isActive = s.id === activeShipmentId;

          return (
            <Reveal key={s.id} delay={idx * 0.04}>
              <div
                onClick={() => handleSelectShipment(s.id)}
                className={`surface press cursor-pointer p-5 transition-all hover:shadow-[var(--shadow-float)] ${
                  isActive ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <CommodityThumb category={s.category} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{s.id}</span>
                      {isActive && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[10px] font-bold text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="truncate font-semibold text-base mt-0.5">{s.commodity}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.from} → {s.to}
                    </div>
                  </div>
                  <div className="num text-2xl font-semibold">{r}%</div>
                </div>

                <ProgressBar value={r} className="mt-4" />

                <div className="mt-4 flex items-center justify-between text-xs">
                  <StatusBadge status={status} />
                  <span className="flex items-center gap-1 text-muted-foreground">
                    {s.issues > 0 && r < 100 && (
                      <>
                        <AlertTriangle className="size-3 text-warning" /> {s.issues} issues ·{" "}
                      </>
                    )}
                    {s.updated}
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* New Export Consignment Modal */}
      <NewConsignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          navigate({ to: "/dashboard" });
        }}
      />
    </div>
  );
}
