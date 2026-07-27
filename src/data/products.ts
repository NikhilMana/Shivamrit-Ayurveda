export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  price: number;
  distributorPrice: number;
  images: string[];
  benefits: string[];
  size?: string;
}

export const products: Product[] = [
  {
    id: "kesh-kalpa-shampoo",
    name: "Kesh Kalpa Anti-Dandruff Shampoo",
    slug: "kesh-kalpa-anti-dandruff-shampoo",
    category: "Hair Care",
    shortDescription: "An premium Ayurvedic formulation enriched with powerful natural actives like Neem, Aloe Vera, Bhringraj, and Tea Tree Oil designed to tackle stubborn flakes while maintaining vital scalp hydration.",
    price: 230,
    distributorPrice: 200,
    size: "100ml",
    images: [
      "/assets/kesh kalpa shampoo.png",
      "/assets/combo pack.png",
    ],
    benefits: [
      "Fights & Controls Dandruff",
      "Reduces Scalp Irritation & Itch",
      "Strengthens Hair Roots",
      "Paraben & Sulphate Free"
    ],
  },
  {
    id: "kesh-amrit-hair-oil",
    name: "Kesh Amrit Premium Hair Oil",
    slug: "kesh-amrit-premium-hair-oil",
    category: "Hair Care",
    shortDescription: "A potent, deeply nourishing traditional blend powered by Bhringraj, Amla, Hibiscus, and premium natural oils. Features an easy-to-use comb applicator for direct root penetration.",
    price: 200,
    distributorPrice: 170,
    size: "100ml",
    images: [
      "/assets/kesh amrit hair oil.png",
      "/assets/combo pack.png",
    ],
    benefits: [
      "Significantly Reduces Hair Fall",
      "Delays Premature Greying",
      "Promotes Active Hair Growth",
      "Deeply Nourishes Scalp"
    ],
  },
  {
    id: "twak-amrit-face-oil",
    name: "Twak Amrit Kumkumadi Face Oil / Serum",
    slug: "twak-amrit-kumkumadi-face-oil",
    category: "Skin Care",
    shortDescription: "An exquisite luxurious blend of rare saffron (Kumkum), Sandalwood, Lotus, Yashtimadhu, and pure Sesame Oil structured to reveal timeless, glowing skin clarity.",
    price: 239,
    distributorPrice: 199,
    size: "30ml",
    images: [
      "/assets/twak amrit face oil.png",
      "/assets/combo pack.png",
    ],
    benefits: [
      "Brightens & Enhances Complexion",
      "Evens Skin Tone & Texture",
      "Fades Dark Spots & Pigmentation",
      "Provides Youthful Radiance"
    ],
  },
  {
    id: "greeshm-smooth-soap",
    name: "Greeshm Smooth Nourishing Soap",
    slug: "greeshm-smooth-nourishing-soap",
    category: "Skin Care",
    shortDescription: "Infused with Kumkum, Kesar, Chandana, Manjista, and Palasha to provide premium cooling, natural deep cleansing, and sun-tan removal support during daily baths.",
    price: 50,
    distributorPrice: 35,
    size: "125g",
    images: [
      "/assets/greeshm soap.png",
      "/assets/combo pack.png",
    ],
    benefits: [
      "Deep Cleansing Action",
      "Cooling & Refreshing Effect",
      "Sun-Tan Removal Support",
      "Nourishes & Radiates Skin"
    ],
  },

  {
    id: "neem-wooden-comb",
    name: "Pure Neem Wooden Comb",
    slug: "pure-neem-wooden-comb",
    category: "Accessories",
    shortDescription: "Handcrafted from 100% natural neem wood. Anti-static, detangles smoothly while stimulating scalp circulation and preventing hair breakage.",
    price: 50,
    distributorPrice: 35,
    size: "1 Comb",
    images: [
      "/assets/neem comb.png",
      "/assets/combo pack.png",
    ],
    benefits: [
      "100% Natural Neem Wood",
      "Anti-Static & Gentle on Scalp",
      "Stimulates Hair Follicles",
      "Prevents Hair Breakage"
    ],
  },
  {
    id: "essential-combo-pack",
    name: "Shivamrit Essential Combo Ritual Pack",
    slug: "shivamrit-essential-combo-pack",
    category: "Sanctuary Kit",
    shortDescription: "The complete Shivamrit Ayurvedic sanctuary experience featuring our hair oil, anti-dandruff shampoo, kumkumadi face oil, and nourishing soap. Includes a FREE Pure Neem Wooden Comb!",
    price: 719,
    distributorPrice: 649,
    size: "Full Ritual Kit + FREE Comb",
    images: [
      "/assets/combo pack.png",
      "/assets/shivamrit frame 2.png",
    ],
    benefits: [
      "🎁 Includes FREE Pure Neem Wooden Comb",
      "Complete Hair & Skin Care",
      "100% Authentic Formulations",
      "Best Value Sanctuary Kit"
    ],
  }
];
