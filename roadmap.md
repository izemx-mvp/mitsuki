# MITSUKI AI — feuille de route des améliorations

## Terminé
- Palette étendue (turquoise, pétrole, orange, bordeaux), gradients légers, micro-interactions et respect de `prefers-reduced-motion`.
- Fond animé discret (`AiBackground`) sur le tableau de bord, les modules et les pages d'analyse.
- État partagé global (`StoreProvider`) : alertes enrichies, idées, publications, retours clients, plan d'action.
- Chatbot global (`AssistantDock`) accessible sur toutes les pages, page Assistant IA autonome supprimée.
- Sidebar repliable (desktop) et menu latéral (tablette/mobile).
- Community Manager réduit à Idées / Générateur / Calendrier, avec visuels de plats, import d'image,
  création manuelle, planification, modification, suppression et publication simulée.
- Calendrier éditorial réel (mois / semaine / jour).
- Analyses IA détaillées pour Achats, Production et Finance + page de détail `/analyse/$analysisId`
  (données observées, évolution, cause, impact, recommandation, création d'alerte de suivi).
- Satisfaction : import simulé d'une fiche papier, détail d'un retour client `/feedback/$feedbackId`,
  plan d'action qualité avec statuts.
- Centre d'alertes enrichi : module, type, responsable assignable, prise en charge, statuts, historique.
- Boutons retour basés sur l'historique réel sur toutes les pages détail.

## Reste possible (non demandé explicitement)
- Persistance des données au-delà de la session (nécessiterait une base de données).
