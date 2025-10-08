import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // ✅ Make sure this is at the very top

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("✅ DB query", { text, duration, rows: res.rowCount });
  return res;
}
