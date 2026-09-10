/**
 * Données de démonstration MITSUKI AI.
 * Ces données simulent le contenu qui proviendra d'Odoo.
 * Elles ne sont jamais consommées directement par l'UI :
 * elles passent par services/odooService.
 */

export type RestaurantId = "arribate" | "agdal" | "carrousel";

export interface Restaurant {
  id: RestaurantId;
  odoo_id: number;
  name: string;
  city: string;
  couverts_jour: number;
  employees: number;
}

export const restaurants: Restaurant[] = [
  {
    id: "arribate",
    odoo_id: 101,
    name: "Arribate Center",
    city: "Rabat",
    couverts_jour: 210,
    employees: 24,
  },
  {
    id: "agdal",
    odoo_id: 102,
    name: "Gare Agdal",
    city: "Rabat",
    couverts_jour: 165,
    employees: 18,
  },
  {
    id: "carrousel",
    odoo_id: 103,
    name: "Carrousel",
    city: "Rabat",
    couverts_jour: 132,
    employees: 15,
  },
];

export const restaurantName = (id: RestaurantId | "all") =>
  id === "all"
    ? "Tous les établissements"
    : (restaurants.find((r) => r.id === id)?.name ?? id);

export interface User {
  id: string;
  name: string;
  email: string;
  role:
    | "Administrateur"
    | "Direction"
    | "Finance"
    | "Achats"
    | "Production"
    | "Marketing";
  restaurant: RestaurantId | "all";
  active: boolean;
  lastLogin: string;
}

export const users: User[] = [
  {
    id: "u1",
    name: "Direction Mitsuki",
    email: "direction@mitsuki.ma",
    role: "Direction",
    restaurant: "all",
    active: true,
    lastLogin: "2026-09-10",
  },
  {
    id: "u2",
    name: "Youssef El Amrani",
    email: "achats@mitsuki.ma",
    role: "Achats",
    restaurant: "all",
    active: true,
    lastLogin: "2026-09-09",
  },
  {
    id: "u3",
    name: "Salma Bennani",
    email: "finance@mitsuki.ma",
    role: "Finance",
    restaurant: "all",
    active: true,
    lastLogin: "2026-09-09",
  },
  {
    id: "u4",
    name: "Karim Idrissi",
    email: "production.arribate@mitsuki.ma",
    role: "Production",
    restaurant: "arribate",
    active: true,
    lastLogin: "2026-09-10",
  },
  {
    id: "u5",
    name: "Nada Chraibi",
    email: "marketing@mitsuki.ma",
    role: "Marketing",
    restaurant: "all",
    active: true,
    lastLogin: "2026-09-08",
  },
  {
    id: "u6",
    name: "Admin IT",
    email: "it@mitsuki.ma",
    role: "Administrateur",
    restaurant: "all",
    active: false,
    lastLogin: "2026-08-21",
  },
];

/* ------------------------------------------------------------------ */
/* Générateur pseudo-aléatoire déterministe                            */
/* ------------------------------------------------------------------ */

let seed = 20260910;
const rnd = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const between = (min: number, max: number, dec = 0) =>
  Number((min + rnd() * (max - min)).toFixed(dec));
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;

