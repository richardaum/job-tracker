# TOON for AI Communication — Technical Specification

## Problem Statement

When communicating with AI assistants, structured data is typically sent as JSON. JSON is verbose: field names repeat for every record in arrays, delimiters proliferate, and the overhead grows with dataset size. This raises token costs and, at the margin, can degrade model comprehension. TOON (Token-Oriented Object Notation) is a lossless alternative that reduces token usage by ~40% on mixed-structure datasets while maintaining or improving model accuracy.

This spec defines when, how, and to what degree the team should adopt TOON when sending structured data to AI assistants.

## Goals

- [ ] Reduce token consumption on structured data payloads sent to AI assistants by ≥30%
- [ ] Establish clear, team-wide guidelines on when to use TOON vs JSON vs plain text
- [ ] Make the format switch frictionless — tooling must allow encoding/decoding with a single command

## Out of Scope

| Feature                                         | Reason                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------- |
| Replacing JSON in job-tracker API or codebase   | TOON is only for human↔AI conversations, not production data                    |
| Parsing TOON responses from models              | Models should reply in whatever format is clearest; this spec covers input only |
| Custom TOON extensions or modifications         | Use the standard format as defined by `toon-format/toon`                        |
| Streaming or real-time TOON encoding in-browser | Out of scope for team communication context                                     |

---

## Background: TOON Format Primer

TOON uses indentation for nesting (YAML-style) and a tabular header+rows pattern for uniform arrays (CSV-style).

### Scalar objects

```toon
context:
  task: review pull request
  repo: job-tracker
  branch: feat/compensation
```

### Simple arrays

```toon
reviewers[2]: alice,bob
```

### Uniform object arrays (highest savings)

Instead of repeating field names per record like JSON does:

```toon
applications[3]{id,company,role,status,appliedAt}:
  1,Stripe,Senior Engineer,interview,2026-04-01
  2,Vercel,Staff Engineer,applied,2026-04-10
  3,Linear,Backend Engineer,rejected,2026-04-15
```

Field names are declared once in `{...}`, then rows are streamed as CSV lines. This is where TOON achieves its largest token reduction.

### Nesting

```toon
application:
  id: 42
  company: Stripe
  compensation:
    base: 180000
    equity: 0.05
  tags[2]: remote,senior
```

---

## User Stories

### P1: Team Adoption Guideline ⭐ MVP

**User Story**: As a team member communicating with an AI assistant, I want a clear rule for when to use TOON instead of JSON so that I can reduce token usage without thinking about it case by case.

**Why P1**: The whole benefit depends on consistent adoption. Without a clear rule, people default to JSON.

**Acceptance Criteria**:

1. WHEN the payload contains a uniform array of ≥3 objects with ≥3 fields THEN the sender SHALL use TOON tabular format
2. WHEN the payload is a single flat object or a simple list of scalars THEN the sender MAY use TOON scalar/array syntax or plain text — JSON is not necessary
3. WHEN the payload is deeply nested and non-uniform THEN the sender SHALL use TOON scalar nesting; JSON is acceptable only if the structure cannot be represented cleanly
4. WHEN copy-pasting raw JSON from a tool or API response THEN the sender SHALL convert it to TOON before including it in the prompt

**Independent Test**: Send an application list to an AI assistant in TOON; the model correctly interprets all fields and performs the requested analysis without asking for clarification.

---

### P1: Encoding Workflow ⭐ MVP

**User Story**: As a team member, I want to convert JSON to TOON with a single CLI command so that adoption has zero friction.

**Why P1**: If encoding requires manual effort, people won't do it.

**Acceptance Criteria**:

1. WHEN a team member has JSON data THEN they SHALL be able to run `npx @toon-format/cli input.json` to produce TOON output
2. WHEN running the CLI THEN output SHALL be pipe-compatible so it can be copied directly into a prompt
3. WHEN the JSON is already inline in a prompt draft THEN the team member SHALL paste it to a temp file, encode, and replace

**Independent Test**: Run `echo '{"apps":[{"id":1,"company":"Stripe","role":"SWE"}]}' | npx @toon-format/cli /dev/stdin` and get valid TOON output.

---

