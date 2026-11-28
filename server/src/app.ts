import express from "express";
import { pool } from "./db.js";
import { applicationsRouter } from "./routes/applications.js";
import { errorHandler, notFoundHandler } from "./errorHandlers.js";

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

app.use("/applications", applicationsRouter);

// These two must come last, in this order
app.use(notFoundHandler);
app.use(errorHandler);