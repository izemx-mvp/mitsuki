/**
 * Couche IA (simulée pour le MVP).
 *
 * Principe imposé : IA analyse → IA recommande → utilisateur valide → système exécute.
 * Chaque sortie IA porte un niveau de confiance, ses sources et sa date de génération.
 */

import { analyses, analysesByModule, analysisById, type AnalysisModule } from "@/data/analyses";
import * as db from "@/data/mitsuki";
import { analyticsService } from "./analyticsService";
import { odooService, type PeriodKey, type Scope } from "./odooService";

export interface AiAnalysis {
  summary: string;
  blocks: { title: string; text: string }[];
  confidence: number;
  sources: string[];
  generatedAt: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();

export const AI_DISCLAIMER =
  "Les conclusions de l'IA sont des recommandations basées sur les données disponibles. Une validation humaine reste nécessaire avant toute action.";

export const aiService = {
  disclaimer: AI_DISCLAIMER,


  /* --- Analyses IA détaillées --- */
  getAnalyses(module: AnalysisModule, scope: Scope) {
    return analysesByModule(module).filter(
      (a) => scope === "all" || a.restaurant === scope || a.restaurant === "all",
    );
  },
  getAnalysis: (id: string) => analysisById(id),
  getAllAnalyses: () => analyses,

  /** Analyse simulée d'une fiche de satisfaction papier importée. */
  async analyzeSatisfactionSheet(fileName: string) {
    await wait(1600);
    const r = db.restaurants[Math.floor(Math.random() * db.restaurants.length)]!;
    const dish = db.dishes[Math.floor(Math.random() * db.dishes.length)]!;
    const low = Math.random() < 0.45;
    const service = low ? 2 : 5;
    const product = low ? 2 : 4;
    const cleanliness = low ? 3 : 5;
    return {
      fileName,
      date: db.dayISO(-Math.floor(Math.random() * 6)),
      order: `SO/2026/${9200 + Math.floor(Math.random() * 400)}`,
      restaurant: r.id,
      service,
      product,
      cleanliness,
      recommend: low ? 4 : 9,
      dish: dish.name,
      comment: low
        ? "Plat servi tiède et attente longue au comptoir."
        : "Très bon accueil, produits frais, je recommande.",
      sentiment: (low ? "Négatif" : "Très positif") as db.Sentiment,
      priority: (low ? "Élevée" : "Faible") as db.NeedPriority,
      confidence: low ? 84 : 91,
      sources: ["Fiche papier numérisée", "Historique feedbacks", "Ventes Odoo"],
      generatedAt: now(),
      simulated: true as const,
    };
  },

  /** Analyse IA d'un feedback existant (sentiment, sujet, criticité). */
  async feedbackInsight(f: db.Feedback) {
    await wait(600);
    const negative = f.sentiment === "Négatif" || f.sentiment === "Très négatif";
    const topic = /attente|attend/i.test(f.comment)
      ? "Temps d'attente"
      : /tiède|froid|chaud/i.test(f.comment)
        ? "Température du plat"
        : /saumon|goût|frais/i.test(f.comment)
          ? "Fraîcheur produit"
          : /portion|quantité/i.test(f.comment)
            ? "Grammage"
            : "Expérience globale";
    return {
      sentiment: f.sentiment,
      topic,
      dish: f.dish,
      problem: negative
        ? `${topic} identifié comme irritant principal sur ${f.dish}.`
        : "Aucun problème détecté, retour utilisable en communication.",
      criticality: negative ? (f.priority === "Critique" ? "Élevée" : "Moyenne") : "Faible",
      confidence: negative ? 86 : 79,
      sources: ["Fiche de satisfaction", "Nomenclatures", "Réceptions Odoo"],
      generatedAt: now(),
    };
  },

  async activityAnalysis(scope: Scope, period: PeriodKey): Promise<AiAnalysis> {
    await wait(700);
    const t = analyticsService.salesTotals(scope, period);
    const fc = analyticsService.foodCostAvg();
    const sat = analyticsService.satisfactionScore(scope);
    return {
      summary: `Sur la période, le chiffre d'affaires atteint ${db.formatMAD(t.revenue)} (${t.revenueDelta > 0 ? "+" : ""}${t.revenueDelta} % vs période précédente) pour ${t.orders.toLocaleString("fr-FR")} commandes et un panier moyen de ${db.formatMAD(t.avgTicket, 1)}.`,
      blocks: [
        {
          title: "Ventes",
          text: `La dynamique reste portée par les week-ends (+32 % de couverts). Arribate Center concentre la plus forte contribution au CA, Carrousel affiche un panier moyen en retrait de 6 %.`,
        },
        {
          title: "Production",
          text: `4 ordres de fabrication présentent un écart supérieur à 15 % entre quantité prévue et produite. Les prévisions de production gagneraient à être recalculées deux fois par semaine.`,
        },
        {
          title: "Stocks",
          text: `Plusieurs références de produits de la mer descendent sous 2 jours de couverture, dont le saumon frais sur Gare Agdal. À l'inverse, un surstock de nouilles udon est détecté sur Carrousel.`,
        },
        {
          title: "Finance",
          text: `Le Food Cost moyen s'établit à ${fc} % contre une cible de 32 %. Les charges d'énergie progressent de 9 % et la masse salariale représente 27,4 % du CA.`,
        },
        {
          title: "Satisfaction",
          text: `Le score global est de ${sat}/5. Un regroupement de 14 retours sur la fraîcheur du saumon nécessite une vérification de la chaîne du froid.`,
        },
      ],
      confidence: 82,
      sources: [
        "Ventes Odoo",
        "Stocks Odoo",
        "Ordres de fabrication",
        "Nomenclatures",
        "Fiches de satisfaction",
      ],
      generatedAt: now(),
    };
  },

  async financialAnalysis(scope: Scope, period: PeriodKey): Promise<AiAnalysis> {
    await wait(700);
    const t = analyticsService.salesTotals(scope, period);
    const charges = analyticsService.charges(scope);
    return {
      summary: `Résultat estimé de ${db.formatMAD(t.revenue - charges)} sur la période, pour ${db.formatMAD(t.revenue)} de produits et ${db.formatMAD(charges)} de charges.`,
      blocks: [
        {
          title: "Résumé de la période",
          text: `Le CA progresse de ${t.revenueDelta} % alors que les charges augmentent plus vite (+6,8 %), ce qui comprime légèrement la marge opérationnelle.`,
        },
        {
          title: "Variations importantes",
          text: "Énergie +9,4 %, emballages +8,9 %, masse salariale +4,1 %. Les achats matières restent stables en pourcentage du CA.",
        },
        {
          title: "Anomalies",
          text: "Un écart de 12 400 MAD entre les remises enregistrées et le total offert sur Carrousel mérite un contrôle des tickets annulés.",
        },
        {
          title: "Points à surveiller",
          text: "Ratio masse salariale / CA de Carrousel à 29,1 %, au-delà du seuil interne de 27 %.",
        },
        {
          title: "Opportunités",
          text: "L'ajustement du grammage de 3 plats signature et la renégociation des emballages représentent environ 32 000 MAD d'économies annuelles.",
        },
        {
          title: "Recommandations",
          text: "Recaler les nomenclatures des makis signature, lancer un appel d'offres emballages, planifier les effectifs sur les pics du vendredi soir.",
        },
      ],
      confidence: 79,
      sources: ["Ventes Odoo", "Charges Odoo", "Paie", "Nomenclatures"],
      generatedAt: now(),
    };
  },

  async generatePurchaseRecommendations(scope: Scope) {
    await wait(1100);
    const needs = odooService.getPurchaseNeeds(scope);
    return needs.map((n) => ({
      ...n,
      status: n.status === "Commandé" || n.status === "Validé" ? n.status : ("Recommandation IA" as const),
      recommendedQty: Number((n.recommendedQty * 1.05 + 0.4).toFixed(1)),
      confidence: Math.min(97, n.confidence + 3),
    }));
  },

  async productionForecast(scope: Scope) {
    await wait(1100);
    const mos = odooService.getManufacturingOrders(scope);
    return db.dishes.map((d, i) => {
      const avgSales = d.soldPerDay;
      const current = mos.filter((m) => m.dishId === d.id).reduce((a, m) => a + m.planned, 0);
      const stock = Math.round(avgSales * (0.4 + ((i * 7) % 10) / 20));
      const need = Math.round(avgSales * 1.15);
      return {
        id: d.id,
        product: d.name,
        avgSales,
        current,
        stock,
        need,
        recommended: Math.max(0, need - stock),
        restaurant: scope,
        confidence: 60 + ((i * 13) % 35),
      };
    });
  },

  async chat(question: string): Promise<{
    text: string;
    metrics?: { label: string; value: string; delta?: number }[];
    chart?: { date: string; value: number }[];
    confidence: number;
    sources: string[];
  }> {
    await wait(800);
    const q = question.toLowerCase();
    const t = analyticsService.salesTotals("all", "30d");
    const series = analyticsService.revenueSeries("all", "30d").map((p) => ({
      date: p.date.slice(5),
      value: p.revenue,
    }));

    if (q.includes("food cost") || q.includes("marge") || q.includes("rentab")) {
      const worst = [...db.dishes].sort((a, b) => db.foodCost(b) - db.foodCost(a)).slice(0, 3);
      return {
        text: `Le Food Cost moyen est de ${analyticsService.foodCostAvg()} % sur les 30 derniers jours, au-dessus de la cible interne de 32 %. Les trois plats les plus exposés sont ${worst.map((d) => `${d.name} (${db.foodCost(d)} %)`).join(", ")}. Un ajustement de grammage sur ces références ramènerait le ratio global autour de 33 %.`,
        metrics: worst.map((d) => ({ label: d.name, value: `${db.foodCost(d)} %` })),
        confidence: 81,
        sources: ["Nomenclatures", "Prix de vente", "Prix d'achat"],
      };
    }
    if (q.includes("stock") || q.includes("rupture")) {
      const critical = db.rawMaterials
        .filter((m) => db.stockStatus(m) === "Critique")
        .slice(0, 4);
      return {
        text: `${critical.length} références sont en couverture critique (moins d'un jour de consommation). Les plus urgentes : ${critical.map((m) => `${m.name} (${db.restaurantName(m.restaurant)})`).join(", ")}. Une commande fournisseur est recommandée aujourd'hui pour éviter une rupture en service du soir.`,
        metrics: critical.map((m) => ({
          label: m.name,
          value: `${db.coverageDays(m)} j de couverture`,
        })),
        confidence: 88,
        sources: ["Stocks Odoo", "Consommation 30 jours"],
      };
    }
    if (q.includes("production")) {
      return {
        text: "4 ordres de fabrication affichent un écart supérieur à 15 % entre quantité prévue et produite, principalement sur les makis signature en service du soir. Recalculer les prévisions deux fois par semaine réduirait cet écart d'environ un tiers.",
        metrics: [
          { label: "Ordres en anomalie", value: "4" },
          { label: "Écart moyen", value: "-17 %" },
          { label: "Pertes estimées", value: "3 200 MAD / mois" },
        ],
        confidence: 74,
        sources: ["Ordres de fabrication", "Ventes", "Nomenclatures"],
      };
    }
    if (q.includes("qualité") || q.includes("satisfaction") || q.includes("client")) {
      return {
        text: `Le score de satisfaction global est de ${analyticsService.satisfactionScore("all")}/5 sur 120 fiches. Le principal irritant est un groupe de 14 retours sur la fraîcheur du saumon à Gare Agdal, corrélé à un lot fournisseur réceptionné il y a 13 jours.`,
        metrics: [
          { label: "Score global", value: `${analyticsService.satisfactionScore("all")}/5` },
          { label: "Avis négatifs", value: "34" },
          { label: "Problèmes détectés", value: "4" },
        ],
        confidence: 77,
        sources: ["Fiches de satisfaction", "Réceptions Odoo"],
      };
    }
    if (q.includes("achat") || q.includes("fournisseur")) {
      return {
        text: "Les achats des 30 derniers jours représentent 486 300 MAD chez Océan Frais, 268 900 MAD chez Asia Import Maroc. La hausse la plus marquée concerne les emballages (+8,9 %) : un second fournisseur est conseillé pour cette famille.",
        metrics: [
          { label: "Achats du mois", value: "1 291 900 MAD", delta: 4.2 },
          { label: "Fournisseurs actifs", value: "6" },
          { label: "Commandes en cours", value: "9" },
        ],
        confidence: 80,
        sources: ["Commandes fournisseurs Odoo", "Historique des prix"],
      };
    }
    return {
      text: `Sur les 30 derniers jours, le chiffre d'affaires consolidé atteint ${db.formatMAD(t.revenue)} (${t.revenueDelta > 0 ? "+" : ""}${t.revenueDelta} %) pour ${t.orders.toLocaleString("fr-FR")} commandes et un panier moyen de ${db.formatMAD(t.avgTicket, 1)}. Arribate Center reste le premier contributeur.`,
      metrics: [
        { label: "Chiffre d'affaires", value: db.formatMAD(t.revenue), delta: t.revenueDelta },
        { label: "Commandes", value: t.orders.toLocaleString("fr-FR"), delta: t.ordersDelta },
        { label: "Panier moyen", value: db.formatMAD(t.avgTicket, 1), delta: t.ticketDelta },
      ],
      chart: series,
      confidence: 85,
      sources: ["Ventes Odoo", "Commandes Odoo"],
    };
  },

  async generateSocialIdeas() {
    await wait(1000);
    const extra: db.SocialIdea[] = [
      {
        id: `idea-${Date.now()}-1`,
        title: "Duo maki + ramen : la formule du soir",
        category: "Promotion",
        platform: "Instagram",
        objective: "Ticket moyen",
        dish: "Ramen Tonkotsu",
        format: "Reel 20 s",
        potential: "Fort",
      },
      {
        id: `idea-${Date.now()}-2`,
        title: "3 façons de déguster nos gyoza",
        category: "Plat",
        platform: "TikTok",
        objective: "Notoriété",
        dish: "Gyoza Poulet 6 pcs",
        format: "Vidéo verticale",
        potential: "Moyen",
      },
      {
        id: `idea-${Date.now()}-3`,
        title: "Une journée avec l'équipe de Gare Agdal",
        category: "Coulisses",
        platform: "Instagram",
        objective: "Proximité",
        dish: "—",
        format: "Série de stories",
        potential: "Moyen",
      },
    ];
    return extra;
  },

  async generateContent(input: {
    objective: string;
    platform: string;
    restaurant: string;
    dish: string;
    type: string;
    tone: string;
    language: string;
  }) {
    await wait(1200);
    return {
      hook: `${input.dish} — ${input.objective.toLowerCase()} à ${input.restaurant}`,
      caption: `Chez Mitsuki, ${input.dish} se prépare à la commande : produits sélectionnés le matin, dressage minute. ${input.type} pensé pour ${input.objective.toLowerCase()}, à découvrir à ${input.restaurant}. Ton ${input.tone.toLowerCase()}, en ${input.language.toLowerCase()}.`,
      cta: "Réservez votre table ou commandez en ligne dès maintenant.",
      hashtags: "#mitsuki #sushirabat #asianfood #rabat #foodlover",
      visual: `Plan serré sur ${input.dish}, lumière naturelle latérale, fond ardoise, baguettes en amorce.`,
      brief: `${input.platform} — ${input.type} de 15 à 20 secondes : plan d'ouverture sur le dressage, plan de coupe sur les ingrédients, plan final sur le plat servi avec incrustation du prix.`,
      confidence: 76,
      sources: ["Nomenclatures", "Ventes", "Performances sociales"],
      generatedAt: now(),
    };
  },
};
