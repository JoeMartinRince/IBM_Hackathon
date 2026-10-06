import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/verifex/primitives";

export const Route = createFileRoute("/_app/customs")({
  head: () => seo("Customs Risk", "Customs Risk — VERIFEX AI export document verification."),
  component: () => (
    <div>
      <PageHeader eyebrow="VERIFEX AI" title="Customs Risk" sub="This screen is coming next in the demo build." />
      <div className="surface p-10 text-center text-muted-foreground">Content for this screen hasn't been built yet.</div>
    </div>
  ),
});
