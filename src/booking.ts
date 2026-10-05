import type { EquipmentRequest } from "./marketplaceTypes";
export function daysBetween(start: string, end: string): number {
  const parse = (s: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return NaN;
    const value = new Date(`${s}T00:00:00Z`);
    return Number.isFinite(value.getTime()) &&
      value.toISOString().slice(0, 10) === s
      ? value.getTime()
      : NaN;
  };
  const a = parse(start),
    b = parse(end);
  return Number.isFinite(a) && Number.isFinite(b) && b >= a
    ? Math.round((b - a) / 86400000) + 1
    : 0;
}
export function rentalQuote(
  days: number,
  daily: number,
  weekly = daily * 6,
  monthly = daily * 22,
  deposit = 0,
  delivery = 0,
) {
  if (
    !Number.isInteger(days) ||
    days < 1 ||
    days > 90 ||
    daily <= 0 ||
    weekly <= 0 ||
    monthly <= 0 ||
    deposit < 0 ||
    delivery < 0
  )
    throw new Error("Choose a valid rental of 1–90 days with positive rates.");
  const costs = [0];
  for (let day = 1; day <= days; day++)
    costs[day] = Math.min(
      costs[day - 1] + daily,
      day >= 7 ? costs[day - 7] + weekly : Infinity,
      day >= 30 ? costs[day - 30] + monthly : Infinity,
    );
  const rental = Math.round(costs[days] * 100) / 100;
  return {
    rental,
    deposit,
    delivery,
    total: rental + deposit + delivery,
    savings: days * daily - rental,
  };
}
export function blockedFor(
  equipmentId: string,
  dates: string[],
  requests: EquipmentRequest[],
) {
  const result = new Set(dates);
  for (const r of requests) {
    if (
      r.equipmentId !== equipmentId ||
      r.kind !== "rent" ||
      r.status !== "accepted" ||
      r.sample ||
      !r.start ||
      !r.end
    )
      continue;
    const days = daysBetween(r.start, r.end);
    for (let i = 0; i < days; i++) {
      const d = new Date(`${r.start}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + i);
      result.add(d.toISOString().slice(0, 10));
    }
  }
  return result;
}
export function isRangeAvailable(
  start: string,
  end: string,
  blocked: Set<string>,
) {
  const days = daysBetween(start, end);
  if (days < 1 || days > 90) return false;
  for (let i = 0; i < days; i++) {
    const date = new Date(`${start}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + i);
    if (blocked.has(date.toISOString().slice(0, 10))) return false;
  }
  return true;
}
