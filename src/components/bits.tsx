import { ArrowDownRight, ArrowUpRight, Minus, Search, Sparkles } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/* ------------------------------ Badges ------------------------------ */

const toneMap: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  info: "bg-primary-soft text-accent-foreground border-transparent",
  success: "bg-success/12 text-success border-transparent",
  warning: "bg-warning/18 text-[oklch(0.52_0.13_70)] border-transparent",
  danger: "bg-destructive/12 text-destructive border-transparent",
};

const labelTone: Record<string, keyof typeof toneMap> = {
  // priorités
  Critique: "danger",
  Élevée: "warning",
  Normale: "info",
  Faible: "neutral",
  // statuts génériques
  Nouvelle: "danger",
  Nouveau: "danger",
  "En cours": "warning",
  Résolue: "success",
  Traité: "success",
  Ignorée: "neutral",
  // stocks
  Normal: "success",
  "À surveiller": "warning",
  Surstock: "info",
  // besoins d'achat
  "À analyser": "neutral",
  "Recommandation IA": "info",
  "À valider": "warning",
  Validé: "success",
  Commandé: "success",
  // production
  Planifié: "info",
  "En production": "warning",
  Terminé: "success",
  Anomalie: "danger",
  // achats
  Brouillon: "neutral",
  Envoyée: "info",
  Confirmée: "warning",
  Réceptionnée: "success",
  Facturée: "success",
  // sentiments
  "Très positif": "success",
  Positif: "success",
  Neutre: "neutral",
  Négatif: "warning",
  "Très négatif": "danger",
  // impact
  Fort: "danger",
  Moyen: "warning",
  // social
  Idée: "neutral",
  "Brouillon IA": "info",
  Planifié2: "info",
  Publié: "success",
};

export function StatusBadge({ value }: { value: string }) {
  const tone = labelTone[value] ?? "neutral";
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", toneMap[tone])}>
      {value}
    </Badge>
  );
}

/* ------------------------------ Delta ------------------------------ */

export function Delta({ value, invert = false }: { value: number; invert?: boolean }) {
  const good = invert ? value < 0 : value > 0;
  const Icon = value === 0 ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        value === 0 ? "text-muted-foreground" : good ? "text-success" : "text-destructive",
      )}
    >
      <Icon className="size-3.5" />
      {value > 0 ? "+" : ""}
      {value} %
    </span>
  );
}

/* ------------------------------ KPI ------------------------------ */

export interface KpiItem {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  invert?: boolean;
}

export function KpiCard({ item }: { item: KpiItem }) {
  return (
    <Card className="gap-0 py-4 shadow-[var(--shadow-card)]">
      <CardContent className="px-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {item.label}
        </p>
        <p className="mt-2 text-2xl font-semibold tabular-nums">{item.value}</p>
        <div className="mt-2 flex items-center gap-2">
          {typeof item.delta === "number" && <Delta value={item.delta} invert={item.invert ?? false} />}
          <span className="text-xs text-muted-foreground">
            {item.hint ?? "vs période précédente"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {items.map((i) => (
        <KpiCard key={i.label} item={i} />
      ))}
    </div>
  );
}

/* ------------------------------ Sections ------------------------------ */

export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("shadow-[var(--shadow-card)]", className)}>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AiBadge({ confidence, sources, generatedAt }: {
  confidence: number;
  sources: string[];
  generatedAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5 font-medium text-accent-foreground">
        <Sparkles className="size-3.5" /> Confiance IA {confidence} %
      </span>
      <span>Sources : {sources.join(", ")}</span>
      <span>Généré le {new Date(generatedAt).toLocaleString("fr-FR")}</span>
    </div>
  );
}

export function AiDisclaimer() {
  return (
    <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
      Les conclusions de l'IA sont des recommandations nécessitant une validation humaine avant
      toute action.
    </p>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

/* ------------------------------ DataTable ------------------------------ */

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  pageSize = 10,
  onRowClick,
  emptyTitle = "Aucune donnée",
  toolbar,
}: {
  rows: T[];
  columns: Column<T>[];
  searchKeys?: (row: T) => string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  toolbar?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);

  const filtered = useMemo(() => {
    let out = rows;
    if (query && searchKeys) {
      const q = query.toLowerCase();
      out = out.filter((r) => searchKeys(r).toLowerCase().includes(q));
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const va = col.sortValue!(a);
          const vb = col.sortValue!(b);
          const cmp = typeof va === "number" && typeof vb === "number"
            ? va - vb
            : String(va).localeCompare(String(vb));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, query, sort, columns, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const view = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {searchKeys && (
          <div className="relative w-full max-w-xs">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Rechercher…"
              className="pl-8"
            />
          </div>
        )}
        {toolbar}
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description="Ajustez vos filtres ou votre recherche pour afficher des résultats."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {columns.map((c) => (
                    <TableHead
                      key={c.key}
                      className={cn("whitespace-nowrap", c.sortValue && "cursor-pointer select-none", c.className)}
                      onClick={() =>
                        c.sortValue &&
                        setSort((s) =>
                          s?.key === c.key
                            ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" }
                            : { key: c.key, dir: "asc" },
                        )
                      }
                    >
                      {c.header}
                      {sort?.key === c.key && (sort.dir === "asc" ? " ↑" : " ↓")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {view.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(onRowClick && "cursor-pointer")}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((c) => (
                      <TableCell key={c.key} className={cn("whitespace-nowrap", c.className)}>
                        {c.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {current} sur {pages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={current >= pages}
                onClick={() => setPage(current + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------ Filtre ------------------------------ */

export function Filter({
  value,
  onChange,
  label,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: (string | { value: string; label: string })[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[170px]", className)}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label} : tous</SelectItem>
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
