# Remix of Mitsuki Insights AI

Crée une application web SaaS professionnelle appelée « MITSUKI AI », destinée à Mitsuki, enseigne de restauration asiatique utilisant actuellement Odoo pour gérer ses achats, ses stocks, sa production, ses ventes et une partie de ses données financières.

OBJECTIF GLOBAL

L’objectif de MITSUKI AI n’est pas de remplacer Odoo.

La plateforme doit fonctionner comme une couche intelligente connectée à Odoo afin d’exploiter les données existantes, centraliser les informations importantes et fournir aux responsables Mitsuki :

- analyses IA ;
- alertes ;
- recommandations ;
- prévisions ;
- indicateurs de performance ;
- aide à la décision ;
- automatisation de certaines tâches.

La plateforme doit couvrir cinq grands domaines :

Achats & Approvisionnement
Production & Stocks
Finance & Performance
Satisfaction Client & Qualité
Community Management

Ajouter également un Assistant IA de Direction accessible depuis toute la plateforme.

====================================================
1. IDENTITÉ VISUELLE
====================================================

Créer une interface moderne, premium et professionnelle inspirée de l’identité actuelle de Mitsuki.

Palette principale :

Turquoise / teal Mitsuki : #079AA6 ou couleur très proche.
Blanc : #FFFFFF.
Fond général : #F6F8FA.
Texte principal : #1F2937.
Texte secondaire : #64748B.
Vert succès : #22C55E.
Orange alerte : #F59E0B.
Rouge critique : #DC2626.

Utiliser quelques touches orange, rouge et jaune inspirées du logo Mitsuki, mais le turquoise reste la couleur dominante de l’application.

Style :

dashboard SaaS moderne ;
interface claire ;
très peu de surcharge visuelle ;
cartes légèrement arrondies ;
ombres très légères ;
grandes zones blanches ;
tableaux professionnels ;
graphiques lisibles ;
icônes simples ;
typographie moderne type Inter / DM Sans.

L’application doit sembler être un outil professionnel réellement utilisé quotidiennement par une chaîne de restaurants.

Desktop first mais responsive tablette.

====================================================
2. STRUCTURE PRINCIPALE
====================================================

Créer une sidebar fixe à gauche.

Afficher le logo Mitsuki en haut.

Navigation :

Vue d’ensemble
Achats & Approvisionnement
Production & Stocks
Finance & Performance
Satisfaction & Qualité
Community Manager
Assistant IA
Centre d’alertes
Configuration

Dans le bas de la sidebar :

Profil utilisateur
Notifications
Déconnexion

Créer un header supérieur contenant :

nom du module ;
sélecteur de période ;
sélecteur du point de vente ;
notifications ;
avatar utilisateur.

Points de vente à prévoir dans le prototype :

Tous les établissements
Arribate Center
Gare Agdal
Carrousel

Prévoir une architecture permettant d’ajouter facilement de nouveaux établissements.

====================================================
3. DASHBOARD — VUE D’ENSEMBLE
====================================================

Créer une page d’accueil destinée principalement à la direction.

Afficher en première ligne six KPI :

Chiffre d’affaires
Nombre de commandes
Panier moyen
Food Cost
Satisfaction client
Alertes actives

Chaque KPI doit afficher :

valeur actuelle ;
variation par rapport à la période précédente ;
mini indicateur de tendance.

Ajouter ensuite un graphique :

Évolution du chiffre d’affaires

avec choix :

7 jours
30 jours
3 mois
année

Ajouter un graphique de comparaison du chiffre d’affaires par établissement.

Ajouter une section :

« Analyse IA de l’activité »

Présenter une carte contenant une synthèse automatiquement générée par l’IA sur :

ventes ;
production ;
stocks ;
finance ;
satisfaction.

Créer ensuite une section :

« Points nécessitant votre attention »

Afficher les alertes importantes sous forme de cartes.

Chaque alerte possède :

