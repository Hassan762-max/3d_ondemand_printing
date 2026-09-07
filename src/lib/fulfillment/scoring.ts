/** Pure scoring helpers — kept free of Prisma for unit tests. */

const CITY_REGION: Record<string, string> = {
  karachi: "sindh",
  hyderabad: "sindh",
  sukkur: "sindh",
  lahore: "punjab_central",
  faisalabad: "punjab_central",
  multan: "punjab_south",
  gujranwala: "punjab_central",
  sialkot: "punjab_north",
  islamabad: "capital",
  rawalpindi: "capital",
  peshawar: "kpk",
  quetta: "balochistan",
};

const NEIGHBORS: Record<string, string[]> = {
  punjab_central: ["punjab_north", "punjab_south", "capital"],
  punjab_north: ["punjab_central", "capital", "kpk"],
  punjab_south: ["punjab_central", "sindh"],
  capital: ["punjab_central", "punjab_north", "kpk"],
  sindh: ["punjab_south"],
  kpk: ["capital", "punjab_north"],
  balochistan: ["sindh"],
};

export function regionOf(city: string) {
  return CITY_REGION[city.trim().toLowerCase()] ?? "other";
}

/** 1 = same city · 0.72 = same region · 0.45 = neighbor · 0.2 = far */
export function locationScore(customerCity: string, vendorCity: string) {
  const a = customerCity.trim().toLowerCase();
  const b = vendorCity.trim().toLowerCase();
  if (a === b) return 1;
  const ra = regionOf(a);
  const rb = regionOf(b);
  if (ra === rb && ra !== "other") return 0.72;
  if (NEIGHBORS[ra]?.includes(rb)) return 0.45;
  return 0.2;
}

/** Cost factor 1.0 → score 1.0; higher cost → lower score (clamped 0–1). */
export function costScore(baseCostFactor: number) {
  return Math.max(0, Math.min(1, 2 - baseCostFactor));
}

export function capacityScore(openOrders: number, capacityDaily: number) {
  return Math.max(0, 1 - openOrders / Math.max(1, capacityDaily));
}
