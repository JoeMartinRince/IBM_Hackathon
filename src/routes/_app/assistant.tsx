import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  FileText,
  CornerDownLeft,
} from "lucide-react";
import { seo } from "@/lib/seo";
import { useDemo } from "@/lib/demo-store";
import { PageHeader, Reveal } from "@/components/verifex/primitives";
import { assistantAnswers } from "@/lib/data";
import { assistantService } from "@/lib/services/api";

export const Route = createFileRoute("/_app/assistant")({
  head: () => seo("Ask Shipment", "Grounded AI trade intelligence assistant for your export file."),
  component: AssistantPage,
});

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

function AssistantPage() {
  const { activeShipmentId, activeShipment } = useDemo();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am your VERIFAI export intelligence assistant. I am grounded in verified data for **${activeShipment.id}** (${activeShipment.commodity}). Ask me anything about declared quantities, tariff codes, discrepancies, or customs clearance steps.`,
      citations: ["Verified Consignment Dossier", "Consensus Golden Record"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chips = [
    "How many cartons are in this shipment?",
    "Which documents contain mismatches?",
    "What should I fix first?",
    "Why is this shipment not ready?",
    "What is the highest-risk issue?",
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await assistantService.askQuestion(activeShipmentId, q);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, citations: res.citations },
      ]);
    } catch {
      // Local fallback
      const foundAnswer = assistantAnswers[q] || `Based on the verified Golden Record for ${activeShipmentId}: The commodity is ${activeShipment.commodity} with a declared value of ${activeShipment.value}. Please review active discrepancies on the Results page.`;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: foundAnswer,
          citations: ["Commercial Invoice", "Packing List", "Shipping Bill"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Grounded Export Intelligence"
        title="Ask Your Shipment"
        sub="Inquire directly about quantities, weights, tariff lines, and customs query predictions. Answers are strictly grounded in your uploaded trade documents."
      />

      {/* Suggested Prompt Chips */}
      <Reveal className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleSend(chip)}
            className="press rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
          >
            "{chip}"
          </button>
        ))}
      </Reveal>

      {/* Chat Messages Log */}
      <Reveal delay={0.08} className="surface flex flex-col h-[520px] p-4 sm:p-6 justify-between">
        <div className="overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-ink text-ink-foreground">
                  <Sparkles className="size-4 text-primary" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 max-w-xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-sm"
                    : "bg-muted/40 border text-foreground rounded-tl-sm space-y-2.5"
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />

                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-foreground">Verified Sources:</span>
                    {m.citations.map((c, i) => (
                      <span key={i} className="rounded-md bg-card px-2 py-0.5 border font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary font-bold text-xs">
                  AJ
                </div>
              )}
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-muted-foreground animate-pulse">
              <Sparkles className="size-4 text-primary" /> Analyzing trade documents…
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 flex items-center gap-2 border-t pt-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${activeShipment.id} (e.g., "Why does the packing list differ?")`}
            className="h-12 flex-1 rounded-full border bg-card px-5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="press flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-ink-foreground shadow-sm hover:brightness-125 disabled:opacity-40"
          >
            <Send className="size-4 text-primary" />
          </button>
        </form>
      </Reveal>
    </div>
  );
}
