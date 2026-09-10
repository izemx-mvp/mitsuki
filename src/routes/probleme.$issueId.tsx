import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { AiDisclaimer, Section, StatusBadge } from "@/components/bits";
import { formatDate, qualityIssues, restaurantName } from "@/data/mitsuki";

export const Route = createFileRoute("/probleme/$issueId")({
  head: () => ({
    meta: [
      { title: "Problème qualité — MITSUKI AI" },
      {
        name: "description",
        content: "Détail d'un problème qualité Mitsuki : causes probables, chaîne de corrélation IA et actions proposées.",
      },
      { property: "og:title", content: "Problème qualité — MITSUKI AI" },
      { property: "og:description", content: "Causes probables et actions correctives proposées." },
    ],
  }),
  component: IssueDetail,
});

function IssueDetail() {
  const { issueId } = Route.useParams();
  const q = qualityIssues.find((x) => x.id === issueId);

  if (!q) {
    return (
      <AppShell title="Problème introuvable" breadcrumbs={[{ label: "MITSUKI AI", to: "/" }]}>
        <Section title="Problème introuvable">
          <p className="text-sm text-muted-foreground">Ce problème n'existe pas dans les données.</p>
        </Section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={q.title}
      breadcrumbs={[
        { label: "MITSUKI AI", to: "/" },
        { label: "Satisfaction & Qualité", to: "/satisfaction" },
        { label: q.title },
      ]}
      actions={<BackButton />}
    >
      <Section title="Synthèse">
        <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
          {[
            ["Plat concerné", q.dish],
            ["Établissement", restaurantName(q.restaurant)],
            ["Catégorie", q.category],
            ["Retours liés", String(q.feedbackCount)],
            ["Première occurrence", formatDate(q.firstSeen)],
            ["Dernière occurrence", formatDate(q.lastSeen)],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 font-medium">{v}</dd>
            </div>
          ))}
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Priorité</dt>
            <dd className="mt-1">
              <StatusBadge value={q.priority} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Statut</dt>
            <dd className="mt-1">
              <StatusBadge value={q.status} />
            </dd>
          </div>
        </dl>
      </Section>

      <Section title="Chaîne de corrélation détectée par l'IA">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[q.chain.feedback, q.chain.dish, q.chain.production, q.chain.material, q.chain.supplier].map(
            (step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-lg border px-3 py-1.5">{step}</span>
                {i < 4 && <span className="text-muted-foreground">→</span>}
              </span>
            ),
          )}
        </div>
      </Section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="Causes probables">
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            {q.causes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Section>
        <Section title="Actions proposées">
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            {q.actions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Fiabilité de l'analyse">
        <p className="text-sm">
          Confiance IA {q.confidence} % sur la base de {q.feedbackCount} retours clients corrélés aux
          réceptions et ordres de fabrication.
        </p>
        <AiDisclaimer />
      </Section>
    </AppShell>
  );
}
