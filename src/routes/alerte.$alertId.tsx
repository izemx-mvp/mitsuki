import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { useApp } from "@/components/app-context";
import { AppShell } from "@/components/app-shell";
import { BackButton } from "@/components/back-button";
import { AiDisclaimer, Section, StatusBadge } from "@/components/bits";
import { DetailField, RiskGrid, StepList, Timeline } from "@/components/premium";
import { useStore, type AlertStatus } from "@/components/store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alertDetailFor } from "@/data/alert-details";
import { teamMembers } from "@/data/analyses";
import { formatDate, restaurantName } from "@/data/mitsuki";


export const Route = createFileRoute("/alerte/$alertId")({
  head: () => ({
    meta: [
      { title: "Détail d'une alerte — MITSUKI AI" },
      {
        name: "description",
        content:
          "Détail d'une alerte Mitsuki : contexte, établissement, responsable, historique des actions et suivi du statut.",
      },
      { property: "og:title", content: "Détail d'une alerte — MITSUKI AI" },
      { property: "og:description", content: "Contexte, responsable et historique de l'alerte." },
    ],
  }),
  component: AlertDetail,
});

function AlertDetail() {
  const { alertId } = Route.useParams();
  const { alerts, updateAlert } = useStore();
  const { user } = useApp();
  const alert = alerts.find((a) => a.id === alertId);

  if (!alert) {
    return (
      <AppShell title="Alerte introuvable" actions={<BackButton fallback="/alertes" />}>
        <Section title="Alerte introuvable">
          <p className="text-sm text-muted-foreground">
            Cette alerte n'existe plus ou a été supprimée.
          </p>
        </Section>
      </AppShell>
    );
  }

  const detail = alertDetailFor(alert.module);

  const setStatus = (status: AlertStatus) => {

    updateAlert(alert.id, { status }, `Statut passé à « ${status} »`);
    toast.success(`Alerte « ${status} »`);
  };

  return (
    <AppShell
      title="Détail de l'alerte"
      ambient
      breadcrumbs={[
        { label: "MITSUKI AI", to: "/" },
        { label: "Centre d'alertes", to: "/alertes" },
        { label: alert.type },
      ]}
      actions={<BackButton fallback="/alertes" />}
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge value={alert.priority} />
          <StatusBadge value={alert.status} />
          <span className="text-xs text-muted-foreground">
            {alert.module} · {alert.type} · {restaurantName(alert.restaurant)}
          </span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-petrol">{alert.title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">{alert.description}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <DetailField label="Module" value={alert.module} />
        <DetailField label="Date de détection" value={formatDate(alert.date)} />
        <DetailField label="Responsable proposé" value={alert.owner} />
        <DetailField label="Assignée à" value={alert.assignee ?? "Non assignée"} />
      </div>

      <Section
        title="Contexte détecté par l'IA"
        description={`Confiance ${detail.confidence} % · sources : ${detail.sources.join(", ")}`}
      >
        <p className="text-sm text-muted-foreground">{detail.context}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <DetailField label="Conséquence si aucune action" value={detail.consequence} />
          <DetailField
            label="Priorité & délai conseillé"
            value={`${alert.priority} · traitement conseillé sous ${
              alert.priority === "Critique" ? "24 h" : alert.priority === "Élevée" ? "72 h" : "1 semaine"
            }`}
          />
        </div>
      </Section>

      <Section
        title="Produits & postes exactement concernés"
        description="Références précises exposées par cette alerte"
      >
        <RiskGrid items={detail.risks} />
      </Section>

      <Section
        title="Étapes de traitement recommandées"
        description="Plan proposé par l'IA, à valider par le responsable"
      >
        <StepList steps={detail.steps} />
      </Section>



      <div className="grid gap-4 lg:grid-cols-3">
        <Section
          title="Suivi"
          description="Assignation et statut, validés par un utilisateur"
          className="lg:col-span-1"
        >
          <div className="space-y-3">
            <Select
              value={alert.assignee ?? ""}
              onValueChange={(v) => {
                updateAlert(
                  alert.id,
                  { assignee: v, status: alert.status === "Nouvelle" ? "Assignée" : alert.status },
                  `Assignation à ${v}`,
                );
                toast.success("Alerte assignée", { description: v });
              }}
            >
              <SelectTrigger>
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

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  updateAlert(
                    alert.id,
                    { assignee: user.name, status: "En cours" },
                    `Prise en charge par ${user.name}`,
                  );
                  toast.success("Alerte prise en charge");
                }}
              >
                Prendre en charge
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus("Résolue")}>
                Marquer résolue
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setStatus("Ignorée")}>
                Ignorer
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Historique des actions" className="lg:col-span-2">
          <Timeline items={alert.history} />
        </Section>
      </div>

      <AiDisclaimer />
    </AppShell>
  );
}