niveau de priorité ;
catégorie ;
titre ;
courte description ;
date ;
établissement ;
bouton « Consulter ».

Catégories :

Stock
Production
Finance
Qualité
Achats

Ajouter une section :

« Recommandations IA »

Présenter les recommandations générées par l’IA avec :

titre ;
domaine ;
niveau d’impact ;
description ;
bouton « Voir l’analyse ».

====================================================
4. MODULE ACHATS & APPROVISIONNEMENT
====================================================

Créer un dashboard dédié aux achats.

KPI :

Montant des achats
Commandes fournisseurs
Produits à commander
Risques de rupture
Variation du coût d’achat
Fournisseurs actifs

Créer plusieurs onglets :

Vue d’ensemble
Besoins d’achat
Commandes
Fournisseurs
Analyse IA

PAGE BESOINS D’ACHAT

Créer un tableau contenant :

Produit
Catégorie
Stock actuel
Unité
Consommation moyenne
Couverture estimée
Besoin prévisionnel
Quantité recommandée
Fournisseur recommandé
Priorité
Statut
Actions

Priorités :

Critique
Élevée
Normale
Faible

Statuts :

À analyser
Recommandation IA
À valider
Validé
Commandé

Ajouter des filtres :

établissement ;
catégorie ;
fournisseur ;
priorité ;
statut.

Ajouter un bouton :

« Générer recommandations IA »

Cette action analyse fictivement les données et actualise les recommandations.

Lorsqu’on consulte un produit, ouvrir une page détail contenant :

Stock actuel
Historique de consommation
Évolution du prix d’achat
Fournisseurs habituels
Commandes précédentes
Besoin prévisionnel
Analyse IA

PAGE COMMANDES

Afficher les commandes Odoo avec :

Référence
Date
Fournisseur
Acheteur
Montant
Échéance
Statut

PAGE FOURNISSEURS

Afficher :

Nom
Nombre de commandes
Montant acheté
Dernière commande
Évolution des prix
Produits fournis
Score interne

Créer une fiche fournisseur complète.

Ajouter un graphique permettant de suivre l’évolution du prix des matières premières.

====================================================
5. MODULE PRODUCTION & STOCKS
====================================================

Créer une interface dédiée à la production.

KPI :

Production du jour
Ordres de fabrication
Stock critique
Surconsommations détectées
Écarts de production
Valeur du stock

Onglets :

Vue d’ensemble
Production
Prévisions
Stocks
Consommation
Nomenclatures
Analyse IA

PAGE PRODUCTION

Afficher les feuilles et ordres de fabrication.

Colonnes :

Référence
Date
Produit
Quantité prévue
Quantité produite
Écart
Point de vente
Statut

Statuts :

Planifié
En production
Terminé
Anomalie

PAGE PRÉVISIONS

Créer une interface permettant à l’IA de recommander les quantités de production.

Afficher :

Produit
Ventes moyennes
Production actuelle
Stock disponible
Besoin prévisionnel
Quantité recommandée
Point de vente
Niveau de confiance

Ajouter un bouton :

« Calculer les prévisions IA »

PAGE STOCKS

Afficher :

Produit
Catégorie
Stock actuel
Stock minimum
Consommation moyenne
Couverture
Évolution
Statut

Statuts :

Normal
À surveiller
Faible
Critique
Surstock

PAGE CONSOMMATION

Comparer :

Consommation théorique
Consommation réelle
Écart
Pourcentage d’écart

Afficher les écarts importants visuellement.

Créer un graphique :

Consommation théorique vs consommation réelle.

PAGE NOMENCLATURES

Afficher les produits finis avec :

Référence
Produit
Prix de vente
Coût matière
Food Cost
Marge estimée

En cliquant sur un produit, afficher les matières premières utilisées.

====================================================
6. MODULE FINANCE & PERFORMANCE
====================================================

Créer un cockpit financier destiné à la direction.

KPI principaux :

CA
Résultat estimé
Charges
Masse salariale
Food Cost
Marge
Panier moyen

