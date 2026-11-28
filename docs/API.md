# API Design: Job Application Tracker

Plan for the Week 4 endpoints. Only `applications` is covered here. Status history and interviews come in Week 5.

## Conventions

- **Base URL (local):** `http://localhost:3000`
- **Format:** JSON requests and responses. Clients send `Content-Type: application/json`.
- **Naming:** URLs use plural nouns (`/applications`). The HTTP method says what to do.
- **JSON fields use `camelCase`**, while database columns use `snake_case`. The API layer maps between them.
- **Dates** are `YYYY-MM-DD` strings (`dateApplied`, `followUpOn`). **Timestamps** are ISO 8601 strings in UTC (`createdAt`, `updatedAt`).
- **Current user:** until authentication exists (Week 9), every request acts as the user with email `dev@example.com`. This lookup lives in one place so it can be replaced by the logged-in user later. Applications belonging to other users are treated as if they don't exist (404).

## Allowed status values

`wishlist`, `applied`, `online_assessment`, `interview`, `offer`, `rejected`, `withdrawn`

## The application object

```json
{
  "id": 1,
  "company": "Atlassian",
  "role": "Software Engineer Intern",
  "status": "applied",
  "jobUrl": null,
  "location": null,
  "source": null,
  "dateApplied": "2026-11-10",
  "followUpOn": null,
  "notes": null,
  "createdAt": "2026-11-10T01:23:45.000Z",
  "updatedAt": "2026-11-10T01:23:45.000Z"
}
```

## Endpoints at a glance

| Action | Method | Path | Success status |
|---|---|---|---|
| List | GET | `/applications` | 200 |
| Get one | GET | `/applications/:id` | 200 |
| Create | POST | `/applications` | 201 |
| Update | PATCH | `/applications/:id` | 200 |
| Delete | DELETE | `/applications/:id` | 204 |

---

## GET `/applications`

Returns the current user's applications.

**Query parameters (optional)**

| Name | Meaning |
|---|---|
| `status` | Only return applications with this status, e.g. `?status=applied` |

**Success: 200** with a JSON array of application objects, newest first (`created_at` descending, then `id` descending). An empty list returns `[]`, not an error. Pagination is a later improvement.

**Errors**

| Status | When |
|---|---|
| 400 | `status` isn't one of the allowed values |

---

## GET `/applications/:id`

Returns one application.

**Success: 200** with the application object.

**Errors**

| Status | When |
|---|---|
| 400 | `:id` isn't a positive integer |
| 404 | No application with that id exists for the current user |

---

## POST `/applications`

Creates an application.

**Body**

| Field | Required | Rules |
|---|---|---|
| `company` | yes | Non-empty string after trimming |
| `role` | yes | Non-empty string after trimming |
| `status` | no | One of the allowed values. Defaults to `wishlist` |
| `jobUrl` | no | String, or `null` |
| `location` | no | String, or `null` |
| `source` | no | String, or `null` (e.g. SEEK, LinkedIn, referral) |
| `dateApplied` | no | `YYYY-MM-DD`, or `null` |
| `followUpOn` | no | `YYYY-MM-DD`, or `null` |
| `notes` | no | String, or `null` |

Fields the client shouldn't control (`id`, `userId`, `createdAt`, `updatedAt`) are ignored if sent.

**Example request**

```json
{ "company": "Canva", "role": "Frontend Intern", "status": "applied", "dateApplied": "2026-11-12" }
```

**Success: 201** with the created application object.

**Errors**

| Status | When |
|---|---|
| 400 | `company` or `role` is missing or empty, `status` is invalid, a date is malformed, or the body isn't valid JSON |
| 409 | The user already has an application for the same company and role |

---

## PATCH `/applications/:id`

Updates only the fields that are sent. Anything omitted stays unchanged.

**Body:** any of `company`, `role`, `status`, `jobUrl`, `location`, `source`, `dateApplied`, `followUpOn`, `notes`, with the same rules as POST. Optional fields can be set to `null` to clear them. `company` and `role` can't be cleared. The `id`, `userId`, `createdAt` and `updatedAt` fields can't be changed.

**Example request**

```json
{ "status": "interview", "followUpOn": "2026-11-28" }
```

**Success: 200** with the full updated application object.

**Errors**

| Status | When |
|---|---|
| 400 | `:id` isn't a positive integer, the body is empty (no updatable fields), or a field fails validation |
| 404 | No application with that id exists for the current user |
| 409 | The change would duplicate another of the user's applications (same company and role) |

**Note for Week 5:** when `status` changes, a row will also be added to `status_history`, in the same database transaction as the update.

---

## DELETE `/applications/:id`

Deletes the application. Its status history and interviews are deleted with it (`ON DELETE CASCADE`).

**Success: 204** with no body.

**Errors**

| Status | When |
|---|---|
| 400 | `:id` isn't a positive integer |
| 404 | No application with that id exists for the current user |

---

## Error response format

Every error returns JSON in this shape:

```json
{ "message": "Validation failed", "errors": [ { "field": "company", "message": "company is required" } ] }
```

`errors` is only present for validation problems (400). Other errors return just `message`. Unexpected failures return 500 with a generic message, and the real error is logged on the server, never sent to the client.

## Status codes used

| Code | Meaning here |
|---|---|
| 200 | OK, with a body |
| 201 | Created |
| 204 | Success, no body |
| 400 | The client sent something invalid |
| 404 | The resource doesn't exist (or isn't yours) |
| 409 | Conflict with an existing record |
| 500 | Unexpected server error |

## Implementation notes

- **Always use query parameters** (`$1`, `$2`, ...) with `pool.query`. Never join user input into SQL strings.
- **Map columns to camelCase** in one helper (e.g. `date_applied` becomes `dateApplied`) so routes never repeat it.
- **Return dates as `YYYY-MM-DD` strings.** The `pg` driver converts `DATE` columns to JavaScript `Date` objects, which shifts the day in some time zones. Fix it once, either with `to_char(date_applied, 'YYYY-MM-DD')` in SQL or by setting a type parser for dates.
- **Map database errors to HTTP errors:** PostgreSQL error code `23505` (unique violation) becomes 409, and `23514` (check violation) becomes 400.
- **Keep the order of `app.use(express.json())` above the routes.**
- **Remove `/dev/applications` and `/dev/echo`** once the real endpoints exist.

## Build order and progress

- [x] GET `/applications`
- [x] GET `/applications/:id`
- [x] POST `/applications`
- [x] PATCH `/applications/:id`
- [x] DELETE `/applications/:id`

For each endpoint: build it, test success and error cases in Postman, save the requests in the collection, then commit.