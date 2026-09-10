/**
 * Analyses IA détaillées (données de démonstration).
 * Consommées via services/aiService, jamais directement par l'UI.
 */

import { dayISO, type NeedPriority, type RestaurantId } from "@/data/mitsuki";

export type AnalysisModule = "Achats" | "Production" | "Finance" | "Satisfaction";

export interface AnalysisPoint {
  label: string;
  value: string;
  hint?: string;
}

export type RiskLevel = "Critique" | "Élevé" | "Modéré";

/** Produit / poste précisément exposé par l'analyse. */
export interface RiskItem {
  name: string;
  detail: string;
  level: RiskLevel;
  metric?: string;
}

export interface Analysis {
  id: string;
  module: AnalysisModule;
  category: string;
  title: string;
  description: string;
  impact: "Fort" | "Moyen" | "Faible";
  priority: NeedPriority;
  confidence: number;
  sources: string[];
  generatedAt: string;
  restaurant: RestaurantId | "all";
  observed: AnalysisPoint[];
  evolution: { date: string; value: number }[];
  evolutionLabel: string;
  cause: string;
  impactText: string;
  recommendation: string;
  estimatedGain?: string;
  /** Produits / postes exactement à risque. */
  riskItems?: RiskItem[];
  /** Étapes concrètes de la suggestion IA. */
  steps?: string[];
}


const serie = (base: number, steps: number[]) =>
  steps.map((s, i) => ({ date: dayISO(-((steps.length - i) * 3)), value: Number((base + s).toFixed(1)) }));

