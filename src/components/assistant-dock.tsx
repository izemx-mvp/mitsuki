import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AiBackground } from "@/components/ai-background";
import { AiThinking } from "@/components/ai-thinking";
import { Delta } from "@/components/bits";
import { AreaTrend } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { aiService } from "@/services/aiService";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  metrics?: { label: string; value: string; delta?: number }[] | undefined;
  chart?: { date: string; value: number }[] | undefined;
  confidence?: number | undefined;
  sources?: string[] | undefined;
  at?: string;
}

const quick = [
  "Résume ma journée",
  "Voir les alertes critiques",
  "Analyse les stocks",
  "Analyse le Food Cost",
  "Résume les feedbacks clients",
];

/** Chatbot global : bouton flottant + panneau latéral droit, présent sur toutes les pages. */
export function AssistantDock() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "ai",
      text: "Bonjour, je suis l'assistant Mitsuki. Je m'appuie sur vos données de ventes, stocks, production, achats, finance et satisfaction. Posez une question ou choisissez une suggestion.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const ask = async (question: string) => {
    if (!question.trim() || loading) return;
    setMessages((m) => [
      ...m,
      { id: `u${Date.now()}`, role: "user", text: question, at: new Date().toISOString() },
    ]);
    setInput("");
    setLoading(true);
    const res = await aiService.chat(question);
    setMessages((m) => [
      ...m,
      {
        id: `a${Date.now()}`,
        role: "ai",
        text: res.text,
        metrics: res.metrics,
        chart: res.chart,
        confidence: res.confidence,
        sources: res.sources,
        at: new Date().toISOString(),
      },
    ]);
    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <>
      <Button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ouvrir l'assistant Mitsuki"
        className="fixed right-5 bottom-5 z-40 size-13 rounded-full bg-gradient-to-br from-primary to-petrol shadow-[var(--shadow-lift)]"
      >
        {open ? <X className="size-5.5" /> : <Bot className="size-5.5" />}
      </Button>

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l bg-card shadow-[var(--shadow-lift)] transition-transform duration-300 sm:w-[420px]",
          open ? "translate-x-0" : "pointer-events-none translate-x-full",
        )}
        aria-hidden={!open}
      >
        <AiBackground />
        <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/12 text-primary">
              <Sparkles className="size-4.5 [animation:var(--animate-pulse-soft)]" />
            </span>
            <div>
              <p className="text-sm font-semibold">Assistant Mitsuki</p>
              <p className="text-xs text-muted-foreground">Posez une question sur votre activité</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fermer">
            <X className="size-4" />
          </Button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                    : "w-full space-y-2.5 text-sm"
                }
              >
                <div className="flex items-center gap-1.5 text-[11px] opacity-70">
                  {m.role === "user" ? <User className="size-3" /> : <Sparkles className="size-3" />}
                  {m.role === "user" ? "Vous" : "MITSUKI AI"}
                  {m.at && <span>· {new Date(m.at).toLocaleTimeString("fr-FR")}</span>}
                </div>
                <p className="whitespace-pre-line">{m.text}</p>
                {m.metrics && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {m.metrics.map((k) => (
                      <div key={k.label} className="rounded-lg border bg-background px-3 py-2">
                        <p className="text-[11px] text-muted-foreground">{k.label}</p>
                        <p className="text-sm font-semibold tabular-nums">{k.value}</p>
                        {typeof k.delta === "number" && <Delta value={k.delta} />}
                      </div>
                    ))}
                  </div>
                )}
                {m.chart && (
                  <div className="rounded-lg border bg-background p-2">
                    <AreaTrend data={m.chart} xKey="date" yKey="value" height={140} />
                  </div>
                )}
                {m.confidence && (
                  <p className="text-[11px] text-muted-foreground">
                    Confiance IA {m.confidence} % · Sources : {m.sources?.join(", ")} · validation
                    humaine requise avant action
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && <AiThinking stepMs={280} />}
          <div ref={endRef} />
        </div>

        <div className="border-t px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => void ask(q)}
                className="rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-primary hover:bg-primary-soft"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            className="mt-2.5 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(input);
            }}
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Votre question…"
            />
            <Button type="submit" size="icon" disabled={loading} aria-label="Envoyer">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
