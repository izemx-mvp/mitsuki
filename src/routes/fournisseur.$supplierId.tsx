import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { DataTable, KpiGrid, Section, StatusBadge } from "@/components/bits";
import { formatDate, formatMAD, restaurantName } from "@/data/mitsuki";
import { odooService } from "@/services/odooService";

export const Route = createFileRoute("/fournisseur/$supplierId")({
  head: () => ({
    meta: [
      { title: "Fiche fournisseur — MITSUKI AI" },
      {
        name: "description",
        content: "Détail d'un fournisseur Mitsuki : volume d'achats, délais, évolution des prix et commandes récentes.",
      },
      { property: "og:title", content: "Fiche fournisseur — MITSUKI AI" },
      { property: "og:description", content: "Volume d'achats, délais et commandes d'un fournisseur." },
    ],
  }),
  component: SupplierDetail,
});

function SupplierDetail() {
  const { supplierId } = Route.useParams();
  const s = odooService.getSupplier(supplierId);

  if (!s) {
    return (
      <AppShell title="Fournisseur introuvable" breadcrumbs={[{ label: "MITSUKI AI", to: "/" }]}>
        <Section title="Fournisseur introuvable">
          <p className="text-sm text-muted-foreground">Cette fiche n'existe pas dans les données.</p>
        </Section>
      </AppShell>
    );
  }

  const orders = odooService.getPurchaseOrders("all").filter((o) => o.supplierId === s.id);

  return (
    <AppShell
      title={s.name}
      breadcrumbs={[
        { label: "MITSUKI AI", to: "/" },
        { label: "Achats", to: "/achats" },
        { label: s.name },
      ]}
      actions={<BackButton />}
    >
      <KpiGrid
        items={[
          { label: "Commandes", value: String(s.orders), hint: "12 derniers mois" },
          { label: "Volume d'achats", value: formatMAD(s.amount) },
          { label: "Délai moyen", value: `${s.leadTime} j` },
          { label: "Évolution des prix", value: `${s.priceTrend > 0 ? "+" : ""}${s.priceTrend} %`, delta: s.priceTrend, invert: true },
          { label: "Score interne", value: `${s.score} / 100` },
          { label: "Dernière commande", value: formatDate(s.lastOrder) },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="Coordonnées">
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            {[
              ["Catégorie", s.category],
              ["Contact", s.contact],
              ["Téléphone", s.phone],
              ["Identifiant Odoo", String(s.odoo_id)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
        <Section title="Produits référencés">
          <ul className="grid gap-1.5 text-sm sm:grid-cols-2">
            {s.products.map((p) => (
              <li key={p} className="rounded-lg border px-3 py-1.5">
                {p}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="Commandes" description="Commandes fournisseurs synchronisées depuis Odoo">
        <DataTable
          rows={orders}
          pageSize={10}
          searchKeys={(o) => o.ref}
          columns={[
            { key: "r", header: "Référence", render: (o) => <span className="font-medium">{o.ref}</span>, sortValue: (o) => o.ref },
            { key: "d", header: "Date", render: (o) => formatDate(o.date), sortValue: (o) => o.date },
            { key: "a", header: "Montant", render: (o) => formatMAD(o.amount), sortValue: (o) => o.amount },
            { key: "e", header: "Échéance", render: (o) => formatDate(o.dueDate) },
            { key: "res", header: "Établissement", render: (o) => restaurantName(o.restaurant) },
            { key: "b", header: "Acheteur", render: (o) => o.buyer },
            { key: "s", header: "Statut", render: (o) => <StatusBadge value={o.status} /> },
          ]}
        />
      </Section>
    </AppShell>
  );
}