Créer des filtres :

Période
Établissement
Comparaison avec période précédente

Onglets :

Vue d’ensemble
Chiffre d’affaires
Charges
Masse salariale
Food Cost
Balance
Analyse IA

PAGE VUE D’ENSEMBLE

Afficher :

évolution du CA ;
charges totales ;
marge ;
ventes ;
commandes ;
panier moyen ;
total remises ;
total offert.

Créer un graphique :

CA par établissement.

Créer un graphique :

CA vs Charges.

Créer un graphique :

Évolution de la marge.

PAGE CHARGES

Afficher :

Type
Catégorie
Montant
Période
Établissement
Évolution

Catégories :

Loyer
Énergie
Fournisseurs
Transport
Services
Autres

PAGE MASSE SALARIALE

Afficher :

Établissement
Nombre de salariés
Masse salariale
CA
Ratio masse salariale / CA

PAGE FOOD COST

Afficher :

Plat
Prix de vente
Coût matière
Food Cost %
Marge
Évolution du coût
Statut

Ajouter une visualisation des plats :

Rentables
À surveiller
Faible marge

PAGE BALANCE

Créer une présentation simplifiée :

Solde
Créances
Dettes
Charges
Produits

Prévoir que ces informations seront alimentées par les données comptables Odoo.

PAGE ANALYSE IA

Créer un grand bloc :

« Analyse financière IA »

L’IA doit présenter :

résumé de la période ;
variations importantes ;
anomalies ;
points à surveiller ;
opportunités ;
recommandations.

====================================================
7. ASSISTANT IA DE DIRECTION
====================================================

Créer une interface type ChatGPT intégrée à MITSUKI AI.

Titre :

« Assistant Mitsuki »

Sous-titre :

« Interrogez vos données opérationnelles et financières. »

Créer un champ de conversation.

À gauche :

historique des conversations.

Au centre :

conversation IA.

Ajouter des suggestions de catégories au-dessus de la zone de saisie :

Finance
Stocks
Production
Ventes
Achats
Qualité

L’assistant doit être conçu pour exploiter les futures données Odoo.

Lorsqu’une réponse contient des chiffres, utiliser des cartes ou petits graphiques directement dans la conversation.

Ajouter un bouton :

« Générer un rapport »

Prévoir export PDF dans une version future.

====================================================
8. SATISFACTION CLIENT & QUALITÉ
====================================================

Créer un module exploitant les fiches de satisfaction Mitsuki.

KPI :

Satisfaction globale
Nombre de réponses
Avis négatifs
Avis positifs
Alertes qualité
Évolution du score

Onglets :

Vue d’ensemble
Feedbacks
Analyse par plat
Analyse par établissement
Problèmes détectés
Analyse IA

PAGE FEEDBACKS

Créer un tableau :

Date
Commande
Établissement
Accueil & service
Qualité produit
Propreté
Recommandation
Commentaire
Sentiment IA
Priorité
Statut

Sentiments :

Très positif
Positif
Neutre
Négatif
Très négatif

Ajouter filtres :

date ;
établissement ;
sentiment ;
priorité.

PAGE ANALYSE PAR PLAT

Afficher :

Plat
Nombre de feedbacks
Score
Avis négatifs
Principal problème détecté
Évolution

PAGE PROBLÈMES DÉTECTÉS

L’IA regroupe automatiquement les retours similaires.

Afficher sous forme de cartes :

Problème détecté
Plat
Établissement
Nombre de feedbacks concernés
Catégorie
Première apparition
Dernière apparition
Priorité
Statut

Catégories :

Goût
Qualité
Fraîcheur
Température
Quantité
Présentation
Service
Attente
Propreté
Autre

====================================================
9. CORRÉLATION QUALITÉ / PRODUCTION
====================================================

Ajouter dans le détail d’un problème qualité une section :

« Analyse de corrélation IA »

Cette section doit pouvoir croiser :

