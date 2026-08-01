import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const catalogProducts = [
  {
    id: "kesh-kalpa-shampoo",
    name: "Kesh Kalpa Anti-Dandruff Shampoo",
    slug: "kesh-kalpa-anti-dandruff-shampoo",
    description: "An premium Ayurvedic formulation enriched with powerful natural actives like Neem, Aloe Vera, Bhringraj, and Tea Tree Oil designed to tackle stubborn flakes while maintaining vital scalp hydration.",
    price: 230,
    offer_price: 200,
    size: "100ml",
    stock: 50,
    featured: true,
    status: "active",
    benefits: [
      "Fights & Controls Dandruff",
      "Reduces Scalp Irritation & Itch",
      "Strengthens Hair Roots",
      "Paraben & Sulphate Free"
    ]
  },
  {
    id: "kesh-amrit-hair-oil",
    name: "Kesh Amrit Premium Hair Oil",
    slug: "kesh-amrit-premium-hair-oil",
    description: "A potent, deeply nourishing traditional blend powered by Bhringraj, Amla, Hibiscus, and premium natural oils. Features an easy-to-use comb applicator for direct root penetration.",
    price: 200,
    offer_price: 170,
    size: "100ml",
    stock: 50,
    featured: true,
    status: "active",
    benefits: [
      "Significantly Reduces Hair Fall",
      "Delays Premature Greying",
      "Promotes Active Hair Growth",
      "Deeply Nourishes Scalp"
    ]
  },
  {
    id: "twak-amrit-face-oil",
    name: "Twak Amrit Kumkumadi Face Oil / Serum",
    slug: "twak-amrit-kumkumadi-face-oil",
    description: "An exquisite luxurious blend of rare saffron (Kumkum), Sandalwood, Lotus, Yashtimadhu, and pure Sesame Oil structured to reveal timeless, glowing skin clarity.",
    price: 239,
    offer_price: 199,
    size: "10ml",
    stock: 50,
    featured: true,
    status: "active",
    benefits: [
      "Brightens & Enhances Complexion",
      "Evens Skin Tone & Texture",
      "Fades Dark Spots & Pigmentation",
      "Provides Youthful Radiance"
    ]
  },
  {
    id: "greeshm-smooth-soap",
    name: "Greeshm Smooth Nourishing Soap",
    slug: "greeshm-smooth-nourishing-soap",
    description: "Infused with Kumkum, Kesar, Chandana, Manjista, and Palasha to provide premium cooling, natural deep cleansing, and sun-tan removal support during daily baths.",
    price: 50,
    offer_price: 35,
    size: "60g",
    stock: 100,
    featured: false,
    status: "active",
    benefits: [
      "Deep Cleansing Action",
      "Cooling & Refreshing Effect",
      "Sun-Tan Removal Support",
      "Nourishes & Radiates Skin"
    ]
  },
  {
    id: "neem-wooden-comb",
    name: "Pure Neem Wooden Comb",
    slug: "pure-neem-wooden-comb",
    description: "Handcrafted from 100% natural neem wood. Anti-static, detangles smoothly while stimulating scalp circulation and preventing hair breakage.",
    price: 50,
    offer_price: 35,
    size: "1 Comb",
    stock: 100,
    featured: false,
    status: "active",
    benefits: [
      "100% Natural Neem Wood",
      "Anti-Static & Gentle on Scalp",
      "Stimulates Hair Follicles",
      "Prevents Hair Breakage"
    ]
  },
  {
    id: "essential-combo-pack",
    name: "Shivamrit Essential Combo Ritual Pack",
    slug: "shivamrit-essential-combo-pack",
    description: "The complete Shivamrit Ayurvedic sanctuary experience featuring our hair oil, anti-dandruff shampoo, kumkumadi face oil, and nourishing soap. Includes a FREE Pure Neem Wooden Comb!",
    price: 719,
    offer_price: 649,
    size: "Full Ritual Kit",
    stock: 30,
    featured: true,
    status: "active",
    benefits: [
      "🎁 Includes FREE Pure Neem Wooden Comb",
      "Complete Hair & Skin Care",
      "100% Authentic Formulations",
      "Best Value Sanctuary Kit"
    ]
  }
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    for (const p of catalogProducts) {
      await (supabase.from("products") as any).upsert(p);
    }

    return NextResponse.json({ success: true, count: catalogProducts.length });
  } catch (error: any) {
    console.error("Product seed route error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed products" }, { status: 500 });
  }
}
