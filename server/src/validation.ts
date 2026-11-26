import { STATUSES, type Status } from "./types.js";

// Returns a positive integer, or null if the value isn't one.
export function parseId(value: unknown): number | null {
    if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }



  export interface FieldError {
    field: string;
    message: string;
  }
  
  export type ValidationResult<T> =
    | { ok: true; value: T }
    | { ok: false; errors: FieldError[] };
  
  export interface NewApplication {
    company: string;
    role: string;
    status: Status;
    jobUrl: string | null;
    location: string | null;
    source: string | null;
    dateApplied: string | null;
    followUpOn: string | null;
    notes: string | null;
  }
  
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  
  // "2026-02-30" matches the pattern but isn't a real date, so round-trip it.
  export function isValidDate(value: string): boolean {
    if (!DATE_RE.test(value)) return false;
    const d = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
  }
  
  export function validateNewApplication(body: unknown): ValidationResult<NewApplication> {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return { ok: false, errors: [{ field: "body", message: "Request body must be a JSON object" }] };
    }
    const b = body as Record<string, unknown>;
    const errors: FieldError[] = [];
  
    const requiredText = (field: string): string => {
      const v = b[field];
      if (typeof v !== "string" || v.trim() === "") {
        errors.push({ field, message: `${field} is required` });
        return "";
      }
      return v.trim();
    };
  
    const optionalText = (field: string): string | null => {
      const v = b[field];
      if (v === undefined || v === null) return null;
      if (typeof v !== "string") {
        errors.push({ field, message: `${field} must be a string or null` });
        return null;
      }
      const t = v.trim();
      return t === "" ? null : t;
    };
  
    const optionalDate = (field: string): string | null => {
      const v = b[field];
      if (v === undefined || v === null) return null;
      if (typeof v !== "string" || !isValidDate(v)) {
        errors.push({ field, message: `${field} must be a date in YYYY-MM-DD format` });
        return null;
      }
      return v;
    };
  
    const company = requiredText("company");
    const role = requiredText("role");
  
    let status: Status = "wishlist";
    if (b.status !== undefined) {
      if (typeof b.status !== "string" || !STATUSES.includes(b.status as Status)) {
        errors.push({ field: "status", message: `status must be one of: ${STATUSES.join(", ")}` });
      } else {
        status = b.status as Status;
      }
    }
  
    const jobUrl = optionalText("jobUrl");
    const location = optionalText("location");
    const source = optionalText("source");
    const dateApplied = optionalDate("dateApplied");
    const followUpOn = optionalDate("followUpOn");
    const notes = optionalText("notes");
  
    if (errors.length > 0) return { ok: false, errors };
    return {
      ok: true,
      value: { company, role, status, jobUrl, location, source, dateApplied, followUpOn, notes },
    };
  }