const { Client } = require("pg");

const connectionString = "postgresql://postgres.jmgluhfmvjphxbptnkeo:Shivamrit%4020@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const products = [
  {
    id: "kesh-kalpa-shampoo",
    name: "Kesh Kalpa Anti-Dandruff Shampoo",
    slug: "kesh-kalpa-anti-dandruff-shampoo",
    category: "Hair Care",
    short_description: "An premium Ayurvedic formulation enriched with powerful natural actives like Neem, Aloe Vera, Bhringraj, and Tea Tree Oil designed to tackle stubborn flakes while maintaining vital scalp hydration.",
    price: 230,
    distributor_price: 200,
    size: "100ml",
    images: ["/assets/kesh kalpa shampoo.png", "/assets/combo pack.png"],
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
    category: "Hair Care",
    short_description: "A potent, deeply nourishing traditional blend powered by Bhringraj, Amla, Hibiscus, and premium natural oils. Features an easy-to-use comb applicator for direct root penetration.",
    price: 210,
    distributor_price: 180,
    size: "100ml",
    images: ["/assets/kesh amrit hair oil.png", "/assets/combo pack.png"],
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
    category: "Skin Care",
    short_description: "An exquisite luxurious blend of rare saffron (Kumkum), Sandalwood, Lotus, Yashtimadhu, and pure Sesame Oil structured to reveal timeless, glowing skin clarity.",
    price: 239,
    distributor_price: 199,
    size: "30ml",
    images: ["/assets/twak amrit face oil.png", "/assets/combo pack.png"],
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
    category: "Skin Care",
    short_description: "Infused with Kumkum, Kesar, Chandana, Manjista, and Palasha to provide premium cooling, natural deep cleansing, and sun-tan removal support during daily baths.",
    price: 40,
    distributor_price: 30,
    size: "125g",
    images: ["/assets/greeshm soap.png", "/assets/combo pack.png"],
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
    category: "Accessories",
    short_description: "Handcrafted from 100% natural neem wood. Anti-static, detangles smoothly while stimulating scalp circulation and preventing hair breakage.",
    price: 149,
    distributor_price: 99,
    size: "1 Comb",
    images: ["/assets/neem comb.png", "/assets/combo pack.png"],
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
    category: "Sanctuary Kit",
    short_description: "The complete Shivamrit Ayurvedic sanctuary experience featuring our hair oil, anti-dandruff shampoo, kumkumadi face oil, nourishing soap, and handcrafted neem comb in one holistic ritual box.",
    price: 699,
    distributor_price: 599,
    size: "Full Ritual Kit",
    images: ["/assets/combo pack.png", "/assets/shivamrit frame 2.png"],
    benefits: [
      "Complete Hair & Skin Care",
      "100% Authentic Formulations",
      "Holistic Wellness Ritual",
      "Best Value Sanctuary Kit"
    ]
  }
];

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to Supabase PostgreSQL database.");

  // Create products table
  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(255) NOT NULL,
      short_description TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      distributor_price NUMERIC(10, 2) NOT NULL,
      size VARCHAR(100),
      images TEXT[] NOT NULL,
      benefits TEXT[] NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("✅ Table 'products' is ready.");

  // Insert or update products
  for (const p of products) {
    await client.query(`
      INSERT INTO products (id, name, slug, category, short_description, price, distributor_price, size, images, benefits)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        short_description = EXCLUDED.short_description,
        price = EXCLUDED.price,
        distributor_price = EXCLUDED.distributor_price,
        size = EXCLUDED.size,
        images = EXCLUDED.images,
        benefits = EXCLUDED.benefits;
    `, [p.id, p.name, p.slug, p.category, p.short_description, p.price, p.distributor_price, p.size, p.images, p.benefits]);
  }

  console.log("✅ Seeded products into Supabase PostgreSQL!");
  await client.end();
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
