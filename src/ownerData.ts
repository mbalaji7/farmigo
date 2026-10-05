import type { Equipment } from "./data";
import { ownerSlug } from "./utils";
export type OwnerReview = {
  id: string;
  ownerKey: string;
  authorId?: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
  sample?: boolean;
};
export const ownerKey = (e: Equipment) => e.ownerId || ownerSlug(e.owner);
export const ownerPath = (e: Equipment): `/${string}` => `/owners/${ownerKey(e)}`;
const sampleOwners = [
  "willow-creek-farm",
  "green-acres-co-op",
  "miller-family-farms",
  "prairie-view-farm",
  "oak-field",
  "heartland-equipment",
];
export function sampleReviews(key: string): OwnerReview[] {
  if (!sampleOwners.includes(key)) return [];
  return [
    {
      id: `${key}-1`,
      ownerKey: key,
      author: "Jamie R. (sample)",
      rating: 5,
      body: "Sample review: Clear equipment details and a helpful conversation about pickup. It made planning our fieldwork easier.",
      createdAt: "2026-09-18T12:00:00Z",
      sample: true,
    },
    {
      id: `${key}-2`,
      ownerKey: key,
      author: "Morgan L. (sample)",
      rating: 5,
      body: "Sample review: The owner answered our questions about the attachment and operating requirements before we made arrangements.",
      createdAt: "2026-08-22T12:00:00Z",
      sample: true,
    },
    {
      id: `${key}-3`,
      ownerKey: key,
      author: "Casey W. (sample)",
      rating: key === "miller-family-farms" ? 5 : 4,
      body: "Sample review: A straightforward experience. Confirming the transport details in advance was useful for our schedule.",
      createdAt: "2026-07-10T12:00:00Z",
      sample: true,
    },
  ];
}
export function reviewSummary(reviews: OwnerReview[]) {
  return {
    count: reviews.length,
    rating: reviews.length
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "New",
  };
}
