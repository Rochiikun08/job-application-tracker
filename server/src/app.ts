import express from "express";
import { pool } from "./db.js";

export const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Job Application Tracker API" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT now() AS time");
    res.json({ status: "ok", time: result.rows[0].time });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

app.get("/dev/applications", async (_req, res) => {
    try {
      const result = await pool.query(
        `SELECT id, company, role, status, date_applied
         FROM applications
         WHERE user_id = (SELECT id FROM users WHERE email = $1)
         ORDER BY id`,
        ["dev@example.com"],
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load applications" });
    }
  });