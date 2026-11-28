import type { NextFunction, Request, Response } from "express";

// Runs when no route matched the request
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: "Route not found" });
}

interface HttpLikeError {
  type?: unknown;
  status?: unknown;
  statusCode?: unknown;
}

// Runs when any route throws or rejects. It must take four arguments,
// or Express won't treat it as an error handler.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  const e = (typeof err === "object" && err !== null ? err : {}) as HttpLikeError;

  // express.json() throws this when the body isn't valid JSON
  if (e.type === "entity.parse.failed") {
    res.status(400).json({ message: "Request body is not valid JSON" });
    return;
  }

  const status =
    typeof e.status === "number" ? e.status :
    typeof e.statusCode === "number" ? e.statusCode : 500;

  if (status >= 400 && status < 500) {
    res.status(status).json({ message: "Bad request" });
    return;
  }

  // Unexpected: log the real error here, but never send it to the client
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}