### P2: Decision Reference Card

**User Story**: As a team member, I want a quick-reference table showing format selection rules so that I can make the right choice without reading the full spec.

**Why P2**: Important for onboarding and day-to-day use, but the table itself isn't blocking adoption.

**Acceptance Criteria**:

1. WHEN a decision card is published THEN it SHALL cover: uniform arrays, flat objects, nested structures, and plain prose — with a format recommendation for each
2. WHEN a payload matches the "avoid TOON" criteria THEN the card SHALL state what to use instead

**Independent Test**: A new team member reads only the card and correctly formats 3 sample payloads.

---

### P3: Prompt Template Library

**User Story**: As a team member, I want reusable prompt templates with TOON placeholders for common operations (application review, data analysis, bulk update planning) so that I spend less time formatting prompts.

**Why P3**: Useful but requires prior P1/P2 adoption to be meaningful.

**Acceptance Criteria**:

1. WHEN templates are created THEN each SHALL include a TOON-formatted data block and clear instructions to the model
2. WHEN a template is used THEN the sender SHALL only need to replace the TOON data rows, not restructure the prompt

---

## Format Selection Decision Table

| Data shape                     | Size                  | Recommended format      | Reason                          |
| ------------------------------ | --------------------- | ----------------------- | ------------------------------- |
| Uniform array of objects       | ≥3 objects, ≥3 fields | **TOON tabular**        | Maximum token reduction         |
| Uniform array of objects       | <3 objects            | TOON or JSON            | Savings minimal; either is fine |
| Flat scalar object             | Any                   | **TOON scalar nesting** | Saves delimiters and quotes     |
| Simple list of strings/numbers | Any                   | `key[N]: a,b,c`         | Minimal; one line               |
| Deeply nested, non-uniform     | Any                   | TOON scalar nesting     | Falls back gracefully           |
| Pure prose / no structure      | —                     | **Plain text**          | No encoding needed              |
| Single value                   | —                     | Inline in sentence      | Not worth any structured format |

---

## Edge Cases

- WHEN a field value contains a comma THEN it SHALL be wrapped in double quotes (standard CSV escaping): `"Acme, Inc"`
- WHEN a field value contains a newline THEN it SHALL be escaped as `\n` or the field shall be moved to a nested block
- WHEN an array has mixed types across records (non-uniform) THEN tabular format SHALL NOT be used; fall back to TOON scalar nesting
- WHEN the model returns data in JSON THEN the team member is NOT required to re-encode it as TOON; conversion applies to inputs only
- WHEN a TOON payload is ambiguous (e.g., missing length declaration) THEN the sender SHALL add the `[N]` count to aid model parsing

---

## Requirement Traceability

| Requirement ID | Story                                               | Status  |
| -------------- | --------------------------------------------------- | ------- |
| TOON-01        | P1: Adoption Guideline — uniform array rule         | Pending |
| TOON-02        | P1: Adoption Guideline — flat object rule           | Pending |
| TOON-03        | P1: Adoption Guideline — nested structure rule      | Pending |
| TOON-04        | P1: Adoption Guideline — copy-paste conversion rule | Pending |
| TOON-05        | P1: Encoding Workflow — CLI command                 | Pending |
| TOON-06        | P1: Encoding Workflow — pipe-compatible output      | Pending |
| TOON-07        | P2: Decision Reference Card                         | Pending |
| TOON-08        | P3: Prompt Template Library                         | Pending |

---

## Success Criteria

- [ ] Team consistently uses TOON tabular format for uniform arrays in AI prompts — verified by spot-checking shared prompts
- [ ] Average token count for structured payloads in team prompts drops by ≥30% compared to JSON baseline
- [ ] New team members adopt TOON without needing help after reading this spec + the decision table
- [ ] Zero cases of model misinterpreting a TOON-formatted payload sent by the team

---

## References

- TOON format repo: https://github.com/toon-format/toon
- CLI: `npx @toon-format/cli`
- TypeScript SDK: `@toon-format/core` — `encode(data)` / `encodeLines(data)`
- Benchmark: 39.9% fewer tokens vs JSON, 76.4% vs 75.0% accuracy on tested models
