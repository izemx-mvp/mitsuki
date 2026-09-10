import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

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
import { AreaTrend, BarsCompare, HBars } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dishes, foodCost, formatMAD, restaurantName } from "@/data/mitsuki";
import { aiService, type AiAnalysis } from "@/services/aiService";
import { analyticsService } from "@/services/analyticsService";
import { odooService } from "@/services/odooService";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance & Performance — MITSUKI AI" },
      {
        name: "description",
        content:
          "Cockpit financier Mitsuki : chiffre d'affaires, charges, masse salariale, food cost, balance simplifiée et analyse financière IA.",
      },
      { property: "og:title", content: "Finance & Performance — MITSUKI AI" },
      {
        property: "og:description",
        content: "Suivez marge, charges et rentabilité par établissement.",
      },
    ],
  }),
  component: FinanceModule,
});

function FinanceModule() {
  const { scope, period } = useApp();
  const [fCat, setFCat] = useState("all");
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const totals = analyticsService.salesTotals(scope, period);
  const charges = analyticsService.charges(scope);
  const payrollRows = odooService.getPayroll(scope);
  const payroll = payrollRows.reduce((a, p) => a + p.payroll, 0);
  const expenses = odooService.getExpenses(scope);
  const balance = odooService.getBalance(scope);
  const series = analyticsService.revenueSeries(scope, period);
  const chargesSeries = analyticsService.chargesVsRevenue(scope, period);
  const byRestaurant = analyticsService.revenueByRestaurant(period);

  const load = () => {
    setLoading(true);
    aiService.financialAnalysis(scope, period).then((a) => {
      setAnalysis(a);
      setLoading(false);
    });
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    aiService.financialAnalysis(scope, period).then((a) => {
      if (alive) {
        setAnalysis(a);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [scope, period]);

  const result = totals.revenue - charges;
  const kpis = [
    { label: "Chiffre d'affaires", value: formatMAD(totals.revenue), delta: totals.revenueDelta },
    { label: "Résultat estimé", value: formatMAD(result), delta: 2.9 },
    { label: "Charges", value: formatMAD(charges), delta: 6.8, invert: true },
    { label: "Masse salariale", value: formatMAD(payroll), delta: 4.1, invert: true },
    { label: "Food Cost", value: `${analyticsService.foodCostAvg()} %`, delta: 1.8, invert: true },
    {
      label: "Marge",
      value: `${totals.revenue ? Number(((result / totals.revenue) * 100).toFixed(1)) : 0} %`,
      delta: -1.4,
    },
    { label: "Panier moyen", value: formatMAD(totals.avgTicket, 1), delta: totals.ticketDelta },
  ];

  const categories = [...new Set(expenses.map((e) => e.category))];

  return (
    <AppShell
      title="Finance & Performance"
      ambient
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: "Finance & Performance" }]}
    >
      <KpiGrid items={kpis} />

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="ca">Chiffre d'affaires</TabsTrigger>
          <TabsTrigger value="charges">Charges</TabsTrigger>
          <TabsTrigger value="payroll">Masse salariale</TabsTrigger>
          <TabsTrigger value="foodcost">Food Cost</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="ai">Analyse IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              { l: "Ventes", v: formatMAD(totals.revenue) },
              { l: "Commandes", v: totals.orders.toLocaleString("fr-FR") },
              { l: "Panier moyen", v: formatMAD(totals.avgTicket, 1) },
              { l: "Charges totales", v: formatMAD(charges) },
              { l: "Marge", v: formatMAD(result) },
              { l: "Total remises", v: formatMAD(totals.discounts) },
              { l: "Total offert", v: formatMAD(totals.offered) },
              { l: "Masse salariale", v: formatMAD(payroll) },
            ].map((i) => (
              <Card key={i.l} className="gap-0 py-4 shadow-[var(--shadow-card)]">
                <CardContent className="px-4">
                  <p className="text-xs text-muted-foreground uppercase">{i.l}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{i.v}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Section title="CA par établissement" description="Sur la période sélectionnée">
              <BarsCompare
                data={byRestaurant}
                xKey="name"
                bars={[{ key: "revenue", label: "Chiffre d'affaires", color: "var(--chart-1)" }]}
              />
            </Section>
            <Section title="CA vs Charges" description="Comparaison sur la période">
              <BarsCompare
                data={chargesSeries.slice(-12)}
                xKey="date"
                bars={[
                  { key: "revenue", label: "CA", color: "var(--chart-1)" },
                  { key: "charges", label: "Charges", color: "var(--chart-3)" },
                ]}
              />
            </Section>
          </div>

          <Section title="Évolution de la marge" description="CA diminué des charges réparties">
            <AreaTrend data={chargesSeries} yKey="marge" />
          </Section>
        </TabsContent>

        <TabsContent value="ca" className="mt-4 space-y-4">
          <Section title="Évolution du chiffre d'affaires" description={restaurantName(scope)}>
            <AreaTrend data={series} height={300} />
          </Section>
          <Section title="Contribution par établissement">
            <DataTable
              rows={byRestaurant.map((r) => ({ ...r, id: r.name }))}
              columns={[
                { key: "n", header: "Établissement", render: (r) => <span className="font-medium">{r.name}</span> },
                { key: "ca", header: "Chiffre d'affaires", render: (r) => formatMAD(r.revenue), sortValue: (r) => r.revenue },
                { key: "o", header: "Commandes", render: (r) => r.orders.toLocaleString("fr-FR") },
                {
                  key: "pm",
                  header: "Panier moyen",
                  render: (r) => formatMAD(r.orders ? r.revenue / r.orders : 0, 1),
                },
                { key: "d", header: "Évolution", render: (r) => <Delta value={r.delta} /> },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="charges" className="mt-4">
          <Section title="Charges" description="Charges enregistrées dans Odoo">
            <DataTable
              rows={expenses.filter((e) => fCat === "all" || e.category === fCat)}
              pageSize={12}
              searchKeys={(e) => `${e.type} ${e.category}`}
              toolbar={<Filter value={fCat} onChange={setFCat} label="Catégorie" options={categories} />}
              columns={[
                { key: "t", header: "Type", render: (e) => <span className="font-medium">{e.type}</span>, sortValue: (e) => e.type },
                { key: "c", header: "Catégorie", render: (e) => e.category, sortValue: (e) => e.category },
                { key: "m", header: "Montant", render: (e) => formatMAD(e.amount), sortValue: (e) => e.amount },
                { key: "p", header: "Période", render: (e) => e.period },
                { key: "r", header: "Établissement", render: (e) => restaurantName(e.restaurant) },
                { key: "ev", header: "Évolution", render: (e) => <Delta value={e.trend} invert /> },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4 space-y-4">
          <Section title="Masse salariale" description="Ratio masse salariale / chiffre d'affaires (30 jours)">
            <DataTable
              rows={payrollRows.map((p) => ({ ...p, id: p.restaurant }))}
              columns={[
                { key: "r", header: "Établissement", render: (p) => <span className="font-medium">{restaurantName(p.restaurant)}</span> },
                { key: "e", header: "Salariés", render: (p) => p.employees },
                { key: "m", header: "Masse salariale", render: (p) => formatMAD(p.payroll), sortValue: (p) => p.payroll },
                { key: "ca", header: "CA", render: (p) => formatMAD(p.revenue), sortValue: (p) => p.revenue },
                {
                  key: "ratio",
                  header: "Ratio MS / CA",
                  render: (p) => {
                    const ratio = Number(((p.payroll / p.revenue) * 100).toFixed(1));
                    return (
                      <span className={ratio > 27 ? "font-semibold text-destructive" : "text-success"}>
                        {ratio} %
                      </span>
                    );
                  },
                  sortValue: (p) => p.payroll / p.revenue,
                },
              ]}
            />
          </Section>
          <Section title="Masse salariale par établissement">
            <HBars
              data={payrollRows.map((p) => ({ name: restaurantName(p.restaurant), value: p.payroll }))}
              height={200}
            />
          </Section>
        </TabsContent>

        <TabsContent value="foodcost" className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { l: "Plats rentables", f: (d: number) => d <= 30, tone: "text-success" },
              { l: "À surveiller", f: (d: number) => d > 30 && d <= 34, tone: "text-[oklch(0.52_0.13_70)]" },
              { l: "Faible marge", f: (d: number) => d > 34, tone: "text-destructive" },
            ].map((g) => {
              const list = dishes.filter((d) => g.f(foodCost(d)));
              return (
                <Card key={g.l} className="shadow-[var(--shadow-card)]">
                  <CardContent className="pt-2">
                    <p className="text-xs text-muted-foreground uppercase">{g.l}</p>
                    <p className={`mt-1 text-2xl font-semibold ${g.tone}`}>{list.length} plats</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {list.slice(0, 4).map((d) => (
                        <li key={d.id}>
                          {d.name} — {foodCost(d)} %
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Section title="Food Cost par plat" description="Cible interne : 32 %">
            <DataTable
              rows={dishes}
              pageSize={12}
              searchKeys={(d) => d.name}
              columns={[
                { key: "n", header: "Plat", render: (d) => <span className="font-medium">{d.name}</span>, sortValue: (d) => d.name },
                { key: "p", header: "Prix de vente", render: (d) => formatMAD(d.price), sortValue: (d) => d.price },
                { key: "c", header: "Coût matière", render: (d) => formatMAD(d.materialCost, 1) },
                {
                  key: "fc",
                  header: "Food Cost %",
                  render: (d) => `${foodCost(d)} %`,
                  sortValue: (d) => foodCost(d),
                },
                { key: "m", header: "Marge", render: (d) => formatMAD(d.price - d.materialCost, 1) },
                { key: "ev", header: "Évolution du coût", render: (d) => <Delta value={d.costTrend} invert /> },
                {
                  key: "s",
                  header: "Statut",
                  render: (d) => (
                    <StatusBadge
                      value={foodCost(d) > 34 ? "Critique" : foodCost(d) > 30 ? "À surveiller" : "Normal"}
                    />
                  ),
                },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="balance" className="mt-4">
          <Section
            title="Balance simplifiée"
            description="Ces informations seront alimentées par les données comptables Odoo"
          >
            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {balance.map((b) => (
                <Card key={b.label} className="shadow-[var(--shadow-card)]">
                  <CardContent className="pt-2">
                    <p className="text-xs text-muted-foreground uppercase">{b.label}</p>
                    <p
                      className={`mt-1 text-xl font-semibold tabular-nums ${b.amount < 0 ? "text-destructive" : ""}`}
                    >
                      {formatMAD(b.amount)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <AnalysisPanel module="Finance" />
          <Section
            title="Analyse financière IA"
            description="Lecture consolidée des ventes, charges, paie et nomenclatures"
            action={
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className="size-4" /> Régénérer
              </Button>
            }
          >
            {loading || !analysis ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm">{analysis.summary}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {analysis.blocks.map((b) => (
                    <div key={b.title} className="rounded-xl border p-4">
                      <p className="text-sm font-semibold">{b.title}</p>
                      <p className="mt-1.5 text-sm text-muted-foreground">{b.text}</p>
                    </div>
                  ))}
                </div>
                <AiBadge
                  confidence={analysis.confidence}
                  sources={analysis.sources}
                  generatedAt={analysis.generatedAt}
                />
                <AiDisclaimer />
              </div>
            )}
          </Section>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
