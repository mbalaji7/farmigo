export type DemoProfile = {
  id: string;
  name: string;
  email: string;
  farm: string;
  city: string;
  state: string;
  role: "renter" | "owner" | "both";
  bio: string;
  createdAt: string;
};
export type ProfileInput = Pick<
  DemoProfile,
  "name" | "email" | "farm" | "city" | "state" | "role" | "bio"
>;
