import type { EquipmentRequest } from "./marketplaceTypes";
export type ActivityEvent = {
  equipmentId: string;
  kind: "view" | "save";
  createdAt: string;
};
export function summarizeRequests(requests: EquipmentRequest[]) {
  const real = requests.filter((r) => !r.sample);
  const accepted = real.filter(
    (r) => r.kind === "rent" && r.status === "accepted",
  );
  return {
    inquiries: real.length,
    pending: real.filter((r) => r.status === "pending").length,
    accepted: accepted.length,
    quoted: accepted.reduce(
      (sum, r) => sum + Math.max(0, r.total - (r.deposit || 0)),
      0,
    ),
    returned: accepted.filter((r) => r.stage === "returned").length,
  };
}
