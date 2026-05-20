---
id: T-03
title: Update Company details page
status: pending
type: frontend
depends_on: [T-01]
---

# T-03: Update Company details page

## Scope

- Add `notFound` to `useCompanyDetailsViewModel`
- Replace inline not-found text in `CompanyDetailsPage` with `EntityNotFound`

## Implementation

### 1. View-model: add `notFound`

**File:** `apps/web/src/modules/companies/details/hooks/useCompanyDetailsViewModel.ts`

Add to the returned object:

```ts
notFound: !showCompaniesInitialLoading && !company,
```

### 2. CompanyDetailsPage: replace not-found branch

**File:** `apps/web/src/modules/companies/details/page/CompanyDetailsPage.tsx`

- Import `EntityNotFound` from `@/components/entity-not-found`
- Destructure `notFound` from the view-model
- Replace the `!company ? <Text>Company not found.</Text>` branch with `notFound ? <EntityNotFound resource="company" backHref="/companies" backLabel="Back to companies" />`
- The condition chain becomes: `showCompaniesInitialLoading → companiesError → notFound → ...tabs/content`

## Verification

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Navigating to `/companies/nonexistent-id` shows EntityNotFound with message + "Back to companies" link
- [ ] Existing error state still renders correctly
