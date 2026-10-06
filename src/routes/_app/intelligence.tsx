import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";
import { PageHeader } from "@/components/verifex/primitives";

export const Route = createFileRoute("/_app/intelligence")({
  head: () => seo("AI Intelligence", "AI Intelligence — VERIFEX AI export document verification."),
  component: () => (
    <div>
      <PageHeader eyebrow="VERIFEX AI" title="AI Intelligence" sub="This screen is coming next in the demo build." />
      <div className="surface p-10 text-center text-muted-foreground">Content for this screen hasn't been built yet.</div>
    </div>
  ),
});
