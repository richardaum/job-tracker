---
status: planned
created: "2026-05-12"
priority: high
tags:
  - api
  - web
  - compliance
  - privacy
  - legal
---

# LGPD Compliance

> **Status**: planned · **Priority**: high · **Created**: 2026-05-12

## Motivation

NewJobTracker collects and stores users' personal data — name, email, full resumes, salary preferences, application history, and browsing data from the Chrome extension. Brazil's General Data Protection Law (LGPD — Lei nº 13.709/2018) requires applications that process personal data in Brazil to provide:

- Transparency about which data is collected and for what purposes.
- Record of legal bases for each processing operation.
- Mechanisms for data subject rights (access, correction, deletion, portability, anonymization, consent withdrawal).
- Retention and secure disposal policies.
- Technical and administrative security measures.

This spec defines what needs to be implemented to bring NewJobTracker into LGPD compliance.

## Data inventory

### Data collected per subsystem

| Subsystem        | Personal data                              | Purpose                           | Likely legal basis                       |
| ---------------- | ------------------------------------------ | --------------------------------- | ---------------------------------------- |
| **Auth**         | Name, email, avatar (via Google OAuth)     | Identification and authentication | Legitimate interest / contract execution |
| **Resume**       | Full name, work history, education, skills | Job match analysis                | Consent                                  |
| **Preferences**  | Work preferences (remote, salary, etc.)    | Match analysis personalization    | Consent                                  |
| **Applications** | Target companies, roles, stages, notes     | Job search management             | Legitimate interest                      |
| **Salary**       | Salary expectations, currency              | Salary calculation and conversion | Consent                                  |
| **Extension**    | Visited job URLs, company, role            | Automatic job import              | Consent                                  |
| **Settings**     | User preferences                           | Experience configuration          | Legitimate interest                      |

### Sensitive data (Art. 11 LGPD)

The application does **not** intentionally collect sensitive data (racial origin, religious beliefs, political opinions, health data, etc.) through its forms. However, the free-form resume field (`resume.content`) may contain sensitive data voluntarily provided by the user. The retention and deletion policy must treat this data with the same rigor.

## Design

### Consent

#### Initial collection

On the signup/login flow, display a **consent banner** with individual checkboxes for each purpose that requires consent:

```
┌──────────────────────────────────────────────┐
│  NewJobTracker needs your consent               │
│  for some operations with your data:          │
│                                                │
│  ☑ Store resumes for fit analysis             │
│     (usei.me/resume)                          │
│  ☑ Store work preferences                     │
│     (usei.me/preferences)                     │
│  ☑ Collect browsing data via the              │
│     Chrome extension (usei.me/extension)      │
│  ☑ Store salary data                          │
│     (usei.me/salary)                          │
│                                                │
│  [  Accept selected  ]  [  Decline  ]         │
│                                                │
│  ────────────────────────────────────────────  │
│  You can revoke or change this at any time     │
│  in Settings > Privacy.                        │
│  Read our Privacy Policy.                      │
└──────────────────────────────────────────────┘
```

- Consent is **granular** — each purpose has its own checkbox.
- User may proceed with partial consent; non-consented features are disabled.
- Consent is **revocable** at any time via **Settings > Privacy**.

#### Consent record

Each consent is persisted with:

| Field       | Type     | Description                                    |
| ----------- | -------- | ---------------------------------------------- |
| `userId`    | UUID     | 1:N relationship with the user                 |
| `purpose`   | enum     | `resume`, `preferences`, `extension`, `salary` |
| `granted`   | boolean  | True = consented, False = revoked              |
| `grantedAt` | datetime | Consent timestamp                              |
| `ip`        | text     | IP at consent time (hash)                      |
| `userAgent` | text     | User-Agent at consent time                     |

### Data subject rights

#### Privacy page

New section in **Settings > Privacy** with:

