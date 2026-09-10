/**
 * Couche de service Odoo.
 *
 * Toutes les données métier consommées par l'UI passent par ce service.
 * Pour le MVP les méthodes retournent des données de démonstration ;
 * il suffira de remplacer le corps de chaque méthode par un appel
 * XML-RPC / JSON-RPC Odoo (search_read) sans toucher aux composants.
 */

import * as db from "@/data/mitsuki";
import type { RestaurantId } from "@/data/mitsuki";

export type Scope = RestaurantId | "all";
export type PeriodKey = "7d" | "30d" | "3m" | "12m";

export const periodDays: Record<PeriodKey, number> = {
  "7d": 7,
  "30d": 30,
  "3m": 90,
  "12m": 365,
};

export const periodLabel: Record<PeriodKey, string> = {
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "3m": "3 derniers mois",
  "12m": "12 derniers mois",
};

const inScope = <T extends { restaurant: RestaurantId | "all" }>(rows: T[], scope: Scope) =>
  scope === "all" ? rows : rows.filter((r) => r.restaurant === scope || r.restaurant === "all");

export interface OdooConnection {
  url: string;
  database: string;
  apiUser: string;
  status: "connected" | "disconnected";
  lastSync: string;
  records: number;
  simulated: true;
}

let connection: OdooConnection = {
  url: "https://mitsuki.odoo.com",
  database: "mitsuki-prod",
  apiUser: "api.mitsukiai@mitsuki.ma",
  status: "connected",
  lastSync: new Date("2026-09-10T06:45:00Z").toISOString(),
  records: 1284,
  simulated: true,
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const odooService = {
  /* --- Référentiel --- */
  getRestaurants: () => db.restaurants,
  getUsers: () => db.users,
  getSuppliers: () => db.suppliers,
  getSupplier: (id: string) => db.suppliers.find((s) => s.id === id),
  getDishes: () => db.dishes,
  getDish: (id: string) => db.dishes.find((d) => d.id === id),

  /* --- Stocks --- */
  getRawMaterials: (scope: Scope) =>
    scope === "all" ? db.rawMaterials : db.rawMaterials.filter((m) => m.restaurant === scope),
  getRawMaterial: (id: string) => db.rawMaterials.find((m) => m.id === id),

  /* --- Achats --- */
  getPurchaseNeeds: (scope: Scope) => inScope(db.purchaseNeeds, scope),
  getPurchaseOrders: (scope: Scope) => inScope(db.purchaseOrders, scope),

  /* --- Production --- */
  getManufacturingOrders: (scope: Scope) => inScope(db.manufacturingOrders, scope),
  getConsumption: (scope: Scope) => inScope(db.consumption, scope),

  /* --- Ventes & finance --- */
  getSales: (scope: Scope, period: PeriodKey) => {
    const from = db.dayISO(-periodDays[period] + 1);
    return db.sales.filter(
      (s) => s.date >= from && (scope === "all" || s.restaurant === scope),
    );
  },
  getExpenses: (scope: Scope) => inScope(db.expenses, scope),
  getPayroll: (scope: Scope) =>
    db.restaurants
      .filter((r) => scope === "all" || r.id === scope)
      .map((r) => {
        const revenue = db.sales
          .filter((s) => s.restaurant === r.id && s.date >= db.dayISO(-29))
          .reduce((a, s) => a + s.revenue, 0);
        const payroll = Math.round(r.employees * 5400 * (r.id === "carrousel" ? 1.08 : 1));
        return { restaurant: r.id, employees: r.employees, payroll, revenue };
      }),
  getBalance: (scope: Scope) => {
    const factor = scope === "all" ? 1 : 0.36;
    return [
      { label: "Solde de trésorerie", amount: Math.round(742000 * factor) },
      { label: "Créances clients", amount: Math.round(186000 * factor) },
      { label: "Dettes fournisseurs", amount: Math.round(-398000 * factor) },
      { label: "Charges de la période", amount: Math.round(-612000 * factor) },
      { label: "Produits de la période", amount: Math.round(1894000 * factor) },
    ];
  },

  /* --- Qualité --- */
  getFeedbacks: (scope: Scope) => inScope(db.feedbacks, scope),
  getQualityIssues: (scope: Scope) => inScope(db.qualityIssues, scope),
  getQualityIssue: (id: string) => db.qualityIssues.find((q) => q.id === id),

  /* --- Alertes & notifications --- */
  getAlerts: (scope: Scope) => inScope(db.alerts, scope),
  getNotifications: () => db.notifications,
  getValidationLog: () => db.validationLog,

  /* --- Social --- */
  getSocialIdeas: () => db.socialIdeas,
  getSocialPosts: () => db.socialPosts,

  /* --- Connexion --- */
  getConnection: () => connection,
  async testConnection() {
    await wait(900);
    connection = { ...connection, status: "connected" };
    return { ok: true, message: "Connexion Odoo simulée établie (mode démonstration)." };
  },
  async syncNow() {
    await wait(1400);
    connection = {
      ...connection,
      lastSync: new Date().toISOString(),
      records: connection.records + Math.round(Math.random() * 120),
    };
    return connection;
  },
};
