import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AnalysisPanel } from "@/components/analysis-panel";
import { useApp } from "@/components/app-context";
import { AppShell } from "@/components/app-shell";
import {
  DataTable,
  Delta,
  Filter,
  KpiGrid,
  Section,
  StatusBadge,
  TableSkeleton,
} from "@/components/bits";
import { BarsCompare, HBars } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  coverageDays,
  dishes,
  foodCost,
  formatDate,
  formatMAD,
  restaurantName,
  stockStatus,
} from "@/data/mitsuki";
import { aiService } from "@/services/aiService";
import { odooService } from "@/services/odooService";

export const Route = createFileRoute("/production")({
  head: () => ({
    meta: [
      { title: "Production & Stocks — MITSUKI AI" },
      {
        name: "description",
        content:
          "Ordres de fabrication, prévisions IA de production, niveaux de stock, écarts de consommation et nomenclatures des restaurants Mitsuki.",
      },
      { property: "og:title", content: "Production & Stocks — MITSUKI AI" },
      {
        property: "og:description",
        content: "Ajustez la production et maîtrisez les écarts de consommation.",
      },
    ],
  }),
  component: ProductionModule,
});

type Forecast = Awaited<ReturnType<typeof aiService.productionForecast>>;

function ProductionModule() {
  const { scope } = useApp();
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [fStatus, setFStatus] = useState("all");
  const [fStockStatus, setFStockStatus] = useState("all");

  const mos = odooService.getManufacturingOrders(scope);
  const materials = odooService.getRawMaterials(scope);
  const consumption = odooService.getConsumption(scope);

  const stockRows = useMemo(
    () =>
      materials.map((m) => ({
        ...m,
        coverage: coverageDays(m),
        status: stockStatus(m),
        value: Number((m.stock * m.price).toFixed(0)),
      })),
    [materials],
  );

  const stockValue = stockRows.reduce((a, m) => a + m.value, 0);
  const overuse = consumption.filter((c) => c.real / c.theoretical > 1.1).length;
  const gaps = mos.filter((m) => m.status !== "Planifié" && m.produced < m.planned * 0.9).length;

  const kpis = [
    {
      label: "Production du jour",
      value: `${mos.filter((m) => m.date === formatISOToday()).reduce((a, m) => a + m.produced, 0)} pcs`,
      delta: 3.4,
    },
    { label: "Ordres de fabrication", value: String(mos.length), delta: 5.1, hint: "20 derniers jours" },
    {
      label: "Stock critique",
      value: String(stockRows.filter((s) => s.status === "Critique").length),
      delta: 9.8,
      hint: "Références sous 1 jour",
    },
    { label: "Surconsommations détectées", value: String(overuse), delta: 6.2, hint: "Écart > 10 %" },
    { label: "Écarts de production", value: String(gaps), delta: -4.1, hint: "Écart > 10 %" },
    { label: "Valeur du stock", value: formatMAD(stockValue), delta: 2.7 },
  ];

  const runForecast = async () => {
    setLoadingForecast(true);
    const f = await aiService.productionForecast(scope);
    setForecast(f);
    setLoadingForecast(false);
    toast.success("Prévisions IA calculées", {
      description: "Basées sur les ventes moyennes, les stocks et les ordres en cours.",
    });
  };

  const consumptionChart = consumption.slice(0, 10).map((c) => ({
    name: c.material,
    theorique: c.theoretical,
    reel: c.real,
  }));

  return (
    <AppShell
      title="Production & Stocks"
      ambient
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: "Production & Stocks" }]}
    >
      <KpiGrid items={kpis} />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="prod">Production</TabsTrigger>
          <TabsTrigger value="forecast">Prévisions</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="conso">Consommation</TabsTrigger>
          <TabsTrigger value="bom">Nomenclatures</TabsTrigger>
          <TabsTrigger value="ai">Analyse IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Section title="Références les plus tendues" description="Couverture de stock la plus faible">
              <HBars
                data={[...stockRows]
                  .sort((a, b) => a.coverage - b.coverage)
                  .slice(0, 8)
                  .map((s) => ({
                    name: s.name,
                    value: s.coverage,
                    color: s.coverage < 1 ? "var(--destructive)" : "var(--chart-2)",
                  }))}
                height={300}
              />
            </Section>
            <Section title="Consommation théorique vs réelle" description="10 principales matières">
              <BarsCompare
                data={consumptionChart}
                xKey="name"
                bars={[
                  { key: "theorique", label: "Théorique", color: "var(--chart-1)" },
                  { key: "reel", label: "Réelle", color: "var(--chart-2)" },
                ]}
                height={300}
              />
            </Section>
          </div>
        </TabsContent>

        <TabsContent value="prod" className="mt-4">
          <Section title="Ordres de fabrication" description="Feuilles de production synchronisées depuis Odoo">
            <DataTable
              rows={mos.filter((m) => fStatus === "all" || m.status === fStatus)}
              pageSize={12}
              searchKeys={(m) => `${m.ref} ${m.product}`}
              toolbar={
                <Filter
                  value={fStatus}
                  onChange={setFStatus}
                  label="Statut"
                  options={["Planifié", "En production", "Terminé", "Anomalie"]}
                />
              }
              columns={[
                { key: "ref", header: "Référence", render: (m) => <span className="font-medium">{m.ref}</span>, sortValue: (m) => m.ref },
                { key: "date", header: "Date", render: (m) => formatDate(m.date), sortValue: (m) => m.date },
                { key: "prod", header: "Produit", render: (m) => m.product, sortValue: (m) => m.product },
                { key: "planned", header: "Qté prévue", render: (m) => m.planned, sortValue: (m) => m.planned },
                { key: "produced", header: "Qté produite", render: (m) => m.produced },
                {
                  key: "gap",
                  header: "Écart",
                  render: (m) => (
                    <span className={m.produced < m.planned ? "text-destructive" : "text-success"}>
                      {m.produced - m.planned}
                    </span>
                  ),
                  sortValue: (m) => m.produced - m.planned,
                },
                { key: "resto", header: "Point de vente", render: (m) => restaurantName(m.restaurant) },
                { key: "status", header: "Statut", render: (m) => <StatusBadge value={m.status} /> },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="forecast" className="mt-4">
          <Section
            title="Prévisions de production IA"
            description="Quantités recommandées à partir des ventes, stocks et ordres en cours"
            action={
              <Button size="sm" onClick={runForecast} disabled={loadingForecast}>
                <Sparkles className="size-4" />
                {loadingForecast ? "Calcul en cours…" : "Calculer les prévisions IA"}
              </Button>
            }
          >
            {loadingForecast ? (
              <TableSkeleton />
            ) : forecast ? (
              <DataTable
                rows={forecast}
                pageSize={10}
                searchKeys={(f) => f.product}
                columns={[
                  { key: "p", header: "Produit", render: (f) => <span className="font-medium">{f.product}</span>, sortValue: (f) => f.product },
                  { key: "avg", header: "Ventes moyennes", render: (f) => `${f.avgSales} / j` },
                  { key: "cur", header: "Production actuelle", render: (f) => f.current },
                  { key: "stock", header: "Stock disponible", render: (f) => f.stock },
                  { key: "need", header: "Besoin prévisionnel", render: (f) => f.need, sortValue: (f) => f.need },
                  {
                    key: "reco",
                    header: "Qté recommandée",
                    render: (f) => <span className="font-semibold">{f.recommended}</span>,
                    sortValue: (f) => f.recommended,
                  },
                  { key: "resto", header: "Point de vente", render: () => restaurantName(scope) },
                  {
                    key: "conf",
                    header: "Confiance",
                    render: (f) => `${f.confidence} %`,
                    sortValue: (f) => f.confidence,
                  },
                ]}
              />
            ) : (
              <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
                Lancez le calcul pour obtenir les quantités recommandées par plat et par point de
                vente.
              </div>
            )}
          </Section>
        </TabsContent>

        <TabsContent value="stocks" className="mt-4">
          <Section title="Stocks" description="Niveaux et couverture par référence">
            <DataTable
              rows={stockRows.filter((s) => fStockStatus === "all" || s.status === fStockStatus)}
              pageSize={12}
              searchKeys={(s) => `${s.name} ${s.category}`}
              toolbar={
                <Filter
                  value={fStockStatus}
                  onChange={setFStockStatus}
                  label="Statut"
                  options={["Normal", "À surveiller", "Faible", "Critique", "Surstock"]}
                />
              }
              columns={[
                {
                  key: "name",
                  header: "Produit",
                  render: (s) => (
                    <Link
                      to="/produit/$materialId"
                      params={{ materialId: s.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {s.name}
                    </Link>
                  ),
                  sortValue: (s) => s.name,
                },
                { key: "cat", header: "Catégorie", render: (s) => s.category, sortValue: (s) => s.category },
                { key: "stock", header: "Stock actuel", render: (s) => `${s.stock} ${s.unit}`, sortValue: (s) => s.stock },
                { key: "min", header: "Stock minimum", render: (s) => s.minStock },
                { key: "avg", header: "Conso. moyenne", render: (s) => `${s.avgConsumption} / j` },
                { key: "cov", header: "Couverture", render: (s) => `${s.coverage} j`, sortValue: (s) => s.coverage },
                { key: "trend", header: "Évolution", render: (s) => <Delta value={s.priceTrend} invert /> },
                { key: "status", header: "Statut", render: (s) => <StatusBadge value={s.status} /> },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="conso" className="mt-4 space-y-4">
          <Section title="Écarts de consommation" description="Théorique issu des nomenclatures vs réel constaté">
            <DataTable
              rows={consumption}
              pageSize={12}
              searchKeys={(c) => c.material}
              columns={[
                { key: "m", header: "Matière", render: (c) => <span className="font-medium">{c.material}</span>, sortValue: (c) => c.material },
                { key: "r", header: "Établissement", render: (c) => restaurantName(c.restaurant) },
                { key: "t", header: "Conso. théorique", render: (c) => `${c.theoretical} ${c.unit}` },
                { key: "re", header: "Conso. réelle", render: (c) => `${c.real} ${c.unit}` },
                {
                  key: "gap",
                  header: "Écart",
                  render: (c) => Number((c.real - c.theoretical).toFixed(1)),
                  sortValue: (c) => c.real - c.theoretical,
                },
                {
                  key: "pct",
                  header: "% d'écart",
                  render: (c) => {
                    const p = Number((((c.real - c.theoretical) / c.theoretical) * 100).toFixed(1));
                    return (
                      <span
                        className={
                          p > 10 ? "font-semibold text-destructive" : p > 5 ? "text-[oklch(0.52_0.13_70)]" : "text-success"
                        }
                      >
                        {p > 0 ? "+" : ""}
                        {p} %
                      </span>
                    );
                  },
                  sortValue: (c) => (c.real - c.theoretical) / c.theoretical,
                },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="bom" className="mt-4">
          <Section title="Nomenclatures" description="Coût matière et marge par produit fini">
            <DataTable
              rows={dishes}
              pageSize={12}
              searchKeys={(d) => `${d.ref} ${d.name} ${d.category}`}
              columns={[
                { key: "ref", header: "Référence", render: (d) => d.ref, sortValue: (d) => d.ref },
                {
                  key: "name",
                  header: "Produit",
                  render: (d) => (
                    <Link
                      to="/plat/$dishId"
                      params={{ dishId: d.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {d.name}
                    </Link>
                  ),
                  sortValue: (d) => d.name,
                },
                { key: "price", header: "Prix de vente", render: (d) => formatMAD(d.price), sortValue: (d) => d.price },
                { key: "cost", header: "Coût matière", render: (d) => formatMAD(d.materialCost, 1) },
                {
                  key: "fc",
                  header: "Food Cost",
                  render: (d) => (
                    <span className={foodCost(d) > 34 ? "font-semibold text-destructive" : "text-success"}>
                      {foodCost(d)} %
                    </span>
                  ),
                  sortValue: (d) => foodCost(d),
                },
                {
                  key: "marge",
                  header: "Marge estimée",
                  render: (d) => formatMAD(d.price - d.materialCost, 1),
                  sortValue: (d) => d.price - d.materialCost,
                },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="ai" className="mt-4 space-y-4">
          <AnalysisPanel module="Production" />
          <Section
            title="Analyse IA production & stocks"
            description="Lecture croisée des ordres de fabrication, stocks et consommations"
          >
            <ul className="space-y-3 text-sm">
              <li className="rounded-xl border p-4">
                <strong>{gaps} ordres</strong> présentent un écart de production supérieur à 10 %,
                concentrés sur les makis signature en service du soir. Recalculer les prévisions deux
                fois par semaine réduirait l'écart d'environ un tiers.
              </li>
              <li className="rounded-xl border p-4">
                <strong>{overuse} matières</strong> sont surconsommées de plus de 10 % par rapport à
                la nomenclature. Le grammage du saumon et de l'avocat est le premier contributeur.
              </li>
              <li className="rounded-xl border p-4">
                Un surstock de nouilles udon est détecté sur Carrousel : décaler la prochaine
                commande de 10 jours limiterait le risque de perte sur DLC.
              </li>
            </ul>
            <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              Confiance IA 76 % · Sources : ordres de fabrication, nomenclatures, stocks,
              consommations. Recommandations nécessitant une validation humaine.
            </p>
          </Section>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function formatISOToday() {
  return new Date("2026-09-10T00:00:00Z").toISOString().slice(0, 10);
}
