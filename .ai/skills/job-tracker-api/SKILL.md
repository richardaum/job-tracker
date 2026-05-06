---
name: job-tracker-api
description: >-
  job-tracker GraphQL API (NestJS): applications, companies, stage events,
  notes, salary rules, JWT auth, list filters, AI queries/mutations. Use for API
  integration, tests, curls, codegen sync. Canonical schema apps/api/src/schema.gql.
---

# job-tracker GraphQL API (applications / candidacies)

## Agent directives

- **Treat `apps/api/src/schema.gql` as authoritative.** If skill and schema diverge, follow the schema.
- **Use GraphQL only** — never query Postgres or TypeORM repositories from agents.
- **Select company as nested object**: `company { id name }`, not `company` as scalar (there is none on `ApplicationType`).
- **Salary logic questions:** answer from **`salary.service.ts`** and this file’s **Salary fields** section without calling the API unless the user asks for live data.

## Maintain this skill

- **Canonical path:** `.ai/skills/job-tracker-api/SKILL.md`. Edit only there.
- Repo mirroring: `pnpm setup-ai` → symlinks `.ai/skills` into `.cursor/skills`, `.claude/skills`, etc.
- Optional global Cursor symlink:  
  `ln -sf /abs/path/job-tracker/.ai/skills/job-tracker-api ~/.cursor/skills/job-tracker-api`  
  See `docs/CONVENTIONS.mdx` → **Agent skill: job-tracker-api**.

## Endpoint and auth

| Item            | Value                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| HTTP            | `POST` JSON body `{ "query", "variables?", "operationName?" }`                                |
| Default dev URL | `http://localhost:3101/graphql`                                                               |
| Guards          | `JwtAuthGuard` + `RolesGuard` role **`user`** on application, company, note, and AI resolvers |
| JWT             | Cookie **`access_token`** or header **`Authorization: Bearer <jwt>`** (`jwt.strategy.ts`)     |

Generate a test JWT (needs `JWT_ACCESS_SECRET` from API `.env`):

```bash
cd apps/api && node -e "
require('dotenv/config');
const jwt = require('jsonwebtoken');
console.log(jwt.sign({ sub: 'USER_UUID' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' }));
"
```

## Skill verbs → default action

| Verb                   | Agent does                                                                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **list**               | Name operations from **`schema.gql`** (below) + run **`applications`** when user wants their rows                                                                         |
| **fetch**              | **`application(id:)`** OR **`applications(company: "Exact Company Name")`** (exact trimmed name, case-insensitive) OR list all → client fuzzy match on **`company.name`** |
| **add**                | **`createApplication`** or **`createApplicationWithAI`**; optional **`createApplicationStageEvent`**, **`createApplicationNote`** if user asks                            |
| **update-application** | **`updateApplication`** and/or **`removeApplicationTag`**; never stage-event fields here                                                                                  |
| **timeline**           | Read/write **`applicationStageEvents`** **only**; app fields → **update-application**; free text outside schema → notes                                                   |

### Index (from `schema.gql`)

**Query:** `me`, `applications(filter?, company?)`, `application(id:)`, `companies`, `companyApplicationsCount(id:)`, `applicationStageEvents(applicationId:)`, `applicationNotes(applicationId:)`, `generateApplicationDraftWithAI(input:)`, `generateCompanyDescription`, `generateApplicationNoteWithAI`, `rewriteTextWithAI`, `restructureJobDescriptionWithAI`.

**Mutation:** `createApplication`, `createApplicationWithAI`, `updateApplication`, `removeApplicationTag`, `deleteApplication`, `createApplicationStageEvent`, `updateApplicationStageEvent`, `deleteApplicationStageEvent`, `createApplicationNote`, `updateApplicationNote`, `deleteApplicationNote`, `updateCompany`, `deleteCompany`.

---

## Listing: `applications`

