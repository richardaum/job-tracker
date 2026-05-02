---
name: job-tracker-api
description: >-
  job-tracker GraphQL API for applications (job candidacies): fields, auth,
  compensation (salary), createApplication / updateApplication, responses, and
  errors. Use when integrating, testing, or documenting API calls.
---

# GraphQL API: applications (“jobs” / candidacies)

In this product, a **job application** is the **`Application`** type. There is no separate `Job` entity. Use the operations below.

**Authoritative schema** (generated, do not edit by hand): `apps/api/src/schema.gql`.

> **Rule:** always retrieve and mutate data through the GraphQL API. Do not query the database directly.

**Global skill sync:** keep **one** `SKILL.md` in the repo at `.cursor/skills/job-tracker-api/SKILL.md`. On your machine, `~/.cursor/skills/job-tracker-api` must be a **symlink** to that directory (not a copied file). Example after cloning to a new path:

```bash
ln -sf /absolute/path/to/job-tracker/.cursor/skills/job-tracker-api ~/.cursor/skills/job-tracker-api
```

Verify: `readlink ~/.cursor/skills/job-tracker-api` should print the repo path. Editing the repo file updates the global skill automatically.

## Skill commands (`list`, `fetch`, `add`, `update-application`, `timeline`)

These are **invocation verbs** for this skill (e.g. user says `/job-tracker-api list` or “job-tracker-api fetch …”). The agent should interpret them as follows; all network calls use **§1** (endpoint) and **§2** (auth).

| Command                  | Purpose                                                   | Default GraphQL / docs action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`list`**               | Catalog or collection                                     | **Catalog:** Summarize application-related operations from `apps/api/src/schema.gql` — `Query`: `me`, `applications`, `application`, `applicationStageEvents`, `applicationNotes`; `Mutation`: `createApplication`, `updateApplication`, `deleteApplication`, stage-event and note create/update/delete. **Data:** If the user wants their saved rows, call `applications { … }` (authenticated).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| **`fetch`**              | One record, by company, or precise contract               | **One application:** `application(id: ID!) { … }`. **By company:** There is **no** GraphQL argument to filter by company (`Query.applications` has no variables). Call `applications { id title company … }` (authenticated), then **filter client-side** to rows whose `company` matches the user’s string (case-insensitive or substring; the API stores the string as submitted on create/update). **Contract:** Answer from this skill plus `schema.gql` and **§10**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **`add`**                | Create                                                    | **Primary:** `createApplication(input: CreateApplicationInput!)` — required `title` and `company`; optional fields per **§3**–**§5**; compensation rules **§3.1**. **Related creates:** `createApplicationStageEvent`, `createApplicationNote` (TipTap on note `content`, **§9**) when the user explicitly asks for stage or note creation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **`update-application`** | Patch an existing application                             | **`updateApplication(id: ID!, input: UpdateApplicationInput!): ApplicationType!`** — every field on `UpdateApplicationInput` is optional (`title`, `company`, `description`, `url`, and the five `salary*` fields per **§4** / `schema.gql`). **`description`** must still be valid TipTap JSON when sent (**§5**). **Compensation:** **`mergeCompensationForUpdate`** runs only when **at least one** `salary*` key is **present** on the input (`!== undefined`); omitted keys leave persisted salary columns unchanged (**§3.1**). Resolve `id` via **`fetch`** / `applications` if the user names a job without an id.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **`timeline`**           | Stage history for one application (**stage events only**) | **Writes touch only stage events** — use `createApplicationStageEvent` / `updateApplicationStageEvent`. Do **not** use **`timeline`** to change the **`Application`** row (title, company, description, salary, etc. → **`update-application`**), **notes**, or anything outside **`ApplicationStageEventType`**. Model the pipeline as **`ApplicationStageEventType`** rows for a single `applicationId`. **Read:** `applicationStageEvents(applicationId: ID!) { id fromStage toStage source scheduledAt createdAt }`. **List order (server):** newest first by `COALESCE(scheduledAt, createdAt)`, then `createdAt`, then `id` — all **descending**. For a **chronological** story (left‑to‑right / past → now), **reverse** that array in the client or sort ascending by the same key. **`NEW`:** on **`createApplication`**, the API inserts an initial **system** event with **`toStage: NEW`**, **`fromStage: null`**, **`source: “system”`** (**§7**) — that row is the usual anchor for “when the candidacy was opened / the posting was first tracked”. **Append a step:** `createApplicationStageEvent(input: { applicationId, toStage, source?, scheduledAt? })` — **`fromStage` is set by the server** from the row with the greatest `createdAt` (and `id` tiebreak), **not** from `scheduledAt` order. Default **`source`** is `”manual”` if omitted. **`toStage`:** GraphQL enum **`ApplicationStage`**: `NEW`, `APPLIED`, `RECRUITER_SCREEN`, `TECHNICAL`, `OFFER`, `REJECTED` (**§9**). **Fix an existing row:** `updateApplicationStageEvent(id:, input:)` — only **`toStage`** and **`scheduledAt`** can change; there is **no** `deleteApplicationStageEvent` in the schema. **Backfill / past truth:** when the user adjusts **when** something happened in the past (especially **when the job was registered** in the tracker), set **`scheduledAt`** on the corresponding event — **typically the `NEW` event** — to that **past** `DateTime` (ISO-8601); do **not** rely on `createdAt` alone if the story should reflect the real registration date. Same pattern for later stages (e.g. past `APPLIED`) on their own rows. |

