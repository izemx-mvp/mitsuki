import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  alertTypesByModule,
  defaultOwnerByModule,
  type AlertModule,
} from "@/data/analyses";
import { dishImage } from "@/data/dish-images";
import {
  alerts as seedAlerts,
  dayISO,
  feedbacks as seedFeedbacks,
  qualityIssues,
  socialIdeas as seedIdeas,
  socialPosts as seedPosts,
  type Alert,
  type Feedback,
  type NeedPriority,
  type RestaurantId,
  type SocialIdea,
  type SocialPost,
} from "@/data/mitsuki";

/* ------------------------------ Types ------------------------------ */

export type AlertStatus = "Nouvelle" | "Assignée" | "En cours" | "Résolue" | "Ignorée";

export interface AlertEvent {
  label: string;
  at: string;
  by: string;
}

export interface RichAlert extends Omit<Alert, "status"> {
  module: AlertModule;
  type: string;
  status: AlertStatus;
  assignee: string | null;
  history: AlertEvent[];
}

export interface RichIdea extends SocialIdea {
  image: string;
  restaurant: RestaurantId | "all";
  contentType: string;
}

export interface RichPost extends SocialPost {
  image: string;
  objective: string;
  contentType: string;
  cta: string;
}

export type ActionStatus = "À traiter" | "À vérifier" | "En cours" | "Résolu";

export interface ActionItem {
  id: string;
  title: string;
  source: string;
  impact: "Fort" | "Moyen" | "Faible";
  owner: string;
  priority: NeedPriority;
  date: string;
  status: ActionStatus;
  detail: string;
}

/* --------------------------- Seed mapping --------------------------- */

const moduleFromCategory = (a: Alert): AlertModule => {
  switch (a.category) {
    case "Stock":
      return "Stocks";
    case "Qualité":
      return "Qualité";
    case "Achats":
      return "Achats";
    case "Finance":
      return "Finance";
    default:
      return "Production";
  }
};

const typeFor = (a: Alert, m: AlertModule): string => {
  const t = a.title.toLowerCase();
  const list = alertTypesByModule[m];
  const found = list.find((x) => t.includes(x.toLowerCase()));
  return found ?? list[0]!;
};

const toRich = (a: Alert): RichAlert => {
  const module = moduleFromCategory(a);
  return {
    ...a,
    module,
    type: typeFor(a, module),
    status: a.status as AlertStatus,
    assignee: a.status === "Nouvelle" ? null : a.owner,
    history: [
      { label: "Création de l'alerte par l'IA", at: a.date, by: "MITSUKI AI" },
      ...(a.status === "Nouvelle"
        ? []
        : [{ label: `Assignation à ${a.owner}`, at: a.date, by: "Direction Mitsuki" }]),
      ...(a.status === "En cours"
        ? [{ label: "Prise en charge", at: a.date, by: a.owner }]
        : []),
      ...(a.status === "Résolue"
        ? [{ label: "Résolution enregistrée", at: a.date, by: a.owner }]
        : []),
    ],
  };
};

const extraAlerts: RichAlert[] = [
  {
    id: "al-cm1",
    title: "Publication Instagram à valider avant planification",
    description:
      "Le contenu « Nouveauté Ramen Poulet Miso » attend une validation humaine avant publication.",
    category: "Qualité",
    module: "Community Manager",
    type: "Contenu à valider",
    restaurant: "all",
    priority: "Normale",
    date: dayISO(0),
    status: "Nouvelle",
    owner: "Nada Chraibi",
    assignee: null,
    history: [{ label: "Création de l'alerte par l'IA", at: dayISO(0), by: "MITSUKI AI" }],
  },
  {
    id: "al-sat1",
    title: "Temps d'attente supérieur à 30 min le vendredi soir",
    description:
      "7 retours clients mentionnent une attente excessive à Arribate Center sur le service du vendredi.",
    category: "Qualité",
    module: "Satisfaction",
    type: "Temps d'attente",
    restaurant: "arribate",
    priority: "Élevée",
    date: dayISO(-1),
    status: "Nouvelle",
    owner: "Hind Ouazzani",
    assignee: null,
    history: [{ label: "Création de l'alerte par l'IA", at: dayISO(-1), by: "MITSUKI AI" }],
  },
];

const ideaSeed: RichIdea[] = seedIdeas.map((i, k) => ({
  ...i,
  image: dishImage(i.dish, k),
  restaurant: "all",
  contentType: i.format,
}));