| Argument                           | Values / meaning                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `filter` `ApplicationQuickFilter?` | **`NEW`** / **`APPLIED`** / **`ACTIVE`** / **`INCOMING`** — semantics use **latest** stage row per app (ordering: `COALESCE(scheduledAt, createdAt)` desc, etc., see `applications.repository.ts`). **`INCOMING`** also requires ≥1 event with **`scheduledAt` ≥ start of **today** (server **`setHours(0,0,0,0)`**). **`ACTIVE`\*\* = latest not `NEW` | `APPLIED` | `REJECTED`. |
| `company` `String?`                | Exact match on **`CompanyType.name`** (trim, case-insensitive).                                                                                                                                                                                                                                                                                         |

```graphql
query List($f: ApplicationQuickFilter, $c: String) {
  applications(filter: $f, company: $c) {
    id
    title
    currentStage
    company {
      id
      name
    }
  }
}
```

---

## Types and inputs

**`ApplicationType`** — `title`, `userId`, `companyId`, `company`, `description?`, `url?`, `source?` (**`LINKEDIN` \| `JACK` \| `WELLFOUND`**), **`salary*?`**, `tags`, **`currentStage`**, **`currentStageReason?`**, **`currentStageAt`**, `createdAt`, `updatedAt`.

**`CreateApplicationInput`** — required: `title`, `company` (string → **`findOrCreateByName`** unless **`companyId`** set). Optional: **`companyId`**, `description`, `url`, **`source`**, **`salary*`**, `tags`.

**`UpdateApplicationInput`** — all optional: `title`, `company`, `companyId`, `description`, `url`, `source`, `tags`, `salary*` (omit keys you don’t patch).

### TipTap (description + note content)

Must be JSON stringifiable document: **`{ "type": "doc", "content": [] }`** or richer TipTap blocks. Minimum: `"{\"type\":\"doc\",\"content\":[]}"`.

### Salary fields (`salary.service.ts`)

- **Create:** `SalaryService.getCreateSalary` — missing salary amounts → null columns; **`tags`** normalized elsewhere (≤8 labels, ≤32 chars each after trim/dedupe).
- **Update:** `SalaryService.getUpdateSalary` runs only when **any** of `salaryMinCents`, `salaryMaxCents`, `salaryCurrency`, `salaryPeriod` is **`!== undefined`**. **`tags`** are updated separately when the tag key is present on the DTO.

**Validity:**

- Amount min/max ⇔ **both** **`salaryCurrency`** (3-letter ISO) and **`salaryPeriod`** (**`YEAR` \| `MONTH` \| `HOUR`**); min/max ≥ 0; min ≤ max.
- **Tags only** (no range): **`salaryCurrency`** and **`salaryPeriod`** must be null → else `Remove salaryCurrency and salaryPeriod when no salary range is set`.
- No range after validation ⇒ stored amounts cleared, **tags retained**.

Typical GraphQL/errors strings: **`A salary range requires salaryCurrency and salaryPeriod`**, **`salaryCurrency must be a 3-letter ISO 4217 code`**, **`Remove salaryCurrency and salaryPeriod when no salary range is set`**, non-negative min/max, min ≤ max. TipTap failures: **`description must be valid TipTap document JSON`** / **`content must be valid TipTap document JSON`**.

---

## Mutations — focused examples

**Create:**

```graphql
mutation M($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    id
    title
    company {
      name
    }
    currentStage
    salaryMinCents
    salaryCurrency
    salaryPeriod
    tags
  }
}
```

```json
{
  "input": {
    "title": "Engineer",
    "company": "Acme",
    "source": "LINKEDIN",
    "salaryMinCents": 800000,
    "salaryMaxCents": 1000000,
    "salaryCurrency": "BRL",
    "salaryPeriod": "MONTH"
  }
}
```

**Patch (omit absent keys):**

```graphql
mutation U($id: ID!, $input: UpdateApplicationInput!) {
  updateApplication(id: $id, input: $input) {
    id
    company {
      name
    }
    tags
  }
}
```

```json
{ "id": "APP_UUID", "input": { "tags": ["Remote"] } }
```

**Remove single tag:**

```graphql
mutation R($id: ID!, $tag: String!) {
  removeApplicationTag(id: $id, tag: $tag) {
    id
    tags
  }
}
```

Side effect after **`createApplication`**: **`ApplicationService.create`** inserts **`ApplicationStage`** **`NEW`** with **`source` `"system"`**, **`fromStage` null**.

**AI:**

- **`generateApplicationDraftWithAI(input:)`** → **`ApplicationAiDraftType`** (preview only).
- **`createApplicationWithAI(input:)`** → persists **`ApplicationType`** (+ optional notes from **`noteContents`** in service layer).

Same auth as other guarded operations.

---

## Stage events (“timeline”)

**Do not** change application scalar fields here.

| Fact                          | Detail                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Read order                    | `COALESCE(scheduledAt, createdAt)` DESC → `createdAt` DESC → `id` DESC                                                              |
| **`fromStage`** on **create** | Copied from **`toStage`** of row with **latest `createdAt`** (then **`id`**) — **`not`** scheduled-at ordering                      |
| Inputs                        | **`CreateApplicationStageEventInput`**: `applicationId`, `toStage`, optional `source` (default `"manual"`), `reason`, `scheduledAt` |
| Patch                         | **`updateApplicationStageEvent`**: partial `toStage`, `scheduledAt`, `reason`                                                       |
| Delete                        | **`deleteApplicationStageEvent(id:)`** → `Boolean`                                                                                  |
| Enum **`ApplicationStage`**   | `NEW`, `APPLIED`, `RECRUITER_SCREEN`, `TECHNICAL`, `OFFER`, `REJECTED`                                                              |

**Backfill:** find event with **`toStage: NEW`** (often **`source: "system"`**), **`updateApplicationStageEvent`** with past **`scheduledAt`** ISO8601.

```graphql
query T($applicationId: ID!) {
  applicationStageEvents(applicationId: $applicationId) {
    id
    fromStage
    toStage
    source
    reason
    scheduledAt
    createdAt
  }
}
mutation A($input: CreateApplicationStageEventInput!) {
  createApplicationStageEvent(input: $input) {
    id
    fromStage
    toStage
  }
}
mutation Patch($id: ID!, $input: UpdateApplicationStageEventInput!) {
  updateApplicationStageEvent(id: $id, input: $input) {
    id
    scheduledAt
    reason
  }
}
```

Variables example: `{ "input": { "applicationId": "UUID", "toStage": "TECHNICAL" } }`

---

## Notes

- **`createApplicationNote`**: **`CreateNoteInput`** — `applicationId`, **`content`** (TipTap JSON string).
- **`updateApplicationNote`**: **`UpdateNoteInput`** — optional `content`, required **`expectedRevision`** (optimistic concurrency).
- **`deleteApplicationNote(id:)`**.

Prefer structured application fields **`update-application`** before creating notes unless the payload is unstructured.

```graphql
mutation N($input: CreateNoteInput!) {
  createApplicationNote(input: $input) {
    id
    revision
    applicationId
    content
  }
}
```

---

## Companies

`companies`, `companyApplicationsCount(id:)`, **`updateCompany`**, **`deleteCompany`** (`UpdateCompanyInput`: `name?`, `description?`).

---

## Errors and codegen

- HTTP **200** with **`errors`** array common for validation/auth; web client may surface **`UNAUTHENTICATED`** extension.
- **Web:** **`pnpm --filter @job-tracker/web run codegen`** (or **`pnpm codegen`** inside **`apps/web`**); schema path in **`apps/web/codegen.ts`** points at **`../api/src/schema.gql`**.

## Source files for deeper dives

`applications.resolver.ts`, `applications.service.ts`, `applications.repository.ts`, `salary.service.ts`, `notes.resolver.ts`, `companies.resolver.ts`, `ai.resolver.ts`.
