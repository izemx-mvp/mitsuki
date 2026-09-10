import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { AiBadge, AiDisclaimer, Section, StatusBadge } from "@/components/bits";
import { Button } from "@/components/ui/button";
import { aiRecommendations } from "@/data/mitsuki";

export const Route = createFileRoute("/recommandation/$recoId")({
  head: () => ({
    meta: [
      { title: "Recommandation IA — MITSUKI AI" },
      {
        name: "description",
        content: "Détail d'une recommandation IA Mitsuki : impact, confiance, sources et validation humaine.",
      },
      { property: "og:title", content: "Recommandation IA — MITSUKI AI" },
      { property: "og:description", content: "Impact estimé, sources et validation de la recommandation." },
    ],
  }),
  component: RecoDetail,
});

function RecoDetail() {
  const { recoId } = Route.useParams();
  const r = aiRecommendations.find((x) => x.id === recoId);

  if (!r) {
    return (
      <AppShell title="Recommandation introuvable" breadcrumbs={[{ label: "MITSUKI AI", to: "/" }]}>
        <Section title="Recommandation introuvable">
          <p className="text-sm text-muted-foreground">Cette recommandation n'existe pas.</p>
        </Section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={r.title}
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: r.title }]}
      actions={<BackButton />}
    >
      <Section
        title="Recommandation"
        description={`Domaine ${r.domain}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Recommandation refusée", { description: "Décision tracée dans le journal." })}
            >
              Refuser
            </Button>
            <Button
              size="sm"
              onClick={() =>
                toast.success("Recommandation validée", {
                  description: "Le système peut préparer l'action correspondante.",
                })
              }
            >
              Valider
            </Button>
          </div>
        }
      >
        <p className="text-sm">{r.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge value={r.impact} />
          <span className="text-muted-foreground">Impact estimé</span>
        </div>
        <div className="mt-4">
          <AiBadge confidence={r.confidence} sources={r.sources} generatedAt={r.generatedAt} />
        </div>
        <AiDisclaimer />
      </Section>

      <Section title="Processus de décision">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>L'IA analyse les données Odoo synchronisées.</li>
          <li>L'IA formule une recommandation avec son niveau de confiance et ses sources.</li>
          <li>La direction valide ou refuse la recommandation.</li>
          <li>Le système exécute uniquement après validation humaine.</li>
        </ol>
      </Section>
    </AppShell>
  );
}
