import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/app-shell";
import { DataTable, Section, StatusBadge } from "@/components/bits";
import { Button } from "@/components/ui/button";
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
import {
  dayISO,
  formatDate,
  restaurantName,
  restaurants as seedRestaurants,
  users as seedUsers,
  type Restaurant,
  type RestaurantId,
  type User,
} from "@/data/mitsuki";
import { odooService } from "@/services/odooService";

export const Route = createFileRoute("/configuration")({
  head: () => ({
    meta: [
      { title: "Paramètres — MITSUKI AI" },
      {
        name: "description",
        content:
          "Paramètres MITSUKI AI : établissements, utilisateurs et rôles, comptes réseaux sociaux et journal de validation des décisions humaines.",
      },
      { property: "og:title", content: "Paramètres — MITSUKI AI" },
      { property: "og:description", content: "Établissements, utilisateurs, réseaux sociaux et traçabilité." },
    ],
  }),
  component: SettingsModule,
});


const roles: User["role"][] = [
  "Administrateur",
  "Direction",
  "Finance",
  "Achats",
  "Production",
  "Marketing",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SettingsModule() {
  const log = odooService.getValidationLog();
  const [places, setPlaces] = useState<Restaurant[]>([...seedRestaurants]);
  const [people, setPeople] = useState<User[]>([...seedUsers]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const [place, setPlace] = useState({ name: "", city: "Rabat", couverts: "180", employees: "14" });
  const [person, setPerson] = useState({
    name: "",
    email: "",
    role: "Direction" as User["role"],
    restaurant: "all" as RestaurantId | "all",
  });

  const addPlace = () => {
    if (!place.name.trim() || !place.city.trim()) {
      toast.error("Nom et ville sont obligatoires");
      return;
    }
    const id = place.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") as RestaurantId;
    setPlaces((p) => [
      ...p,
      {
        id,
        odoo_id: 100 + p.length + 1,
        name: place.name.trim(),
        city: place.city.trim(),
        couverts_jour: Number(place.couverts) || 0,
        employees: Number(place.employees) || 0,
      },
    ]);
    setPlaceOpen(false);
    setPlace({ name: "", city: "Rabat", couverts: "180", employees: "14" });
    toast.success("Établissement ajouté", { description: `${place.name} est disponible dans les paramètres.` });
  };

  const addUser = () => {
    if (!person.name.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email.trim())) {
      toast.error("Adresse email invalide");
      return;
    }
    setPeople((u) => [
      ...u,
      {
        id: `u-${Date.now()}`,
        name: person.name.trim(),
        email: person.email.trim().toLowerCase(),
        role: person.role,
        restaurant: person.restaurant,
        active: true,
        lastLogin: dayISO(0),
      },
    ]);
    setUserOpen(false);
    setPerson({ name: "", email: "", role: "Direction", restaurant: "all" });
    toast.success("Utilisateur ajouté", { description: `${person.name} · rôle ${person.role}.` });
  };

  return (
    <AppShell
      title="Paramètres"
      ambient
      breadcrumbs={[{ label: "MITSUKI AI", to: "/" }, { label: "Paramètres" }]}
    >
      <Tabs defaultValue="resto">
        <TabsList className="flex-wrap">
          <TabsTrigger value="resto">
            <Building2 className="size-4" /> Établissements
          </TabsTrigger>
          <TabsTrigger value="users">
            <UserPlus className="size-4" /> Utilisateurs & rôles
          </TabsTrigger>
          <TabsTrigger value="social">Réseaux sociaux</TabsTrigger>
          <TabsTrigger value="log">Journal de validation</TabsTrigger>
        </TabsList>

        <TabsContent value="resto" className="mt-4">
          <Section
            title="Établissements"
            description="Périmètre couvert par MITSUKI AI"
            action={
              <Button size="sm" onClick={() => setPlaceOpen(true)}>
                <Plus className="size-4" /> Ajouter un établissement
              </Button>
            }
          >
            <DataTable
              rows={places}
              columns={[
                { key: "n", header: "Nom", render: (r) => <span className="font-medium">{r.name}</span> },
                { key: "a", header: "Ville", render: (r) => r.city },
                {
                  key: "c",
                  header: "Couverts / jour",
                  render: (r) => r.couverts_jour,
                  sortValue: (r) => r.couverts_jour,
                },
                { key: "e", header: "Salariés", render: (r) => r.employees },
                { key: "o", header: "Identifiant Odoo", render: (r) => r.odoo_id },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <Section
            title="Utilisateurs & rôles"
            description="Droits d'accès par module"
            action={
              <Button size="sm" onClick={() => setUserOpen(true)}>
                <Plus className="size-4" /> Ajouter un utilisateur
              </Button>
            }
          >
            <DataTable
              rows={people}
              columns={[
                { key: "n", header: "Nom", render: (u) => <span className="font-medium">{u.name}</span> },
                { key: "e", header: "Email", render: (u) => u.email },
                { key: "r", header: "Rôle", render: (u) => <StatusBadge value={u.role} /> },
                { key: "s", header: "Périmètre", render: (u) => restaurantName(u.restaurant) },
                { key: "m", header: "Dernière connexion", render: (u) => formatDate(u.lastLogin) },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="social" className="mt-4">
          <Section title="Réseaux sociaux" description="Comptes connectés (simulation)">
            <DataTable
              rows={[
                { id: "ig", res: "Instagram", compte: "@mitsuki.ma", etat: "Validé" },
                { id: "fb", res: "Facebook", compte: "Mitsuki Maroc", etat: "Validé" },
                { id: "tt", res: "TikTok", compte: "@mitsuki.ma", etat: "À valider" },
                { id: "li", res: "LinkedIn", compte: "Mitsuki", etat: "À valider" },
              ]}
              columns={[
                { key: "r", header: "Réseau", render: (r) => <span className="font-medium">{r.res}</span> },
                { key: "c", header: "Compte", render: (r) => r.compte },
                { key: "e", header: "État", render: (r) => <StatusBadge value={r.etat} /> },
              ]}
            />
          </Section>
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <Section
            title="Journal de validation"
            description="Traçabilité des décisions humaines sur les recommandations IA"
          >
            <DataTable
              rows={log}
              pageSize={10}
              searchKeys={(l) => `${l.user} ${l.action} ${l.object}`}
              columns={[
                { key: "d", header: "Date", render: (l) => formatDate(l.date), sortValue: (l) => l.date },
                { key: "u", header: "Utilisateur", render: (l) => l.user },
                { key: "a", header: "Action", render: (l) => l.action },
                { key: "o", header: "Objet", render: (l) => l.object },
                { key: "de", header: "Décision", render: (l) => <StatusBadge value={l.decision} /> },
              ]}
            />
          </Section>
        </TabsContent>
      </Tabs>

      {/* ---------------------- Ajout d'un établissement ---------------------- */}
      <Dialog open={placeOpen} onOpenChange={setPlaceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel établissement</DialogTitle>
            <DialogDescription>
              Renseignez les informations ; l'établissement est ajouté à la liste des paramètres.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom de l'établissement">
              <Input
                value={place.name}
                onChange={(e) => setPlace({ ...place, name: e.target.value })}
                placeholder="Ex. Mitsuki Hay Riad"
                maxLength={60}
              />
            </Field>
            <Field label="Ville">
              <Input
                value={place.city}
                onChange={(e) => setPlace({ ...place, city: e.target.value })}
                maxLength={40}
              />
            </Field>
            <Field label="Couverts par jour">
              <Input
                type="number"
                min={0}
                value={place.couverts}
                onChange={(e) => setPlace({ ...place, couverts: e.target.value })}
              />
            </Field>
            <Field label="Nombre de salariés">
              <Input
                type="number"
                min={0}
                value={place.employees}
                onChange={(e) => setPlace({ ...place, employees: e.target.value })}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlaceOpen(false)}>
              Annuler
            </Button>
            <Button onClick={addPlace}>Ajouter l'établissement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------ Ajout d'un utilisateur ---------------------- */}
      <Dialog open={userOpen} onOpenChange={setUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Nom, email, rôle et périmètre d'accès aux modules MITSUKI AI.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nom complet">
              <Input
                value={person.name}
                onChange={(e) => setPerson({ ...person, name: e.target.value })}
                placeholder="Ex. Amine Berrada"
                maxLength={60}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={person.email}
                onChange={(e) => setPerson({ ...person, email: e.target.value })}
                placeholder="prenom.nom@mitsuki.ma"
                maxLength={100}
              />
            </Field>
            <Field label="Rôle">
              <Select
                value={person.role}
                onValueChange={(v) => setPerson({ ...person, role: v as User["role"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Périmètre">
              <Select
                value={person.restaurant}
                onValueChange={(v) => setPerson({ ...person, restaurant: v as RestaurantId | "all" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les établissements</SelectItem>
                  {places.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUserOpen(false)}>
              Annuler
            </Button>
            <Button onClick={addUser}>Ajouter l'utilisateur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
