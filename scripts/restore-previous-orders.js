const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

function getDirectUrl() {
  const envPath = path.join(__dirname, "../.env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/DATABASE_DIRECT_URL=["']?([^"'\r\n]+)["']?/);
    if (match) return match[1];
    const match2 = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match2) return match2[1];
  }
  return "postgresql://postgres:Shivamrit%4020@db.jmgluhfmvjphxbptnkeo.supabase.co:5432/postgres";
}

async function restore() {
  const connectionString = getDirectUrl();
  console.log("Connecting to Supabase DB to restore previous orders...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // Check available products
    const productsRes = await client.query("SELECT id, name FROM public.products");
    console.log("Available products:", productsRes.rows);

    let combProductId = productsRes.rows.find((p) => p.name.toLowerCase().includes("comb"))?.id || null;
    let comboProductId = productsRes.rows.find((p) => p.name.toLowerCase().includes("combo"))?.id || null;

    // 1. Order #3ED0667D - Jeevan M Jeevan (Razorpay ₹99)
    let jeevanUserRes = await client.query(
      "SELECT id FROM public.profiles WHERE phone LIKE '%9731436969%' OR LOWER(full_name) LIKE '%jeevan%' LIMIT 1"
    );

    let jeevanUserId;
    if (jeevanUserRes.rows.length > 0) {
      jeevanUserId = jeevanUserRes.rows[0].id;
    } else {
      const fallbackUser = await client.query("SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1");
      jeevanUserId = fallbackUser.rows[0]?.id;
    }

    if (jeevanUserId) {
      // Address for Jeevan
      let jeevanAddrRes = await client.query("SELECT id FROM public.addresses WHERE user_id = $1 LIMIT 1", [jeevanUserId]);
      let jeevanAddrId = jeevanAddrRes.rows[0]?.id || null;

      if (!jeevanAddrId) {
        const insAddr = await client.query(
          `INSERT INTO public.addresses (user_id, full_name, phone, address_line_1, city, state, postal_code, country, is_default)
           VALUES ($1, 'Jeevan M Jeevan', '+919731436969', 'Bangalore, Maharashtra', 'Bangalore', 'Karnataka', '560091', 'India', true)
           RETURNING id`,
          [jeevanUserId]
        );
        jeevanAddrId = insAddr.rows[0].id;
      }

      const jeevanOrderRes = await client.query(
        `INSERT INTO public.orders (user_id, address_id, subtotal, shipping_charge, total_amount, payment_method, payment_status, order_status, created_at, updated_at)
         VALUES ($1, $2, 50, 49, 99, 'razorpay', 'paid', 'confirmed', '2026-08-01 22:15:00+05:30', '2026-08-01 22:15:00+05:30')
         RETURNING id`,
        [jeevanUserId, jeevanAddrId]
      );
      const o1Id = jeevanOrderRes.rows[0].id;
      await client.query("INSERT INTO public.order_items (order_id, product_id, quantity, price) VALUES ($1, $2, 1, 50)", [o1Id, combProductId]);
      console.log("Restored Order #1: Jeevan M Jeevan (Razorpay ₹99)");
    }

    // 2. Order #55CE4538 - Hindi Hemavathi (COD ₹768)
    let hindiUserRes = await client.query(
      "SELECT id FROM public.profiles WHERE phone LIKE '%6360835388%' OR LOWER(full_name) LIKE '%hindi%' OR LOWER(full_name) LIKE '%hemavathi%' LIMIT 1"
    );

    let hindiUserId;
    if (hindiUserRes.rows.length > 0) {
      hindiUserId = hindiUserRes.rows[0].id;
    } else {
      const fallbackUser = await client.query("SELECT id FROM public.profiles ORDER BY created_at DESC LIMIT 1");
      hindiUserId = fallbackUser.rows[0]?.id || jeevanUserId;
    }

    if (hindiUserId) {
      let hindiAddrRes = await client.query("SELECT id FROM public.addresses WHERE user_id = $1 LIMIT 1", [hindiUserId]);
      let hindiAddrId = hindiAddrRes.rows[0]?.id || null;

      if (!hindiAddrId) {
        const insAddr = await client.query(
          `INSERT INTO public.addresses (user_id, full_name, phone, address_line_1, city, state, postal_code, country, is_default)
           VALUES ($1, 'Hindi Hemavathi', '6360835388', 'Delivery Address', 'Bangalore', 'Karnataka', '560001', 'India', true)
           RETURNING id`,
          [hindiUserId]
        );
        hindiAddrId = insAddr.rows[0].id;
      }

      const hindiOrderRes = await client.query(
        `INSERT INTO public.orders (user_id, address_id, subtotal, shipping_charge, total_amount, payment_method, payment_status, order_status, created_at, updated_at)
         VALUES ($1, $2, 719, 49, 768, 'cod', 'pending', 'confirmed', '2026-08-01 20:08:00+05:30', '2026-08-01 20:08:00+05:30')
         RETURNING id`,
        [hindiUserId, hindiAddrId]
      );
      const o2Id = hindiOrderRes.rows[0].id;
      await client.query("INSERT INTO public.order_items (order_id, product_id, quantity, price) VALUES ($1, $2, 1, 719)", [o2Id, comboProductId]);
      console.log("Restored Order #2: Hindi Hemavathi (COD ₹768)");
    }

    console.log("Previous orders restored successfully!");
  } catch (err) {
    console.error("Error restoring previous orders:", err);
  } finally {
    await client.end();
  }
}

restore();
