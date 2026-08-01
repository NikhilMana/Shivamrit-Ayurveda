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

async function check() {
  const client = new Client({
    connectionString: getDirectUrl(),
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT o.id, o.order_status, o.payment_status, o.payment_method, o.cancel_reason, o.total_amount, o.created_at, o.updated_at, p.full_name, p.email
       FROM public.orders o
       LEFT JOIN public.profiles p ON o.user_id = p.id
       ORDER BY o.created_at DESC`
    );
    console.log("ALL ORDERS IN SUPABASE DB:");
    console.dir(res.rows, { depth: null });
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