Feedback
Plat
Nomenclature
Matières premières
Production
Fournisseur
Achats
Date
Point de vente

Présenter graphiquement la chaîne :

Feedback client
→ Plat
→ Production
→ Matières premières
→ Fournisseur

Ajouter un niveau de confiance IA.

Ajouter une section :

« Causes potentielles »

Puis :

« Actions recommandées »

Toujours préciser que les conclusions IA sont des recommandations nécessitant une validation humaine.

====================================================
10. MODULE COMMUNITY MANAGER
====================================================

Créer un espace de gestion des réseaux sociaux.

KPI :

Publications ce mois
Contenus planifiés
Brouillons IA
Idées disponibles
Engagement
Contenus publiés

Onglets :

Idées IA
Créer un contenu
Bibliothèque
Calendrier
Performances
Configuration

PAGE IDÉES IA

Créer un catalogue de cartes.

Chaque idée contient :

Titre
Catégorie
Plateforme
Objectif
Produit / plat concerné
Format
Potentiel estimé

Catégories :

Plat
Nouveauté
Promotion
Coulisses
Équipe
Point de vente
Événement
Storytelling
Saisonnier
Engagement

Ajouter un bouton :

« Générer de nouvelles idées IA »

PAGE CRÉER UN CONTENU

Créer un formulaire :

Objectif
Plateforme
Point de vente
Produit / plat
Type de contenu
Ton
Langue

Bouton :

« Générer avec l’IA »

Le résultat doit pouvoir contenir :

Accroche
Caption
CTA
Hashtags
Concept visuel
Brief vidéo ou image

Ajouter :

Régénérer
Modifier
Enregistrer
Envoyer au calendrier

PAGE BIBLIOTHÈQUE

Afficher les contenus sous forme de cartes ou tableau.

Statuts :

Idée
Brouillon IA
À valider
Validé
Planifié
Publié

PAGE CALENDRIER

Créer un calendrier mensuel.

Chaque publication doit apparaître à sa date.

Pouvoir cliquer sur une publication pour voir :

visuel ;
caption ;
réseau ;
heure ;
statut.

Prévoir la planification future pour :

Instagram
Facebook
TikTok
LinkedIn

Ne pas prétendre que les publications sont réellement envoyées tant que les API sociales ne sont pas connectées.

====================================================
11. CENTRE D’ALERTES
====================================================

Créer un centre centralisé regroupant les alertes de tous les modules.

Filtres :

Toutes
Achats
Stocks
Production
Finance
Qualité

Filtres supplémentaires :

Priorité
Établissement
Date
Statut

Chaque alerte contient :

Titre
Description
Catégorie
Établissement
Priorité
Date
Statut
Responsable

Statuts :

Nouvelle
En cours
Résolue
Ignorée

Permettre d’assigner l’alerte à un utilisateur.

====================================================
12. CONFIGURATION
====================================================

Créer plusieurs sous-sections :

Établissements
Utilisateurs
Rôles & permissions
Connexion Odoo
Paramètres IA
Notifications
Réseaux sociaux

UTILISATEURS

Créer les rôles :

Administrateur
Direction
Finance
Achats
Production
Marketing

Prévoir permissions :

Lecture
Création
Modification
Validation
Administration

CONNEXION ODOO

Créer une page affichant :

URL Odoo
Base
Utilisateur API
Statut de connexion
Dernière synchronisation

Ajouter :

« Tester la connexion »

et

« Synchroniser maintenant »

Pour le prototype Lovable, utiliser une connexion simulée mais structurer le code avec un service Odoo séparé afin qu’une véritable API puisse être branchée ensuite.

====================================================
13. DONNÉES ET ARCHITECTURE
====================================================

Pour le MVP, utiliser des données de démonstration réalistes correspondant à Mitsuki.

Préparer une architecture permettant ensuite de connecter Odoo.

Créer des entités structurées :

