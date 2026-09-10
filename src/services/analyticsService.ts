/**
 * Calculs d'indicateurs et agrégations.
 * Consomme uniquement odooService — aucune logique Odoo ici.
 */

import * as db from "@/data/mitsuki";
import { odooService, periodDays, type PeriodKey, type Scope } from "./odooService";

export interface Kpi {
  label: string;
  value: string;
  delta: number;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "danger";
}

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
const pct = (now: number, before: number) =>
  before === 0 ? 0 : Number((((now - before) / before) * 100).toFixed(1));

export const analyticsService = {
  salesTotals(scope: Scope, period: PeriodKey) {
    const days = periodDays[period];
    const from = db.dayISO(-days + 1);
    const prevFrom = db.dayISO(-days * 2 + 1);
    const all = db.sales.filter((s) => scope === "all" || s.restaurant === scope);
    const current = all.filter((s) => s.date >= from);
    const previous = all.filter((s) => s.date >= prevFrom && s.date < from);
    const agg = (rows: typeof all) => ({
      revenue: sum(rows.map((r) => r.revenue)),
      orders: sum(rows.map((r) => r.orders)),
      discounts: sum(rows.map((r) => r.discounts)),
      offered: sum(rows.map((r) => r.offered)),
    });
    const c = agg(current);
    const p = agg(previous);
    return {
      ...c,
      avgTicket: c.orders ? c.revenue / c.orders : 0,
      prev: p,
      revenueDelta: pct(c.revenue, p.revenue),
      ordersDelta: pct(c.orders, p.orders),
      ticketDelta: pct(c.orders ? c.revenue / c.orders : 0, p.orders ? p.revenue / p.orders : 0),
    };
  },

  revenueSeries(scope: Scope, period: PeriodKey) {
    const rows = odooService.getSales(scope, period);
    const byDate = new Map<string, { revenue: number; orders: number }>();
    for (const r of rows) {
      const e = byDate.get(r.date) ?? { revenue: 0, orders: 0 };
      e.revenue += r.revenue;
      e.orders += r.orders;
      byDate.set(r.date, e);
    }
    const points = [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));
    if (period === "12m" || period === "3m") {
      const grouped = new Map<string, { revenue: number; orders: number }>();
      for (const p of points) {
        const key = p.date.slice(0, 7);
        const e = grouped.get(key) ?? { revenue: 0, orders: 0 };
        e.revenue += p.revenue;
        e.orders += p.orders;
        grouped.set(key, e);
      }
      return [...grouped.entries()].map(([date, v]) => ({ date, ...v }));
    }
    return points;
  },

  revenueByRestaurant(period: PeriodKey) {
    return db.restaurants.map((r) => {
      const t = analyticsService.salesTotals(r.id, period);
      return { name: r.name, revenue: t.revenue, orders: t.orders, delta: t.revenueDelta };
    });
  },

  foodCostAvg() {
    const list = db.dishes.map(db.foodCost);
    return Number((sum(list) / list.length).toFixed(1));
  },

  satisfactionScore(scope: Scope) {
    const rows = odooService.getFeedbacks(scope);
    if (!rows.length) return 0;
    const s = sum(rows.map((f) => (f.service + f.product + f.cleanliness) / 3));
    return Number((s / rows.length).toFixed(2));
  },

  charges(scope: Scope) {
    return sum(odooService.getExpenses(scope).map((e) => e.amount));
  },

  payrollTotal(scope: Scope) {
    return sum(odooService.getPayroll(scope).map((p) => p.payroll));
  },

  overviewKpis(scope: Scope, period: PeriodKey): Kpi[] {
    const t = analyticsService.salesTotals(scope, period);
    const activeAlerts = odooService
      .getAlerts(scope)
      .filter((a) => a.status === "Nouvelle" || a.status === "En cours").length;
    return [
      {
        label: "Chiffre d'affaires",
        value: db.formatMAD(t.revenue),
        delta: t.revenueDelta,
        tone: "primary",
      },
      { label: "Nombre de commandes", value: t.orders.toLocaleString("fr-FR"), delta: t.ordersDelta },
      { label: "Panier moyen", value: db.formatMAD(t.avgTicket, 1), delta: t.ticketDelta },
      {
        label: "Food Cost",
        value: `${analyticsService.foodCostAvg()} %`,
        delta: 1.8,
        tone: "warning",
        hint: "Cible 32 %",
      },
      {
        label: "Satisfaction client",
        value: `${analyticsService.satisfactionScore(scope)} / 5`,
        delta: -2.4,
        tone: "success",
      },
      {
        label: "Alertes actives",
        value: String(activeAlerts),
        delta: 12.5,
        tone: "danger",
        hint: "Toutes catégories",
      },
    ];
  },

  chargesVsRevenue(scope: Scope, period: PeriodKey) {
    const series = analyticsService.revenueSeries(scope, period);
    const monthlyCharges = analyticsService.charges(scope);
    const perPoint = monthlyCharges / Math.max(series.length, 1) * (period === "7d" ? 0.25 : 1);
    return series.map((p) => ({
      date: p.date,
      revenue: p.revenue,
      charges: Math.round(perPoint * (period === "12m" ? 1 : 1)),
      marge: Math.round(p.revenue - perPoint),
    }));
  },
};
