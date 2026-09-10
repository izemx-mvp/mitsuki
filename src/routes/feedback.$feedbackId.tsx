import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { AiBadge, AiDisclaimer, Section, StatusBadge } from "@/components/bits";
import { AiThinking } from "@/components/ai-thinking";
import { DetailField } from "@/components/premium";
import { useStore } from "@/components/store";
import { Button } from "@/components/ui/button";
import { defaultOwnerByModule } from "@/data/analyses";
import { dayISO, formatDate, restaurantName } from "@/data/mitsuki";
import { aiService } from "@/services/aiService";

export const Route = createFileRoute("/feedback/$feedbackId")({
  head: () => ({
    meta: [
      { title: "Détail d'un retour client — MITSUKI AI" },
      {
        name: "description",
        content:
          "Fiche de satisfaction Mitsuki : notes, commentaire, analyse IA du sentiment, sujet identifié et actions de suivi.",
      },
      { property: "og:title", content: "Détail d'un retour client — MITSUKI AI" },
      { property: "og:description", content: "Notes, commentaire et analyse IA du retour client." },
    ],
  }),
  component: FeedbackDetail,
});

type Insight = Awaited<ReturnType<typeof aiService.feedbackInsight>>;

function FeedbackDetail() {
  const { feedbackId } = Route.useParams();
  const { feedbacks, updateFeedback, addAlert } = useStore();
  const feedback = feedbacks.find((f) => f.id === feedbackId);
  const [insight, setInsight] = useState<Insight | null>(null);

  useEffect(() => {
    let alive = true;
    if (feedback) {
      void aiService.feedbackInsight(feedback).then((r) => {
        if (alive) setInsight(r);
      });
    }
    return () => {
      alive = false;
    };
  }, [feedback]);

  if (!feedback) {
    return (
      <AppShell title="Retour introuvable" actions={<BackButton fallback="/satisfaction" />}>
        <Section title="Retour introuvable">
          <p className="text-sm text-muted-foreground">Cette fiche de satisfaction n'existe plus.</p>
        </Section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Retour client"
      ambient
      breadcrumbs={[
        { label: "MITSUKI AI", to: "/" },
        { label: "Satisfaction & Qualité", to: "/satisfaction" },
        { label: feedback.order },
      ]}
      actions={<BackButton fallback="/satisfaction" />}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge value={feedback.sentiment} />
        <StatusBadge value={feedback.priority} />
        <StatusBadge value={feedback.status} />
        <span className="text-xs text-muted-foreground">
          {restaurantName(feedback.restaurant)} · {formatDate(feedback.date)}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <DetailField label="Commande" value={feedback.order} />
        <DetailField label="Plat concerné" value={feedback.dish} />
        <DetailField label="Note service" value={`${feedback.service} / 5`} />
        <DetailField label="Note produit" value={`${feedback.product} / 5`} />
        <DetailField label="Note propreté" value={`${feedback.cleanliness} / 5`} />
        <DetailField label="Recommandation" value={`${feedback.recommend} / 10`} />
      </div>

      <Section title="Commentaire du client">
        <p className="text-sm text-muted-foreground">« {feedback.comment} »</p>
      </Section>

      <Section title="Analyse IA du retour" description="Sentiment, sujet et criticité identifiés">
        {!insight && <AiThinking />}
        {insight && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Sujet identifié :</span> {insight.topic}
            </p>
            <p>
              <span className="font-medium">Sentiment :</span> {insight.sentiment}
            </p>
            <p>
              <span className="font-medium">Criticité :</span> {insight.criticality}
            </p>
            <p className="text-muted-foreground">{insight.problem}</p>
            <AiBadge
              confidence={insight.confidence}
              sources={insight.sources}
              generatedAt={insight.generatedAt}
            />
            <AiDisclaimer />
          </div>
        )}
      </Section>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            updateFeedback(feedback.id, { status: "En cours" });
            toast.success("Retour pris en charge");
          }}
        >
          Prendre en charge
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            updateFeedback(feedback.id, { status: "Traité" });
            toast.success("Retour marqué traité");
          }}
        >
          Marquer traité
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            addAlert({
              id: `al-fb-${feedback.id}-${Date.now()}`,
              title: `Retour client à traiter : ${insight?.topic ?? feedback.dish}`,
              description: feedback.comment,
              category: "Qualité",
              module: "Satisfaction",
              type: "Réclamation client",
              restaurant: feedback.restaurant,
              priority: feedback.priority,
              date: dayISO(0),
              status: "Nouvelle",
              owner: defaultOwnerByModule.Satisfaction,
              assignee: null,
              history: [
                { label: "Alerte créée depuis un retour client", at: dayISO(0), by: "Direction Mitsuki" },
              ],
            });
            toast.success("Alerte créée", { description: "Visible dans le centre d'alertes." });
          }}
        >
          Créer une alerte
        </Button>
      </div>
    </AppShell>
  );
}
