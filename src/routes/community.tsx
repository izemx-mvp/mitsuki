import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Lightbulb,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { useApp } from "@/components/app-context";
import { AppShell } from "@/components/app-shell";
import { AiBadge, AiDisclaimer, Filter, Section, StatusBadge } from "@/components/bits";
import { AiThinking } from "@/components/ai-thinking";
import { StatGrid } from "@/components/premium";
import { useStore, type RichIdea, type RichPost } from "@/components/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { dishImage } from "@/data/dish-images";
import {
  dayISO,
  dishes,
  formatDate,
  restaurantName,
  restaurants,
  type Platform,
  type RestaurantId,
} from "@/data/mitsuki";
import { aiService } from "@/services/aiService";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Manager — MITSUKI AI" },
      {
        name: "description",
        content:
          "Idées de contenus, générateur IA de publications et calendrier éditorial Mitsuki : création, planification et publication simulée.",
      },
      { property: "og:title", content: "Community Manager — MITSUKI AI" },
      {
        property: "og:description",
        content: "Idées, génération de contenus et calendrier éditorial pour les 3 établissements.",
      },
    ],
  }),
  component: CommunityModule,
});

const platforms: Platform[] = ["Instagram", "Facebook", "TikTok", "LinkedIn"];
const objectives = ["Notoriété", "Trafic midi", "Ticket moyen", "Proximité", "Nouveauté"];
const contentTypes = ["Post", "Reel", "Story", "Carrousel"];
const tones = ["Gourmand", "Premium", "Convivial", "Informatif"];
const languages = ["Français", "Arabe", "Anglais"];

interface Generated {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  visual: string;
  brief: string;
  confidence: number;
  sources: string[];
  generatedAt: string;
}

/* --------------------------------- Module -------------------------------- */