export const analyses: Analysis[] = [
  /* ---------------------------- Achats ---------------------------- */
  {
    id: "an-a1",
    module: "Achats",
    category: "Rupture anticipée",
    title: "Rupture de saumon frais anticipée sous 24 h à Gare Agdal",
    description:
      "La consommation de saumon progresse plus vite que le réapprovisionnement : la couverture tombe à 0,8 jour.",
    impact: "Fort",
    priority: "Critique",
    confidence: 91,
    sources: ["Stocks Odoo", "Consommation 30 jours", "Délais fournisseur"],
    generatedAt: dayISO(0),
    restaurant: "agdal",
    observed: [
      { label: "Stock actuel", value: "18,4 kg" },
      { label: "Consommation moyenne", value: "22,6 kg / jour" },
      { label: "Couverture", value: "0,8 jour", hint: "seuil interne 2 jours" },
      { label: "Délai fournisseur", value: "1 jour" },
    ],
    evolution: serie(24, [0, -1.5, -3, -4.2, -5.6, -6.1]),
    evolutionLabel: "Couverture stock (kg)",
    cause:
      "Hausse de 12 % des ventes de California Roll et Dragon Roll sur 14 jours, sans ajustement du calendrier de commande hebdomadaire.",
    impactText:
      "2 ruptures par mois en service du soir, soit environ 9 800 MAD de ventes manquées et un risque d'insatisfaction client.",
    recommendation:
      "Passer la commande de 42 kg dès aujourd'hui chez Océan Frais SARL et avancer la commande hebdomadaire de 24 h.",
    estimatedGain: "9 800 MAD / mois",
  },
  {
    id: "an-a2",
    module: "Achats",
    category: "Prix fournisseur",
    title: "Dérive du prix des emballages : +8,9 % en deux mois",
    description:
      "Le prix unitaire des emballages augmente sans variation de volume, sur un fournisseur unique.",
    impact: "Moyen",
    priority: "Élevée",
    confidence: 86,
    sources: ["Commandes fournisseurs Odoo", "Historique des prix", "Volumes achetés"],
    generatedAt: dayISO(-1),
    restaurant: "all",
    observed: [
      { label: "Prix moyen actuel", value: "2,44 MAD / unité" },
      { label: "Prix il y a 60 jours", value: "2,24 MAD / unité" },
      { label: "Volume mensuel", value: "34 600 unités" },
      { label: "Fournisseurs actifs", value: "1" },
    ],
    evolution: serie(2.24, [0, 0.04, 0.09, 0.13, 0.17, 0.2]),
    evolutionLabel: "Prix unitaire (MAD)",
    cause: "Dépendance à un fournisseur unique et absence de contrat cadre annuel.",
    impactText: "Surcoût estimé de 6 900 MAD par mois sur l'ensemble des établissements.",
    recommendation:
      "Lancer une consultation auprès de deux fournisseurs alternatifs et négocier un contrat cadre trimestriel.",
    estimatedGain: "6 900 MAD / mois",
  },
  {
    id: "an-a3",
    module: "Achats",
    category: "Surstock",
    title: "Surstock de nouilles udon à Carrousel",
    description: "La couverture atteint 21 jours pour une rotation cible de 8 jours.",
    impact: "Moyen",
    priority: "Normale",
    confidence: 78,
    sources: ["Stocks Odoo", "Ventes ramen", "Nomenclatures"],
    generatedAt: dayISO(-2),
    restaurant: "carrousel",
    observed: [
      { label: "Stock", value: "126 kg" },
      { label: "Consommation", value: "6 kg / jour" },
      { label: "Couverture", value: "21 jours" },
      { label: "Valeur immobilisée", value: "4 280 MAD" },
    ],
    evolution: serie(14, [0, 1.4, 2.8, 4.1, 5.5, 7]),
    evolutionLabel: "Jours de couverture",
    cause: "Commande passée sur un ancien niveau de ventes de ramen, en baisse de 18 % depuis la rentrée.",
    impactText: "Immobilisation de trésorerie et risque de dépréciation avant date limite.",
    recommendation:
      "Suspendre la prochaine commande, transférer 40 kg vers Arribate Center et mettre le ramen en avant sur le menu du midi.",
    estimatedGain: "4 280 MAD immobilisés",
  },
  {
    id: "an-a4",
    module: "Achats",
    category: "Fournisseur",
    title: "Fiabilité de livraison dégradée chez Asia Import Maroc",
    description: "Le taux de livraison conforme passe de 96 % à 88 % sur 60 jours.",
    impact: "Moyen",
    priority: "Élevée",
    confidence: 82,
    sources: ["Réceptions Odoo", "Commandes fournisseurs", "Écarts de quantité"],
    generatedAt: dayISO(-3),
    restaurant: "all",
    observed: [
      { label: "Livraisons conformes", value: "88 %" },
      { label: "Retards moyens", value: "1,4 jour" },
      { label: "Commandes concernées", value: "9" },
      { label: "Références impactées", value: "6" },
    ],
    evolution: serie(96, [0, -1.5, -3, -4.5, -6, -8]),
    evolutionLabel: "Taux de conformité (%)",
    cause: "Regroupement des tournées de livraison par le fournisseur depuis août.",
    impactText: "Risque de rupture sur les références sèches et surcharge des réceptions du matin.",
    recommendation:
      "Planifier un point fournisseur, ajouter un stock tampon de 2 jours sur les 6 références concernées.",
  },

  /* -------------------------- Production -------------------------- */
  {
    id: "an-p1",
    module: "Production",
    category: "Surconsommation",
    title: "Surconsommation de saumon de 14 % sur les makis signature",
    description:
      "La consommation réelle dépasse la consommation théorique issue des nomenclatures.",
    impact: "Fort",
    priority: "Critique",
    confidence: 88,
    sources: ["Ordres de fabrication", "Nomenclatures", "Consommation Odoo"],
    generatedAt: dayISO(0),
    restaurant: "arribate",
    observed: [
      { label: "Consommation théorique", value: "184 kg" },
      { label: "Consommation réelle", value: "210 kg" },
      { label: "Écart", value: "+14 %" },
      { label: "Coût de l'écart", value: "5 460 MAD" },
    ],
    evolution: serie(8, [0, 1.5, 3, 4.5, 5.4, 6]),
    evolutionLabel: "Écart de consommation (%)",
    cause: "Grammages non respectés en service du soir et pertes de parage supérieures à la norme.",
    impactText: "Dégradation du Food Cost de 1,6 point sur les plats concernés.",
    recommendation:
      "Recaler les nomenclatures, former les équipes du soir au grammage et pesée de contrôle sur 2 semaines.",
    estimatedGain: "5 460 MAD / mois",
  },
  {
    id: "an-p2",
    module: "Production",
    category: "Surproduction",
    title: "Surproduction récurrente de Bento le lundi",
    description: "La production dépasse les ventes réelles de 22 % en début de semaine.",
    impact: "Moyen",
    priority: "Élevée",
    confidence: 84,
    sources: ["Ordres de fabrication", "Ventes", "Pertes déclarées"],
    generatedAt: dayISO(-1),
    restaurant: "agdal",
    observed: [
      { label: "Production prévue", value: "120 unités" },
      { label: "Production réelle", value: "118 unités" },
      { label: "Ventes", value: "92 unités" },
      { label: "Pertes", value: "26 unités" },
    ],
    evolution: serie(12, [0, 2, 4, 6, 8, 10]),
    evolutionLabel: "Écart production / ventes (%)",
    cause: "Prévision basée sur la moyenne hebdomadaire sans pondération du jour de la semaine.",
    impactText: "Environ 3 200 MAD de pertes mensuelles et gaspillage alimentaire évitable.",
    recommendation:
      "Appliquer une prévision journalière pondérée et réduire l'ordre du lundi à 95 unités.",
    estimatedGain: "3 200 MAD / mois",
  },
  {
    id: "an-p3",
    module: "Production",
    category: "Sous-production",
    title: "Sous-production de Ramen Poulet Miso le vendredi soir",
    description: "La demande dépasse la production disponible sur le service du soir.",
    impact: "Moyen",
    priority: "Normale",
    confidence: 76,
    sources: ["Ventes horaires", "Ordres de fabrication", "Ruptures constatées"],
    generatedAt: dayISO(-2),
    restaurant: "carrousel",
    observed: [
      { label: "Production", value: "48 portions" },
      { label: "Demande estimée", value: "62 portions" },
      { label: "Ruptures", value: "3 services" },
      { label: "Ventes manquées", value: "1 850 MAD" },
    ],
    evolution: serie(6, [0, 1, 2.5, 3.5, 5, 6.5]),
    evolutionLabel: "Portions manquantes",
    cause: "Capacité de bouillon limitée et absence d'anticipation du pic du vendredi.",
    impactText: "Ventes manquées et report des clients vers des plats à marge plus faible.",
    recommendation: "Lancer un second bain de bouillon à 17 h le vendredi et porter l'ordre à 65 portions.",
    estimatedGain: "1 850 MAD / mois",
  },
  {
    id: "an-p4",
    module: "Production",
    category: "Risque de rupture",
    title: "Risque de rupture sur 4 références de produits de la mer",
    description: "La couverture descend sous 2 jours sur quatre matières premières critiques.",
    impact: "Fort",
    priority: "Élevée",
    confidence: 87,
    sources: ["Stocks Odoo", "Nomenclatures", "Plan de production"],
    generatedAt: dayISO(-1),
    restaurant: "all",
    observed: [
      { label: "Références concernées", value: "4" },
      { label: "Couverture moyenne", value: "1,4 jour" },
      { label: "Plats impactés", value: "9" },
      { label: "CA exposé", value: "24 600 MAD" },
    ],
    evolution: serie(3, [0, -0.3, -0.6, -0.9, -1.2, -1.6]),
    evolutionLabel: "Couverture moyenne (jours)",
    cause: "Plan de production du week-end non répercuté sur le calendrier d'achats.",
    impactText: "Risque de retrait de 9 plats de la carte sur le service du samedi.",
    recommendation: "Synchroniser le plan de production et le calendrier d'achats avec 48 h d'avance.",
  },

  /* ---------------------------- Finance --------------------------- */
  {
    id: "an-f1",
    module: "Finance",
    category: "Food Cost",
    title: "Food Cost à 36,4 % contre une cible de 32 %",
    description: "Quatre plats signature portent l'essentiel de l'écart de Food Cost.",
    impact: "Fort",
    priority: "Critique",
    confidence: 89,
    sources: ["Nomenclatures", "Prix d'achat", "Prix de vente", "Ventes Odoo"],
    generatedAt: dayISO(0),
    restaurant: "all",
    observed: [
      { label: "Food Cost moyen", value: "36,4 %" },
      { label: "Cible interne", value: "32 %" },
      { label: "Plats hors cible", value: "4" },
      { label: "Impact mensuel", value: "18 400 MAD" },
    ],
    evolution: serie(32, [0, 0.8, 1.6, 2.6, 3.5, 4.4]),
    evolutionLabel: "Food Cost (%)",
    cause: "Hausse du prix du saumon et du thon combinée à des grammages supérieurs à la nomenclature.",
    impactText: "Perte de marge de 4,4 points, soit environ 18 400 MAD par mois.",
    recommendation:
      "Recaler les nomenclatures des 4 plats, ajuster 2 prix de vente et sécuriser un prix saumon trimestriel.",
    estimatedGain: "18 400 MAD / mois",
  },
  {
    id: "an-f2",
    module: "Finance",
    category: "Charges",
    title: "Charges d'énergie en hausse de 9,4 %",
    description: "La consommation énergétique progresse plus vite que l'activité.",
    impact: "Moyen",
    priority: "Élevée",
    confidence: 81,
    sources: ["Charges Odoo", "Relevés énergie", "Heures d'ouverture"],
    generatedAt: dayISO(-1),
    restaurant: "arribate",
    observed: [
      { label: "Charges énergie", value: "48 200 MAD" },
      { label: "Variation", value: "+9,4 %" },
      { label: "Variation du CA", value: "+3,1 %" },
      { label: "Ratio / CA", value: "4,2 %" },
    ],
    evolution: serie(44, [0, 0.6, 1.4, 2.3, 3.2, 4.2]),
    evolutionLabel: "Charges énergie (kMAD)",
    cause: "Fonctionnement continu des vitrines réfrigérées hors service et absence de programmation.",
    impactText: "Surcoût annualisé estimé à 49 000 MAD.",
    recommendation: "Programmer les équipements hors service et auditer les 3 vitrines les plus anciennes.",
    estimatedGain: "4 100 MAD / mois",
  },
  {
    id: "an-f3",
    module: "Finance",
    category: "Masse salariale",
    title: "Ratio masse salariale / CA à 29,1 % à Carrousel",
    description: "Le ratio dépasse le seuil interne de 27 % depuis six semaines.",
    impact: "Moyen",
    priority: "Élevée",
    confidence: 83,
    sources: ["Paie", "Ventes Odoo", "Planning"],
    generatedAt: dayISO(-2),
    restaurant: "carrousel",
    observed: [
      { label: "Ratio actuel", value: "29,1 %" },
      { label: "Seuil interne", value: "27 %" },
      { label: "Effectif", value: "15" },
      { label: "Écart mensuel", value: "7 300 MAD" },
    ],
    evolution: serie(27, [0, 0.3, 0.8, 1.3, 1.7, 2.1]),
    evolutionLabel: "Masse salariale / CA (%)",
    cause: "Effectif dimensionné sur les pics du vendredi appliqué à toute la semaine.",
    impactText: "Écart de 7 300 MAD par mois par rapport à la cible.",
    recommendation: "Replanifier les effectifs par tranche horaire à partir des couverts réels.",
    estimatedGain: "7 300 MAD / mois",
  },
  {
    id: "an-f4",
    module: "Finance",
    category: "Marge",
    title: "Opportunité de marge sur trois plats à forte rotation",
    description: "Trois plats très vendus supportent une hausse de prix limitée sans perte de volume.",
    impact: "Moyen",
    priority: "Normale",
    confidence: 74,
    sources: ["Ventes Odoo", "Élasticité observée", "Nomenclatures"],
    generatedAt: dayISO(-3),
    restaurant: "all",
    observed: [
      { label: "Plats concernés", value: "3" },
      { label: "Hausse simulée", value: "+4 MAD" },
      { label: "Volume à risque", value: "-1,2 %" },
      { label: "Marge additionnelle", value: "12 700 MAD" },
    ],
    evolution: serie(18, [0, 0.6, 1.1, 1.9, 2.4, 3.1]),
    evolutionLabel: "Marge additionnelle (kMAD)",
    cause: "Positionnement tarifaire inférieur de 6 % à la moyenne du marché local sur ces références.",
    impactText: "Gain potentiel de 12 700 MAD par mois avec un impact volume marginal.",
    recommendation: "Tester la hausse sur un établissement pendant 3 semaines avant généralisation.",
    estimatedGain: "12 700 MAD / mois",
  },
  {
    id: "an-f5",
    module: "Finance",
    category: "CA",
    title: "Panier moyen en retrait de 6 % à Carrousel",
    description: "Le panier moyen est inférieur aux deux autres établissements malgré une fréquentation stable.",
    impact: "Moyen",
    priority: "Normale",
    confidence: 77,
    sources: ["Ventes Odoo", "Tickets", "Mix produits"],
    generatedAt: dayISO(-4),
    restaurant: "carrousel",
    observed: [
      { label: "Panier moyen", value: "148 MAD" },
      { label: "Moyenne réseau", value: "158 MAD" },
      { label: "Écart", value: "-6 %" },
      { label: "Tickets / jour", value: "132" },
    ],
    evolution: serie(158, [0, -2, -4, -6, -8, -10]),
    evolutionLabel: "Panier moyen (MAD)",
    cause: "Faible attachement des accompagnements et boissons dans le mix de vente.",
    impactText: "Manque à gagner d'environ 39 600 MAD par mois.",
    recommendation: "Mettre en place deux formules d'accompagnement et former l'équipe à la vente additionnelle.",
    estimatedGain: "39 600 MAD / mois",
  },
  {
    id: "an-f6",
    module: "Finance",
    category: "Rentabilité",
    title: "Rentabilité par établissement : écart de 3,8 points",
    description: "Arribate Center dégage 3,8 points de marge opérationnelle de plus que Carrousel.",
    impact: "Fort",
    priority: "Élevée",
    confidence: 85,
    sources: ["Ventes Odoo", "Charges Odoo", "Paie"],
    generatedAt: dayISO(-2),
    restaurant: "all",
    observed: [
      { label: "Marge Arribate", value: "18,6 %" },
      { label: "Marge Gare Agdal", value: "16,2 %" },
      { label: "Marge Carrousel", value: "14,8 %" },
      { label: "Écart", value: "3,8 pts" },
    ],
    evolution: serie(16, [0, 0.4, 0.9, 1.4, 2.1, 2.6]),
    evolutionLabel: "Écart de marge (points)",
    cause: "Combinaison d'un panier moyen plus faible et d'un ratio masse salariale plus élevé à Carrousel.",
    impactText: "Environ 46 000 MAD de résultat mensuel non capté.",
    recommendation:
      "Déployer à Carrousel le plan d'action panier moyen et la replanification des effectifs.",
    estimatedGain: "46 000 MAD / mois",
  },
];

