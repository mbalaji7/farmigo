export type WantedOffer = {
  id: string;
  authorId: string;
  author: string;
  equipmentId: string;
  message: string;
  createdAt: string;
};
export type WantedPost = {
  id: string;
  authorId: string;
  author: string;
  title: string;
  category: string;
  kind: "rent" | "buy";
  city: string;
  neededBy: string;
  budget: number;
  description: string;
  createdAt: string;
  expiresAt: string;
  status: "open" | "fulfilled";
  sample?: boolean;
  offers: WantedOffer[];
};
export function wantedStatus(p: WantedPost, today: string) {
  return p.status === "fulfilled"
    ? "fulfilled"
    : p.expiresAt < today
      ? "expired"
      : "open";
}
