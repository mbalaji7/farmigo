export type Category =
  | "Tractors"
  | "Harvesters"
  | "Planting"
  | "Hay & forage"
  | "Attachments"
  | "Irrigation";
export type Equipment = {
  id: string;
  title: string;
  category: Category;
  city: string;
  state: string;
  zip: string;
  year: number;
  hours: number;
  horsepower: number;
  rent: number;
  price: number;
  image: string;
  owner: string;
  initials: string;
  rating: string;
  reviews: number;
  condition: "Excellent" | "Good";
  description: string;
  tag?: string;
  photos?: string[];
  workingWidth?: string;
  capacity?: string;
  brand?: string;
  attachments?: string;
  pickupNotes?: string;
};
export const images = {
  tractor:
    "https://www.deere.ch/assets/images/region-2/product/images/r2g095846_large_frame_large_f22b91065b8acb097bde6c66c4f700fe9fd10536.jpg",
  utility:
    "https://www.deere.com.mx/assets/images/common/products/tractors/6125e_r3g015705_small_bb0ce572702fddca16d16b52c2fb50aedccac19e.jpg",
  harvester:
    "https://www.deere.com.br/assets/images/region-3/products/harvesters/s-series/s680/colheitadeira_s680_campo3_large_d260b38fda4648f0514fd146f835e1997db49d8f.jpg",
  baler: "/baler.jpg",
  planter:
    "https://cisp.cachefly.net/assets/articles/images/resized/0000866217_resized_agritech6bcabjohndeere1022.jpg",
  field:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",
};
export const initialEquipment: Equipment[] = [
  {
    id: "jd-6m",
    title: "John Deere 6M 220",
    category: "Tractors",
    city: "Des Moines",
    state: "IA",
    zip: "50309",
    year: 2023,
    hours: 420,
    horsepower: 220,
    rent: 245,
    price: 148500,
    image: images.tractor,
    owner: "Willow Creek Farm",
    initials: "WC",
    rating: "4.9",
    reviews: 24,
    condition: "Excellent",
    tag: "Popular pick",
    description:
      "A dependable workhorse for your busiest days. This well-maintained tractor comes with a climate-controlled cab, front-wheel assist, and ready-to-work hydraulics. Ideal for tillage, planting, and hauling. Pickup at our farm; delivery can be discussed with the owner.",
  },
  {
    id: "jd-s680",
    title: "John Deere S680 Combine",
    category: "Harvesters",
    city: "Ames",
    state: "IA",
    zip: "50010",
    year: 2021,
    hours: 860,
    horsepower: 473,
    rent: 580,
    price: 215000,
    image: images.harvester,
    owner: "Green Acres Co-op",
    initials: "GA",
    rating: "4.8",
    reviews: 18,
    condition: "Excellent",
    tag: "Harvest ready",
    description:
      "Make the most of harvest season with our meticulously serviced combine. A spacious cab and powerful harvesting system help make long days a little easier. Header availability and delivery arrangements can be discussed with the owner.",
  },
  {
    id: "jd-baler",
    title: "John Deere F440E Baler",
    category: "Hay & forage",
    city: "Ankeny",
    state: "IA",
    zip: "50023",
    year: 2022,
    hours: 210,
    horsepower: 65,
    rent: 125,
    price: 28500,
    image: images.baler,
    owner: "Miller Family Farms",
    initials: "MF",
    rating: "5.0",
    reviews: 12,
    condition: "Excellent",
    description:
      "Clean, consistent round bales, season after season. Our F440E baler is regularly serviced and ready for your next hay cut. Tractor not included; a compatible tractor with at least 65 horsepower is recommended.",
  },
  {
    id: "jd-utility",
    title: "John Deere 6125E",
    category: "Tractors",
    city: "Boone",
    state: "IA",
    zip: "50036",
    year: 2020,
    hours: 1120,
    horsepower: 123,
    rent: 175,
    price: 67000,
    image: images.utility,
    owner: "Prairie View Farm",
    initials: "PV",
    rating: "4.9",
    reviews: 31,
    condition: "Good",
    tag: "Great value",
    description:
      "A versatile utility tractor for everyday farm jobs. Easy-to-use controls, reliable power, and a comfortable enclosed cab make this a great fit for mowing, hauling, and light fieldwork.",
  },
  {
    id: "planter",
    title: "6-row Precision Planter",
    category: "Planting",
    city: "Newton",
    state: "IA",
    zip: "50208",
    year: 2022,
    hours: 160,
    horsepower: 90,
    rent: 160,
    price: 32000,
    image: images.planter,
    owner: "Oak & Field",
    initials: "OF",
    rating: "4.8",
    reviews: 9,
    condition: "Excellent",
    description:
      "Get your planting season off to a strong start with this six-row planter. Well maintained with adjustable row spacing. Tractor shown for illustration and not included in the rental.",
  },
  {
    id: "disc",
    title: "Heavy-duty Disc Harrow",
    category: "Attachments",
    city: "Des Moines",
    state: "IA",
    zip: "50309",
    year: 2021,
    hours: 380,
    horsepower: 120,
    rent: 95,
    price: 12500,
    image: images.tractor,
    owner: "Willow Creek Farm",
    initials: "WC",
    rating: "4.9",
    reviews: 24,
    condition: "Good",
    description:
      "Prepare a smooth, even seedbed with this rugged disc harrow. Compatible with tractors rated at 120 horsepower or more. Tractor pictured is not included.",
  },
  {
    id: "irrigation",
    title: "Portable Irrigation Package",
    category: "Irrigation",
    city: "Ames",
    state: "IA",
    zip: "50010",
    year: 2023,
    hours: 90,
    horsepower: 0,
    rent: 80,
    price: 8500,
    image: images.field,
    owner: "Green Acres Co-op",
    initials: "GA",
    rating: "4.8",
    reviews: 18,
    condition: "Excellent",
    description:
      "Keep your crops growing with a portable pump and hose package. Includes pump, fittings, and hoses. Field pictured for illustration. Contact the owner to confirm flow rates and compatibility.",
  },
  {
    id: "jd-6m2",
    title: "John Deere 6M Field Package",
    category: "Tractors",
    city: "Cedar Rapids",
    state: "IA",
    zip: "52401",
    year: 2022,
    hours: 640,
    horsepower: 220,
    rent: 275,
    price: 142000,
    image: images.tractor,
    owner: "Heartland Equipment",
    initials: "HE",
    rating: "4.9",
    reviews: 16,
    condition: "Good",
    description:
      "An all-around fieldwork package with a reliable tractor and matched tillage attachment. Ideal for larger acreage. Reach out to the owner for exact implement dimensions and transport options.",
  },
];
