/**
 * Détails d'alerte (démonstration) : produits/postes exactement exposés,
 * conséquence si aucune action et étapes de traitement recommandées.
 * Consommé via services/aiService, jamais directement dans l'UI.
 */

import type { AlertModule } from "@/data/analyses";
import type { RiskLevel } from "@/data/analyses";

export interface AlertRisk {
  name: string;
  detail: string;
  level: RiskLevel;
}

export interface AlertDetail {
  context: string;
  risks: AlertRisk[];
  consequence: string;
  steps: string[];
  sources: string[];
  confidence: number;
}

const byModule: Record<AlertModule, AlertDetail> = {
  Achats: {
    context:
      "Croisement des stocks Odoo, de la consommation des 30 derniers jours et des délais de livraison fournisseurs.",
    risks: [
      { name: "Saumon frais (MP-001)", detail: "Couverture 0,8 jour · 18,4 kg restants", level: "Critique" },
      { name: "Thon rouge (MP-004)", detail: "Couverture 1,6 jour · délai fournisseur 2 jours", level: "Élevé" },
      { name: "Emballages bento (MP-021)", detail: "Prix unitaire +8,9 % sur 60 jours", level: "Modéré" },
    ],
    consequence:
      "Retrait possible des makis signature de la carte sur le service du soir et ventes manquées estimées à 9 800 MAD par mois.",
    steps: [
      "Vérifier le stock physique et les réceptions du jour dans Odoo.",
      "Passer une commande d'urgence de 42 kg chez Océan Frais SARL.",
      "Avancer la commande hebdomadaire de 24 heures.",
      "Confirmer la réception puis clôturer l'alerte.",
    ],
    sources: ["Stocks Odoo", "Consommation 30 jours", "Délais fournisseurs"],
    confidence: 91,
  },
  Stocks: {
    context: "Suivi des niveaux de stock par établissement et des rotations théoriques par référence.",
    risks: [
      { name: "Saumon frais (MP-001)", detail: "Sous le stock de sécurité depuis 2 jours", level: "Critique" },
      { name: "Nouilles udon (MP-014)", detail: "Surstock : 21 jours de couverture pour une cible de 8", level: "Modéré" },
      { name: "Algues nori (MP-009)", detail: "Stock dormant depuis 26 jours", level: "Modéré" },
    ],
    consequence:
      "Immobilisation de trésorerie sur les références dormantes et risque de rupture sur les produits de la mer.",
    steps: [
      "Réaliser un inventaire tournant sur les 3 références.",
      "Transférer 40 kg de nouilles udon vers Arribate Center.",
      "Ajuster les stocks de sécurité dans Odoo.",
    ],
    sources: ["Stocks Odoo", "Nomenclatures", "Ventes"],
    confidence: 86,
  },
  Production: {
    context:
      "Comparaison des ordres de fabrication, des nomenclatures théoriques et des ventes réelles par service.",
    risks: [
      { name: "Makis signature saumon", detail: "Surconsommation matière de +14 % (26 kg)", level: "Critique" },
      { name: "Bento du lundi", detail: "Surproduction de 26 unités, pertes 3 200 MAD / mois", level: "Élevé" },
      { name: "Ramen Poulet Miso", detail: "Sous-production de 14 portions le vendredi soir", level: "Modéré" },
    ],
    consequence: "Dégradation du Food Cost de 1,6 point et gaspillage alimentaire évitable.",
    steps: [
      "Recaler les nomenclatures des plats concernés.",
      "Mettre en place une pesée de contrôle pendant 2 semaines.",
      "Ajuster l'ordre de fabrication du lundi à 95 unités.",
    ],
    sources: ["Ordres de fabrication", "Nomenclatures", "Ventes Odoo"],
    confidence: 88,
  },
  Finance: {
    context: "Croisement des prix d'achat, des prix de vente, des charges et des ventes Odoo.",
    risks: [
      { name: "Dragon Roll", detail: "Food Cost 41 % contre une cible de 32 %", level: "Critique" },
      { name: "Rainbow Roll", detail: "Food Cost 38 % · grammage supérieur à la nomenclature", level: "Élevé" },
      { name: "Charges d'énergie", detail: "+9,4 % pour un CA à +3,1 %", level: "Modéré" },
    ],
    consequence: "Perte de marge de 4,4 points, environ 18 400 MAD par mois sur le réseau.",
    steps: [
      "Recaler les nomenclatures des 4 plats hors cible.",
      "Simuler puis valider 2 ajustements de prix de vente.",
      "Sécuriser un prix saumon trimestriel avec le fournisseur.",
    ],
    sources: ["Nomenclatures", "Prix d'achat", "Ventes Odoo", "Charges"],
    confidence: 89,
  },
  Satisfaction: {
    context: "Analyse sémantique des retours clients et corrélation avec la production et le service.",
    risks: [
      { name: "Service du vendredi soir", detail: "7 retours : attente supérieure à 30 minutes", level: "Élevé" },
      { name: "California Roll", detail: "4 retours sur la texture du riz", level: "Modéré" },
      { name: "Commande en ligne", detail: "3 retours sur la température à la livraison", level: "Modéré" },
    ],
    consequence: "Baisse de la note moyenne et risque d'avis publics négatifs.",
    steps: [
      "Contacter les clients concernés dans les 48 heures.",
      "Renforcer l'équipe de salle le vendredi soir.",
      "Vérifier le protocole riz et la chaîne de livraison.",
    ],
    sources: ["Retours clients", "Ventes Odoo", "Planning"],
    confidence: 84,
  },
  Qualité: {
    context: "Corrélation des retours clients avec les lots fournisseurs réceptionnés.",
    risks: [
      { name: "Saumon frais — lot OF-2291", detail: "14 retours sur la fraîcheur, lot reçu il y a 13 jours", level: "Critique" },
      { name: "Vitrines réfrigérées Gare Agdal", detail: "Température relevée à 6,2 °C au lieu de 4 °C", level: "Élevé" },
      { name: "Riz vinaigré", detail: "Écart de préparation constaté sur 2 services", level: "Modéré" },
    ],
    consequence: "Risque sanitaire et d'image, retrait potentiel de 9 plats de la carte.",
    steps: [
      "Isoler le lot concerné et contrôler la chaîne du froid.",
      "Relever les températures des 3 vitrines les plus anciennes.",
      "Ouvrir une réclamation fournisseur sur le lot OF-2291.",
    ],
    sources: ["Retours clients", "Réceptions Odoo", "Relevés température"],
    confidence: 87,
  },
  "Community Manager": {
    context: "Suivi du calendrier éditorial et des contenus générés par l'IA en attente de validation.",
    risks: [
      { name: "Publication « Ramen Poulet Miso »", detail: "Planifiée sans validation humaine", level: "Élevé" },
      { name: "Visuel produit", detail: "Photo non conforme à la charte Mitsuki", level: "Modéré" },
      { name: "Créneau de publication", detail: "Chevauchement avec une autre publication", level: "Modéré" },
    ],
    consequence: "Publication non conforme visible publiquement sur les comptes Mitsuki.",
    steps: [
      "Relire le texte, les hashtags et le visuel.",
      "Valider ou corriger la publication dans le calendrier.",
      "Confirmer le créneau de diffusion.",
    ],
    sources: ["Calendrier éditorial", "Performances sociales", "Ventes Odoo"],
    confidence: 79,
  },
};

export const alertDetailFor = (module: AlertModule): AlertDetail =>
  byModule[module] ?? byModule.Production;