export const dayISO = (offset: number) => {
  const d = new Date("2026-09-10T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const formatDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? "T00:00:00Z" : "")).toLocaleDateString(
    "fr-FR",
    { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" },
  );

export const formatMAD = (v: number, dec = 0) =>
  `${v.toLocaleString("fr-FR", { minimumFractionDigits: dec, maximumFractionDigits: dec })} MAD`;

/* ------------------------------------------------------------------ */
/* Fournisseurs                                                        */
/* ------------------------------------------------------------------ */

export interface Supplier {
  id: string;
  odoo_id: number;
  name: string;
  category: string;
  contact: string;
  phone: string;
  orders: number;
  amount: number;
  lastOrder: string;
  priceTrend: number;
  leadTime: number;
  score: number;
  products: string[];
}

export const suppliers: Supplier[] = [
  {
    id: "sup1",
    odoo_id: 501,
    name: "Océan Frais SARL",
    category: "Poissons & fruits de mer",
    contact: "M. Tazi",
    phone: "+212 661 22 41 08",
    orders: 46,
    amount: 486300,
    lastOrder: dayISO(-2),
    priceTrend: 6.4,
    leadTime: 1,
    score: 82,
    products: ["Saumon frais", "Thon rouge", "Crevettes", "Poulpe"],
  },
  {
    id: "sup2",
    odoo_id: 502,
    name: "Asia Import Maroc",
    category: "Épicerie asiatique",
    contact: "Mme Lau",
    phone: "+212 662 74 19 32",
    orders: 31,
    amount: 268900,
    lastOrder: dayISO(-5),
    priceTrend: 1.8,
    leadTime: 4,
    score: 91,
    products: ["Riz à sushi", "Nori", "Sauce soja", "Wasabi", "Gingembre mariné"],
  },
  {
    id: "sup3",
    odoo_id: 503,
    name: "Primeurs Atlas",
    category: "Fruits & légumes",
    contact: "M. Ouazzani",
    phone: "+212 663 55 87 44",
    orders: 58,
    amount: 154200,
    lastOrder: dayISO(-1),
    priceTrend: -2.1,
    leadTime: 1,
    score: 76,
    products: ["Avocat", "Concombre", "Mangue", "Cébette", "Edamame"],
  },
  {
    id: "sup4",
    odoo_id: 504,
    name: "Volailles du Gharb",
    category: "Viandes & volailles",
    contact: "M. Berrada",
    phone: "+212 664 30 12 76",
    orders: 27,
    amount: 198400,
    lastOrder: dayISO(-3),
    priceTrend: 3.2,
    leadTime: 2,
    score: 84,
    products: ["Filet de poulet", "Bœuf émincé", "Porc chashu"],
  },
  {
    id: "sup5",
    odoo_id: 505,
    name: "Pack & Go Emballages",
    category: "Emballages",
    contact: "Mme Serrhini",
    phone: "+212 665 90 63 21",
    orders: 22,
    amount: 96800,
    lastOrder: dayISO(-7),
    priceTrend: 8.9,
    leadTime: 5,
    score: 68,
    products: ["Boîtes bento", "Sacs kraft", "Baguettes", "Sauciers"],
  },
  {
    id: "sup6",
    odoo_id: 506,
    name: "Boissons Chellah",
    category: "Boissons",
    contact: "M. Sefrioui",
    phone: "+212 666 41 55 09",
    orders: 19,
    amount: 87300,
    lastOrder: dayISO(-4),
    priceTrend: 0.9,
    leadTime: 3,
    score: 79,
    products: ["Thé vert", "Soda", "Eau minérale"],
  },
];

/* ------------------------------------------------------------------ */
/* Matières premières & stocks                                         */
/* ------------------------------------------------------------------ */

export type StockStatus =
  | "Normal"
  | "À surveiller"
  | "Faible"
  | "Critique"
  | "Surstock";

export interface RawMaterial {
  id: string;
  odoo_id: number;
  name: string;
  category: string;
  unit: string;
  supplierId: string;
  price: number;
  priceTrend: number;
  stock: number;
  minStock: number;
  avgConsumption: number;
  restaurant: RestaurantId;
}

const rawSeed: [string, string, string, string, number][] = [
  ["Saumon frais", "Poissons", "kg", "sup1", 145],
  ["Thon rouge", "Poissons", "kg", "sup1", 210],
  ["Crevettes décortiquées", "Poissons", "kg", "sup1", 128],
  ["Poulpe", "Poissons", "kg", "sup1", 96],
  ["Surimi", "Poissons", "kg", "sup1", 62],
  ["Anguille fumée", "Poissons", "kg", "sup1", 240],
  ["Riz à sushi", "Épicerie", "kg", "sup2", 22],
  ["Vinaigre de riz", "Épicerie", "L", "sup2", 34],
  ["Feuilles de nori", "Épicerie", "paquet", "sup2", 48],
  ["Sauce soja", "Épicerie", "L", "sup2", 29],
  ["Wasabi", "Épicerie", "kg", "sup2", 180],
  ["Gingembre mariné", "Épicerie", "kg", "sup2", 74],
  ["Huile de sésame", "Épicerie", "L", "sup2", 88],
  ["Graines de sésame", "Épicerie", "kg", "sup2", 52],
  ["Nouilles udon", "Épicerie", "kg", "sup2", 41],
  ["Nouilles ramen", "Épicerie", "kg", "sup2", 38],
  ["Panko", "Épicerie", "kg", "sup2", 36],
  ["Pâte miso", "Épicerie", "kg", "sup2", 69],
  ["Avocat", "Fruits & légumes", "kg", "sup3", 38],
  ["Concombre", "Fruits & légumes", "kg", "sup3", 12],
  ["Mangue", "Fruits & légumes", "kg", "sup3", 26],
  ["Cébette", "Fruits & légumes", "kg", "sup3", 18],
  ["Edamame", "Fruits & légumes", "kg", "sup3", 44],
  ["Carotte", "Fruits & légumes", "kg", "sup3", 9],
  ["Chou blanc", "Fruits & légumes", "kg", "sup3", 8],
  ["Champignons shiitake", "Fruits & légumes", "kg", "sup3", 72],
  ["Filet de poulet", "Viandes", "kg", "sup4", 68],
  ["Bœuf émincé", "Viandes", "kg", "sup4", 112],
  ["Porc chashu", "Viandes", "kg", "sup4", 94],
  ["Fromage frais", "Crémerie", "kg", "sup2", 56],
  ["Œufs", "Crémerie", "plateau", "sup3", 42],
  ["Boîtes bento", "Emballages", "unité", "sup5", 3.2],
  ["Sacs kraft", "Emballages", "unité", "sup5", 1.4],
  ["Baguettes", "Emballages", "paire", "sup5", 0.7],
  ["Thé vert", "Boissons", "kg", "sup6", 130],
];

export const rawMaterials: RawMaterial[] = rawSeed.flatMap(
  ([name, category, unit, supplierId, price], i) =>
    restaurants.map((r, ri) => {
      const avg = between(2, 26, 1);
      const min = Number((avg * 3).toFixed(1));
      const factor = pick([0.25, 0.6, 0.9, 1.4, 2.6, 4.2]);
      return {
        id: `rm${i + 1}-${r.id}`,
        odoo_id: 2000 + i * 10 + ri,
        name,
        category,
        unit,
        supplierId,
        price,
        priceTrend: between(-6, 12, 1),
        stock: Number((min * factor).toFixed(1)),
        minStock: min,
        avgConsumption: avg,
        restaurant: r.id,
      } satisfies RawMaterial;
    }),
);

export const stockStatus = (m: RawMaterial): StockStatus => {
  const cover = m.stock / m.avgConsumption;
  if (cover < 1) return "Critique";
  if (cover < 2.2) return "Faible";
  if (cover < 3.5) return "À surveiller";
  if (cover > 11) return "Surstock";
  return "Normal";
};

export const coverageDays = (m: RawMaterial) =>
  Number((m.stock / m.avgConsumption).toFixed(1));

/* ------------------------------------------------------------------ */
/* Plats / recettes (nomenclatures)                                    */
/* ------------------------------------------------------------------ */

export interface RecipeLine {
  material: string;
  qty: number;
  unit: string;
}
export interface Dish {
  id: string;
  odoo_id: number;
  ref: string;
  name: string;
  category: string;
  price: number;
  materialCost: number;
  costTrend: number;
  soldPerDay: number;
  lines: RecipeLine[];
}

const dishSeed: [string, string, string, number, number][] = [
  ["SUSHI-001", "California Roll Saumon", "Maki", 89, 26.4],
  ["SUSHI-002", "Spicy Tuna Roll", "Maki", 98, 33.1],
  ["SUSHI-003", "Dragon Roll", "Maki signature", 145, 52.7],
  ["SUSHI-004", "Rainbow Roll", "Maki signature", 152, 58.9],
  ["SUSHI-005", "Sashimi Saumon 9 pcs", "Sashimi", 135, 51.2],
  ["SUSHI-006", "Nigiri Mix 8 pcs", "Nigiri", 128, 42.8],
  ["BOWL-001", "Poke Bowl Saumon Avocat", "Bowls", 112, 38.6],
  ["BOWL-002", "Poke Bowl Poulet Teriyaki", "Bowls", 98, 27.9],
  ["RAMEN-001", "Ramen Tonkotsu", "Chaud", 118, 34.2],
  ["RAMEN-002", "Ramen Poulet Miso", "Chaud", 105, 29.4],
  ["UDON-001", "Udon Sauté Bœuf", "Chaud", 122, 41.6],
  ["ENTR-001", "Gyoza Poulet 6 pcs", "Entrées", 62, 17.3],
  ["ENTR-002", "Edamame", "Entrées", 38, 9.1],
  ["ENTR-003", "Soupe Miso", "Entrées", 32, 6.4],
  ["ENTR-004", "Tempura Crevettes", "Entrées", 78, 31.5],
  ["MENU-001", "Bento Mitsuki Midi", "Menus", 149, 54.3],
  ["MENU-002", "Plateau Partage 36 pcs", "Menus", 389, 148.7],
  ["DESS-001", "Mochi Glacé 3 pcs", "Desserts", 48, 14.2],
];

export const dishes: Dish[] = dishSeed.map(
  ([ref, name, category, price, materialCost], i) => ({
    id: `d${i + 1}`,
    odoo_id: 3000 + i,
    ref,
    name,
    category,
    price,
    materialCost,
    costTrend: between(-4, 14, 1),
    soldPerDay: between(8, 62),
    lines: [
      { material: "Riz à sushi", qty: between(0.05, 0.22, 3), unit: "kg" },
      {
        material: pick([
          "Saumon frais",
          "Thon rouge",
          "Filet de poulet",
          "Crevettes décortiquées",
          "Bœuf émincé",
        ]),
        qty: between(0.06, 0.18, 3),
        unit: "kg",
      },
      { material: pick(["Avocat", "Concombre", "Mangue"]), qty: between(0.02, 0.09, 3), unit: "kg" },
      { material: "Feuilles de nori", qty: between(0.5, 2, 1), unit: "paquet" },
      { material: "Sauce soja", qty: between(0.01, 0.05, 3), unit: "L" },
    ],
  }),
);

export const foodCost = (d: Dish) => Number(((d.materialCost / d.price) * 100).toFixed(1));

/* ------------------------------------------------------------------ */
/* Ventes                                                              */
/* ------------------------------------------------------------------ */

export interface SalesPoint {
  date: string;
  restaurant: RestaurantId;
  revenue: number;
  orders: number;
  discounts: number;
  offered: number;
}

export const sales: SalesPoint[] = Array.from({ length: 365 }, (_, k) => {
  const offset = -364 + k;
  const date = dayISO(offset);
  const weekday = new Date(date + "T00:00:00Z").getUTCDay();
  const weekend = weekday === 0 || weekday === 5 || weekday === 6;
  return restaurants.map((r) => {
    const base = r.couverts_jour * (weekend ? 1.32 : 1) * between(0.88, 1.12, 3);
    const orders = Math.round(base);
    const avgTicket = between(118, 158, 2);
    return {
      date,
      restaurant: r.id,
      orders,
      revenue: Number((orders * avgTicket).toFixed(0)),
      discounts: Number((orders * avgTicket * between(0.01, 0.05, 4)).toFixed(0)),
      offered: Number((orders * avgTicket * between(0.002, 0.015, 4)).toFixed(0)),
    } satisfies SalesPoint;
  });
}).flat();

/* ------------------------------------------------------------------ */
/* Achats                                                             */
/* ------------------------------------------------------------------ */

export type PurchaseStatus =
  | "Brouillon"
  | "Envoyée"
  | "Confirmée"
  | "Réceptionnée"
  | "Facturée";

export interface PurchaseOrder {
  id: string;
  odoo_id: number;
  ref: string;
  date: string;
  supplierId: string;
  buyer: string;
  amount: number;
  dueDate: string;
  restaurant: RestaurantId;
  status: PurchaseStatus;
}

export const purchaseOrders: PurchaseOrder[] = Array.from({ length: 42 }, (_, i) => {
  const offset = -Math.round(between(0, 60));
  const sup = pick(suppliers);
  return {
    id: `po${i + 1}`,
    odoo_id: 4000 + i,
    ref: `PO/2026/${String(1200 + i)}`,
    date: dayISO(offset),
    supplierId: sup.id,
    buyer: pick(["Youssef El Amrani", "Karim Idrissi", "Direction Mitsuki"]),
    amount: between(3200, 48000),
    dueDate: dayISO(offset + 30),
    restaurant: pick(restaurants).id,
    status: pick([
      "Brouillon",
      "Envoyée",
      "Confirmée",
      "Réceptionnée",
      "Facturée",
    ] as const),
  } satisfies PurchaseOrder;
});

export type NeedPriority = "Critique" | "Élevée" | "Normale" | "Faible";
export type NeedStatus =
  | "À analyser"
  | "Recommandation IA"
  | "À valider"
  | "Validé"
  | "Commandé";

export interface PurchaseNeed {
  id: string;
  materialId: string;
  product: string;
  category: string;
  unit: string;
  stock: number;
  avgConsumption: number;
  coverage: number;
  forecastNeed: number;
  recommendedQty: number;
  supplierId: string;
  priority: NeedPriority;
  status: NeedStatus;
  restaurant: RestaurantId;
  confidence: number;
}

export const purchaseNeeds: PurchaseNeed[] = rawMaterials
  .filter((_, i) => i % 2 === 0)
  .map((m, i) => {
    const cover = coverageDays(m);
    const priority: NeedPriority =
      cover < 1.2 ? "Critique" : cover < 2.5 ? "Élevée" : cover < 5 ? "Normale" : "Faible";
    const need = Number((m.avgConsumption * 7).toFixed(1));
    return {
      id: `need${i + 1}`,
      materialId: m.id,
      product: m.name,
      category: m.category,
      unit: m.unit,
      stock: m.stock,
      avgConsumption: m.avgConsumption,
      coverage: cover,
      forecastNeed: need,
      recommendedQty: Number(Math.max(0, need - m.stock).toFixed(1)),
      supplierId: m.supplierId,
      priority,
      status: pick([
        "À analyser",
        "Recommandation IA",
        "À valider",
        "Validé",
        "Commandé",
      ] as const),
      restaurant: m.restaurant,
      confidence: between(62, 96),
    } satisfies PurchaseNeed;
  });

/* ------------------------------------------------------------------ */
/* Production                                                          */
/* ------------------------------------------------------------------ */

export type MoStatus = "Planifié" | "En production" | "Terminé" | "Anomalie";

export interface ManufacturingOrder {
  id: string;
  odoo_id: number;
  ref: string;
  date: string;
  dishId: string;
  product: string;
  planned: number;
  produced: number;
  restaurant: RestaurantId;
  status: MoStatus;
}

export const manufacturingOrders: ManufacturingOrder[] = Array.from(
  { length: 64 },
  (_, i) => {
    const d = pick(dishes);
    const planned = between(20, 140);
    const status = pick(["Planifié", "En production", "Terminé", "Terminé", "Anomalie"] as const);
    const produced =
      status === "Planifié"
        ? 0
        : status === "En production"
          ? Math.round(planned * between(0.3, 0.8, 2))
          : Math.round(planned * between(status === "Anomalie" ? 0.6 : 0.94, 1.04, 2));
    return {
      id: `mo${i + 1}`,
      odoo_id: 5000 + i,
      ref: `MO/2026/${String(800 + i)}`,
      date: dayISO(-Math.round(between(0, 20))),
      dishId: d.id,
      product: d.name,
      planned,
      produced,
      restaurant: pick(restaurants).id,
      status,
    } satisfies ManufacturingOrder;
  },
);

export interface ConsumptionRow {
  id: string;
  material: string;
  unit: string;
  theoretical: number;
  real: number;
  restaurant: RestaurantId;
  period: string;
}

export const consumption: ConsumptionRow[] = rawSeed.flatMap(([name, , unit], i) =>
  restaurants.map((r) => {
    const theoretical = between(30, 320, 1);
    return {
      id: `cons${i}-${r.id}`,
      material: name,
      unit,
      theoretical,
      real: Number((theoretical * between(0.92, 1.22, 3)).toFixed(1)),
      restaurant: r.id,
      period: "Septembre 2026",
    } satisfies ConsumptionRow;
  }),
);

/* ------------------------------------------------------------------ */
/* Finance                                                             */
/* ------------------------------------------------------------------ */

export interface Expense {
  id: string;
  odoo_id: number;
  type: string;
  category: "Loyer" | "Énergie" | "Fournisseurs" | "Transport" | "Services" | "Autres";
  amount: number;
  period: string;
  restaurant: RestaurantId;
  trend: number;
}

const expenseSeed: [string, Expense["category"], number][] = [
  ["Loyer commercial", "Loyer", 62000],
  ["Électricité", "Énergie", 18400],
  ["Eau", "Énergie", 4100],
  ["Gaz", "Énergie", 3600],
  ["Achats matières", "Fournisseurs", 214000],
  ["Emballages", "Fournisseurs", 21800],
  ["Livraisons", "Transport", 12600],
  ["Carburant", "Transport", 6800],
  ["Maintenance", "Services", 9400],
  ["Nettoyage", "Services", 7200],
  ["Marketing", "Services", 15400],
  ["Frais bancaires", "Autres", 3100],
  ["Assurances", "Autres", 5200],
];

export const expenses: Expense[] = expenseSeed.flatMap(([type, category, amount], i) =>
  restaurants.map((r, ri) => ({
    id: `exp${i}-${r.id}`,
    odoo_id: 6000 + i * 10 + ri,
    type,
    category,
    amount: Math.round(amount * (r.couverts_jour / 210) * between(0.9, 1.1, 3)),
    period: "Août 2026",
    restaurant: r.id,
    trend: between(-8, 14, 1),
  })),
);

export interface PayrollRow {
  restaurant: RestaurantId;
  employees: number;
  payroll: number;
  revenue: number;
}

export interface BalanceRow {
  label: string;
  amount: number;
}

/* ------------------------------------------------------------------ */
/* Satisfaction & qualité                                             */
/* ------------------------------------------------------------------ */

export type Sentiment = "Très positif" | "Positif" | "Neutre" | "Négatif" | "Très négatif";

export interface Feedback {
  id: string;
  date: string;
  order: string;
  restaurant: RestaurantId;
  service: number;
  product: number;
  cleanliness: number;
  recommend: number;
  dish: string;
  comment: string;
  sentiment: Sentiment;
  priority: NeedPriority;
  status: "Nouveau" | "En cours" | "Traité";
}

const comments: [string, Sentiment][] = [
  ["Poisson très frais, service impeccable.", "Très positif"],
  ["Bon rapport qualité prix, je recommande.", "Positif"],
  ["Riz un peu sec sur les California.", "Négatif"],
  ["Commande servie tiède, dommage.", "Négatif"],
  ["Attente de 35 min le vendredi soir.", "Très négatif"],
  ["Portions plus petites que d'habitude.", "Négatif"],
  ["Équipe très accueillante, plateau magnifique.", "Très positif"],
  ["Correct, sans plus.", "Neutre"],
  ["Le saumon avait un goût inhabituel.", "Très négatif"],
  ["Ramen excellent, bouillon parfumé.", "Très positif"],
  ["Salle propre, personnel souriant.", "Positif"],
  ["Trop de sauce, plat noyé.", "Négatif"],
];

export const feedbacks: Feedback[] = Array.from({ length: 120 }, (_, i) => {
  const [comment, sentiment] = pick(comments);
  const negative = sentiment === "Négatif" || sentiment === "Très négatif";
  return {
    id: `fb${i + 1}`,
    date: dayISO(-Math.round(between(0, 45))),
    order: `SO/2026/${String(9000 + i)}`,
    restaurant: pick(restaurants).id,
    service: negative ? between(2, 3) : between(4, 5),
    product: negative ? between(1, 3) : between(4, 5),
    cleanliness: between(3, 5),
    recommend: negative ? between(2, 5) : between(7, 10),
    dish: pick(dishes).name,
    comment,
    sentiment,
    priority: negative ? pick(["Critique", "Élevée"] as const) : "Faible",
    status: pick(["Nouveau", "En cours", "Traité"] as const),
  } satisfies Feedback;
});

export type QualityCategory =
  | "Goût"
  | "Qualité"
  | "Fraîcheur"
  | "Température"
  | "Quantité"
  | "Présentation"
  | "Service"
  | "Attente"
  | "Propreté"
  | "Autre";

export interface QualityIssue {
  id: string;
  title: string;
  dish: string;
  restaurant: RestaurantId;
  feedbackCount: number;
  category: QualityCategory;
  firstSeen: string;
  lastSeen: string;
  priority: NeedPriority;
  status: "Nouvelle" | "En cours" | "Résolue" | "Ignorée";
  confidence: number;
  causes: string[];
  actions: string[];
  chain: { feedback: string; dish: string; production: string; material: string; supplier: string };
}

export const qualityIssues: QualityIssue[] = [
  {
    id: "qi1",
    title: "Goût inhabituel du saumon signalé de façon répétée",
    dish: "California Roll Saumon",
    restaurant: "agdal",
    feedbackCount: 14,
    category: "Fraîcheur",
    firstSeen: dayISO(-12),
    lastSeen: dayISO(-1),
    priority: "Critique",
    status: "En cours",
    confidence: 78,
    causes: [
      "Lot de saumon réceptionné le " + formatDate(dayISO(-13)) + " avec 2 jours de DLC restants",
      "Rupture de chaîne du froid possible lors de la livraison (fournisseur Océan Frais)",
      "Rotation FIFO non respectée sur la chambre froide de Gare Agdal",
    ],
    actions: [
      "Bloquer le lot restant et contrôler la température de la chambre froide",
      "Demander au fournisseur les relevés de température du camion",
      "Renforcer le contrôle réception sur les produits de la mer",
    ],
    chain: {
      feedback: "14 feedbacks négatifs (fraîcheur)",
      dish: "California Roll Saumon",
      production: "MO/2026/812 — 96 pièces",
      material: "Saumon frais — lot L-2609",
      supplier: "Océan Frais SARL",
    },
  },
  {
    id: "qi2",
    title: "Plats servis tièdes en service du soir",
    dish: "Ramen Tonkotsu",
    restaurant: "arribate",
    feedbackCount: 9,
    category: "Température",
    firstSeen: dayISO(-20),
    lastSeen: dayISO(-2),
    priority: "Élevée",
    status: "Nouvelle",
    confidence: 71,
    causes: [
      "Pic de commandes entre 20h et 21h30 supérieur à la capacité de passe",
      "Temps d'attente moyen en passe supérieur à 8 minutes",
    ],
    actions: [
      "Renforcer la passe d'un équipier sur le créneau 20h-22h",
      "Revoir l'ordonnancement des tickets ramen / sushi",
    ],
    chain: {
      feedback: "9 feedbacks (température)",
      dish: "Ramen Tonkotsu",
      production: "Service soir — 3 sessions",
      material: "Bouillon tonkotsu",
      supplier: "Production interne",
    },
  },
  {
    id: "qi3",
    title: "Portions perçues comme réduites sur les poke bowls",
    dish: "Poke Bowl Saumon Avocat",
    restaurant: "carrousel",
    feedbackCount: 7,
    category: "Quantité",
    firstSeen: dayISO(-18),
    lastSeen: dayISO(-4),
    priority: "Normale",
    status: "En cours",
    confidence: 64,
    causes: [
      "Écart de consommation saumon de -9% vs théorique sur Carrousel",
      "Grammage non standardisé entre les équipes",
    ],
    actions: [
      "Recaler le grammage avec balance obligatoire",
      "Former les équipes sur la nomenclature validée",
    ],
    chain: {
      feedback: "7 feedbacks (quantité)",
      dish: "Poke Bowl Saumon Avocat",
      production: "MO/2026/826",
      material: "Saumon frais",
      supplier: "Océan Frais SARL",
    },
  },
  {
    id: "qi4",
    title: "Attente en click & collect le vendredi",
    dish: "Bento Mitsuki Midi",
    restaurant: "agdal",
    feedbackCount: 11,
    category: "Attente",
    firstSeen: dayISO(-25),
    lastSeen: dayISO(-3),
    priority: "Élevée",
    status: "Nouvelle",
    confidence: 69,
    causes: [
      "Volume de commandes vendredi midi +38% vs moyenne",
      "Préparation des bentos non anticipée",
    ],
    actions: [
      "Pré-production partielle des bentos avant 11h30",
      "Créneaux de retrait espacés de 5 minutes",
    ],
    chain: {
      feedback: "11 feedbacks (attente)",
      dish: "Bento Mitsuki Midi",
      production: "MO/2026/833",
      material: "Riz à sushi",
      supplier: "Asia Import Maroc",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Alertes & recommandations IA                                        */
/* ------------------------------------------------------------------ */

export type AlertCategory = "Stock" | "Production" | "Finance" | "Qualité" | "Achats";

export interface Alert {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  restaurant: RestaurantId | "all";
  priority: NeedPriority;
  date: string;
  status: "Nouvelle" | "En cours" | "Résolue" | "Ignorée";
  owner: string;
}

export const alerts: Alert[] = [
  {
    id: "al1",
    title: "Rupture imminente — Saumon frais",
    description: "Couverture estimée à 0,8 jour sur Gare Agdal. Commande fournisseur requise aujourd'hui.",
    category: "Stock",
    restaurant: "agdal",
    priority: "Critique",
    date: dayISO(0),
    status: "Nouvelle",
    owner: "Youssef El Amrani",
  },
  {
    id: "al2",
    title: "Food Cost au-dessus de la cible sur 4 plats",
    description: "Le Food Cost moyen atteint 36,4% contre une cible de 32%. Impact estimé 18 400 MAD / mois.",
    category: "Finance",
    restaurant: "all",
    priority: "Élevée",
    date: dayISO(-1),
    status: "En cours",
    owner: "Salma Bennani",
  },
  {
    id: "al3",
    title: "Surconsommation détectée — Avocat",
    description: "Écart de +19% entre consommation théorique et réelle sur Arribate Center.",
    category: "Production",
    restaurant: "arribate",
    priority: "Élevée",
    date: dayISO(-1),
    status: "Nouvelle",
    owner: "Karim Idrissi",
  },
  {
    id: "al4",
    title: "14 feedbacks négatifs sur la fraîcheur du saumon",
    description: "Regroupement IA de retours similaires sur 12 jours. Corrélation possible avec un lot fournisseur.",
    category: "Qualité",
    restaurant: "agdal",
    priority: "Critique",
    date: dayISO(-2),
    status: "En cours",
    owner: "Direction Mitsuki",
  },
  {
    id: "al5",
    title: "Hausse du prix des emballages +8,9%",
    description: "Pack & Go Emballages a augmenté ses tarifs sur 3 références. Renégociation conseillée.",
    category: "Achats",
    restaurant: "all",
    priority: "Normale",
    date: dayISO(-3),
    status: "Nouvelle",
    owner: "Youssef El Amrani",
  },
  {
    id: "al6",
    title: "Écart de production sur MO/2026/812",
    description: "Quantité produite inférieure de 22% à la quantité prévue.",
    category: "Production",
    restaurant: "agdal",
    priority: "Normale",
    date: dayISO(-3),
    status: "Résolue",
    owner: "Karim Idrissi",
  },
  {
    id: "al7",
    title: "Ratio masse salariale / CA en hausse",
    description: "Le ratio atteint 29,1% sur Carrousel contre 26,4% le mois précédent.",
    category: "Finance",
    restaurant: "carrousel",
    priority: "Élevée",
    date: dayISO(-4),
    status: "En cours",
    owner: "Salma Bennani",
  },
  {
    id: "al8",
    title: "Surstock détecté — Nouilles udon",
    description: "Couverture de 21 jours, risque de perte sur DLC.",
    category: "Stock",
    restaurant: "carrousel",
    priority: "Faible",
    date: dayISO(-5),
    status: "Ignorée",
    owner: "Karim Idrissi",
  },
  {
    id: "al9",
    title: "Retard de livraison fournisseur",
    description: "Commande PO/2026/1214 en retard de 2 jours (Asia Import Maroc).",
    category: "Achats",
    restaurant: "arribate",
    priority: "Normale",
    date: dayISO(-5),
    status: "Nouvelle",
    owner: "Youssef El Amrani",
  },
  {
    id: "al10",
    title: "Baisse du panier moyen sur Carrousel",
    description: "-6,2% sur 14 jours. Analyse du mix produit recommandée.",
    category: "Finance",
    restaurant: "carrousel",
    priority: "Normale",
    date: dayISO(-6),
    status: "Nouvelle",
    owner: "Direction Mitsuki",
  },
];

export interface AiRecommendation {
  id: string;
  title: string;
  domain: "Achats" | "Production" | "Finance" | "Qualité" | "Marketing";
  impact: "Fort" | "Moyen" | "Faible";
  description: string;
  confidence: number;
  sources: string[];
  generatedAt: string;
}

export const aiRecommendations: AiRecommendation[] = [
  {
    id: "rec1",
    title: "Anticiper la commande de saumon de 24h sur Gare Agdal",
    domain: "Achats",
    impact: "Fort",
    description:
      "La consommation de saumon progresse de 12% sur 14 jours alors que le délai fournisseur reste de 1 jour. Passer la commande la veille éviterait 2 ruptures par mois, soit environ 9 800 MAD de ventes manquées.",
    confidence: 84,
    sources: ["Stocks Odoo", "Ventes 30 jours", "Délais fournisseur"],
    generatedAt: dayISO(0),
  },
  {
    id: "rec2",
    title: "Revoir le grammage du Rainbow Roll",
    domain: "Finance",
    impact: "Fort",
    description:
      "Le Food Cost du Rainbow Roll atteint 38,8%. Un ajustement du grammage de thon de 10 g ramènerait le ratio sous 34% sans dégrader la perception client observée dans les feedbacks.",
    confidence: 76,
    sources: ["Nomenclatures", "Feedbacks clients", "Prix d'achat"],
    generatedAt: dayISO(0),
  },
  {
    id: "rec3",
    title: "Réduire la production de Mochi de 20% en semaine",
    domain: "Production",
    impact: "Moyen",
    description:
      "Les ventes de desserts sont 34% plus faibles du lundi au mercredi. Une production ajustée limiterait les pertes estimées à 1 400 MAD par semaine.",
    confidence: 81,
    sources: ["Ventes par jour", "Ordres de fabrication", "Stocks"],
    generatedAt: dayISO(-1),
  },
  {
    id: "rec4",
    title: "Renégocier les emballages ou consulter un second fournisseur",
    domain: "Achats",
    impact: "Moyen",
    description:
      "Hausse de 8,9% des tarifs Pack & Go sur 3 mois. Un appel d'offres sur les boîtes bento représenterait environ 14 000 MAD d'économie annuelle.",
    confidence: 69,
    sources: ["Historique prix d'achat", "Volumes commandés"],
    generatedAt: dayISO(-1),
  },
  {
    id: "rec5",
    title: "Mettre en avant le Ramen Tonkotsu en communication",
    domain: "Marketing",
    impact: "Moyen",
    description:
      "Score de satisfaction de 4,6/5 et marge de 71%. Deux publications par semaine sur ce plat soutiendraient le ticket moyen du service du soir.",
    confidence: 73,
    sources: ["Feedbacks", "Marges", "Performances sociales"],
    generatedAt: dayISO(-2),
  },
  {
    id: "rec6",
    title: "Contrôler la chaîne du froid sur les livraisons de la mer",
    domain: "Qualité",
    impact: "Fort",
    description:
      "Corrélation entre un lot fournisseur et 14 feedbacks sur la fraîcheur. Un contrôle systématique à réception réduirait le risque qualité.",
    confidence: 78,
    sources: ["Feedbacks", "Réceptions Odoo", "Lots fournisseur"],
    generatedAt: dayISO(-2),
  },
];

/* ------------------------------------------------------------------ */
/* Community management                                                */
/* ------------------------------------------------------------------ */

export type Platform = "Instagram" | "Facebook" | "TikTok" | "LinkedIn";
export type PostStatus = "Idée" | "Brouillon IA" | "À valider" | "Validé" | "Planifié" | "Publié";

export interface SocialIdea {
  id: string;
  title: string;
  category: string;
  platform: Platform;
  objective: string;
  dish: string;
  format: string;
  potential: "Fort" | "Moyen" | "Faible";
}

export const socialIdeas: SocialIdea[] = [
  {
    id: "idea1",
    title: "Le geste du chef : montage du Dragon Roll en 15 secondes",
    category: "Coulisses",
    platform: "TikTok",
    objective: "Notoriété",
    dish: "Dragon Roll",
    format: "Reel vertical",
    potential: "Fort",
  },
  {
    id: "idea2",
    title: "Offre midi Bento à Gare Agdal",
    category: "Promotion",
    platform: "Instagram",
    objective: "Trafic midi",
    dish: "Bento Mitsuki Midi",
    format: "Carrousel 3 visuels",
    potential: "Fort",
  },
  {
    id: "idea3",
    title: "Portrait de notre sushi chef",
    category: "Équipe",
    platform: "LinkedIn",
    objective: "Marque employeur",
    dish: "—",
    format: "Post photo + texte",
    potential: "Moyen",
  },
  {
    id: "idea4",
    title: "Nouveauté : Ramen Poulet Miso",
    category: "Nouveauté",
    platform: "Instagram",
    objective: "Lancement produit",
    dish: "Ramen Poulet Miso",
    format: "Reel + story",
    potential: "Fort",
  },
  {
    id: "idea5",
    title: "Arrivage du jour : sélection de poissons",
    category: "Storytelling",
    platform: "Instagram",
    objective: "Confiance qualité",
    dish: "Sashimi Saumon 9 pcs",
    format: "Story série",
    potential: "Moyen",
  },
  {
    id: "idea6",
    title: "Plateau partage pour les soirées entre amis",
    category: "Plat",
    platform: "Facebook",
    objective: "Commandes week-end",
    dish: "Plateau Partage 36 pcs",
    format: "Post photo",
    potential: "Moyen",
  },
  {
    id: "idea7",
    title: "Mitsuki Carrousel fête ses 2 ans",
    category: "Événement",
    platform: "Instagram",
    objective: "Engagement local",
    dish: "—",
    format: "Carrousel",
    potential: "Moyen",
  },
  {
    id: "idea8",
    title: "Quiz : sauras-tu reconnaître nos makis ?",
    category: "Engagement",
    platform: "Instagram",
    objective: "Interaction",
    dish: "Nigiri Mix 8 pcs",
    format: "Story interactive",
    potential: "Faible",
  },
  {
    id: "idea9",
    title: "Rentrée : formules à emporter pour le bureau",
    category: "Saisonnier",
    platform: "LinkedIn",
    objective: "B2B",
    dish: "Bento Mitsuki Midi",
    format: "Post texte + visuel",
    potential: "Moyen",
  },
];

export interface SocialPost {
  id: string;
  title: string;
  platform: Platform;
  restaurant: RestaurantId | "all";
  date: string;
  time: string;
  status: PostStatus;
  caption: string;
  hashtags: string;
  visual: string;
  engagement: number;
}

export const socialPosts: SocialPost[] = [
  {
    id: "sp1",
    title: "Dragon Roll en gros plan",
    platform: "Instagram",
    restaurant: "all",
    date: dayISO(-6),
    time: "19:30",
    status: "Publié",
    caption:
      "Le Dragon Roll, notre signature : anguille fumée, avocat, sauce maison. Disponible dans nos 3 adresses.",
    hashtags: "#mitsuki #sushirabat #dragonroll",
    visual: "Photo macro du roll sur ardoise noire",
    engagement: 6.8,
  },
  {
    id: "sp2",
    title: "Offre midi Bento",
    platform: "Instagram",
    restaurant: "agdal",
    date: dayISO(-3),
    time: "11:00",
    status: "Publié",
    caption: "Votre pause déjeuner à Gare Agdal : Bento Mitsuki à 149 MAD, prêt en 10 minutes.",
    hashtags: "#lunchrabat #bento #mitsuki",
    visual: "Bento vu du dessus, fond clair",
    engagement: 5.1,
  },
  {
    id: "sp3",
    title: "Coulisses du sushi bar",
    platform: "TikTok",
    restaurant: "arribate",
    date: dayISO(2),
    time: "18:00",
    status: "Planifié",
    caption: "45 secondes dans les coulisses de notre sushi bar d'Arribate Center.",
    hashtags: "#behindthescenes #sushichef",
    visual: "Vidéo verticale, plan séquence",
    engagement: 0,
  },
  {
    id: "sp4",
    title: "Nouveauté Ramen Poulet Miso",
    platform: "Instagram",
    restaurant: "all",
    date: dayISO(4),
    time: "12:30",
    status: "Validé",
    caption: "Nouveau à la carte : Ramen Poulet Miso, bouillon mijoté 6 heures.",
    hashtags: "#ramen #nouveaute #mitsuki",
    visual: "Bol fumant, lumière chaude",
    engagement: 0,
  },
  {
    id: "sp5",
    title: "Portrait équipe cuisine",
    platform: "LinkedIn",
    restaurant: "all",
    date: dayISO(7),
    time: "09:00",
    status: "À valider",
    caption: "Rencontre avec Karim, responsable production, 6 ans chez Mitsuki.",
    hashtags: "#marqueemployeur #restauration",
    visual: "Portrait en cuisine",
    engagement: 0,
  },
  {
    id: "sp6",
    title: "Arrivage du jour",
    platform: "Instagram",
    restaurant: "all",
    date: dayISO(9),
    time: "10:00",
    status: "Brouillon IA",
    caption: "Chaque matin, notre chef sélectionne le poisson du jour.",
    hashtags: "#fraicheur #sushi",
    visual: "Série de stories",
    engagement: 0,
  },
  {
    id: "sp7",
    title: "Plateau partage week-end",
    platform: "Facebook",
    restaurant: "carrousel",
    date: dayISO(-12),
    time: "17:00",
    status: "Publié",
    caption: "36 pièces à partager, à emporter ou sur place à Carrousel.",
    hashtags: "#plateau #weekend",
    visual: "Plateau vu du dessus",
    engagement: 3.9,
  },
  {
    id: "sp8",
    title: "Anniversaire Carrousel",
    platform: "Instagram",
    restaurant: "carrousel",
    date: dayISO(12),
    time: "18:30",
    status: "Idée",
    caption: "2 ans déjà — merci Rabat.",
    hashtags: "#anniversaire #mitsuki",
    visual: "Montage photos clients",
    engagement: 0,
  },
];

export interface Notification {
  id: string;
  title: string;
  detail: string;
  date: string;
  read: boolean;
}

export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Rupture imminente : Saumon frais",
    detail: "Gare Agdal — couverture 0,8 jour",
    date: dayISO(0),
    read: false,
  },
  {
    id: "n2",
    title: "Nouvelle analyse IA disponible",
    detail: "Analyse financière — Août 2026",
    date: dayISO(0),
    read: false,
  },
  {
    id: "n3",
    title: "3 feedbacks critiques à traiter",
    detail: "Fraîcheur du saumon — Gare Agdal",
    date: dayISO(-1),
    read: false,
  },
  {
    id: "n4",
    title: "Synchronisation Odoo terminée",
    detail: "1 284 enregistrements mis à jour",
    date: dayISO(-1),
    read: true,
  },
];

export interface ValidationLogEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  object: string;
  decision: "Validé" | "Refusé";
}

export const validationLog: ValidationLogEntry[] = [
  {
    id: "v1",
    date: dayISO(-1),
    user: "Youssef El Amrani",
    action: "Validation d'une recommandation d'achat IA",
    object: "Saumon frais — 42 kg — Océan Frais SARL",
    decision: "Validé",
  },
  {
    id: "v2",
    date: dayISO(-2),
    user: "Direction Mitsuki",
    action: "Validation d'un contenu social IA",
    object: "Nouveauté Ramen Poulet Miso — Instagram",
    decision: "Validé",
  },
  {
    id: "v3",
    date: dayISO(-4),
    user: "Salma Bennani",
    action: "Refus d'un ajustement de grammage IA",
    object: "Dragon Roll — thon -15 g",
    decision: "Refusé",
  },
];
