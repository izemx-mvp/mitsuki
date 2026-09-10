import { Sparkles } from "lucide-react";
import { useState } from "react";

import { AiThinking } from "@/components/ai-thinking";
import { useApp } from "@/components/app-context";
import { AiDisclaimer, Section } from "@/components/bits";
import { AiInsightCard } from "@/components/premium";
import { Button } from "@/components/ui/button";
import type { AnalysisModule } from "@/data/analyses";
import { restaurantName } from "@/data/mitsuki";
import { aiService } from "@/services/aiService";

/**
 * Analyses IA détaillées d'un module, avec accès au détail complet
 * (données observées, évolution, cause, impact, recommandation).
 */
export function AnalysisPanel({ module }: { module: AnalysisModule }) {
  const { scope } = useApp();
  const [running, setRunning] = useState(false);
  const analyses = aiService.getAnalyses(module, scope);

  const relaunch = () => {
    setRunning(true);
    window.setTimeout(() => setRunning(false), 1800);
  };

  return (
    <Section
      title={`Analyses IA · ${module}`}
      description="Chaque analyse détaille les données observées, la cause probable, l'impact estimé et la recommandation"
      action={
        <Button variant="outline" onClick={relaunch} disabled={running}>
          <Sparkles className="size-4" /> Relancer l'analyse
        </Button>
      }
    >
      {running && <AiThinking className="mb-3" />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {analyses.map((a, k) => (
          <AiInsightCard
            key={a.id}
            index={k}
            title={a.title}
            description={a.description}
            impact={a.impact}
            confidence={a.confidence}
            sources={a.sources}
            generatedAt={a.generatedAt}
            restaurant={restaurantName(a.restaurant)}
            category={a.category}
            to="/analyse/$analysisId"
            params={{ analysisId: a.id }}
          />
        ))}
      </div>
      {analyses.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucune analyse pour cet établissement sur la période sélectionnée.
        </p>
      )}
      <AiDisclaimer />
    </Section>
  );
}
