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

async function verify() {
  const client = new Client({
    connectionString: getDirectUrl(),
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT o.id, o.payment_method, o.payment_status, o.total_amount, o.order_status, o.created_at, a.full_name, a.phone
       FROM public.orders o
       LEFT JOIN public.addresses a ON o.address_id = a.id
       ORDER BY o.created_at DESC`
    );
    console.log("Current Orders in Database:", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

verify();