If the user combines a command with a topic (e.g. “fetch salary rules”), prefer **§3.1** and `application-compensation.util.ts` without requiring a GraphQL call.

**Example — `fetch` scoped by company (client filter):**

```graphql
query Applications {
  applications {
    id
    title
    company
  }
}
```

Then keep only nodes where `company` matches the requested company (e.g. case-insensitive equality or contains).

**Example — `update-application`:**

```graphql
mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
  updateApplication(id: $id, input: $input) {
    id
    title
    company
    salaryMinCents
    salaryMaxCents
    salaryCurrency
    salaryPeriod
    tags
    updatedAt
  }
}
```

```json
{
  "id": "APPLICATION_UUID",
  "input": { "company": "NewCo", "tags": ["Remote"] }
}
```

Omit any key you do not intend to change; for salary, only include `salary*` keys you want to participate in the merge (**§3.1**).

**Example — `timeline` (read, add step, correct):** mutations here **only** create/update **stage events**; the parent application and notes are unchanged.

```graphql
query StageTimeline($applicationId: ID!) {
  applicationStageEvents(applicationId: $applicationId) {
    id
    fromStage
    toStage
    source
    scheduledAt
    createdAt
  }
}
```

```graphql
mutation AddStage($input: CreateApplicationStageEventInput!) {
  createApplicationStageEvent(input: $input) {
    id
    fromStage
    toStage
    source
    scheduledAt
    createdAt
  }
}
```

```json
{
  "input": {
    "applicationId": "APPLICATION_UUID",
    "toStage": "TECHNICAL",
    "source": "manual",
    "scheduledAt": null
  }
}
```

```graphql
mutation FixStage($id: ID!, $input: UpdateApplicationStageEventInput!) {
  updateApplicationStageEvent(id: $id, input: $input) {
    id
    toStage
    scheduledAt
  }
}
```

**Backfill `NEW` (when the posting was registered):** resolve the stage-event `id` where **`toStage` is `NEW`** (and usually `source` is `"system"`), then call `FixStage` with `scheduledAt` equal to the **past** instant the user says they **saved / registered** the vacancy — e.g. `"2024-03-15T14:00:00.000Z"`. Align with **`application { createdAt }`** when that timestamp is the intended truth; otherwise use the user-supplied registration date.

Use **`timeline`** whenever the user cares about **order**, **dates**, **`NEW`** / other **`fromStage`/`toStage`**, or **retroactive fixes** to **stage-event** rows only — not only when they say “timeline”. For application fields or notes, switch to **`update-application`** or the note mutations (**§9**).

## 1) Endpoint and transport

- **Default dev URL:** `http://localhost:3101/graphql` (`PORT` in `apps/api/src/env/server.ts`, default `3101`).
- **Method:** `POST` with a JSON body (`{ "query", "variables", "operationName" }` as usual for GraphQL over HTTP).
- **CORS:** `credentials: true` (browser clients can send cookies when origin is allowed).

## 2) Authentication (required for application mutations and queries)

`ApplicationResolver` uses `JwtAuthGuard` and `RolesGuard` with role `user` (`apps/api/src/domains/applications/applications.resolver.ts`).

The JWT is read from either (`apps/api/src/domains/auth/jwt.strategy.ts`):

1. Cookie `access_token`, or
2. Header `Authorization: Bearer <jwt>`.

Without a valid token, the request fails (often a GraphQL error with an `UNAUTHENTICATED`-style extension in the web client).

## 2.1) Generating a JWT for manual testing

The API validates tokens with `JWT_ACCESS_SECRET` (env var, see `apps/api/src/env/server.ts`). Payload must have a `sub` field with the user's UUID.

**Using `jsonwebtoken` (Node.js):**

```js
const jwt = require("jsonwebtoken");

const token = jwt.sign({ sub: "USER_UUID" }, process.env.JWT_ACCESS_SECRET, {
  expiresIn: "15m",
});

console.log(token);
```

Run with the same `.env` the API uses:

```bash
# from apps/api
node -e "
  require('dotenv/config');
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ sub: 'USER_UUID' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  console.log(token);
"
```

Pass the token as `Authorization: Bearer <token>` or as the `access_token` cookie. The `expiresIn` used in production is `"15m"` (access) and `"7d"` (refresh) — match that when you need a longer-lived test token.

## 3) `CreateApplicationInput` fields

| Field            | GraphQL (see `schema.gql`)         | Required | Notes                                                                                                                                                                                    |
| ---------------- | ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`          | `String!`                          | yes      | Job title.                                                                                                                                                                               |
| `company`        | `String!`                          | yes      | Company name.                                                                                                                                                                            |
| `description`    | `String`                           | no       | If sent, must be a **TipTap** JSON string (`{ "type": "doc", "content": [...] }`) or the API throws `BadRequestException` with message `description must be valid TipTap document JSON`. |
| `url`            | `String`                           | no       | Posting URL, etc.                                                                                                                                                                        |
| `salaryMinCents` | `Int`                              | no       | Minor currency units. See **§3.1**.                                                                                                                                                      |
| `salaryMaxCents` | `Int`                              | no       | Same.                                                                                                                                                                                    |
| `salaryCurrency` | `String`                           | no       | ISO 4217, three letters (e.g. `BRL`, `USD`) after normalization. **Required in practice** when a numeric range is set. See **§3.1**.                                                     |
| `salaryPeriod`   | `SalaryPeriod`                     | no       | `YEAR`, `MONTH`, or `HOUR` (GraphQL enum). **Required in practice** when a numeric range is set.                                                                                         |
| `tags`           | `[String!]` (nullable input field) | no       | Omitted, `null`, or `[]` are treated like “no client tags” for create defaults; the server **normalizes** tags (see **§3.1**).                                                           |

## 3.1) Compensation (salary) rules

Validation and normalization live in `application-compensation.util.ts`. Types use `CompensationInput` for GraphQL-shaped input and `CompensationColumns` (a `Pick` of application persistence fields) for the normalized row fragment returned by `normalizeCreateCompensation` / `mergeCompensationForUpdate`.

**API behavior:**

- **Create:** omitted salary fields default to `null` amounts, `null` currency/period, and normalized tags (typically `[]`).
- **Update:** if **no** `salary*` key is present on the input, salary columns are left unchanged. Any present key (even explicit `null`) participates in the merge/validation.

**Business rules (`assertValidCompensationState`):**

- **Empty state:** no min/max, no tags after normalization → valid.
- **Numeric range** (`salaryMinCents` and/or `salaryMaxCents` set): `salaryCurrency` and `salaryPeriod` must be set. Currency must match `^[A-Z]{3}$` after trim/uppercase. Amounts are **non-negative**; if both min and max are set, `min ≤ max`.
- **Tags only** (no min/max): `salaryCurrency` and `salaryPeriod` must be **null** — see error message below.
- **Tag normalization** (`normalizeSalaryTags`): trim, drop empties, dedupe case-insensitively, keep at most **8** tags, each at most **32** characters (longer values truncated).

**After validation** (`rowAfterValidation`): if there is no numeric range, the stored fragment **clears** `salaryMinCents`, `salaryMaxCents`, `salaryCurrency`, and `salaryPeriod` but **keeps** `tags`.

**Update merge:** `mergeCompensationForUpdate` runs only when **any** of `salaryMinCents`, `salaryMaxCents`, `salaryCurrency`, `salaryPeriod`, or `tags` is **`!== undefined`** on the input (so explicit `null` still counts as “present” for that field and participates in the merge).

**Typical error messages** (HTTP 400 / GraphQL `errors`):

- `A salary range requires salaryCurrency and salaryPeriod`
- `salaryCurrency must be a 3-letter ISO 4217 code (e.g. BRL, USD)`
- `Remove salaryCurrency and salaryPeriod when no salary range is set`
- `salaryMinCents must be non-negative` / `salaryMaxCents must be non-negative`
- `salaryMinCents must be less than or equal to salaryMaxCents`

## 4) `ApplicationType` (read / mutation return)

As in `schema.gql`, including:

- `salaryMinCents: Int`, `salaryMaxCents: Int`, `salaryCurrency: String`, `salaryPeriod: SalaryPeriod` (nullable)
- `tags: [String!]!` — **non-null** list (may be empty `[]`)

`UpdateApplicationInput` mirrors the optional fields: `title`, `company`, `description`, `url`, and the five compensation fields, all optional.

## 5) `description` format (when provided)

Stringified JSON, TipTap document root:

- `"type": "doc"`
- `"content"`: **array** (can be `[]`).

Minimum valid example:

```json
{ "type": "doc", "content": [] }
```

## 6) `createApplication` operation

**Mutation name:** `createApplication(input: CreateApplicationInput!): ApplicationType!`

**Example variables (with compensation):**

```json
{
  "input": {
    "title": "Senior Engineer",
    "company": "Acme",
    "url": "https://example.com/jobs/1",
    "description": "{\"type\":\"doc\",\"content\":[]}",
    "salaryMinCents": 800000,
    "salaryMaxCents": 1000000,
    "salaryCurrency": "BRL",
    "salaryPeriod": "MONTH",
    "tags": ["Equity", "CLT"]
  }
}
```

**Tags only** (no amounts): do not send `salaryCurrency` or `salaryPeriod` (or send `null`).

```json
{
  "input": {
    "title": "Designer",
    "company": "Beta",
    "tags": ["Bonus", "Equity"]
  }
}
```

**Example document:**

```graphql
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    id
    userId
    title
    company
    description
    url
    salaryMinCents
    salaryMaxCents
    salaryCurrency
    salaryPeriod
    tags
    createdAt
    updatedAt
  }
}
```

`SalaryPeriod` in GraphQL is `YEAR` | `MONTH` | `HOUR` (see `apps/api/src/domains/applications/salary-period.enum.ts`).

**`curl` (Bearer):**

```bash
curl -sS -X POST "http://localhost:3101/graphql" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"query":"mutation($input: CreateApplicationInput!){ createApplication(input: $input){ id userId title company description url salaryMinCents salaryMaxCents salaryCurrency salaryPeriod tags createdAt updatedAt } }","variables":{"input":{"title":"T","company":"C","salaryMinCents":500000,"salaryMaxCents":500000,"salaryCurrency":"BRL","salaryPeriod":"MONTH","tags":[]}}}'
```

## 7) Successful response

- HTTP **200** with a GraphQL payload.
- `data.createApplication` contains `ApplicationType` for the selected fields.
- **Side effect:** on create, the service also inserts an initial stage event with `toStage: NEW` and `source: "system"` (`ApplicationService.create`).

## 8) Error responses (typical)

- `errors[]` in the body, e.g. TipTap errors for `description` or any rule from **§3.1** for salary fields.
- `errors` may be present with partial or no `data` depending on the failure.
- Unauthenticated / forbidden behavior depends on the GraphQL/HTTP layer; the web app often uses error extensions (e.g. `UNAUTHENTICATED`).

## 9) Other operations (same access control)

From `schema.gql`:

- `updateApplication(id: ID!, input: UpdateApplicationInput!): ApplicationType!`
- `deleteApplication(id: ID!): Boolean!`
- `createApplicationStageEvent` / `updateApplicationStageEvent` — `ApplicationStage` enum: `NEW`, `APPLIED`, `RECRUITER_SCREEN`, `TECHNICAL`, `OFFER`, `REJECTED`
- `createApplicationNote` / `updateApplicationNote` / `deleteApplicationNote` — note `content` must be valid TipTap JSON; failures use `content must be valid TipTap document JSON`.

### Notes: capturing context that doesn't fit structured fields

When the user provides information that **cannot be represented** by the existing `Application` fields (`title`, `company`, `url`, `description`, `salaryMinCents`, `salaryMaxCents`, `salaryCurrency`, `salaryPeriod`, `tags`) — such as recruiter contact details, interview impressions, custom deadlines, referral context, or any free-form observation — **proactively suggest (or create) a note** via `createApplicationNote` to preserve that context.

Guidelines:

- A note is **optional**: only create one when the information genuinely has nowhere else to go.
- Prefer structured fields first: if the data fits a field, use that field.
- A single note can hold multiple pieces of context; do not create one note per sentence.
- Note `content` is TipTap JSON (same format as `description` — see **§5**).

```graphql
mutation CreateNote($input: CreateApplicationNoteInput!) {
  createApplicationNote(input: $input) {
    id
    applicationId
    content
    createdAt
  }
}
```

```json
{
  "input": {
    "applicationId": "APPLICATION_UUID",
    "content": "{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Recruiter: Jane Doe — jane@example.com. Mentioned remote-first culture.\"}]}]}"
  }
}
```

## 10) Where the contract lives

The single source of truth for the API contract is `apps/api/src/schema.gql`. Regenerate it after changing GraphQL decorators (`nest build`) and keep this skill aligned with that file.

## 11) Web app GraphQL codegen

The Next.js app reads the same schema file and generates typed documents/hooks (`apps/web/codegen.ts`: `schema` → `../api/src/schema.gql`, `documents` → `src/graphql/**/*.graphql`). After API schema changes, run **`pnpm codegen`** from `apps/web` (see `package.json` script `codegen`: `graphql-codegen --config codegen.ts` plus `scripts/postprocess-codegen-hooks.mjs`) so `apps/web/src/gql/*` matches the server contract.
