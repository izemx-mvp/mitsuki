import { createFileRoute, Link } from "@tanstack/react-router";
import { FileUp } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useApp } from "@/components/app-context";
import { AppShell } from "@/components/app-shell";
import {
  AiBadge,
  AiDisclaimer,
  DataTable,
  Filter,
  Section,
  StatusBadge,
} from "@/components/bits";
import { AiThinking } from "@/components/ai-thinking";
import { HBars } from "@/components/charts";
import { StatGrid } from "@/components/premium";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore, type ActionItem, type ActionStatus } from "@/components/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate, restaurantName, restaurants, type Feedback } from "@/data/mitsuki";
import { aiService } from "@/services/aiService";
import { analyticsService } from "@/services/analyticsService";
import { odooService } from "@/services/odooService";

export const Route = createFileRoute("/satisfaction")({
  head: () => ({
    meta: [
      { title: "Satisfaction & Qualité — MITSUKI AI" },
      {
        name: "description",
        content:
          "Analyse des retours clients Mitsuki, notes par plat et par établissement, problèmes qualité détectés et corrélations IA jusqu'au fournisseur.",
      },
      { property: "og:title", content: "Satisfaction & Qualité — MITSUKI AI" },
      {
        property: "og:description",
        content: "Détectez les irritants clients et remontez à leur cause réelle.",
      },
    ],
  }),
  component: SatisfactionModule,
});

function SatisfactionModule() {
  const { scope } = useApp();
  const [fSentiment, setFSentiment] = useState("all");
  const [fStatus, setFStatus] = useState("all");

  const { feedbacks: allFeedbacks, addFeedback, actions, updateAction } = useStore();
  const feedbacks = allFeedbacks.filter((f) => scope === "all" || f.restaurant === scope);
  const issues = odooService.getQualityIssues(scope);
  const score = analyticsService.satisfactionScore(scope);

  const negatives = feedbacks.filter(
    (f) => f.sentiment === "Négatif" || f.sentiment === "Très négatif",
  );
  const nps = Math.round(
    ((feedbacks.filter((f) => f.recommend >= 9).length -
      feedbacks.filter((f) => f.recommend <= 6).length) /
      Math.max(feedbacks.length, 1)) *
      100,
  );

  const avg = (key: "service" | "product" | "cleanliness") =>
    Number((feedbacks.reduce((a, f) => a + f[key], 0) / Math.max(feedbacks.length, 1)).toFixed(2));

  const kpis = [
    { label: "Score global", value: `${score} / 5`, delta: -2.4 },
    { label: "Note service", value: `${avg("service")} / 5`, delta: -1.1 },
    { label: "Note produit", value: `${avg("product")} / 5`, delta: -3.2 },
    { label: "Note propreté", value: `${avg("cleanliness")} / 5`, delta: 0.8 },
    { label: "NPS estimé", value: String(nps), delta: -4.5 },
    { label: "Avis négatifs", value: String(negatives.length), delta: 8.3, invert: true },
  ];

  const byDish = useMemo(() => {
    const map = new Map<string, { total: number; n: number; neg: number }>();
    for (const f of feedbacks) {
      const e = map.get(f.dish) ?? { total: 0, n: 0, neg: 0 };
      e.total += (f.service + f.product + f.cleanliness) / 3;
      e.n += 1;
      if (f.sentiment === "Négatif" || f.sentiment === "Très négatif") e.neg += 1;
      map.set(f.dish, e);
    }
    return [...map.entries()]
      .map(([dish, v]) => ({
        id: dish,
        dish,
        score: Number((v.total / v.n).toFixed(2)),
        count: v.n,
        negatives: v.neg,
      }))
      .sort((a, b) => a.score - b.score);
  }, [feedbacks]);

  const byRestaurant = restaurants.map((r) => {
    const rows = allFeedbacks.filter((f) => f.restaurant === r.id);
    const s = analyticsService.satisfactionScore(r.id);
    return {
      id: r.id,
      name: r.name,
      score: s,
      count: rows.length,
      negatives: rows.filter((f) => f.sentiment === "Négatif" || f.sentiment === "Très négatif")
        .length,
    };
  });

  return (
    <AppShell
      title="Satisfaction & Qualité"
      ambient
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: "Satisfaction & Qualité" }]}
      actions={<ImportSheet onImport={addFeedback} />}
    >
      <StatGrid items={kpis} />

      <Tabs defaultValue="feedbacks">
        <TabsList className="flex-wrap">
          <TabsTrigger value="feedbacks">Retours clients</TabsTrigger>
          <TabsTrigger value="dishes">Par plat</TabsTrigger>
          <TabsTrigger value="restaurants">Par établissement</TabsTrigger>
          <TabsTrigger value="issues">Problèmes détectés</TabsTrigger>
          <TabsTrigger value="plan">Plan d'action</TabsTrigger>
          <TabsTrigger value="ai">Analyse IA</TabsTrigger>
        </TabsList>

        <TabsContent value="feedbacks" className="mt-4">
          <Section title="Fiches de satisfaction" description="120 retours collectés sur 45 jours">
            <DataTable
              rows={feedbacks
                .filter((f) => fSentiment === "all" || f.sentiment === fSentiment)
                .filter((f) => fStatus === "all" || f.status === fStatus)}
              pageSize={12}
              searchKeys={(f) => `${f.order} ${f.dish} ${f.comment}`}
              toolbar={
                <>
                  <Filter
                    value={fSentiment}
                    onChange={setFSentiment}
                    label="Sentiment"
                    options={["Très positif", "Positif", "Neutre", "Négatif", "Très négatif"]}
                  />
                  <Filter
                    value={fStatus}
                    onChange={setFStatus}
                    label="Statut"
                    options={["Nouveau", "En cours", "Traité"]}
                  />
                </>
              }
              columns={[
                { key: "d", header: "Date", render: (f) => formatDate(f.date), sortValue: (f) => f.date },
                {
                  key: "o",
                  header: "Commande",
                  render: (f) => (
                    <Link
                      to="/feedback/$feedbackId"
                      params={{ feedbackId: f.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {f.order}
                    </Link>
                  ),
                  sortValue: (f) => f.order,
                },
                { key: "r", header: "Établissement", render: (f) => restaurantName(f.restaurant) },
                { key: "p", header: "Plat", render: (f) => f.dish, sortValue: (f) => f.dish },
                {
                  key: "n",
                  header: "Notes (S/P/Pr)",
                  render: (f) => `${f.service} / ${f.product} / ${f.cleanliness}`,
                },
                { key: "rec", header: "Recommandation", render: (f) => `${f.recommend}/10`, sortValue: (f) => f.recommend },
                {
                  key: "c",
                  header: "Commentaire",
                  render: (f) => <span className="text-muted-foreground">{f.comment}</span>,
                },
                { key: "s", header: "Sentiment", render: (f) => <StatusBadge value={f.sentiment} /> },
                { key: "st", header: "Statut", render: (f) => <StatusBadge value={f.status} /> },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="dishes" className="mt-4 space-y-4">
          <Section title="Plats les moins bien notés">
            <HBars
              data={byDish.slice(0, 8).map((d) => ({
                name: d.dish,
                value: d.score,
                color: d.score < 3.5 ? "var(--destructive)" : "var(--chart-2)",
              }))}
              height={300}
            />
          </Section>
          <Section title="Détail par plat">
            <DataTable
              rows={byDish}
              pageSize={10}
              searchKeys={(d) => d.dish}
              columns={[
                { key: "d", header: "Plat", render: (d) => <span className="font-medium">{d.dish}</span>, sortValue: (d) => d.dish },
                { key: "s", header: "Note moyenne", render: (d) => `${d.score} / 5`, sortValue: (d) => d.score },
                { key: "n", header: "Nb d'avis", render: (d) => d.count, sortValue: (d) => d.count },
                { key: "neg", header: "Avis négatifs", render: (d) => d.negatives, sortValue: (d) => d.negatives },
                {
                  key: "st",
                  header: "Statut",
                  render: (d) => (
                    <StatusBadge value={d.score < 3.5 ? "Critique" : d.score < 4 ? "À surveiller" : "Normal"} />
                  ),
                },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="restaurants" className="mt-4">
          <Section title="Satisfaction par établissement">
            <DataTable
              rows={byRestaurant}
              columns={[
                { key: "n", header: "Établissement", render: (r) => <span className="font-medium">{r.name}</span> },
                { key: "s", header: "Score", render: (r) => `${r.score} / 5`, sortValue: (r) => r.score },
                { key: "c", header: "Nb d'avis", render: (r) => r.count },
                { key: "neg", header: "Avis négatifs", render: (r) => r.negatives },
                {
                  key: "st",
                  header: "Statut",
                  render: (r) => <StatusBadge value={r.score < 4 ? "À surveiller" : "Normal"} />,
                },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="issues" className="mt-4">
          <Section
            title="Problèmes qualité détectés par l'IA"
            description="Regroupements de retours corrélés à la production et aux achats"
          >
            <DataTable
              rows={issues}
              searchKeys={(i) => `${i.title} ${i.dish}`}
              columns={[
                {
                  key: "t",
                  header: "Problème",
                  render: (i) => (
                    <Link
                      to="/probleme/$issueId"
                      params={{ issueId: i.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {i.title}
                    </Link>
                  ),
                  sortValue: (i) => i.title,
                },
                { key: "d", header: "Plat", render: (i) => i.dish },
                { key: "c", header: "Catégorie", render: (i) => i.category, sortValue: (i) => i.category },
                { key: "n", header: "Retours", render: (i) => i.feedbackCount, sortValue: (i) => i.feedbackCount },
                { key: "r", header: "Établissement", render: (i) => restaurantName(i.restaurant) },
                { key: "f", header: "1re occurrence", render: (i) => formatDate(i.firstSeen) },
                { key: "l", header: "Dernière", render: (i) => formatDate(i.lastSeen) },
                { key: "conf", header: "Confiance IA", render: (i) => `${i.confidence} %`, sortValue: (i) => i.confidence },
                { key: "p", header: "Priorité", render: (i) => <StatusBadge value={i.priority} /> },
                { key: "s", header: "Statut", render: (i) => <StatusBadge value={i.status} /> },
              ]}
            />
            <AiDisclaimer />
          </Section>
        </TabsContent>

        <TabsContent value="plan" className="mt-4">
          <Section
            title="Plan d'action qualité"
            description="Actions issues des retours clients et des analyses IA, suivies jusqu'à la résolution"
          >
            <div className="grid gap-3 lg:grid-cols-4">
              {(["À traiter", "En cours", "À vérifier", "Résolu"] as ActionStatus[]).map((col) => (
                <div key={col} className="space-y-2 rounded-xl border bg-muted/40 p-2.5">
                  <p className="px-1 text-xs font-semibold tracking-wide uppercase">
                    {col} · {actions.filter((a) => a.status === col).length}
                  </p>
                  {actions
                    .filter((a) => a.status === col)
                    .map((a) => (
                      <ActionCard key={a.id} item={a} onChange={updateAction} />
                    ))}
                </div>
              ))}
            </div>
            <AiDisclaimer />
          </Section>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <Section
            title="Analyse IA satisfaction & qualité"
            description="Corrélations entre retours clients, production et lots fournisseurs"
          >
            <div className="space-y-3 text-sm">
              <p className="rounded-xl bg-primary-soft px-4 py-3">
                Score global de {score}/5 sur {feedbacks.length} fiches, avec {negatives.length}{" "}
                retours négatifs. Le premier irritant reste la fraîcheur du saumon sur Gare Agdal,
                corrélée à un lot fournisseur réceptionné il y a 13 jours.
              </p>
              {issues.slice(0, 3).map((i) => (
                <div key={i.id} className="rounded-xl border p-4">
                  <p className="font-semibold">{i.title}</p>
                  <p className="mt-1 text-muted-foreground">
                    Chaîne détectée : {i.chain.feedback} → {i.chain.dish} → {i.chain.production} →{" "}
                    {i.chain.material} → {i.chain.supplier}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confiance IA {i.confidence} % · {i.feedbackCount} retours liés
                  </p>
                </div>
              ))}
            </div>
            <AiDisclaimer />
          </Section>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

/* -------------------------------- Helpers -------------------------------- */

function ActionCard({
  item,
  onChange,
}: {
  item: ActionItem;
  onChange: (id: string, patch: Partial<ActionItem>) => void;
}) {
  return (
    <div className="lift-card space-y-2 rounded-lg border bg-card p-3">
      <p className="text-sm leading-snug font-medium">{item.title}</p>
      <p className="text-xs text-muted-foreground">{item.detail}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge value={item.priority} />
        <span className="text-[11px] text-muted-foreground">{item.owner}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {item.source} · {formatDate(item.date)}
      </p>
      <Select
        value={item.status}
        onValueChange={(v) => {
          onChange(item.id, { status: v as ActionStatus });
          toast.success(`Action déplacée vers « ${v} »`);
        }}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(["À traiter", "En cours", "À vérifier", "Résolu"] as ActionStatus[]).map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type Parsed = Awaited<ReturnType<typeof aiService.analyzeSatisfactionSheet>>;

function ImportSheet({ onImport }: { onImport: (f: Feedback) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (file?: File) => {
    if (!file) return;
    setOpen(true);
    setParsed(null);
    setLoading(true);
    const res = await aiService.analyzeSatisfactionSheet(file.name);
    setParsed(res);
    setLoading(false);
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => void run(e.target.files?.[0])}
      />
      <Button variant="outline" className="bg-card" onClick={() => fileRef.current?.click()}>
        <FileUp className="size-4" /> Importer une fiche
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lecture de la fiche de satisfaction</DialogTitle>
            <DialogDescription>
              Extraction simulée des notes et du commentaire, à valider avant enregistrement.
            </DialogDescription>
          </DialogHeader>
          {loading && <AiThinking />}
          {parsed && !loading && (
            <div className="space-y-2 text-sm">
              <p className="text-xs text-muted-foreground">Fichier : {parsed.fileName}</p>
              <p>
                {restaurantName(parsed.restaurant)} · {formatDate(parsed.date)} · {parsed.order}
              </p>
              <p>
                Notes : service {parsed.service}/5 · produit {parsed.product}/5 · propreté{" "}
                {parsed.cleanliness}/5 · recommandation {parsed.recommend}/10
              </p>
              <p className="text-muted-foreground">« {parsed.comment} »</p>
              <AiBadge
                confidence={parsed.confidence}
                sources={parsed.sources}
                generatedAt={parsed.generatedAt}
              />
              <AiDisclaimer />
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              disabled={!parsed || loading}
              onClick={() => {
                if (!parsed) return;
                onImport({
                  id: `fb-${Date.now()}`,
                  date: parsed.date,
                  order: parsed.order,
                  restaurant: parsed.restaurant,
                  service: parsed.service,
                  product: parsed.product,
                  cleanliness: parsed.cleanliness,
                  recommend: parsed.recommend,
                  dish: parsed.dish,
                  comment: parsed.comment,
                  sentiment: parsed.sentiment,
                  priority: parsed.priority,
                  status: "Nouveau",
                });
                setOpen(false);
                toast.success("Fiche enregistrée", {
                  description: "Le retour est ajouté à la voix du client.",
                });
              }}
            >
              Valider et enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