export const analysisById = (id: string) => analyses.find((a) => a.id === id);
export const analysesByModule = (m: AnalysisModule) => analyses.filter((a) => a.module === m);

/* ------------------------------------------------------------------ */
/* Équipe (assignation des alertes)                                    */
/* ------------------------------------------------------------------ */

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export const teamMembers: TeamMember[] = [
  { id: "tm1", name: "Direction Mitsuki", role: "Direction", initials: "DM" },
  { id: "tm2", name: "Youssef El Amrani", role: "Responsable Achats", initials: "YA" },
  { id: "tm3", name: "Karim Idrissi", role: "Responsable Production", initials: "KI" },
  { id: "tm4", name: "Salma Bennani", role: "Responsable Finance", initials: "SB" },
  { id: "tm5", name: "Hind Ouazzani", role: "Responsable Qualité", initials: "HO" },
  { id: "tm6", name: "Nada Chraibi", role: "Responsable Marketing", initials: "NC" },
];

export const memberByName = (name: string) => teamMembers.find((m) => m.name === name);

export type AlertModule =
  | "Achats"
  | "Production"
  | "Stocks"
  | "Finance"
  | "Satisfaction"
  | "Qualité"
  | "Community Manager";

export const alertTypesByModule: Record<AlertModule, string[]> = {
  Achats: ["Rupture", "Surstock", "Prix fournisseur", "Commande", "Fournisseur"],
  Production: ["Surproduction", "Sous-production", "Surconsommation", "Écart de production", "Rendement"],
  Stocks: ["Stock faible", "Stock critique", "Stock dormant"],
  Finance: ["Food Cost", "Marge", "Charges", "Masse salariale", "CA", "Balance"],
  Satisfaction: ["Réclamation client", "Service", "Temps d'attente"],
  Qualité: ["Qualité produit", "Propreté", "Plat", "Matière première"],
  "Community Manager": ["Publication", "Planification", "Contenu à valider"],
};

