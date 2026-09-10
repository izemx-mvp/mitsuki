import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/mitsuki-logo.png";
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
          "Accédez à MITSUKI AI : couche intelligente connectée à Odoo pour piloter les restaurants Mitsuki.",
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Formes subtiles inspirées des couleurs du logo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 size-[520px] rounded-full bg-primary/[0.08] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 size-[480px] rounded-full bg-pink/[0.07] blur-[110px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 size-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange/[0.05] blur-[100px]"
      />

      <Card className="relative z-10 w-full max-w-[420px] border bg-card/85 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <CardContent className="flex flex-col items-center px-8 pb-10 pt-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-petrol/10 to-orange/10 blur-xl" />
            <img
              src={logo}
              alt="Logo Mitsuki"
              width={80}
              height={80}
              className="relative size-16 rounded-2xl object-contain"
            />
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">MITSUKI AI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Espace professionnel
          </p>

          <form onSubmit={submit} className="mt-8 w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vous@mitsuki.ma"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-petrol text-primary-foreground shadow-[var(--shadow-soft)] hover:brightness-105"
              disabled={loading}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <Button variant="link" size="sm" className="mt-4 text-muted-foreground hover:text-primary">
            Mot de passe oublié ?
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
