import { Link } from "@tanstack/react-router";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Delta } from "@/components/bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/* ------------------------- Animated counter ------------------------- */

export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 700,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const initial = from.current;
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(initial + (value - initial) * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {display.toLocaleString("fr-FR", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ----------------------------- Stat card ---------------------------- */

export interface StatItem {
  label: string;
  value: string;
  numeric?: number;
  suffix?: string;
  delta?: number;
  invert?: boolean;
  hint?: string;
  tone?: "teal" | "warm" | "deep" | "plain";
  icon?: ReactNode;
}

const toneClass: Record<NonNullable<StatItem["tone"]>, string> = {
  teal: "grad-teal",
  warm: "grad-warm",
  deep: "grad-deep",
  plain: "",
};

export function StatCard({ item, index = 0 }: { item: StatItem; index?: number }) {
  return (
    <Card
      className={cn(
        "lift-card gap-0 overflow-hidden py-4 shadow-[var(--shadow-card)]",
        toneClass[item.tone ?? "plain"],
      )}
      style={{ animation: "fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${index * 45}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {item.label}
          </p>
          {item.icon && <span className="text-primary">{item.icon}</span>}
        </div>
        <p className="mt-2 text-2xl font-semibold text-petrol">
          {typeof item.numeric === "number" ? (
            <AnimatedCounter value={item.numeric} suffix={item.suffix ?? ""} />
          ) : (
            item.value
          )}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {typeof item.delta === "number" && <Delta value={item.delta} invert={item.invert ?? false} />}
          <span className="text-xs text-muted-foreground">{item.hint ?? "vs période précédente"}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatGrid({ items, cols = 6 }: { items: StatItem[]; cols?: 4 | 6 }) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
        cols === 6 ? "xl:grid-cols-6" : "xl:grid-cols-4",
      )}
    >
      {items.map((i, k) => (
        <StatCard key={i.label} item={i} index={k} />
      ))}
    </div>
  );
}

/* -------------------------- AI insight card ------------------------- */

export function AiInsightCard({
  title,
  description,
  impact,
  confidence,
  sources,
  generatedAt,
  restaurant,
  category,
  to,
  params,
  extra,
  index = 0,
}: {
  title: string;
  description: string;
  impact: "Fort" | "Moyen" | "Faible";
  confidence: number;
  sources: string[];
  generatedAt: string;
  restaurant: string;
  category: string;
  to: string;
  params: Record<string, string>;
  extra?: ReactNode;
  index?: number;
}) {
  const tone = impact === "Fort" ? "grad-deep" : impact === "Moyen" ? "grad-warm" : "grad-teal";
  return (
    <Card
      className={cn("lift-card relative overflow-hidden shadow-[var(--shadow-card)]")}
      style={{ animation: "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${index * 70}ms` }}
    >
      <div className={cn("absolute inset-x-0 top-0 h-14", tone)} />
      <CardContent className="relative space-y-3 pt-2">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
            <BrainCircuit className="size-4.5 [animation:var(--animate-pulse-soft)]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="rounded-full text-[10px]">
                {category}
              </Badge>
              <ImpactBadge impact={impact} />
            </div>
            <p className="mt-1.5 text-sm leading-snug font-semibold">{title}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{description}</p>
        {extra}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-medium text-accent-foreground">
              <Sparkles className="size-3.5" /> Confiance IA
            </span>
            <span className="font-semibold tabular-nums">{confidence} %</span>
          </div>
          <Progress value={confidence} className="h-1.5" />
        </div>

        <div className="space-y-0.5 text-[11px] text-muted-foreground">
          <p>Sources : {sources.join(", ")}</p>
          <p>
            {restaurant} · généré le {new Date(generatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="w-full">
          <Link to={to} params={params}>
            Voir l'analyse <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function ImpactBadge({ impact }: { impact: "Fort" | "Moyen" | "Faible" }) {
  const cls =
    impact === "Fort"
      ? "bg-bordeaux/12 text-bordeaux"
      : impact === "Moyen"
        ? "bg-orange/15 text-orange"
        : "bg-primary/12 text-primary";
  return (
    <Badge variant="outline" className={cn("rounded-full border-transparent text-[10px]", cls)}>
      Impact {impact.toLowerCase()}
    </Badge>
  );
}

/* ------------------------------ Timeline ---------------------------- */

export function Timeline({
  items,
}: {
  items: { label: string; at: string; by?: string }[];
}) {
  return (
    <ol className="relative space-y-4 border-l pl-5">
      {items.map((it, i) => (
        <li key={`${it.label}-${i}`} className="relative">
          <span className="absolute top-1 -left-[1.6rem] grid size-3 place-items-center rounded-full bg-primary ring-4 ring-background" />
          <p className="text-sm font-medium">{it.label}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(it.at).toLocaleDateString("fr-FR")}
            {it.by ? ` · ${it.by}` : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}

/* --------------------------- Detail header -------------------------- */

export function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border bg-card px-3 py-2">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

/* ------------------------- Produits à risque ------------------------ */

export function RiskGrid({
  items,
}: {
  items: { name: string; detail: string; level: "Critique" | "Élevé" | "Modéré"; metric?: string }[];
}) {
  const tone = {
    Critique: "border-bordeaux/35 bg-bordeaux/[0.07] text-bordeaux",
    "Élevé": "border-orange/40 bg-orange/[0.08] text-orange",
    "Modéré": "border-primary/35 bg-primary/[0.07] text-primary",
  } as const;

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((r, i) => (
        <div
          key={r.name}
          className={cn("rounded-xl border px-3 py-2.5", tone[r.level])}
          style={{ animation: "fade-up .4s cubic-bezier(.22,1,.36,1) both", animationDelay: `${i * 50}ms` }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold">{r.name}</p>
            <Badge variant="outline" className="shrink-0 rounded-full border-current text-[10px]">
              {r.level}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-foreground/70">{r.detail}</p>
          {r.metric && <p className="mt-1.5 text-sm font-semibold tabular-nums">{r.metric}</p>}
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Étapes d'action ------------------------ */

export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={s} className="flex items-start gap-2.5 rounded-xl border bg-card px-3 py-2">
          <span className="icon-chip mt-0.5 size-6 shrink-0 text-[11px] font-semibold">{i + 1}</span>
          <span className="text-sm">{s}</span>
        </li>
      ))}
    </ol>
  );
}
