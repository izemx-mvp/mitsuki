import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AnalysisPanel } from "@/components/analysis-panel";
import { useApp } from "@/components/app-context";
import { AppShell } from "@/components/app-shell";
import {
  AiBadge,
  AiDisclaimer,
  DataTable,
  Delta,
  Filter,
  KpiGrid,
  Section,
  StatusBadge,
} from "@/components/bits";
import { HBars, LinesCompare } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  aiRecommendations,
  dayISO,
  formatDate,
  formatMAD,
  restaurantName,
  suppliers,
  type NeedPriority,
  type NeedStatus,
  type PurchaseNeed,
} from "@/data/mitsuki";
import { aiService } from "@/services/aiService";
import { odooService } from "@/services/odooService";

export const Route = createFileRoute("/achats")({
  head: () => ({
    meta: [
      { title: "Achats & Approvisionnement — MITSUKI AI" },
      {
        name: "description",
        content:
          "Besoins d'achat, commandes fournisseurs, évolution des prix matières et recommandations IA d'approvisionnement pour les restaurants Mitsuki.",
      },
      { property: "og:title", content: "Achats & Approvisionnement — MITSUKI AI" },
      {
        property: "og:description",
        content: "Anticipez les ruptures et pilotez vos fournisseurs avec l'aide de l'IA.",
      },
    ],
  }),
  component: PurchasingModule,
});

const supplierName = (id: string) => suppliers.find((s) => s.id === id)?.name ?? id;

