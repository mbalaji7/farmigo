import type { Equipment } from "./data";
export type AdvancedFilters = {
  brand: string;
  minPower: string;
  maxPower: string;
  minYear: string;
  maxYear: string;
  maxHours: string;
  radius: string;
};
export type SearchFilters = AdvancedFilters & {
  mode: "rent" | "buy";
  category: string;
  condition: string;
  maxPrice: string;
  sort: string;
  query: string;
  location: string;
};
export const emptyAdvanced: AdvancedFilters = {
  brand: "",
  minPower: "",
  maxPower: "",
  minYear: "",
  maxYear: "",
  maxHours: "",
  radius: "",
};
const categories = [
  "All equipment",
  "Tractors",
  "Harvesters",
  "Planting",
  "Hay & forage",
  "Attachments",
  "Irrigation",
];
export const cityCenters: Record<
  string,
  { city: string; zip: string; lat: number; lng: number }
> = {
  "des moines": {
    city: "Des Moines",
    zip: "50309",
    lat: 41.5868,
    lng: -93.625,
  },
  ames: { city: "Ames", zip: "50010", lat: 42.0308, lng: -93.6319 },
  ankeny: { city: "Ankeny", zip: "50023", lat: 41.7318, lng: -93.6001 },
  boone: { city: "Boone", zip: "50036", lat: 42.0597, lng: -93.8802 },
  newton: { city: "Newton", zip: "50208", lat: 41.6997, lng: -93.0479 },
  "cedar rapids": {
    city: "Cedar Rapids",
    zip: "52401",
    lat: 41.9779,
    lng: -91.6656,
  },
};
export function readFilters(search: string): SearchFilters {
  const p = new URLSearchParams(search);
  const number = (key: string) => {
    const value = p.get(key) || "";
    return value && Number.isFinite(Number(value)) && Number(value) >= 0
      ? value
      : "";
  };
  return {
    ...emptyAdvanced,
    mode: p.get("mode") === "buy" ? "buy" : "rent",
    category: categories.includes(p.get("category") || "")
      ? p.get("category")!
      : "All equipment",
    condition: ["Excellent", "Good"].includes(p.get("condition") || "")
      ? p.get("condition")!
      : "Any condition",
    maxPrice: number("maxPrice"),
    sort: ["price-low", "price-high"].includes(p.get("sort") || "")
      ? p.get("sort")!
      : "recommended",
    query: (p.get("q") || "").slice(0, 200),
    location: (p.get("location") || "").slice(0, 100),
    brand: (p.get("brand") || "").slice(0, 60),
    minPower: number("minPower"),
    maxPower: number("maxPower"),
    minYear: number("minYear"),
    maxYear: number("maxYear"),
    maxHours: number("maxHours"),
    radius: number("radius"),
  };
}
export function filterQuery(f: SearchFilters): string {
  const p = new URLSearchParams();
  if (f.mode === "buy") p.set("mode", "buy");
  if (f.category !== "All equipment") p.set("category", f.category);
  if (f.condition !== "Any condition") p.set("condition", f.condition);
  if (f.sort !== "recommended") p.set("sort", f.sort);
  if (f.query) p.set("q", f.query);
  if (f.location) p.set("location", f.location);
  for (const key of [
    "maxPrice",
    "brand",
    "minPower",
    "maxPower",
    "minYear",
    "maxYear",
    "maxHours",
    "radius",
  ] as const)
    if (f[key]) p.set(key, f[key]);
  return p.toString();
}
export function brandOf(e: Equipment) {
  return (
    e.brand || (/^John Deere/i.test(e.title) ? "John Deere" : "Unspecified")
  );
}
function center(value: string) {
  const key = value
    .trim()
    .toLowerCase()
    .replace(/,?\s+ia$/, "");
  return (
    cityCenters[key] || Object.values(cityCenters).find((c) => c.zip === key)
  );
}
export function distanceFrom(e: Equipment, location: string): number | null {
  const origin = center(location),
    destination = center(e.city);
  if (!origin || !destination) return null;
  const rad = (n: number) => (n * Math.PI) / 180;
  const lat = rad(destination.lat - origin.lat),
    lng = rad(destination.lng - origin.lng);
  const a =
    Math.sin(lat / 2) ** 2 +
    Math.cos(rad(origin.lat)) *
      Math.cos(rad(destination.lat)) *
      Math.sin(lng / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export function matchesEquipment(e: Equipment, f: SearchFilters) {
  const distance = f.radius ? distanceFrom(e, f.location) : null;
  return (
    (!e.status || e.status === "active") &&
    (f.mode === "rent" ? e.rent > 0 : e.price > 0) &&
    (f.category === "All equipment" || e.category === f.category) &&
    `${e.title} ${e.category} ${e.owner} ${brandOf(e)}`
      .toLowerCase()
      .includes(f.query.toLowerCase()) &&
    (f.radius
      ? distance !== null && distance <= Number(f.radius)
      : `${e.city} ${e.state} ${e.zip}`
          .toLowerCase()
          .includes(f.location.toLowerCase())) &&
    (f.condition === "Any condition" || e.condition === f.condition) &&
    (!f.maxPrice ||
      (f.mode === "rent" ? e.rent : e.price) <= Number(f.maxPrice)) &&
    (!f.brand || brandOf(e).toLowerCase() === f.brand.toLowerCase()) &&
    (!f.minPower || e.horsepower >= Number(f.minPower)) &&
    (!f.maxPower || e.horsepower <= Number(f.maxPower)) &&
    (!f.minYear || e.year >= Number(f.minYear)) &&
    (!f.maxYear || e.year <= Number(f.maxYear)) &&
    (!f.maxHours || e.hours <= Number(f.maxHours))
  );
}
