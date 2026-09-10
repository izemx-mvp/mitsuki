import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { useApp } from "@/components/app-context";
import { AppShell } from "@/components/app-shell";
import { AiBadge, AiDisclaimer, DataTable, KpiGrid, Section, StatusBadge } from "@/components/bits";
import { AreaTrend, BarsCompare } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aiRecommendations, formatDate, restaurantName } from "@/data/mitsuki";
import { aiService, type AiAnalysis } from "@/services/aiService";
import { analyticsService } from "@/services/analyticsService";
import { odooService, type PeriodKey } from "@/services/odooService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vue d'ensemble — MITSUKI AI" },
      {
        name: "description",
        content:
          "Tableau de bord de direction MITSUKI AI : chiffre d'affaires, food cost, satisfaction client, alertes et recommandations IA sur les restaurants Mitsuki.",
      },
      { property: "og:title", content: "Vue d'ensemble — MITSUKI AI" },
      {
        property: "og:description",
        content: "Pilotage centralisé des achats, stocks, production, finance et satisfaction client.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { scope, period } = useApp();
  const [chartPeriod, setChartPeriod] = useState<PeriodKey>(period);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(true);

  const kpis = analyticsService.overviewKpis(scope, period);
  const series = analyticsService.revenueSeries(scope, chartPeriod);
  const byRestaurant = analyticsService.revenueByRestaurant(period);
  const alerts = odooService
    .getAlerts(scope)
    .filter((a) => a.status !== "Ignorée")
    .slice(0, 6);

  const runAnalysis = () => {
    setLoadingAi(true);
    aiService.activityAnalysis(scope, period).then((a) => {
      setAnalysis(a);
      setLoadingAi(false);
    });
  };

  useEffect(() => {
    let alive = true;
    setLoadingAi(true);
    aiService.activityAnalysis(scope, period).then((a) => {
      if (alive) {
        setAnalysis(a);
        setLoadingAi(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [scope, period]);

  return (
    <AppShell
      title="Vue d'ensemble"
      ambient
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: "Vue d'ensemble" }]}
    >
      <p className="text-sm text-muted-foreground">
        Couche d'intelligence connectée à Odoo — {restaurantName(scope)}
      </p>

      <KpiGrid items={kpis} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Section
          className="xl:col-span-2"
          title="Évolution du chiffre d'affaires"
          description="Données de vente synchronisées depuis Odoo"
          action={
            <Tabs value={chartPeriod} onValueChange={(v) => setChartPeriod(v as PeriodKey)}>
              <TabsList>
                <TabsTrigger value="7d">7 jours</TabsTrigger>
                <TabsTrigger value="30d">30 jours</TabsTrigger>
                <TabsTrigger value="3m">3 mois</TabsTrigger>
                <TabsTrigger value="12m">Année</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        >
          <AreaTrend data={series} />
        </Section>

        <Section
          title="CA par établissement"
          description="Comparaison sur la période sélectionnée"
        >
          <BarsCompare
            data={byRestaurant}
            xKey="name"
            bars={[{ key: "revenue", label: "Chiffre d'affaires", color: "var(--chart-1)" }]}
          />
        </Section>
      </div>

      <Section
        title="Analyse IA de l'activité"
        description="Synthèse générée automatiquement à partir des données Odoo"
        action={
          <Button variant="outline" size="sm" onClick={runAnalysis} disabled={loadingAi}>
            <RefreshCw className="size-4" /> Régénérer
          </Button>
        }
      >
        {loadingAi || !analysis ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm">{analysis.summary}</p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {analysis.blocks.map((b) => (
                <div key={b.title} className="rounded-xl border p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="size-3.5 text-primary" /> {b.title}
                  </p>
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

      <Section
        title="Points nécessitant votre attention"
        description="Alertes consolidées de tous les modules"
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/alertes">Centre d'alertes</Link>
          </Button>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((a) => (
            <Card key={a.id} className="gap-2 py-4 shadow-[var(--shadow-card)]">
              <CardContent className="space-y-2 px-4">
                <div className="flex items-center gap-2">
                  <StatusBadge value={a.priority} />
                  <Badge variant="secondary" className="rounded-full">
                    {a.category}
                  </Badge>
                </div>
                <p className="text-sm font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(a.date)} · {restaurantName(a.restaurant)}
                </p>
                <Button asChild size="sm" variant="outline" className="mt-1">
                  <Link to="/alerte/$alertId" params={{ alertId: a.id }}>
                    Consulter
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Recommandations IA" description="Analyses proposées, validation humaine requise">
        <DataTable
          rows={aiRecommendations}
          searchKeys={(r) => `${r.title} ${r.domain}`}
          pageSize={6}
          columns={[
            {
              key: "title",
              header: "Recommandation",
              render: (r) => <span className="font-medium">{r.title}</span>,
              sortValue: (r) => r.title,
            },
            { key: "domain", header: "Domaine", render: (r) => <StatusBadge value={r.domain === "Marketing" ? "Neutre" : r.domain} /> },
            { key: "impact", header: "Impact", render: (r) => <StatusBadge value={r.impact} /> },
            {
              key: "desc",
              header: "Description",
              render: (r) => (
                <span className="block max-w-xl text-wrap text-muted-foreground">
                  {r.description}
                </span>
              ),
              className: "whitespace-normal",
            },
            {
              key: "conf",
              header: "Confiance",
              render: (r) => `${r.confidence} %`,
              sortValue: (r) => r.confidence,
            },
            {
              key: "action",
              header: "",
              render: (r) => (
                <Button asChild size="sm" variant="outline">
                  <Link to="/recommandation/$recoId" params={{ recoId: r.id }}>
                    Voir l'analyse
                  </Link>
                </Button>
              ),
            },
          ]}
        />
        <AiDisclaimer />
      </Section>
    </AppShell>
  );
}