const postSeed: RichPost[] = seedPosts.map((p, k) => ({
  ...p,
  image: dishImage(p.title, k),
  objective: "Notoriété",
  contentType: "Post",
  cta: "Réservez votre table ou commandez en ligne.",
}));

const actionSeed: ActionItem[] = [
  ...qualityIssues.slice(0, 4).map((q, k) => ({
    id: `ap-${q.id}`,
    title: `Traiter : ${q.title}`,
    source: `Problème qualité · ${q.feedbackCount} retours`,
    impact: (q.priority === "Critique" ? "Fort" : "Moyen") as "Fort" | "Moyen",
    owner: k % 2 === 0 ? "Hind Ouazzani" : "Karim Idrissi",
    priority: q.priority,
    date: q.lastSeen,
    status: (["À traiter", "En cours", "À vérifier", "Résolu"] as ActionStatus[])[k % 4]!,
    detail: q.causes?.[0] ?? "Analyse IA des retours clients corrélés à la production.",
  })),
  {
    id: "ap-extra1",
    title: "Vérifier la chaîne du froid des vitrines de Gare Agdal",
    source: "Corrélation IA feedbacks / réceptions",
    impact: "Fort",
    owner: "Hind Ouazzani",
    priority: "Critique",
    date: dayISO(0),
    status: "À traiter",
    detail:
      "14 retours sur la fraîcheur du saumon corrélés à un lot fournisseur réceptionné il y a 13 jours.",
  },
  {
    id: "ap-extra2",
    title: "Renforcer l'équipe de salle le vendredi soir",
    source: "Retours temps d'attente",
    impact: "Moyen",
    owner: "Direction Mitsuki",
    priority: "Élevée",
    date: dayISO(-2),
    status: "À vérifier",
    detail: "7 retours mentionnent une attente supérieure à 30 minutes à Arribate Center.",
  },
];

/* ------------------------------ Store ------------------------------ */

interface StoreValue {
  alerts: RichAlert[];
  updateAlert: (id: string, patch: Partial<RichAlert>, event?: string) => void;
  addAlert: (a: RichAlert) => void;

  ideas: RichIdea[];
  addIdeas: (list: RichIdea[]) => void;
  removeIdea: (id: string) => void;

  posts: RichPost[];
  addPost: (p: RichPost) => void;
  updatePost: (id: string, patch: Partial<RichPost>) => void;
  removePost: (id: string) => void;

  feedbacks: Feedback[];
  addFeedback: (f: Feedback) => void;
  updateFeedback: (id: string, patch: Partial<Feedback>) => void;

  actions: ActionItem[];
  updateAction: (id: string, patch: Partial<ActionItem>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<RichAlert[]>([
    ...extraAlerts,
    ...seedAlerts.map(toRich),
  ]);
  const [ideas, setIdeas] = useState<RichIdea[]>(ideaSeed);
  const [posts, setPosts] = useState<RichPost[]>(postSeed);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(seedFeedbacks);
  const [actions, setActions] = useState<ActionItem[]>(actionSeed);

  const updateAlert = useCallback(
    (id: string, patch: Partial<RichAlert>, event?: string) =>
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ...patch,
                history: event
                  ? [
                      ...a.history,
                      { label: event, at: new Date().toISOString().slice(0, 10), by: "Direction Mitsuki" },
                    ]
                  : a.history,
              }
            : a,
        ),
      ),
    [],
  );

  const value = useMemo<StoreValue>(
    () => ({
      alerts,
      updateAlert,
      addAlert: (a) => setAlerts((prev) => [a, ...prev]),
      ideas,
      addIdeas: (list) => setIdeas((prev) => [...list, ...prev]),
      removeIdea: (id) => setIdeas((prev) => prev.filter((i) => i.id !== id)),
      posts,
      addPost: (p) => setPosts((prev) => [p, ...prev]),
      updatePost: (id, patch) =>
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
      removePost: (id) => setPosts((prev) => prev.filter((p) => p.id !== id)),
      feedbacks,
      addFeedback: (f) => setFeedbacks((prev) => [f, ...prev]),
      updateFeedback: (id, patch) =>
        setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f))),
      actions,
      updateAction: (id, patch) =>
        setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    }),
    [alerts, ideas, posts, feedbacks, actions, updateAlert],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { defaultOwnerByModule };
