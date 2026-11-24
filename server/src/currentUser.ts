import { pool } from "./db.js";

export async function getCurrentUserId(): Promise<number> {
  const result = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    ["dev@example.com"],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Dev user not found. Run server/db/seed.sql");
  return row.id;
}