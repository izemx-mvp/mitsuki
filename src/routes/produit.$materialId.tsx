import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { Delta, KpiGrid, Section, StatusBadge } from "@/components/bits";
import {
  coverageDays,
  formatMAD,
  restaurantName,
  stockStatus,
} from "@/data/mitsuki";
import { odooService } from "@/services/odooService";

export const Route = createFileRoute("/produit/$materialId")({
  head: () => ({
    meta: [
      { title: "Fiche produit — MITSUKI AI" },
      {
        name: "description",
        content: "Détail d'une matière première Mitsuki : stock, couverture, prix, fournisseur et consommation.",
      },
      { property: "og:title", content: "Fiche produit — MITSUKI AI" },
      { property: "og:description", content: "Stock, couverture et fournisseur d'une matière première." },
    ],
  }),
  component: MaterialDetail,
});

function MaterialDetail() {
  const { materialId } = Route.useParams();
  const m = odooService.getRawMaterial(materialId);

  if (!m) {
    return (
      <AppShell title="Produit introuvable" breadcrumbs={[{ label: "MITSUKI AI", to: "/" }]}>
        <Section title="Produit introuvable">
          <p className="text-sm text-muted-foreground">Cette référence n'existe pas dans les données.</p>
        </Section>
      </AppShell>
    );
  }

  const supplier = odooService.getSupplier(m.supplierId);
  const cover = coverageDays(m);

  return (
    <AppShell
      title={m.name}
      breadcrumbs={[
        { label: "MITSUKI AI", to: "/" },
        { label: "Achats", to: "/achats" },
        { label: m.name },
      ]}
      actions={<BackButton />}
    >
      <KpiGrid
        items={[
          { label: "Stock actuel", value: `${m.stock} ${m.unit}`, hint: restaurantName(m.restaurant) },
          { label: "Stock minimum", value: `${m.minStock} ${m.unit}`, hint: "Seuil de sécurité" },
          { label: "Couverture", value: `${cover} j`, hint: "Selon consommation moyenne" },
          { label: "Consommation", value: `${m.avgConsumption} ${m.unit} / j`, hint: "Moyenne 30 jours" },
          { label: "Prix d'achat", value: formatMAD(m.price, 2), delta: m.priceTrend, invert: true },
          { label: "Valeur du stock", value: formatMAD(m.stock * m.price) },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="Informations produit">
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            {[
              ["Catégorie", m.category],
              ["Unité", m.unit],
              ["Établissement", restaurantName(m.restaurant)],
              ["Identifiant Odoo", String(m.odoo_id)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Statut du stock</dt>
              <dd className="mt-1">
                <StatusBadge value={stockStatus(m)} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Évolution du prix</dt>
              <dd className="mt-1">
                <Delta value={m.priceTrend} invert />
              </dd>
            </div>
          </dl>
        </Section>

        <Section title="Fournisseur">
          {supplier ? (
            <div className="space-y-2 text-sm">
              <Link
                to="/fournisseur/$supplierId"
                params={{ supplierId: supplier.id }}
                className="font-medium text-primary hover:underline"
              >
                {supplier.name}
              </Link>
              <p className="text-muted-foreground">
                {supplier.category} · {supplier.contact} · {supplier.phone}
              </p>
              <p className="text-muted-foreground">
                Délai de livraison : {supplier.leadTime} jour(s) · Score interne : {supplier.score}/100
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun fournisseur associé.</p>
          )}
        </Section>
      </div>

      <Section
        title="Analyse IA"
        description="Recommandation d'approvisionnement pour cette référence"
      >
        <p className="text-sm">
          Avec {cover} jour(s) de couverture et une consommation moyenne de {m.avgConsumption}{" "}
          {m.unit} par jour, une commande de{" "}
          <strong>{Math.max(0, Number((m.avgConsumption * 7 - m.stock).toFixed(1)))} {m.unit}</strong>{" "}
          est recommandée pour sécuriser 7 jours d'activité.
        </p>
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          Confiance IA 82 % · Sources : stocks Odoo, consommation 30 jours, délais fournisseur ·
          Validation humaine requise avant toute commande.
        </p>
      </Section>
    </AppShell>
  );
}
