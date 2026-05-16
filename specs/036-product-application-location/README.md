---
status: complete
created: 2026-05-14
priority: medium
tags:
  - api
  - web
  - ai
  - data-model
created_at: 2026-05-14T12:00:00.000000Z
updated_at: 2026-05-14T12:00:00.000000Z
---

# Product Scope: application-location

> **Status**: implemented · **Priority**: medium · **Created**: 2026-05-14

## Objective

Add two orthogonal location fields to the application model: **location** (job base / company office location) and **workRegion** (geographic area where the candidate can work from, e.g. "Brazil", "Latam", "Anywhere").

## Context

Every job posting includes location information, yet the application model currently stores none. This gap forces users to mentally track where each role is based and whether they match the allowed work geography — a common source of friction when reviewing or filtering applications.

## Product Outcomes

- [P-175] **Location on Application**: Each application stores a `location` field (free text) describing the job's base office location (e.g. "São Paulo, SP", "San Francisco, CA").
- [P-176] **Work Region on Application**: Each application stores a `workRegion` field (free text) describing the permitted work geography (e.g. "Brazil", "Latam", "Anywhere", "EST timezone").
- [P-177] **AI Extraction**: The AI draft-to-application conversion pipeline extracts both `location` and `workRegion` from the job posting.
- [P-178] **Detail Page Display**: Application detail page shows both fields, each editable via an inline dialog with an AI-inference button that populates the field from the job description.
- [P-179] **List Page Quick-Edit**: The quick-edit dialog includes fields for location and work region.

## Technical Tasks

- [T-217] **AI Extraction Schema**: Add `location` and `workRegion` to the Zod extraction schema, field specs, and normalization service.
- [T-218] **Database Migration**: Add `location` (text, nullable) and `work_region` (text, nullable) columns to the `applications` table.
- [T-219] **TypeORM Entity**: Add `location` and `workRegion` columns to `ApplicationEntity`.
- [T-220] **Service DTOs**: Add `location` and `workRegion` to `CreateDto`, `UpdateDto`, and `CreateApplicationRepoDto` — pass through in `create()`, `update()`, and `processDraftConversion()`.
- [T-221] **GraphQL Schema**: Add `location` and `workRegion` to `ApplicationType`, `CreateApplicationInput`, `UpdateApplicationInput`.
- [T-222] **NestJS Decorators**: Add `@Field()` on `ApplicationType`, `CreateApplicationInput`, `UpdateApplicationInput` classes.
- [T-223] **Location AI Inference Query**: Add `generateApplicationLocationWithAI(applicationId: ID!): LocationInferenceType!` query to infer both fields from the stored description via OpenAI.
- [T-224] **Web GraphQL Operations**: Update `applications.graphql` queries and mutations to request and accept the new fields.
- [T-225] **Detail Page UI**: Render `location` and `workRegion` in `OverviewTabContent` with `FieldWithLabelAction`, `TextFieldEditDialog`, and a `SparkleIcon` AI-inference button.
- [T-226] **List Page Quick-Edit**: Add location and workRegion inputs to `ApplicationQuickEditDialog`.

## Modus Operandi

1. **Free text throughout**: Both fields are nullable strings — no enums, no validation beyond basic trimming. This avoids the complexity of geo-coding or maintaining a location taxonomy.
2. **AI extraction in the draft pipeline**: The existing `draftExtractionModelSchema` and `DraftExtractionNormalizationService` gain two new fields following the same pattern as `tags` or `salary`.
3. **Separate AI inference for detail page**: A dedicated `generateApplicationLocationWithAI` query reads the stored description and calls OpenAI with a focused prompt — independent of the draft pipeline.
4. **SparkleIcon UX**: Each field row in `OverviewTabContent` shows a `SparkleIcon` button alongside the edit pencil. Clicking calls the AI inference, auto-saves the result via `updateApplication`, and shows a success toast.
