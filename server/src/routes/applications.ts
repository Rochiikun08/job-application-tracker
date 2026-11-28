import { Router } from "express";
import { pool } from "../db.js";
import { getCurrentUserId } from "../currentUser.js";
import { toApplication } from "../mappers.js";
import { STATUSES, type ApplicationRow, type Status } from "../types.js";
import { isUniqueViolation } from "../dbErrors.js";
import { parseId, validateNewApplication, validateApplicationPatch, type ApplicationPatch } from "../validation.js";

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

// GET /applications/:id
applicationsRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "id must be a positive integer" });
    return;
  }

  const userId = await getCurrentUserId();
  const result = await pool.query<ApplicationRow>(
    `SELECT ${COLUMNS} FROM applications WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  const row = result.rows[0];
  if (!row) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.json(toApplication(row));
});

// POST /applications
applicationsRouter.post("/", async (req, res) => {
  const result = validateNewApplication(req.body);
  if (!result.ok) {
    res.status(400).json({ message: "Validation failed", errors: result.errors });
    return;
  }
  const a = result.value;
  const userId = await getCurrentUserId();

  try {
    const inserted = await pool.query<ApplicationRow>(
      `INSERT INTO applications
         (user_id, company, role, status, job_url, location, source,
          date_applied, follow_up_on, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${COLUMNS}`,
      [userId, a.company, a.role, a.status, a.jobUrl, a.location,
       a.source, a.dateApplied, a.followUpOn, a.notes],
    );
    const row = inserted.rows[0];
    if (!row) throw new Error("Insert returned no row");
    res.status(201).json(toApplication(row));
  } catch (err) {
    if (isUniqueViolation(err)) {
      res.status(409).json({
        message: "You already have an application for this company and role",
      });
      return;
    }
    throw err;
  }
});

// Maps API field names to database columns. Column names in the SQL
// come ONLY from this object, never from the request.
const PATCH_COLUMNS: Record<keyof ApplicationPatch, string> = {
  company: "company",
  role: "role",
  status: "status",
  jobUrl: "job_url",
  location: "location",
  source: "source",
  dateApplied: "date_applied",
  followUpOn: "follow_up_on",
  notes: "notes",
};

// PATCH /applications/:id
applicationsRouter.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "id must be a positive integer" });
    return;
  }

  const result = validateApplicationPatch(req.body);
  if (!result.ok) {
    res.status(400).json({ message: "Validation failed", errors: result.errors });
    return;
  }

  // Build "col1 = $1, col2 = $2, ..." from the fields that were sent
  const setClauses: string[] = [];
  const params: unknown[] = [];
  for (const [field, value] of Object.entries(result.value)) {
    params.push(value);
    setClauses.push(`${PATCH_COLUMNS[field as keyof ApplicationPatch]} = $${params.length}`);
  }

  const userId = await getCurrentUserId();
  params.push(id);
  const idPos = params.length;
  params.push(userId);
  const userPos = params.length;

  try {
    const updated = await pool.query<ApplicationRow>(
      `UPDATE applications
       SET ${setClauses.join(", ")}
       WHERE id = $${idPos} AND user_id = $${userPos}
       RETURNING ${COLUMNS}`,
      params,
    );

    const row = updated.rows[0];
    if (!row) {
      res.status(404).json({ message: "Application not found" });
      return;
    }
    res.json(toApplication(row));
  } catch (err) {
    if (isUniqueViolation(err)) {
      res.status(409).json({
        message: "You already have an application for this company and role",
      });
      return;
    }
    throw err;
  }
});

// DELETE /applications/:id
applicationsRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "id must be a positive integer" });
    return;
  }

  const userId = await getCurrentUserId();
  const result = await pool.query(
    "DELETE FROM applications WHERE id = $1 AND user_id = $2",
    [id, userId],
  );

  if (!result.rowCount) {
    res.status(404).json({ message: "Application not found" });
    return;
  }
  res.status(204).send();
});