restaurants
users
suppliers
products
raw_materials
stocks
purchase_orders
manufacturing_orders
recipes
sales
expenses
payroll
feedbacks
quality_alerts
ai_recommendations
social_posts
social_ideas
notifications

Prévoir un champ odoo_id pour les objets synchronisés avec Odoo.

Toutes les données métier provenant d’Odoo doivent passer par une couche de service dédiée.

Ne pas intégrer directement la logique Odoo dans les composants UI.

Créer par exemple :

services/odooService
services/aiService
services/analyticsService

====================================================
14. EXPÉRIENCE UTILISATEUR
====================================================

L’interface doit être très simple à utiliser.

Éviter les écrans surchargés.

Utiliser des tableaux pour les informations opérationnelles.

Utiliser des cartes KPI pour les indicateurs clés.

Utiliser des graphiques uniquement lorsqu’ils apportent une vraie valeur.

Utiliser des badges clairs pour :

statuts ;
priorités ;
risques ;
sentiments.

Chaque tableau doit avoir :

recherche ;
filtres ;
tri ;
pagination.

Créer des pages détail lorsque beaucoup d’informations doivent être affichées.

Ajouter des breadcrumbs.

Afficher skeleton loaders durant les chargements.

Créer des empty states professionnels.

Ajouter des notifications toast après chaque action.

====================================================
15. RÈGLES IA
====================================================

L’IA ne doit jamais présenter une recommandation comme une vérité absolue.

Chaque recommandation doit afficher :

niveau de confiance ;
sources de données utilisées ;
date de génération.

Pour les actions sensibles :

commande fournisseur ;
modification financière ;
action sur stock ;
publication sociale ;

utiliser le principe :

IA analyse
→ IA recommande
→ utilisateur valide
→ système exécute.

Prévoir un journal des validations.

====================================================
16. DONNÉES DE DÉMONSTRATION
====================================================

Créer suffisamment de données fictives pour que tous les écrans semblent réellement utilisés.

Utiliser les établissements :

Arribate Center
Gare Agdal
Carrousel

Créer plusieurs fournisseurs.

Créer au moins 30 matières premières.

Créer plusieurs plats asiatiques / sushi.

Créer des ordres de fabrication.

Créer des ventes sur plusieurs semaines.

Créer des charges.

Créer des données de masse salariale.

Créer des feedbacks positifs et négatifs.

Créer des recommandations IA.

Créer des alertes.

Créer des publications Social Media.

Les données doivent être cohérentes entre les différents modules.

====================================================
17. PAGE DE CONNEXION
====================================================

Créer une page Login premium.

Logo Mitsuki centré.

Titre :

« MITSUKI AI »

Sous-titre :

« Intelligence opérationnelle & pilotage »

Champs :

Email
Mot de passe

Bouton :

Se connecter

Créer un compte de démonstration :

direction@mitsuki.ma

Rôle :

Direction

====================================================
18. RÉSULTAT ATTENDU
====================================================

Je veux un prototype fonctionnel complet avec navigation réelle entre toutes les pages.

Tous les boutons importants doivent fonctionner dans le prototype.

Les filtres doivent modifier les données affichées.

Les graphiques doivent utiliser les données de démonstration.

Les alertes doivent être consultables.

Les pages détail doivent fonctionner.

L’Assistant IA doit posséder une interface conversationnelle crédible.

Le Community Manager doit permettre de créer un contenu puis de l’ajouter au calendrier.

Les données doivent être suffisamment réalistes pour présenter le MVP directement au client.

L’objectif final est que lorsque Mitsuki ouvre le prototype, il puisse immédiatement comprendre que la plateforme vient compléter son environnement Odoo existant et lui apporte une couche d’intelligence couvrant :

ACHATS
→ STOCK
→ PRODUCTION
→ VENTES
→ FINANCE
→ SATISFACTION CLIENT
→ MARKETING

avec une vision centralisée destinée à la direction et aux responsables métier.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d5ce0c7a-8070-458e-a27d-450afb588422).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
