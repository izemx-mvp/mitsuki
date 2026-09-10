import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { DataTable, KpiGrid, Section, StatusBadge } from "@/components/bits";
import { dishes, foodCost, formatMAD } from "@/data/mitsuki";

export const Route = createFileRoute("/plat/$dishId")({
  head: () => ({
    meta: [
      { title: "Fiche plat — MITSUKI AI" },
      {
        name: "description",
        content: "Détail d'un plat Mitsuki : prix, coût matière, food cost, marge et nomenclature.",
      },
      { property: "og:title", content: "Fiche plat — MITSUKI AI" },
      { property: "og:description", content: "Nomenclature, coût matière et marge du plat." },
    ],
  }),
  component: DishDetail,
});

function DishDetail() {
  const { dishId } = Route.useParams();
  const d = dishes.find((x) => x.id === dishId);

  if (!d) {
    return (
      <AppShell title="Plat introuvable" breadcrumbs={[{ label: "MITSUKI AI", to: "/" }]}>
        <Section title="Plat introuvable">
          <p className="text-sm text-muted-foreground">Ce plat n'existe pas dans les données.</p>
        </Section>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={d.name}
      breadcrumbs={[
        { label: "MITSUKI AI", to: "/" },
        { label: "Production & Stocks", to: "/production" },
        { label: d.name },
      ]}
      actions={<BackButton />}
    >
      <KpiGrid
        items={[
          { label: "Prix de vente", value: formatMAD(d.price) },
          { label: "Coût matière", value: formatMAD(d.materialCost, 1), delta: d.costTrend, invert: true },
          { label: "Food Cost", value: `${foodCost(d)} %`, hint: "Cible 32 %" },
          { label: "Marge", value: formatMAD(d.price - d.materialCost, 1) },
          { label: "Ventes moyennes", value: `${d.soldPerDay} / j` },
          { label: "Référence", value: d.ref, hint: `Odoo ${d.odoo_id}` },
        ]}
      />

      <Section title="Nomenclature" description="Composition et grammages de la recette">
        <DataTable
          rows={d.lines.map((l, i) => ({ ...l, id: `${d.id}-${i}` }))}
          columns={[
            { key: "m", header: "Ingrédient", render: (l) => <span className="font-medium">{l.material}</span> },
            { key: "q", header: "Quantité", render: (l) => `${l.qty} ${l.unit}` },
          ]}
        />
      </Section>

      <Section title="Analyse IA">
        <p className="text-sm">
          Avec un Food Cost de {foodCost(d)} %, ce plat est{" "}
          {foodCost(d) > 34 ? "sous tension" : foodCost(d) > 30 ? "à surveiller" : "conforme à la cible"}.
        </p>
        <div className="mt-3">
          <StatusBadge value={foodCost(d) > 34 ? "Critique" : foodCost(d) > 30 ? "À surveiller" : "Normal"} />
        </div>
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Confiance IA 78 % · Sources : nomenclatures, prix d'achat, ventes · Validation humaine
          requise avant modification de la recette.
        </p>
      </Section>
    </AppShell>
  );
}
