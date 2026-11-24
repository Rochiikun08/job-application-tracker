import { Router } from "express";
import { pool } from "../db.js";
import { getCurrentUserId } from "../currentUser.js";
import { toApplication } from "../mappers.js";
import { STATUSES, type ApplicationRow, type Status } from "../types.js";

export const applicationsRouter = Router();

// Columns to select, reused by every endpoint
export const COLUMNS = `id, company, role, status, job_url, location, source,
  date_applied, follow_up_on, notes, created_at, updated_at`;

// GET /applications  (optional ?status=applied)
applicationsRouter.get("/", async (req, res) => {
  const status = req.query.status;
  if (
    status !== undefined &&
    (typeof status !== "string" || !STATUSES.includes(status as Status))
  ) {
    res.status(400).json({ message: "Invalid status filter" });
    return;
  }

  const userId = await getCurrentUserId();
  const params: unknown[] = [userId];
  let sql = `SELECT ${COLUMNS} FROM applications WHERE user_id = $1`;
  if (status) {
    params.push(status);
    sql += ` AND status = $2`;
  }
  sql += ` ORDER BY created_at DESC, id DESC`;

  const result = await pool.query<ApplicationRow>(sql, params);
  res.json(result.rows.map(toApplication));
});