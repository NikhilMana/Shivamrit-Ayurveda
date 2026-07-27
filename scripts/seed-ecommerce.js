const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const connectionString = "postgresql://postgres.jmgluhfmvjphxbptnkeo:Shivamrit%4020@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const categories = [
  { id: "c1111111-1111-1111-1111-111111111111", name: "Hair Care", slug: "hair-care" },
  { id: "c2222222-2222-2222-2222-222222222222", name: "Skin Care", slug: "skin-care" },
  { id: "c3333333-3333-3333-3333-333333333333", name: "Accessories", slug: "accessories" },
  { id: "c4444444-4444-4444-4444-444444444444", name: "Sanctuary Kit", slug: "sanctuary-kit" }
];

const products = [
  {
    id: "kesh-kalpa-shampoo",
    category_id: "c1111111-1111-1111-1111-111111111111",
    name: "Kesh Kalpa Anti-Dandruff Shampoo",
    slug: "kesh-kalpa-anti-dandruff-shampoo",
    description: "An premium Ayurvedic formulation enriched with powerful natural actives like Neem, Aloe Vera, Bhringraj, and Tea Tree Oil designed to tackle stubborn flakes while maintaining vital scalp hydration.",
    price: 230,
    offer_price: 200,
    stock: 50,
    featured: true,
    status: "active",
    size: "100ml",
    ingredients: "Neem, Aloe Vera, Bhringraj, Tea Tree Oil, Tulsi Extract",
    usage_instructions: "Apply to wet hair, gently massage into scalp for 2 minutes, and rinse thoroughly with lukewarm water. Use twice weekly.",
    benefits: [
      "Fights & Controls Dandruff",
      "Reduces Scalp Irritation & Itch",
      "Strengthens Hair Roots",
      "Paraben & Sulphate Free"
    ],
    images: ["/assets/kesh kalpa shampoo.png", "/assets/combo pack.png"]
  },
  {
    id: "kesh-amrit-hair-oil",
    category_id: "c1111111-1111-1111-1111-111111111111",
    name: "Kesh Amrit Premium Hair Oil",
    slug: "kesh-amrit-premium-hair-oil",
    description: "A potent, deeply nourishing traditional blend powered by Bhringraj, Amla, Hibiscus, and premium natural oils. Features an easy-to-use comb applicator for direct root penetration.",
    price: 200,
    offer_price: 170,
    stock: 45,
    featured: true,
    status: "active",
    size: "100ml",
    ingredients: "Bhringraj, Amla, Hibiscus, Sesame Oil, Coconut Oil, Brahmi",
    usage_instructions: "Attach comb applicator, gently squeeze and apply to scalp. Massage in circular motions. Leave overnight or for at least 1 hour before wash.",
    benefits: [
      "Significantly Reduces Hair Fall",
      "Delays Premature Greying",
      "Promotes Active Hair Growth",
      "Deeply Nourishes Scalp"
    ],
    images: ["/assets/kesh amrit hair oil.png", "/assets/combo pack.png"]
  },
  {
    id: "twak-amrit-face-oil",
    category_id: "c2222222-2222-2222-2222-222222222222",
    name: "Twak Amrit Kumkumadi Face Oil / Serum",
    slug: "twak-amrit-kumkumadi-face-oil",
    description: "An exquisite luxurious blend of rare saffron (Kumkum), Sandalwood, Lotus, Yashtimadhu, and pure Sesame Oil structured to reveal timeless, glowing skin clarity.",
    price: 239,
    offer_price: 199,
    stock: 35,
    featured: true,
    status: "active",
    size: "30ml",
    ingredients: "Kashmiri Saffron (Kumkum), Sandalwood (Chandan), Lotus Extract, Yashtimadhu, Pure Cold-pressed Sesame Oil",
    usage_instructions: "Cleanse face thoroughly. Dispense 3-4 drops onto fingertips and warm gently. Press softly onto face and neck until absorbed. Ideal before bedtime.",
    benefits: [
      "Brightens & Enhances Complexion",
      "Evens Skin Tone & Texture",
      "Fades Dark Spots & Pigmentation",
      "Provides Youthful Radiance"
    ],
    images: ["/assets/twak amrit face oil.png", "/assets/combo pack.png"]
  },
  {
    id: "greeshm-smooth-soap",
    category_id: "c2222222-2222-2222-2222-222222222222",
    name: "Greeshm Smooth Nourishing Soap",
    slug: "greeshm-smooth-nourishing-soap",
    description: "Infused with Kumkum, Kesar, Chandana, Manjista, and Palasha to provide premium cooling, natural deep cleansing, and sun-tan removal support during daily baths.",
    price: 50,
    offer_price: 35,
    stock: 100,
    featured: false,
    status: "active",
    size: "125g",
    ingredients: "Kumkumadi Extract, Sandalwood Oil, Kesar, Manjistha, Coconut Base",
    usage_instructions: "Lather onto wet skin during bath or shower, massage gently over body and face, then rinse with clean water.",
    benefits: [
      "Deep Cleansing Action",
      "Cooling & Refreshing Effect",
      "Sun-Tan Removal Support",
      "Nourishes & Radiates Skin"
    ],
    images: ["/assets/greeshm soap.png", "/assets/combo pack.png"]
  },
  {
    id: "neem-wooden-comb",
    category_id: "c3333333-3333-3333-3333-333333333333",
    name: "Pure Neem Wooden Comb",
    slug: "pure-neem-wooden-comb",
    description: "Handcrafted from 100% natural neem wood. Anti-static, detangles smoothly while stimulating scalp circulation and preventing hair breakage.",
    price: 50,
    offer_price: 35,
    stock: 60,
    featured: false,
    status: "active",
    size: "1 Comb",
    ingredients: "100% Natural Medicinal Neem Wood",
    usage_instructions: "Gently comb hair starting from ends working up to roots. Wash comb with mild soap water monthly and let dry in shade.",
    benefits: [
      "100% Natural Neem Wood",
      "Anti-Static & Gentle on Scalp",
      "Stimulates Hair Follicles",
      "Prevents Hair Breakage"
    ],
    images: ["/assets/neem comb.png", "/assets/combo pack.png"]
  },
  {
    id: "essential-combo-pack",
    category_id: "c4444444-4444-4444-4444-444444444444",
    name: "Shivamrit Essential Combo Ritual Pack",
    slug: "shivamrit-essential-combo-pack",
    description: "The complete Shivamrit Ayurvedic sanctuary experience featuring our hair oil, anti-dandruff shampoo, kumkumadi face oil, and nourishing soap. Includes a FREE Pure Neem Wooden Comb!",
    price: 719,
    offer_price: 649,
    stock: 25,
    featured: true,
    status: "active",
    size: "Full Ritual Kit + FREE Comb",
    ingredients: "Full suite of Shivamrit premium active botanical preparations",
    usage_instructions: "Follow daily and weekly holistic ritual guide included in the sanctuary box.",
    benefits: [
      "🎁 Includes FREE Pure Neem Wooden Comb",
      "Complete Hair & Skin Care",
      "100% Authentic Formulations",
      "Best Value Sanctuary Kit"
    ],
    images: ["/assets/combo pack.png", "/assets/shivamrit frame 2.png"]
  }
];

