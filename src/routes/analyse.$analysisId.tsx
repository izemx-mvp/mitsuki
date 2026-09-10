import { createFileRoute, notFound } from "@tanstack/react-router";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { AiDisclaimer, Section, StatusBadge } from "@/components/bits";
import { AreaTrend } from "@/components/charts";
import { DetailField, ImpactBadge, RiskGrid, StepList } from "@/components/premium";
import { useStore } from "@/components/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { defaultOwnerByModule, type AlertModule } from "@/data/analyses";
import { dayISO, formatDate, restaurantName } from "@/data/mitsuki";
import { aiService } from "@/services/aiService";

export const Route = createFileRoute("/analyse/$analysisId")({
  loader: ({ params }) => {
    const analysis = aiService.getAnalysis(params.analysisId);
    if (!analysis) throw notFound();
    return { analysis };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Analyse indisponible — MITSUKI AI" }, { name: "robots", content: "noindex" }],
      };
    }
    const t = `${loaderData.analysis.title} — MITSUKI AI`;
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData.analysis.description },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData.analysis.description },
      ],
    };
  },
  component: AnalysisDetail,
});

function AnalysisDetail() {
  const { analysis } = Route.useLoaderData();
  const { addAlert } = useStore();
  const [created, setCreated] = useState(false);

  const module = (analysis.module === "Satisfaction" ? "Satisfaction" : analysis.module) as AlertModule;
  const owner = defaultOwnerByModule[module];

  const createAlert = () => {
    addAlert({
      id: `al-${analysis.id}-${Date.now()}`,
      title: analysis.title,
      description: analysis.recommendation,
      category: analysis.module === "Finance" ? "Finance" : analysis.module === "Achats" ? "Achats" : "Production",
      module,
      type: analysis.category,
      restaurant: analysis.restaurant,
      priority: analysis.priority,
      date: dayISO(0),
      status: "Nouvelle",
      owner,
      assignee: null,
      history: [
        { label: "Alerte créée depuis une analyse IA", at: dayISO(0), by: "Direction Mitsuki" },
      ],
    });
    setCreated(true);
    toast.success("Alerte créée", { description: `Suivi confié à ${owner}.` });
  };

  return (
    <AppShell
      title="Analyse IA"
      ambient
      breadcrumbs={[
        { label: "MITSUKI AI", to: "/" },
        { label: analysis.module, to: `/${analysis.module.toLowerCase()}` },
        { label: analysis.category },
      ]}
      actions={<BackButton fallback="/" />}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={analysis.priority} />
          <ImpactBadge impact={analysis.impact} />
          <span className="text-xs text-muted-foreground">
            {analysis.module} · {analysis.category} · {restaurantName(analysis.restaurant)}
          </span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-petrol">{analysis.title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{analysis.description}</p>
      </div>

      <Section title="Données observées" description="Chiffres issus des données Odoo synchronisées">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {analysis.observed.map((o) => (
            <DetailField
              key={o.label}
              label={o.label}
              value={
                <>
                  {o.value}
                  {o.hint && (
                    <span className="block text-[11px] font-normal text-muted-foreground">{o.hint}</span>
                  )}
                </>
              }
            />
          ))}
        </div>
      </Section>

      {analysis.riskItems && analysis.riskItems.length > 0 && (
        <Section
          title="Produits & postes exactement à risque"
          description="Références précises identifiées par l'IA, classées par niveau de risque"
        >
          <RiskGrid items={analysis.riskItems} />
        </Section>
      )}

      <Section title="Évolution" description={analysis.evolutionLabel}>
        <AreaTrend data={analysis.evolution} xKey="date" yKey="value" height={240} />
      </Section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Cause probable">
          <p className="text-sm text-muted-foreground">{analysis.cause}</p>
        </Section>
        <Section title="Impact estimé">
          <p className="text-sm text-muted-foreground">{analysis.impactText}</p>
          {analysis.estimatedGain && (
            <p className="mt-2 text-sm font-semibold text-petrol">Gain potentiel : {analysis.estimatedGain}</p>
          )}
        </Section>
        <Section title="Recommandation IA">
          <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span>Confiance IA</span>
              <span className="font-semibold tabular-nums">{analysis.confidence} %</span>
            </div>
            <Progress value={analysis.confidence} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">
              Sources : {analysis.sources.join(", ")} · généré le {formatDate(analysis.generatedAt)}
            </p>
          </div>
        </Section>
      </div>

      {analysis.steps && analysis.steps.length > 0 && (
        <Section
          title="Suggestion détaillée — étapes à réaliser"
          description="Plan proposé par l'IA ; chaque étape doit être validée par un utilisateur"
        >
          <StepList steps={analysis.steps} />
        </Section>
      )}

      <AiDisclaimer />


      <div className="flex flex-wrap gap-2">
        <Button onClick={createAlert} disabled={created}>
          {created ? <CheckCircle2 className="size-4" /> : <ClipboardList className="size-4" />}
          {created ? "Alerte créée" : "Créer une alerte de suivi"}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Analyse partagée", {
              description: `Envoyée à ${owner} pour validation humaine.`,
            })
          }
        >
          Partager avec {owner}
        </Button>
      </div>
    </AppShell>
  );
}