```
┌──────────────────────────────────────────────────┐
│  Privacy & Data                                   │
│                                                    │
│  ┌─ Consents ───────────────────────────────────┐ │
│  │  ☑ Resumes                        Revoke     │ │
│  │  ☑ Preferences                    Revoke     │ │
│  │  ☑ Chrome Extension ⚠ Disabled   Grant      │ │
│  │  ☑ Salary Data                    Revoke     │ │
│  └────────────────────────────────────────────────┘ │
│                                                    │
│  ┌─ Your LGPD rights ────────────────────────────┐ │
│  │  📥 Export my data              [  Request  ]  │ │
│  │  🗑️ Delete my account           [  Request  ]  │ │
│  │  ✏️ Correct data                                │ │
│  │  🔄 Portability                                 │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

#### Export flow (SAR — Subject Access Request)

1. User clicks "Export my data".
2. System generates a JSON package with all the user's personal data.
3. Download link sent via email or made available immediately.
4. Format: structured JSON, readable, with fields mapped by subsystem.
5. Deadline: 15 days (Art. 19 LGPD).

#### Deletion flow

1. User requests account deletion from Settings > Privacy.
2. Two-step confirmation:
   - **Step 1**: "Are you sure? This action is irreversible. Your data will be deleted in 30 days."
   - **Step 2**: Type "DELETE" to confirm.
3. After confirmation, the account is marked as `deleted` and data is anonymized or eliminated.
4. 30-day grace period for repentance (reactivation via support).
5. After 30 days, data is physically removed (batch job).

#### Correction flow

- User can edit their data directly in the respective sections (resume, preferences, etc.).
- For auth data (name, email), redirect to Google OAuth (data managed by Google).

### Data retention

| Data               | Default retention          | Post-account-deletion       |
| ------------------ | -------------------------- | --------------------------- |
| Auth (name, email) | While account exists       | Immediate (anonymization)   |
| Resumes            | While consent is valid     | 30 days                     |
| Preferences        | While consent is valid     | 30 days                     |
| Applications       | While account exists       | 90 days (reduced retention) |
| Salary             | While consent is valid     | 30 days                     |
| Extension data     | While consent is valid     | 30 days                     |
| Access logs        | 6 months                   | 6 months                    |
| Consent logs       | 5 years (legal obligation) | 5 years (legal obligation)  |

### Privacy policy

- Static page `/privacy` with the full privacy policy.
- Referenced from the consent banner, footer, and Settings.
- Versioned with date and change history.

### Security

#### Technical requirements

- IP hashing in consent logs (do not store IP in cleartext).
- Chrome extension data stored with reference to `userId`, not browser identifiers.
- All personal data endpoints authenticated (`GoogleAuthGuard`).
- Encryption in transit (HTTPS) — already implemented.
- Rate limiting on export/deletion endpoints to prevent abuse.
- Email notification to user when data is exported or account is deleted.

#### Incidents

- Capability to notify data subjects and ANPD in case of a breach (Art. 48 LGPD).
- Internal incident log with date, description, affected data, actions taken.

### DPO

- DPO contact info available at `/privacy` and `/settings/privacy`.
- Contact channel: `dpo@usei.me`.

## Product outcomes

- **[P-163]** Consent banner is displayed on first login with granular per-purpose checkboxes.
- **[P-164]** User can revoke or grant consent individually in Settings > Privacy.
- **[P-165]** Non-consented features are disabled in the UI.
- **[P-166]** User can export all their personal data in JSON format (SAR).
- **[P-167]** User can request account deletion with two-step confirmation and a 30-day grace period.
- **[P-168]** User can correct their personal data directly through the UI.
- **[P-169]** `/privacy` page with full privacy policy and DPO contact info.
- **[P-170]** Personal data is retained per the retention policy and disposed of after the deadline.
- **[P-171]** User consent is recorded with timestamp, IP hash, and user-agent.
- **[P-172]** Consent logs are kept for 5 years for legal compliance.
- **[P-173]** User is notified by email when their data is exported or account deleted.
- **[P-174]** Personal data endpoints have rate limiting to prevent abuse.

## Technical plan

| ID          | Deliverable                                                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[T-193]** | Create **`UserConsent`** entity + migration (`userId`, `purpose` enum, `granted`, `grantedAt`, `ipHash`, `userAgent`). Unique constraint: `(userId, purpose)`.                                                                                                          |
| **[T-194]** | Create **`ConsentLog`** entity + migration (append-only log of all consent changes, 5-year retention).                                                                                                                                                                  |
| **[T-195]** | Add GraphQL **`Mutation.updateConsent(purpose: ConsentPurpose!, granted: Boolean!)`** and **`Query.myConsents`** to the API.                                                                                                                                            |
| **[T-196]** | Build **`ConsentBanner`** component — modal with per-purpose checkboxes, shown on first login. Controlled by `hasSeenConsent` flag in UserSettings.                                                                                                                     |
| **[T-197]** | Build **Privacy settings section** in Settings — consent list with toggles, "Your LGPD rights" section with export/delete buttons.                                                                                                                                      |
| **[T-198]** | Implement **data export endpoint** (`Mutation.requestDataExport`): generates consolidated JSON package (resumes, preferences, applications, salary, consents), stores as blob in S3/local storage, returns signed URL with 1h expiry.                                   |
| **[T-199]** | Implement **account deletion flow** (`Mutation.requestAccountDeletion`): marks user as `deleted`, schedules physical deletion for 30 days. Mutation `cancelAccountDeletion` for repentance. Weekly batch job for physical deletion of accounts with `deleted_at + 30d`. |
| **[T-200]** | Add **`isDeleting`** or **`deletedAt`** flag to `User` entity + migration. Adjust queries to exclude deleted users (don't return in lists, don't authenticate).                                                                                                         |
| **[T-201]** | Create **data retention batch job** — weekly cron that drops data past its retention period (consent logs excluded, extension data, salary, etc.).                                                                                                                      |
| **[T-202]** | Build **`/privacy`** page with privacy policy (static content in Portuguese). Include DPO contact, version, and date.                                                                                                                                                   |
| **[T-203]** | Implement **rate limiting** on `requestDataExport` and `requestAccountDeletion` endpoints (max 1 request per 24h).                                                                                                                                                      |
| **[T-204]** | Implement **email notification** — send email when data export is generated and when account is deleted.                                                                                                                                                                |
| **[T-205]** | Implement **IP hashing** on consent records (SHA-256 of the real IP).                                                                                                                                                                                                   |
| **[T-206]** | Feature flags: disable features when corresponding consent is revoked. Validate at the GraphQL layer (resolver guard) and frontend (conditional render).                                                                                                                |

## Acceptance checklist

- [ ] Consent banner appears on first login with individual checkboxes.
- [ ] User can proceed with partial consent; non-consented features hide/disable.
- [ ] Settings > Privacy shows consent list with individual toggles.
- [ ] "Export my data" generates a complete JSON with all personal data and makes it available for download.
- [ ] "Delete my account" asks for 2-step confirmation, marks account as deleted, schedules deletion in 30d.
- [ ] User can cancel deletion within the 30-day grace period.
- [ ] Weekly batch job physically deletes accounts with deleted_at > 30 days.
- [ ] `/privacy` displays the full privacy policy with DPO contact.
- [ ] Data is retained per the retention policy; retention batch job removes expired data.
- [ ] Consent is recorded with timestamp, IP hash, and user-agent.
- [ ] Consent logs are append-only with 5-year retention.
- [ ] Rate limiting blocks repeated export/deletion requests (1x/24h).
- [ ] Email notification sent when data is exported and when account is deleted.
- [ ] IP stored in consent logs is SHA-256 hashed, never cleartext.
- [ ] GraphQL resolvers validate active consent before exposing data.
