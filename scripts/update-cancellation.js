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

async function run() {
  const client = new Client({
    connectionString: getDirectUrl(),
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(
      `UPDATE public.orders
       SET order_status = 'cancellation_requested',
           cancel_reason = 'Want to order other product',
           updated_at = NOW()
       WHERE id::text LIKE 'f9f97610%'`
    );
    console.log("Order f9f97610 successfully updated to cancellation_requested!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
