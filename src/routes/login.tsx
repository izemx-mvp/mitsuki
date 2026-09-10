import { createFileRoute, useRouter } from "@tanstack/react-router";
import { BarChart3, Bot, ShieldCheck, Sparkles, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import dragon from "@/assets/dish-dragon-roll.jpg";
import rainbow from "@/assets/dish-rainbow-roll.jpg";
import bento from "@/assets/dish-bento.jpg";
import logo from "@/assets/mitsuki-logo.png";
import { AiBackground } from "@/components/ai-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — MITSUKI AI" },
      {
        name: "description",
        content:
          "Accédez à MITSUKI AI : couche intelligente connectée à Odoo pour piloter achats, stocks, production, finance, satisfaction et communication des restaurants Mitsuki.",
      },
      { property: "og:title", content: "Connexion — MITSUKI AI" },
      {
        property: "og:description",
        content: "Intelligence opérationnelle & pilotage pour les restaurants Mitsuki.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

const highlights = [
  {
    icon: BarChart3,
    title: "Pilotage unifié",
    text: "Achats, stocks, production et finance consolidés depuis Odoo.",
  },
  {
    icon: Bot,
    title: "Assistant IA de direction",
    text: "Analyses, risques précis par produit et étapes d'action recommandées.",
  },
  {
    icon: Sparkles,
    title: "Community manager",
    text: "Idées de contenus, génération et calendrier éditorial validés par vous.",
  },
  {
    icon: ShieldCheck,
    title: "Validation humaine",
    text: "L'IA analyse et recommande, vous validez, le système exécute.",
  },
];

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("direction@mitsuki.ma");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Bienvenue sur MITSUKI AI", {
        description: "Compte de démonstration — Direction",
      });
      router.navigate({ to: "/" });
    }, 600);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AiBackground />

      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1.1fr_minmax(0,380px)] lg:gap-16 lg:py-16">
        {/* ------------------------- Présentation projet ------------------------- */}
        <section className="order-2 lg:order-1">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo Mitsuki"
              width={512}
              height={512}
              className="icon-float size-14 rounded-2xl object-contain"
            />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">MITSUKI AI</h1>
              <p className="text-sm text-muted-foreground">
                Intelligence opérationnelle &amp; pilotage — restauration asiatique
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
            La couche intelligente connectée à Odoo pour les restaurants Mitsuki d'Arribate Center,
            Gare Agdal et Carrousel : détection des ruptures, écarts de production, dérives de Food
            Cost, retours clients et opportunités de contenu — avec des recommandations traçables.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {highlights.map((h) => (
              <div
                key={h.title}
                className="lift-card flex gap-3 rounded-2xl border bg-card/70 p-3.5 backdrop-blur"
              >
                <span className="icon-chip size-9 shrink-0">
                  <h.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{h.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{h.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            {[
              { src: dragon, alt: "Dragon Roll signature Mitsuki" },
              { src: rainbow, alt: "Rainbow Roll Mitsuki" },
              { src: bento, alt: "Bento du midi Mitsuki" },
            ].map((i) => (
              <img
                key={i.alt}
                src={i.src}
                alt={i.alt}
                loading="lazy"
                className="h-24 w-full rounded-2xl border object-cover shadow-[var(--shadow-card)] sm:h-32"
              />
            ))}
          </div>
        </section>

        {/* ------------------------------ Formulaire ----------------------------- */}
        <section className="order-1 w-full lg:order-2">
          <Card className="shadow-[var(--shadow-soft)] backdrop-blur">
            <CardContent className="pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Utensils className="size-4 text-primary" /> Connexion à votre espace
              </div>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Connexion…" : "Se connecter"}
                </Button>
              </form>
              <p className="mt-4 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                Compte de démonstration : <strong>direction@mitsuki.ma</strong> — rôle Direction.
                Prototype alimenté par des données Odoo simulées.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