function PurchasingModule() {
  const { scope } = useApp();
  const [needs, setNeeds] = useState<PurchaseNeed[]>(() => odooService.getPurchaseNeeds("all"));
  const [generating, setGenerating] = useState(false);
  const [fCat, setFCat] = useState("all");
  const [fSup, setFSup] = useState("all");
  const [fPrio, setFPrio] = useState("all");
  const [fStatus, setFStatus] = useState("all");

  const orders = odooService.getPurchaseOrders(scope);
  const scopedNeeds = useMemo(
    () => needs.filter((n) => scope === "all" || n.restaurant === scope),
    [needs, scope],
  );

  const categories = [...new Set(needs.map((n) => n.category))];

  const filteredNeeds = scopedNeeds.filter(
    (n) =>
      (fCat === "all" || n.category === fCat) &&
      (fSup === "all" || n.supplierId === fSup) &&
      (fPrio === "all" || n.priority === fPrio) &&
      (fStatus === "all" || n.status === fStatus),
  );

  const purchaseAmount = orders.reduce((a, o) => a + o.amount, 0);
  const kpis = [
    { label: "Montant des achats", value: formatMAD(purchaseAmount), delta: 4.2 },
    { label: "Commandes fournisseurs", value: String(orders.length), delta: 6.1 },
    {
      label: "Produits à commander",
      value: String(scopedNeeds.filter((n) => n.recommendedQty > 0).length),
      delta: 8.4,
      hint: "Besoin prévisionnel > stock",
    },
    {
      label: "Risques de rupture",
      value: String(scopedNeeds.filter((n) => n.priority === "Critique").length),
      delta: 15.2,
      hint: "Couverture < 1,2 jour",
    },
    { label: "Variation du coût d'achat", value: "+3,6 %", delta: 3.6, invert: true, hint: "vs mois précédent" },
    { label: "Fournisseurs actifs", value: String(suppliers.length), delta: 0, hint: "12 derniers mois" },
  ];

  const generate = async () => {
    setGenerating(true);
    const updated = await aiService.generatePurchaseRecommendations("all");
    setNeeds(updated);
    setGenerating(false);
    toast.success("Recommandations IA actualisées", {
      description: `${updated.length} lignes analysées à partir des stocks et consommations Odoo.`,
    });
  };

  const validate = (need: PurchaseNeed) => {
    setNeeds((prev) =>
      prev.map((n) => (n.id === need.id ? { ...n, status: "Validé" as NeedStatus } : n)),
    );
    toast.success("Recommandation validée", {
      description: `${need.product} — ${need.recommendedQty} ${need.unit} chez ${supplierName(need.supplierId)}. La commande reste à émettre dans Odoo.`,
    });
  };

  const priceSeries = Array.from({ length: 12 }, (_, i) => ({
    date: dayISO(-330 + i * 30),
    saumon: 132 + i * 1.4 + (i % 3) * 3,
    riz: 20 + i * 0.2,
    avocat: 34 + ((i * 7) % 9),
  }));

  return (
    <AppShell
      title="Achats & Approvisionnement"
      ambient
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: "Achats & Approvisionnement" }]}
      actions={
        <Button size="sm" onClick={generate} disabled={generating}>
          <Sparkles className="size-4" />
          {generating ? "Analyse en cours…" : "Générer recommandations IA"}
        </Button>
      }
    >
      <KpiGrid items={kpis} />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="needs">Besoins d'achat</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="ai">Analyse IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Section title="Achats par fournisseur" description="Montant acheté sur 12 mois">
              <HBars
                data={suppliers.map((s) => ({ name: s.name, value: s.amount }))}
                height={280}
              />
            </Section>
            <Section
              title="Évolution du prix des matières premières"
              description="Prix moyen au kg / litre constaté à la réception"
            >
              <LinesCompare
                data={priceSeries}
                xKey="date"
                lines={[
                  { key: "saumon", label: "Saumon frais", color: "var(--chart-1)" },
                  { key: "riz", label: "Riz à sushi", color: "var(--chart-2)" },
                  { key: "avocat", label: "Avocat", color: "var(--chart-4)" },
                ]}
                height={280}
              />
            </Section>
          </div>

          <Section title="Priorités d'approvisionnement" description="Top 8 des couvertures les plus faibles">
            <DataTable
              rows={[...scopedNeeds].sort((a, b) => a.coverage - b.coverage).slice(0, 8)}
              pageSize={8}
              columns={[
                { key: "p", header: "Produit", render: (n) => <span className="font-medium">{n.product}</span> },
                { key: "r", header: "Établissement", render: (n) => restaurantName(n.restaurant) },
                { key: "c", header: "Couverture", render: (n) => `${n.coverage} j` },
                { key: "q", header: "Qté recommandée", render: (n) => `${n.recommendedQty} ${n.unit}` },
                { key: "pr", header: "Priorité", render: (n) => <StatusBadge value={n.priority} /> },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="needs" className="mt-4">
          <Section
            title="Besoins d'achat"
            description="Analyse des stocks, consommations et délais fournisseurs"
          >
            <DataTable
              rows={filteredNeeds}
              pageSize={12}
              searchKeys={(n) => `${n.product} ${n.category} ${supplierName(n.supplierId)}`}
              toolbar={
                <div className="flex flex-wrap gap-2">
                  <Filter value={fCat} onChange={setFCat} label="Catégorie" options={categories} />
                  <Filter
                    value={fSup}
                    onChange={setFSup}
                    label="Fournisseur"
                    options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                  />
                  <Filter
                    value={fPrio}
                    onChange={setFPrio}
                    label="Priorité"
                    options={["Critique", "Élevée", "Normale", "Faible"] satisfies NeedPriority[]}
                  />
                  <Filter
                    value={fStatus}
                    onChange={setFStatus}
                    label="Statut"
                    options={
                      [
                        "À analyser",
                        "Recommandation IA",
                        "À valider",
                        "Validé",
                        "Commandé",
                      ] satisfies NeedStatus[]
                    }
                  />
                </div>
              }
              columns={[
                {
                  key: "product",
                  header: "Produit",
                  render: (n) => (
                    <Link
                      to="/produit/$materialId"
                      params={{ materialId: n.materialId }}
                      className="font-medium text-primary hover:underline"
                    >
                      {n.product}
                    </Link>
                  ),
                  sortValue: (n) => n.product,
                },
                { key: "cat", header: "Catégorie", render: (n) => n.category, sortValue: (n) => n.category },
                { key: "stock", header: "Stock actuel", render: (n) => n.stock, sortValue: (n) => n.stock },
                { key: "unit", header: "Unité", render: (n) => n.unit },
                { key: "avg", header: "Conso. moyenne", render: (n) => `${n.avgConsumption} / j` },
                {
                  key: "cov",
                  header: "Couverture",
                  render: (n) => `${n.coverage} j`,
                  sortValue: (n) => n.coverage,
                },
                { key: "need", header: "Besoin prév.", render: (n) => n.forecastNeed },
                {
                  key: "reco",
                  header: "Qté recommandée",
                  render: (n) => <span className="font-medium">{n.recommendedQty}</span>,
                  sortValue: (n) => n.recommendedQty,
                },
                { key: "sup", header: "Fournisseur", render: (n) => supplierName(n.supplierId) },
                { key: "prio", header: "Priorité", render: (n) => <StatusBadge value={n.priority} /> },
                { key: "status", header: "Statut", render: (n) => <StatusBadge value={n.status} /> },
                {
                  key: "actions",
                  header: "Actions",
                  render: (n) => (
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to="/produit/$materialId" params={{ materialId: n.materialId }}>
                          Détail
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        disabled={n.status === "Validé" || n.status === "Commandé"}
                        onClick={() => validate(n)}
                      >
                        Valider
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
            <AiDisclaimer />
          </Section>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Section title="Commandes fournisseurs" description="Commandes synchronisées depuis Odoo">
            <DataTable
              rows={orders}
              pageSize={12}
              searchKeys={(o) => `${o.ref} ${supplierName(o.supplierId)} ${o.buyer}`}
              columns={[
                { key: "ref", header: "Référence", render: (o) => <span className="font-medium">{o.ref}</span>, sortValue: (o) => o.ref },
                { key: "date", header: "Date", render: (o) => formatDate(o.date), sortValue: (o) => o.date },
                { key: "sup", header: "Fournisseur", render: (o) => supplierName(o.supplierId) },
                { key: "buyer", header: "Acheteur", render: (o) => o.buyer },
                { key: "amount", header: "Montant", render: (o) => formatMAD(o.amount), sortValue: (o) => o.amount },
                { key: "due", header: "Échéance", render: (o) => formatDate(o.dueDate) },
                { key: "resto", header: "Établissement", render: (o) => restaurantName(o.restaurant) },
                { key: "status", header: "Statut", render: (o) => <StatusBadge value={o.status} /> },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-4">
          <Section title="Fournisseurs" description="Performance et évolution tarifaire">
            <DataTable
              rows={suppliers}
              pageSize={10}
              searchKeys={(s) => `${s.name} ${s.category}`}
              columns={[
                {
                  key: "name",
                  header: "Nom",
                  render: (s) => (
                    <Link
                      to="/fournisseur/$supplierId"
                      params={{ supplierId: s.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {s.name}
                    </Link>
                  ),
                  sortValue: (s) => s.name,
                },
                { key: "orders", header: "Commandes", render: (s) => s.orders, sortValue: (s) => s.orders },
                { key: "amount", header: "Montant acheté", render: (s) => formatMAD(s.amount), sortValue: (s) => s.amount },
                { key: "last", header: "Dernière commande", render: (s) => formatDate(s.lastOrder) },
                { key: "trend", header: "Évolution des prix", render: (s) => <Delta value={s.priceTrend} invert /> },
                { key: "prod", header: "Produits fournis", render: (s) => s.products.length },
                {
                  key: "score",
                  header: "Score interne",
                  render: (s) => <span className="font-medium">{s.score}/100</span>,
                  sortValue: (s) => s.score,
                },
                {
                  key: "a",
                  header: "",
                  render: (s) => (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/fournisseur/$supplierId" params={{ supplierId: s.id }}>
                        Fiche
                      </Link>
                    </Button>
                  ),
                },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-4">
          <AnalysisPanel module="Achats" />
          {aiRecommendations
            .filter((r) => r.domain === "Achats" || r.domain === "Finance")
            .map((r) => (
              <Section key={r.id} title={r.title} description={`Domaine ${r.domain} · Impact ${r.impact}`}>
                <p className="text-sm text-muted-foreground">{r.description}</p>
                <div className="mt-3">
                  <AiBadge confidence={r.confidence} sources={r.sources} generatedAt={r.generatedAt} />
                </div>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/recommandation/$recoId" params={{ recoId: r.id }}>
                      Voir l'analyse
                    </Link>
                  </Button>
                </div>
                <AiDisclaimer />
              </Section>
            ))}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
