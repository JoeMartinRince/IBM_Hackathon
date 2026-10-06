import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/verifex/primitives";

export const Route = createFileRoute("/_app/golden-record")({
  head: () => seo("Golden Record", "Golden Record — VERIFEX AI export document verification."),
  component: () => (
    <div>
      <PageHeader eyebrow="VERIFEX AI" title="Golden Record" sub="This screen is coming next in the demo build." />
      <div className="surface p-10 text-center text-muted-foreground">Content for this screen hasn't been built yet.</div>
    </div>
  ),
});
