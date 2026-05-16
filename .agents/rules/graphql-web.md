# GraphQL Web Patterns

## Client (`apps/web`)

Prefer generated query and mutation hooks from `@/gql/hooks` (e.g. `useApplicationsQuery`, `useCreateApplicationMutation`) over calling Apollo Client `useQuery`, `useMutation`, or `useLazyQuery` with a document argument. Codegen keeps operations, variables, and result types aligned with `apps/api/src/schema.gql`.

## Workflow

- `apps/web/codegen.ts` reads `apps/api/src/schema.gql`, writes `apps/web/src/gql/`
- Post-process: `scripts/postprocess-codegen-hooks.mjs`
- Run: `pnpm --filter @job-tracker/web run codegen`

## Agent skill: `job-tracker-api`

The skill `.agents/skills/job-tracker-api/SKILL.md` is the canonical copy. Edit only there.

Keep the skill aligned with the live GraphQL contract whenever API capabilities change:
- Source of truth for types and operations: `apps/api/src/schema.gql` (generated)
- Update skill in the same change set as API changes
- Typical triggers: new/removed queries/mutations/types, renamed fields, input shapes, enum members, validation rules

## View Models

GraphQL screens should keep rendering thin: put API-to-display shaping (derived lists, formatted fields, empty/loading/error flags, props from query results) in view-model hooks, not large page or panel components.

| Topic | Rule |
|---|---|
| Naming | `use<Feature><Screen>ViewModel` (e.g. `useApplicationDetailsViewModel`) |
| Location | `apps/web/src/modules/<domain>/<area>/hooks/use<Name>ViewModel.ts` |
| Return | One object with named fields. Pure formatters live in `utils/` or `*.shared.ts`. |
| Queries | Prefer generated hooks from `@/gql/hooks` over Apollo `useQuery(Document)`. UI-only state may stay on page or in `useXxxUiState`. |
| Dependencies | Apollo and pure helpers allowed; must not import from `app/` (`app → modules` only). |
| Types | Prefer generated GraphQL types; avoid `any`. |
| React 19/Compiler | Follow React 19 rules (prefer plain derivations; avoid default memoization). |
| Size | Split large hooks by concern. |

## List Consistency

### Delete mutations cache

For delete mutations on list-backed entities in `apps/web`, prefer cache-first list consistency with `removeDeletedEntityFromListCache` from `apps/web/src/modules/applications/shared/utils/apolloDeleteCache.ts` over `refetchQueries`.

In the mutation `update(cache, { data })`, call:
```ts
removeDeletedEntityFromListCache(cache, {
  mutationData: data,
  mutation: DeleteXDocument,
  query: ListXDocument
})
```

Pass generated GraphQL documents from `@/gql/hooks`. Keep refetch as fallback only when list consistency depends on server-side derivations.

### Delete mutations payload standard

- Do not model delete mutations as bare `Boolean` returns.
- Return a payload object with at least: `success: Boolean!` and `deletedId: ID!`.
- Keep mutation names explicit (`deleteApplication`, `deleteCompany`).