export const alertModules = Object.keys(alertTypesByModule) as AlertModule[];

export const defaultOwnerByModule: Record<AlertModule, string> = {
  Achats: "Youssef El Amrani",
  Production: "Karim Idrissi",
  Stocks: "Youssef El Amrani",
  Finance: "Salma Bennani",
  Satisfaction: "Hind Ouazzani",
  Qualité: "Hind Ouazzani",
  "Community Manager": "Nada Chraibi",
};

/* ------------------------------------------------------------------ */
/* Détail : produits exactement à risque + étapes de la suggestion     */
/* ------------------------------------------------------------------ */

const enrichment: Record<string, { riskItems: RiskItem[]; steps: string[] }> = {
  "an-a1": {
    riskItems: [
      { name: "Saumon frais (MP-001)", detail: "18,4 kg en stock pour 22,6 kg consommés par jour", level: "Critique", metric: "0,8 j de couverture" },
      { name: "Dragon Roll", detail: "Plat le plus exposé : 34 % de la consommation de saumon", level: "Critique", metric: "-42 ventes / jour si rupture" },
      { name: "California Roll", detail: "Ventes +12 % sur 14 jours sans ajustement des commandes", level: "Élevé", metric: "+12 % de demande" },
      { name: "Rainbow Roll", detail: "Retrait de la carte probable dès le service du soir", level: "Modéré", metric: "9 800 MAD / mois exposés" },
    ],
    steps: [
      "Commander 42 kg de saumon frais chez Océan Frais SARL aujourd'hui avant 16 h.",
      "Avancer la commande hebdomadaire de 24 heures dans Odoo.",
      "Relever le stock de sécurité du saumon de 20 kg à 32 kg.",
      "Prévenir la cuisine de Gare Agdal du plan de production ajusté.",
    ],
  },
  "an-a2": {
    riskItems: [
      { name: "Barquettes bento (MP-021)", detail: "2,44 MAD contre 2,24 MAD il y a 60 jours", level: "Élevé", metric: "+8,9 %" },
      { name: "Sachets de livraison (MP-023)", detail: "Fournisseur unique, aucun contrat cadre", level: "Élevé", metric: "34 600 unités / mois" },
      { name: "Couverts jetables (MP-025)", detail: "Hausse de 5,1 % sur la même période", level: "Modéré", metric: "+5,1 %" },
    ],
    steps: [
      "Lancer une consultation auprès de deux fournisseurs alternatifs.",
      "Négocier un contrat cadre trimestriel sur les 3 références.",
      "Comparer les offres puis valider le nouveau fournisseur.",
    ],
  },
  "an-a3": {
    riskItems: [
      { name: "Nouilles udon (MP-014)", detail: "126 kg pour 6 kg consommés par jour", level: "Élevé", metric: "21 j de couverture" },
      { name: "Bouillon miso concentré (MP-016)", detail: "Rotation ralentie de 18 % depuis la rentrée", level: "Modéré", metric: "4 280 MAD immobilisés" },
    ],
    steps: [
      "Suspendre la prochaine commande de nouilles udon.",
      "Transférer 40 kg vers Arribate Center.",
      "Mettre le ramen en avant sur le menu du midi pendant 2 semaines.",
    ],
  },
  "an-a4": {
    riskItems: [
      { name: "Asia Import Maroc", detail: "Taux de conformité 88 % contre 96 %", level: "Élevé", metric: "1,4 j de retard moyen" },
      { name: "Riz à sushi (MP-030)", detail: "3 livraisons incomplètes sur 60 jours", level: "Élevé", metric: "6 références touchées" },
      { name: "Sauce soja (MP-032)", detail: "Écarts de quantité récurrents à la réception", level: "Modéré", metric: "9 commandes" },
    ],
    steps: [
      "Planifier un point fournisseur cette semaine.",
      "Ajouter un stock tampon de 2 jours sur les 6 références.",
      "Contrôler chaque réception pendant un mois.",
    ],
  },
  "an-p1": {
    riskItems: [
      { name: "Saumon frais (MP-001)", detail: "210 kg réels contre 184 kg théoriques", level: "Critique", metric: "+14 % (26 kg)" },
      { name: "Makis signature saumon", detail: "Grammage non respecté en service du soir", level: "Critique", metric: "5 460 MAD / mois" },
      { name: "Dragon Roll", detail: "Pertes de parage au-dessus de la norme", level: "Élevé", metric: "-1,6 pt de Food Cost" },
    ],
    steps: [
      "Recaler les nomenclatures des makis signature.",
      "Former les équipes du soir au grammage.",
      "Pesée de contrôle quotidienne pendant 2 semaines.",
    ],
  },
  "an-p2": {
    riskItems: [
      { name: "Bento du lundi", detail: "118 unités produites pour 92 vendues", level: "Élevé", metric: "26 unités perdues" },
      { name: "Riz vinaigré (MP-030)", detail: "Matière perdue sur la surproduction", level: "Modéré", metric: "3 200 MAD / mois" },
    ],
    steps: [
      "Appliquer une prévision journalière pondérée.",
      "Réduire l'ordre du lundi à 95 unités.",
      "Suivre l'écart production / ventes pendant 3 semaines.",
    ],
  },
  "an-p3": {
    riskItems: [
      { name: "Ramen Poulet Miso", detail: "48 portions produites pour 62 demandées", level: "Élevé", metric: "14 portions manquantes" },
      { name: "Bouillon miso (MP-016)", detail: "Capacité de bain limitée le vendredi", level: "Modéré", metric: "1 850 MAD / mois" },
    ],
    steps: [
      "Lancer un second bain de bouillon à 17 h le vendredi.",
      "Porter l'ordre de fabrication à 65 portions.",
      "Vérifier la capacité de production après 2 vendredis.",
    ],
  },
  "an-p4": {
    riskItems: [
      { name: "Saumon frais (MP-001)", detail: "Couverture 1,1 jour", level: "Critique", metric: "9 plats impactés" },
      { name: "Thon rouge (MP-004)", detail: "Couverture 1,3 jour", level: "Critique", metric: "24 600 MAD de CA exposé" },
      { name: "Crevettes tempura (MP-007)", detail: "Couverture 1,6 jour", level: "Élevé", metric: "3 plats" },
      { name: "Surimi (MP-011)", detail: "Couverture 1,8 jour", level: "Modéré", metric: "2 plats" },
    ],
    steps: [
      "Synchroniser le plan de production et les achats avec 48 h d'avance.",
      "Commander les 4 références avant vendredi midi.",
      "Confirmer les réceptions avant le service du samedi.",
    ],
  },
  "an-f1": {
    riskItems: [
      { name: "Dragon Roll", detail: "Food Cost 41,2 % pour une cible de 32 %", level: "Critique", metric: "+9,2 pts" },
      { name: "Rainbow Roll", detail: "Food Cost 38,4 %, grammage supérieur", level: "Critique", metric: "+6,4 pts" },
      { name: "Bento Premium", detail: "Food Cost 35,1 %, hausse du thon", level: "Élevé", metric: "+3,1 pts" },
      { name: "California Roll", detail: "Food Cost 33,8 %, prix de vente inchangé", level: "Modéré", metric: "+1,8 pt" },
    ],
    steps: [
      "Recaler les nomenclatures des 4 plats hors cible.",
      "Ajuster le prix de vente du Dragon Roll et du Rainbow Roll.",
      "Sécuriser un prix saumon trimestriel avec Océan Frais SARL.",
      "Contrôler le Food Cost chaque semaine pendant un mois.",
    ],
  },
  "an-f2": {
    riskItems: [
      { name: "Vitrines réfrigérées Arribate", detail: "Fonctionnement continu hors service", level: "Élevé", metric: "+9,4 % de charges" },
      { name: "Cuisine — hottes", detail: "Aucune programmation horaire", level: "Modéré", metric: "4,2 % du CA" },
    ],
    steps: [
      "Programmer les équipements hors service.",
      "Auditer les 3 vitrines les plus anciennes.",
      "Relever la consommation chaque semaine.",
    ],
  },
  "an-f3": {
    riskItems: [
      { name: "Équipe de salle Carrousel", detail: "Effectif dimensionné sur le pic du vendredi", level: "Élevé", metric: "29,1 % du CA" },
      { name: "Service du midi", detail: "Sureffectif de 2 postes en semaine", level: "Modéré", metric: "7 300 MAD / mois" },
    ],
    steps: [
      "Replanifier les effectifs par tranche horaire.",
      "Comparer les couverts réels aux heures planifiées.",
      "Valider le nouveau planning avec la direction.",
    ],
  },
  "an-f4": {
    riskItems: [
      { name: "California Roll", detail: "Prix 6 % sous la moyenne locale", level: "Modéré", metric: "+4 MAD possibles" },
      { name: "Bento du midi", detail: "Forte rotation, faible élasticité observée", level: "Modéré", metric: "-1,2 % de volume" },
      { name: "Ramen Poulet Miso", detail: "Marge inférieure à la moyenne carte", level: "Modéré", metric: "12 700 MAD / mois" },
    ],
    steps: [
      "Tester la hausse sur un établissement pendant 3 semaines.",
      "Mesurer l'impact volume avant généralisation.",
      "Valider la nouvelle carte de prix.",
    ],
  },
  "an-f5": {
    riskItems: [
      { name: "Accompagnements Carrousel", detail: "Faible attachement dans le mix de vente", level: "Élevé", metric: "-10 MAD / ticket" },
      { name: "Boissons", detail: "Taux d'attachement de 38 % contre 52 % réseau", level: "Élevé", metric: "39 600 MAD / mois" },
    ],
    steps: [
      "Créer deux formules d'accompagnement.",
      "Former l'équipe à la vente additionnelle.",
      "Suivre le panier moyen chaque semaine.",
    ],
  },
  "an-f6": {
    riskItems: [
      { name: "Carrousel", detail: "Marge 14,8 % contre 18,6 % à Arribate", level: "Élevé", metric: "-3,8 pts" },
      { name: "Masse salariale Carrousel", detail: "Ratio supérieur de 2,1 points au seuil", level: "Élevé", metric: "46 000 MAD / mois" },
      { name: "Panier moyen Carrousel", detail: "148 MAD contre 158 MAD réseau", level: "Modéré", metric: "-6 %" },
    ],
    steps: [
      "Déployer le plan panier moyen à Carrousel.",
      "Replanifier les effectifs par tranche horaire.",
      "Revoir la rentabilité dans 6 semaines.",
    ],
  },
};

analyses.forEach((a) => {
  const e = enrichment[a.id];
  if (e) {
    a.riskItems = e.riskItems;
    a.steps = e.steps;
  }
});
