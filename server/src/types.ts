export const STATUSES = [
    "wishlist", "applied", "online_assessment",
    "interview", "offer", "rejected", "withdrawn",
  ] as const;
  
  export type Status = (typeof STATUSES)[number];
  
  // A row exactly as it comes out of PostgreSQL (snake_case)
  export interface ApplicationRow {
    id: number;
    company: string;
    role: string;
    status: Status;
    job_url: string | null;
    location: string | null;
    source: string | null;
    date_applied: string | null;
    follow_up_on: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
  }
  
  // The object your API sends to clients (camelCase)
  export interface Application {
    id: number;
    company: string;
    role: string;
    status: Status;
    jobUrl: string | null;
    location: string | null;
    source: string | null;
    dateApplied: string | null;
    followUpOn: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }