import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { useApp } from "@/components/app-context";
import { AppShell } from "@/components/app-shell";
import { DataTable, Filter, Section, StatusBadge } from "@/components/bits";
import { StatGrid } from "@/components/premium";
import { useStore, type AlertStatus, type RichAlert } from "@/components/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alertModules, memberByName, teamMembers } from "@/data/analyses";
import { formatDate, restaurantName } from "@/data/mitsuki";

export const Route = createFileRoute("/alertes")({
  head: () => ({
    meta: [
      { title: "Centre d'alertes — MITSUKI AI" },
      {
        name: "description",
        content:
          "Centre d'alertes Mitsuki : achats, stocks, production, finance, satisfaction, qualité et community management, avec assignation et suivi.",
      },
      { property: "og:title", content: "Centre d'alertes — MITSUKI AI" },
      {
        property: "og:description",
        content: "Toutes les alertes opérationnelles, assignables et suivies au même endroit.",
      },
    ],
  }),
  component: AlertsModule,
});

function Initials({ name }: { name: string | null }) {
  if (!name) return <span className="text-xs text-muted-foreground">Non assignée</span>;
  const m = memberByName(name);
  return (
    <span className="flex items-center gap-2">
      <Avatar className="size-6">
        <AvatarFallback className="bg-primary/12 text-[10px] text-accent-foreground">
          {m?.initials ?? name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm">{name}</span>
    </span>
  );
}

function AlertsModule() {
  const { scope, user } = useApp();
  const { alerts, updateAlert } = useStore();
  const [fMod, setFMod] = useState("all");
  const [fType, setFType] = useState("all");
  const [fPrio, setFPrio] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fAssignee, setFAssignee] = useState("all");

  const scoped = alerts.filter(
    (a) => scope === "all" || a.restaurant === scope || a.restaurant === "all",
  );

  const count = (fn: (a: RichAlert) => boolean) => String(scoped.filter(fn).length);

  const kpis = [
    {
      label: "Alertes actives",
      value: count((a) => a.status !== "Résolue" && a.status !== "Ignorée"),
      tone: "teal" as const,
    },
    { label: "Critiques", value: count((a) => a.priority === "Critique"), tone: "deep" as const },
    { label: "Non assignées", value: count((a) => !a.assignee), tone: "warm" as const },
    { label: "En cours", value: count((a) => a.status === "En cours") },
    { label: "Résolues", value: count((a) => a.status === "Résolue") },
    { label: "Modules concernés", value: String(new Set(scoped.map((a) => a.module)).size) },
  ];

  const setStatus = (a: RichAlert, status: AlertStatus) => {
    updateAlert(a.id, { status }, `Statut passé à « ${status} »`);
    toast.success(`Alerte « ${status} »`, {
      description: "Action enregistrée dans l'historique de l'alerte.",
    });
  };

  const claim = (a: RichAlert) => {
    updateAlert(
      a.id,
      { assignee: user.name, status: a.status === "Nouvelle" ? "En cours" : a.status },
      `Prise en charge par ${user.name}`,
    );
    toast.success("Alerte prise en charge", { description: `Assignée à ${user.name}.` });
  };

  const assign = (a: RichAlert, name: string) => {
    updateAlert(
      a.id,
      { assignee: name, status: a.status === "Nouvelle" ? "Assignée" : a.status },
      `Assignation à ${name}`,
    );
    toast.success("Alerte assignée", { description: `${name} est responsable du suivi.` });
  };

  const rows = scoped
    .filter((a) => fMod === "all" || a.module === fMod)
    .filter((a) => fType === "all" || a.type === fType)
    .filter((a) => fPrio === "all" || a.priority === fPrio)
    .filter((a) => fStatus === "all" || a.status === fStatus)
    .filter((a) =>
      fAssignee === "all"
        ? true
        : fAssignee === "none"
          ? !a.assignee
          : a.assignee === fAssignee,
    );

  const types = Array.from(new Set(scoped.map((a) => a.type)));

  return (
    <AppShell
      title="Centre d'alertes"
      ambient
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: "Centre d'alertes" }]}
    >
      <StatGrid items={kpis} />

      <Section
        title="Alertes consolidées"
        description="Achats, stocks, production, finance, satisfaction, qualité et community management"
      >
        <DataTable
          rows={rows}
          pageSize={12}
          searchKeys={(a) => `${a.title} ${a.description} ${a.owner} ${a.assignee ?? ""}`}
          toolbar={
            <>
              <Filter value={fMod} onChange={setFMod} label="Module" options={alertModules} />
              <Filter value={fType} onChange={setFType} label="Type" options={types} />
              <Filter
                value={fPrio}
                onChange={setFPrio}
                label="Priorité"
                options={["Critique", "Élevée", "Normale", "Faible"]}
              />
              <Filter
                value={fStatus}
                onChange={setFStatus}
                label="Statut"
                options={["Nouvelle", "Assignée", "En cours", "Résolue", "Ignorée"]}
              />
              <Select value={fAssignee} onValueChange={setFAssignee}>
                <SelectTrigger className="w-[190px] bg-card">
                  <SelectValue placeholder="Responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les responsables</SelectItem>
                  <SelectItem value="none">Non assignées</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          }
          columns={[
            {
              key: "t",
              header: "Alerte",
              render: (a) => (
                <div className="min-w-[240px]">
                  <Link
                    to="/alerte/$alertId"
                    params={{ alertId: a.id }}
                    className="font-medium text-primary hover:underline"
                  >
                    {a.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                </div>
              ),
              sortValue: (a) => a.title,
            },
            { key: "m", header: "Module", render: (a) => a.module, sortValue: (a) => a.module },
            { key: "ty", header: "Type", render: (a) => a.type },
            { key: "r", header: "Établissement", render: (a) => restaurantName(a.restaurant) },
            { key: "d", header: "Date", render: (a) => formatDate(a.date), sortValue: (a) => a.date },
            {
              key: "as",
              header: "Responsable",
              render: (a) => (
                <div className="space-y-1.5">
                  <Initials name={a.assignee} />
                  <Select value={a.assignee ?? ""} onValueChange={(v) => assign(a, v)}>
                    <SelectTrigger className="h-7 w-[170px] text-xs">
                      <SelectValue placeholder="Assigner à…" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={m.name}>
                          {m.name} · {m.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            },
            { key: "p", header: "Priorité", render: (a) => <StatusBadge value={a.priority} /> },
            { key: "s", header: "Statut", render: (a) => <StatusBadge value={a.status} /> },
            {
              key: "act",
              header: "Actions",
              render: (a) => (
                <div className="flex flex-wrap gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => claim(a)}>
                    Prendre en charge
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(a, "Résolue")}>
                    Résoudre
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(a, "Ignorée")}>
                    Ignorer
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Section>
    </AppShell>
  );
}
