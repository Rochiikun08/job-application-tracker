import type { Application, ApplicationRow } from "./types.js";

export function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    jobUrl: row.job_url,
    location: row.location,
    source: row.source,
    dateApplied: row.date_applied,
    followUpOn: row.follow_up_on,
    notes: row.notes,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}