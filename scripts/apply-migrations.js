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
  const connectionString = getDirectUrl();

  console.log("Connecting to Supabase PostgreSQL database...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL successfully!");

    const migrationsDir = path.join(__dirname, "../supabase/migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith(".sql")) {
        console.log(`Running migration file: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        await client.query(sql);
        console.log(`Successfully executed ${file}`);
      }
    }

    console.log("All Supabase DB migrations applied successfully!");
  } catch (err) {
    console.error("Migration execution error:", err.message);
  } finally {
    await client.end();
  }
}

run();