async function seed() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to Supabase PostgreSQL.");

  // Read and execute schema migration SQL file
  const schemaSql = fs.readFileSync(
    path.join(__dirname, "../supabase/migrations/20260727000000_schema.sql"),
    "utf8"
  );
  await client.query(schemaSql);
  console.log("✅ Executed schema migration and RLS policies.");

  // Seed Categories
  for (const c of categories) {
    await client.query(`
      INSERT INTO public.categories (id, name, slug)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug;
    `, [c.id, c.name, c.slug]);
  }
  console.log("✅ Categories seeded.");

  // Seed Products and Images
  for (const p of products) {
    await client.query(`
      INSERT INTO public.products (
        id, category_id, name, slug, description, price, offer_price, stock, featured, status, size, ingredients, usage_instructions, benefits
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        offer_price = EXCLUDED.offer_price,
        stock = EXCLUDED.stock,
        featured = EXCLUDED.featured,
        status = EXCLUDED.status,
        size = EXCLUDED.size,
        ingredients = EXCLUDED.ingredients,
        usage_instructions = EXCLUDED.usage_instructions,
        benefits = EXCLUDED.benefits;
    `, [
      p.id, p.category_id, p.name, p.slug, p.description, p.price, p.offer_price, p.stock, p.featured, p.status, p.size, p.ingredients, p.usage_instructions, p.benefits
    ]);

    // Insert Product Images
    await client.query(`DELETE FROM public.product_images WHERE product_id = $1`, [p.id]);
    for (let idx = 0; idx < p.images.length; idx++) {
      await client.query(`
        INSERT INTO public.product_images (product_id, image_url, display_order)
        VALUES ($1, $2, $3);
      `, [p.id, p.images[idx], idx]);
    }
  }
  console.log("✅ Products and Product Images seeded.");

  // Seed Default Settings
  await client.query(`
    INSERT INTO public.settings (id, store_name, support_email, support_phone, address)
    VALUES ('f1111111-1111-1111-1111-111111111111', 'Shivamrit Ayurveda', 'support@shivamritayurveda.com', '+91 98765 43210', 'Haridwar, Uttarakhand, India')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log("✅ Store settings initialized.");

  await client.end();
  console.log("🎉 Database seeding completed successfully!");
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
