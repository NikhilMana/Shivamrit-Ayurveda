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

async function checkProducts() {
  const client = new Client({
    connectionString: getDirectUrl(),
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query("SELECT * FROM public.products ORDER BY created_at DESC");
    console.log("PRODUCTS COUNT IN DB:", res.rows.length);
    console.log("PRODUCTS IN DB:", res.rows);
  } catch (err) {
    console.error("Database query error:", err);
  } finally {
    await client.end();
  }
}

checkProducts();
