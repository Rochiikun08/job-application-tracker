import "dotenv/config";
import pg from "pg";

// BIGINT (id) comes back as a string by default, so convert it to a number.
pg.types.setTypeParser(pg.types.builtins.INT8, (v: string) => Number(v));
// DATE comes back as a Date object, which shifts the day by time zone.
// Keep it as a "YYYY-MM-DD" string instead.
pg.types.setTypeParser(pg.types.builtins.DATE, (v: string) => v);

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});