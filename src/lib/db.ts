import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  // Prevent multiple connection pools during hot reloads in development
  const globalWithPg = global as typeof globalThis & {
    _pgPool?: Pool;
  };

  if (!globalWithPg._pgPool) {
    globalWithPg._pgPool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }
  pool = globalWithPg._pgPool;
}

export const db = pool;

export async function query<T = any>(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === "development") {
    console.log("Executed query", { text, duration, rows: res.rowCount });
  }
  return res;
}