function CommunityModule() {
  const { scope } = useApp();
  const { ideas, addIdeas, removeIdea, posts, addPost, updatePost, removePost, addAlert } =
    useStore();
  const [tab, setTab] = useState("idees");

  /* Idées */
  const [ideaPlatform, setIdeaPlatform] = useState("all");
  const [ideaCategory, setIdeaCategory] = useState("all");
  const [genIdeas, setGenIdeas] = useState(false);
  const [pubIdea, setPubIdea] = useState<RichIdea | null>(null);
  const [pubDate, setPubDate] = useState(dayISO(1));
  const [pubTime, setPubTime] = useState("19:30");


  /* Générateur */
  const [form, setForm] = useState({
    objective: "Notoriété",
    platform: "Instagram" as Platform,
    restaurant: (scope === "all" ? "all" : scope) as RestaurantId | "all",
    dish: dishes[0]?.name ?? "Dragon Roll",
    type: "Post",
    tone: "Gourmand",
    language: "Français",
  });
  const [image, setImage] = useState<string>(dishImage(form.dish, 0));
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Generated | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Planification */
  const [planOpen, setPlanOpen] = useState(false);
  const [planDate, setPlanDate] = useState(dayISO(1));
  const [planTime, setPlanTime] = useState("19:30");

  /* Calendrier */
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<RichPost | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const scopedPosts = posts.filter(
    (p) => scope === "all" || p.restaurant === scope || p.restaurant === "all",
  );

  const kpis = [
    { label: "Idées disponibles", value: String(ideas.length), tone: "teal" as const },
    {
      label: "Publications planifiées",
      value: String(scopedPosts.filter((p) => p.status === "Planifié").length),
      tone: "warm" as const,
    },
    {
      label: "À valider",
      value: String(scopedPosts.filter((p) => p.status === "À valider").length),
    },
    { label: "Publiées", value: String(scopedPosts.filter((p) => p.status === "Publié").length) },
    {
      label: "Engagement moyen",
      value: `${(
        scopedPosts.filter((p) => p.engagement > 0).reduce((s, p) => s + p.engagement, 0) /
          Math.max(1, scopedPosts.filter((p) => p.engagement > 0).length) || 0
      ).toFixed(1)} %`,
    },
    { label: "Établissements couverts", value: String(new Set(scopedPosts.map((p) => p.restaurant)).size) },
  ];

  /* ------------------------------- Actions ------------------------------- */

  const runIdeas = async () => {
    setGenIdeas(true);
    const list = await aiService.generateSocialIdeas();
    addIdeas(
      list.map((i, k) => ({
        ...i,
        image: dishImage(i.dish, k + ideas.length),
        restaurant: form.restaurant,
        contentType: i.format,
      })),
    );
    setGenIdeas(false);
    toast.success("Nouvelles idées générées", {
      description: "Analyse des ventes, des retours clients et des performances sociales.",
    });
  };

  const useIdea = (i: RichIdea) => {
    setForm((f) => ({
      ...f,
      objective: i.objective,
      platform: i.platform,
      dish: i.dish,
      type: i.format.toLowerCase().includes("reel")
        ? "Reel"
        : i.format.toLowerCase().includes("story")
          ? "Story"
          : i.format.toLowerCase().includes("carrousel")
            ? "Carrousel"
            : "Post",
      restaurant: i.restaurant,
    }));
    setImage(i.image);
    setResult(null);
    setTab("generateur");
    toast.info("Idée chargée dans le générateur");
  };

  /** Publie une idée immédiatement ou la planifie dans le calendrier. */
  const publishIdea = (mode: "now" | "plan") => {
    if (!pubIdea) return;
    const now = new Date();
    const date = mode === "now" ? dayISO(0) : pubDate;
    const time = mode === "now" ? now.toTimeString().slice(0, 5) : pubTime;
    const post: RichPost = {
      id: `sp-${Date.now()}`,
      title: pubIdea.title,
      platform: pubIdea.platform,
      restaurant: pubIdea.restaurant,
      date,
      time,
      status: mode === "now" ? "Publié" : "Planifié",
      caption: `${pubIdea.title}\n\n${pubIdea.dish} — ${pubIdea.format} · objectif ${pubIdea.objective.toLowerCase()}.`,
      hashtags: "#mitsuki #sushirabat",
      visual: "Visuel de l'idée",
      engagement: mode === "now" ? Number((4 + Math.random() * 4).toFixed(1)) : 0,
      image: pubIdea.image,
      objective: pubIdea.objective,
      contentType: pubIdea.contentType,
      cta: "Réservez votre table ou commandez en ligne.",
    };
    addPost(post);
    addAlert({
      id: `al-cm-${Date.now()}`,
      title:
        mode === "now"
          ? `Publication diffusée à contrôler : ${post.title}`
          : `Publication planifiée à valider : ${post.title}`,
      description: `${post.platform} · ${formatDate(date)} à ${time} · ${restaurantName(post.restaurant)}`,
      category: "Qualité",
      module: "Community Manager",
      type: mode === "now" ? "Publication" : "Planification",
      restaurant: post.restaurant,
      priority: "Normale",
      date: dayISO(0),
      status: "Nouvelle",
      owner: "Nada Chraibi",
      assignee: null,
      history: [
        {
          label: mode === "now" ? "Publication immédiate depuis une idée" : "Planification depuis une idée",
          at: dayISO(0),
          by: "Direction Mitsuki",
        },
      ],
    });
    removeIdea(pubIdea.id);
    setPubIdea(null);
    setCursor(new Date(date));
    setTab("calendrier");
    toast.success(
      mode === "now" ? "Publication diffusée (simulation)" : "Publication planifiée",
      { description: `${formatDate(date)} à ${time} · visible dans le calendrier.` },
    );
  };


  const generate = async () => {
    setGenerating(true);
    setResult(null);
    const res = await aiService.generateContent({
      ...form,
      restaurant: restaurantName(form.restaurant),
    });
    setResult(res);
    setGenerating(false);
  };

  const buildPost = (status: RichPost["status"], date: string, time: string): RichPost => ({
    id: `sp-${Date.now()}`,
    title: result?.hook ?? `${form.dish} — ${form.objective}`,
    platform: form.platform,
    restaurant: form.restaurant,
    date,
    time,
    status,
    caption: `${result?.caption ?? ""}\n\n${result?.cta ?? ""}`.trim(),
    hashtags: result?.hashtags ?? "#mitsuki",
    visual: result?.visual ?? "Visuel importé",
    engagement: 0,
    image,
    objective: form.objective,
    contentType: form.type,
    cta: result?.cta ?? "",
  });

  const saveDraft = () => {
    addPost(buildPost("À valider", dayISO(0), "12:00"));
    toast.success("Contenu enregistré", {
      description: "Statut « À valider » : une validation humaine est requise.",
    });
  };

  const confirmPlan = () => {
    const post = buildPost("Planifié", planDate, planTime);
    addPost(post);
    addAlert({
      id: `al-cm-${Date.now()}`,
      title: `Publication planifiée à valider : ${post.title}`,
      description: `${post.platform} · ${formatDate(planDate)} à ${planTime} · ${restaurantName(post.restaurant)}`,
      category: "Qualité",
      module: "Community Manager",
      type: "Planification",
      restaurant: post.restaurant,
      priority: "Normale",
      date: dayISO(0),
      status: "Nouvelle",
      owner: "Nada Chraibi",
      assignee: null,
      history: [
        { label: "Publication planifiée depuis le générateur IA", at: dayISO(0), by: "Direction Mitsuki" },
      ],
    });
    setPlanOpen(false);
    setTab("calendrier");
    setCursor(new Date(planDate));
    toast.success("Publication planifiée", {
      description: `${formatDate(planDate)} à ${planTime} · visible dans le calendrier.`,
    });
  };

  const publishNow = (p: RichPost) => {
    updatePost(p.id, { status: "Publié", engagement: Number((4 + Math.random() * 4).toFixed(1)) });
    setSelected(null);
    toast.success("Publication publiée (simulation)", {
      description: "Statut mis à jour et performance simulée disponible.",
    });
  };

  const onUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
    toast.success("Visuel importé");
  };

  /* ------------------------------ Calendrier ----------------------------- */

  const days = useMemo(() => {
    const d = new Date(cursor);
    if (view === "day") return [new Date(d)];
    if (view === "week") {
      const start = new Date(d);
      start.setDate(d.getDate() - ((d.getDay() + 6) % 7));
      return Array.from({ length: 7 }, (_, i) => {
        const x = new Date(start);
        x.setDate(start.getDate() + i);
        return x;
      });
    }
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const x = new Date(start);
      x.setDate(start.getDate() + i);
      return x;
    });
  }, [cursor, view]);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const shift = (dir: number) => {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  };

  const ideaRows = ideas
    .filter((i) => ideaPlatform === "all" || i.platform === ideaPlatform)
    .filter((i) => ideaCategory === "all" || i.category === ideaCategory);

  return (
    <AppShell
      title="Community Manager"
      ambient
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: "Community Manager" }]}
    >
      <StatGrid items={kpis} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="idees">
            <Lightbulb className="size-4" /> Idées
          </TabsTrigger>
          <TabsTrigger value="generateur">
            <Wand2 className="size-4" /> Générateur
          </TabsTrigger>
          <TabsTrigger value="calendrier">
            <CalendarDays className="size-4" /> Calendrier
          </TabsTrigger>
        </TabsList>

        {/* ------------------------------ Idées ----------------------------- */}
        <TabsContent value="idees" className="space-y-4">
          <Section
            title="Idées de contenus"
            description="Propositions générées à partir des ventes, des retours clients et des performances sociales"
            action={
              <Button onClick={() => void runIdeas()} disabled={genIdeas}>
                <Sparkles className="size-4" /> Générer des idées
              </Button>
            }
          >
            <div className="mb-3 flex flex-wrap gap-2">
              <Filter
                value={ideaPlatform}
                onChange={setIdeaPlatform}
                label="Plateforme"
                options={platforms}
              />
              <Filter
                value={ideaCategory}
                onChange={setIdeaCategory}
                label="Catégorie"
                options={Array.from(new Set(ideas.map((i) => i.category)))}
              />
            </div>

            {genIdeas && <AiThinking className="mb-3" />}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {ideaRows.map((i, k) => (
                <Card
                  key={i.id}
                  className="lift-card gap-0 overflow-hidden py-0 shadow-[var(--shadow-card)]"
                  style={{ animation: "fade-up .4s cubic-bezier(.22,1,.36,1) both", animationDelay: `${k * 40}ms` }}
                >
                  <img src={i.image} alt={i.title} className="h-36 w-full object-cover" />
                  <CardContent className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="rounded-full text-[10px]">
                        {i.platform}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px]">
                        {i.category}
                      </Badge>
                      <StatusBadge value={i.potential} />
                    </div>
                    <p className="text-sm leading-snug font-semibold">{i.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.dish} · {i.format} · objectif {i.objective.toLowerCase()}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setPubIdea(i);
                          setPubDate(dayISO(1));
                        }}
                      >
                        <Send className="size-4" /> Publier
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => useIdea(i)}>
                        <Wand2 className="size-4" /> Utiliser
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          removeIdea(i.id);
                          toast.info("Idée écartée");
                        }}
                        aria-label="Écarter"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
            <AiDisclaimer />
          </Section>
        </TabsContent>

        {/* --------------------------- Générateur --------------------------- */}
        <TabsContent value="generateur" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Paramètres du contenu" description="Choisissez le cadre, l'IA rédige la proposition">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Objectif">
                  <Pick
                    value={form.objective}
                    onChange={(v) => setForm({ ...form, objective: v })}
                    options={objectives}
                  />
                </Field>
                <Field label="Plateforme">
                  <Pick
                    value={form.platform}
                    onChange={(v) => setForm({ ...form, platform: v as Platform })}
                    options={platforms}
                  />
                </Field>
                <Field label="Établissement">
                  <Select
                    value={form.restaurant}
                    onValueChange={(v) => setForm({ ...form, restaurant: v as RestaurantId | "all" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les établissements</SelectItem>
                      {restaurants.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Plat mis en avant">
                  <Select
                    value={form.dish}
                    onValueChange={(v) => {
                      setForm({ ...form, dish: v });
                      setImage(dishImage(v, 0));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dishes.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Type de contenu">
                  <Pick value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={contentTypes} />
                </Field>
                <Field label="Ton">
                  <Pick value={form.tone} onChange={(v) => setForm({ ...form, tone: v })} options={tones} />
                </Field>
                <Field label="Langue">
                  <Pick
                    value={form.language}
                    onChange={(v) => setForm({ ...form, language: v })}
                    options={languages}
                  />
                </Field>
              </div>

              <div className="mt-4 space-y-2">
                <Label className="text-xs text-muted-foreground">Visuel de la publication</Label>
                <div className="flex items-start gap-3">
                  <img src={image} alt="Visuel sélectionné" className="size-24 rounded-xl border object-cover" />
                  <div className="space-y-2">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onUpload(e.target.files?.[0])}
                    />
                    <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                      <ImageIcon className="size-4" /> Importer une image
                    </Button>
                    <p className="text-[11px] text-muted-foreground">
                      Ou utilisez le visuel proposé pour le plat sélectionné.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="mt-4 w-full" onClick={() => void generate()} disabled={generating}>
                <Wand2 className="size-4" /> Générer le contenu
              </Button>
            </Section>

            <Section title="Proposition IA" description="À relire et valider avant publication">
              {generating && <AiThinking />}
              {!generating && !result && (
                <p className="text-sm text-muted-foreground">
                  Renseignez les paramètres puis lancez la génération pour obtenir accroche, texte,
                  appel à l'action, hashtags et brief visuel.
                </p>
              )}
              {!generating && result && (
                <div className="space-y-3">
                  <img src={image} alt="Visuel" className="h-40 w-full rounded-xl border object-cover" />
                  <AiBadge
                    confidence={result.confidence}
                    sources={result.sources}
                    generatedAt={result.generatedAt}
                  />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">{result.hook}</p>
                    <p className="whitespace-pre-line text-muted-foreground">{result.caption}</p>
                    <p className="font-medium">{result.cta}</p>
                    <p className="text-primary">{result.hashtags}</p>
                    <p className="text-xs text-muted-foreground">Visuel : {result.visual}</p>
                    <p className="text-xs text-muted-foreground">Brief : {result.brief}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Sources : {result.sources.join(", ")} · généré le {formatDate(result.generatedAt)}
                    </p>
                  </div>
                  <AiDisclaimer />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setPlanOpen(true)}>
                      <CalendarDays className="size-4" /> Planifier
                    </Button>
                    <Button variant="outline" onClick={saveDraft}>
                      Enregistrer pour validation
                    </Button>
                    <Button variant="ghost" onClick={() => void generate()}>
                      Régénérer
                    </Button>
                  </div>
                </div>
              )}
            </Section>
          </div>
        </TabsContent>

        {/* --------------------------- Calendrier --------------------------- */}
        <TabsContent value="calendrier" className="space-y-4">
          <Section
            title="Calendrier éditorial"
            description="Publications planifiées, à valider et publiées par établissement"
            action={
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => shift(-1)} aria-label="Précédent">
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-[150px] text-center text-sm font-medium">
                  {view === "day"
                    ? cursor.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
                    : cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </span>
                <Button size="sm" variant="outline" onClick={() => shift(1)} aria-label="Suivant">
                  <ChevronRight className="size-4" />
                </Button>
                <Select value={view} onValueChange={(v) => setView(v as typeof view)}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mois</SelectItem>
                    <SelectItem value="week">Semaine</SelectItem>
                    <SelectItem value="day">Jour</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={() => setManualOpen(true)}>
                  <Plus className="size-4" /> Nouveau post
                </Button>
              </div>
            }
          >
            <div
              className={cn(
                "grid gap-1.5",
                view === "day" ? "grid-cols-1" : "grid-cols-7",
              )}
            >
              {view !== "day" &&
                ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                  <div key={d} className="px-1 pb-1 text-center text-[11px] font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
              {days.map((d) => {
                const key = iso(d);
                const dayPosts = scopedPosts.filter((p) => p.date === key);
                const dim = view === "month" && d.getMonth() !== cursor.getMonth();
                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-[104px] rounded-lg border bg-card p-1.5 transition-colors",
                      dim && "opacity-45",
                      key === iso(new Date()) && "border-primary",
                    )}
                  >
                    <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                      {d.getDate()}
                    </p>
                    <div className="space-y-1">
                      {dayPosts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelected(p)}
                          className="flex w-full items-center gap-1.5 rounded-md border bg-background px-1.5 py-1 text-left transition-colors hover:border-primary hover:bg-primary-soft"
                        >
                          <img src={p.image} alt="" className="size-6 shrink-0 rounded object-cover" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-medium">{p.title}</span>
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {p.time} · {p.platform} · {p.status}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      {/* --------------------- Dialog publication d'une idée --------------------- */}
      <Dialog open={!!pubIdea} onOpenChange={(o) => !o && setPubIdea(null)}>
        <DialogContent>
          {pubIdea && (
            <>
              <DialogHeader>
                <DialogTitle>Publier cette idée ?</DialogTitle>
                <DialogDescription>
                  Choisissez une diffusion immédiate ou une planification. Une validation humaine est
                  enregistrée dans le centre d'alertes.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-start gap-3">
                <img src={pubIdea.image} alt="" className="size-20 rounded-xl border object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{pubIdea.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {pubIdea.platform} · {pubIdea.dish} · {restaurantName(pubIdea.restaurant)}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Date de planification">
                  <Input type="date" value={pubDate} onChange={(e) => setPubDate(e.target.value)} />
                </Field>
                <Field label="Heure">
                  <Input type="time" value={pubTime} onChange={(e) => setPubTime(e.target.value)} />
                </Field>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <Button variant="ghost" onClick={() => setPubIdea(null)}>
                  Annuler
                </Button>
                <Button variant="outline" onClick={() => publishIdea("plan")}>
                  <CalendarDays className="size-4" /> Planifier
                </Button>
                <Button onClick={() => publishIdea("now")}>
                  <Send className="size-4" /> Publier maintenant
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* -------------------------- Dialog planification -------------------------- */}

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier la publication</DialogTitle>
            <DialogDescription>
              La publication apparaîtra dans le calendrier avec le statut « Planifié ».
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date">
              <Input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)} />
            </Field>
            <Field label="Heure">
              <Input type="time" value={planTime} onChange={(e) => setPlanTime(e.target.value)} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmPlan}>Confirmer la planification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------------------------- Dialog création ---------------------------- */}
      <ManualPostDialog
        open={manualOpen}
        onOpenChange={setManualOpen}
        onCreate={(p) => {
          addPost(p);
          setCursor(new Date(p.date));
          toast.success("Publication créée", { description: `${formatDate(p.date)} à ${p.time}.` });
        }}
      />

      {/* ----------------------------- Dialog détail ----------------------------- */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.title}</DialogTitle>
                <DialogDescription>
                  {selected.platform} · {restaurantName(selected.restaurant)} ·{" "}
                  {formatDate(selected.date)} à {selected.time}
                </DialogDescription>
              </DialogHeader>
              <img src={selected.image} alt="" className="h-40 w-full rounded-xl border object-cover" />
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={selected.status} />
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {selected.contentType}
                </Badge>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  {selected.objective}
                </Badge>
                {selected.engagement > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Engagement {selected.engagement} %
                  </span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Date">
                  <Input
                    type="date"
                    value={selected.date}
                    onChange={(e) => {
                      updatePost(selected.id, { date: e.target.value });
                      setSelected({ ...selected, date: e.target.value });
                    }}
                  />
                </Field>
                <Field label="Heure">
                  <Input
                    type="time"
                    value={selected.time}
                    onChange={(e) => {
                      updatePost(selected.id, { time: e.target.value });
                      setSelected({ ...selected, time: e.target.value });
                    }}
                  />
                </Field>
              </div>
              <Field label="Texte de la publication">
                <Textarea
                  rows={5}
                  value={selected.caption}
                  onChange={(e) => {
                    updatePost(selected.id, { caption: e.target.value });
                    setSelected({ ...selected, caption: e.target.value });
                  }}
                />
              </Field>
              <p className="text-xs text-primary">{selected.hashtags}</p>
              <DialogFooter className="flex-wrap gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    removePost(selected.id);
                    setSelected(null);
                    toast.info("Publication supprimée");
                  }}
                >
                  <Trash2 className="size-4" /> Supprimer
                </Button>
                {selected.status !== "Publié" && (
                  <Button variant="outline" onClick={() => publishNow(selected)}>
                    <Send className="size-4" /> Publier maintenant
                  </Button>
                )}
                <Button
                  onClick={() => {
                    toast.success("Modifications enregistrées");
                    setSelected(null);
                  }}
                >
                  Enregistrer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

/* -------------------------------- Helpers -------------------------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Pick({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ManualPostDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (p: RichPost) => void;
}) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [restaurant, setRestaurant] = useState<RestaurantId | "all">("all");
  const [dish, setDish] = useState(dishes[0]?.name ?? "Dragon Roll");
  const [date, setDate] = useState(dayISO(1));
  const [time, setTime] = useState("19:30");
  const [image, setImage] = useState(dishImage(dishes[0]?.name ?? "", 0));
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    onCreate({
      id: `sp-${Date.now()}`,
      title: title.trim(),
      platform,
      restaurant,
      date,
      time,
      status: "À valider",
      caption,
      hashtags: "#mitsuki #sushirabat",
      visual: "Visuel importé manuellement",
      engagement: 0,
      image,
      objective: "Notoriété",
      contentType: "Post",
      cta: "",
    });
    setTitle("");
    setCaption("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle publication</DialogTitle>
          <DialogDescription>
            Création manuelle, ajoutée au calendrier avec le statut « À valider ».
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Titre">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Nouveauté Ramen" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Plateforme">
              <Pick value={platform} onChange={(v) => setPlatform(v as Platform)} options={platforms} />
            </Field>
            <Field label="Établissement">
              <Select value={restaurant} onValueChange={(v) => setRestaurant(v as RestaurantId | "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les établissements</SelectItem>
                  {restaurants.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Heure">
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
            <Field label="Plat mis en avant">
              <Select
                value={dish}
                onValueChange={(v) => {
                  setDish(v);
                  setImage(dishImage(v, 0));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dishes.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Visuel">
              <div className="flex items-center gap-2">
                <img src={image} alt="" className="size-9 rounded-md border object-cover" />
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => setImage(String(reader.result));
                    reader.readAsDataURL(f);
                  }}
                />
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                  <ImageIcon className="size-4" /> Importer
                </Button>
              </div>
            </Field>
          </div>
          <Field label="Texte">
            <Textarea rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={submit}>Créer la publication</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
