import { Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export const AI_STEPS = [
  "Analyse des données…",
  "Croisement des informations…",
  "Identification des tendances…",
  "Génération des recommandations…",
];

/** État intermédiaire animé affiché pendant une action IA. */
export function AiThinking({
  steps = AI_STEPS,
  stepMs = 420,
  className,
}: {
  steps?: string[];
  stepMs?: number;
  className?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setActive((a) => (a < steps.length - 1 ? a + 1 : a)),
      stepMs,
    );
    return () => clearInterval(id);
  }, [steps.length, stepMs]);

  return (
    <div
      className={cn(
        "grad-teal relative overflow-hidden rounded-xl border p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Sparkles className="size-4 text-primary [animation:var(--animate-pulse-soft)]" />
        Traitement IA en cours
      </div>
      <ul className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li
            key={s}
            className={cn(
              "flex items-center gap-2 text-xs transition-opacity duration-300",
              i <= active ? "opacity-100" : "opacity-35",
            )}
          >
            {i < active ? (
              <Check className="size-3.5 text-success" />
            ) : i === active ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <span className="size-3.5 rounded-full border" />
            )}
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-petrol to-orange transition-all duration-500"
          style={{ width: `${((active + 1) / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
