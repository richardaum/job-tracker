# TechSpec: User Profile Page

**Feature slug:** `user-profile`
**PRD:** `_prd.md`

## Design Decisions

All technical decisions are documented as ADRs:

| ADR                          | Decision                               | Summary                                                                                                |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------- |
| [ADR-001](./adrs/adr-001.md) | Unified Profile Hub                    | Single `/profile` with 4 tab subpages instead of separate routes                                       |
| [ADR-002](./adrs/adr-002.md) | Tab Subpages with Shared Layout        | Next.js `layout.tsx` + individual `page.tsx` per tab, TabsList synced via `usePathname()`              |
| [ADR-003](./adrs/adr-003.md) | User Settings as Typed Entity          | Typed `UserSetting` entity with `autoFillEnabled`, `autoSummaryEnabled`, `duplicateWindowDays` columns |
| [ADR-004](./adrs/adr-004.md) | Resumes Extraction and Route Migration | Extract `ResumesList`, remove old `/resumes` routes, recreate under `/profile/resumes/`                |
| [ADR-005](./adrs/adr-005.md) | Work Preferences Dual-Mode Component   | Extract `WorkPreferencesEditor` with `mode: "inline"                                                   | "dialog"` |

## Backend — User Settings

### Entity

**File:** `apps/api/src/database/entities/user-setting.entity.ts`

```ts
@Entity("user_settings")
export class UserSetting {
  @PrimaryColumn("text")
  userId: string;

  @Column("boolean", { default: false })
  autoFillEnabled: boolean;

  @Column("boolean", { default: false })
  autoSummaryEnabled: boolean;

  @Column("int", { default: 30 })
  duplicateWindowDays: number;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
```

### Migration

One migration: `CREATE TABLE user_settings` with FK to `users`, defaults applied at column level. Register in `apps/api/src/database/migrations/index.ts`.

### GraphQL Schema

```graphql
type UserSetting {
  userId: ID!
  autoFillEnabled: Boolean!
  autoSummaryEnabled: Boolean!
  duplicateWindowDays: Int!
}

input UpdateSettingsInput {
  autoFillEnabled: Boolean
  autoSummaryEnabled: Boolean
  duplicateWindowDays: Int
}

extend type Query {
  settings: UserSetting!
}

extend type Mutation {
  updateSettings(input: UpdateSettingsInput!): UserSetting!
}
```

### NestJS Module

**Module:** `SettingsModule` — imports `AuthModule` (guards), `TypeOrmModule.forFeature([UserSetting])`.

**Service:** `SettingsService`

- `getSettings(userId: string): Promise<UserSetting>` — findOne + auto-create row with defaults if missing (lazy init).
- `updateSettings(userId: string, input: UpdateSettingsInput): Promise<UserSetting>` — partial update via `save()`.

**Resolver:** `SettingsResolver`

- `@Query(() => UserSettingType) settings` — `@UseGuards(JwtAuthGuard, RolesGuard)` + `@CurrentUser()`.
- `@Mutation(() => UserSettingType) updateSettings` — same guards.

### Backward Compatibility

- `APPLICATION_DUPLICATE_PAIRING_WINDOW_MS` constant in `apps/api/src/domains/jobs/job-duplicate.constants.ts` is replaced by a read from `SettingsService.getSettings()`. Service call injected into `JobDuplicateService`.

## Frontend — Profile Shell

### Routing Structure

```
apps/web/src/app/(authenticated)/profile/
├── layout.tsx          # shared shell: BackToLink + Heading + TabsList
├── page.tsx            # Identity tab (root, /profile)
├── settings/
│   └── page.tsx        # Settings tab (/profile/settings)
├── resumes/
│   ├── page.tsx        # Resumes list tab (/profile/resumes)
│   └── [id]/
│       └── page.tsx    # Resume detail/editor (/profile/resumes/[id])
└── preferences/
    └── page.tsx        # Work Preferences tab (/profile/preferences)
```

Each `page.tsx` is a thin re-export:

```ts
export { default } from "@/modules/profile/<tab>/page/<PageComponent>";
```

### Layout (`layout.tsx`)

Renders the persistent shell:

```tsx
<div className="flex h-full min-h-0 flex-col">
  <div className="flex flex-col gap-3 border-b border-border-subtle p-4 sm:px-6 sm:py-5">
    <BackToLink href="/jobs">Back to jobs</BackToLink>
    <Heading as="h1" size="2xl">
      Profile
    </Heading>
    <Tabs value={currentTab} onValueChange={navigateToTab}>
      <TabsList>
        <TabsTrigger value="identity">Identity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="resumes">Resumes</TabsTrigger>
        <TabsTrigger value="preferences">Work Preferences</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
  <div className="flex-1 min-h-0">{children}</div>
</div>
```

The layout uses `usePathname()` to derive `currentTab` from the URL pathname. `onValueChange` calls `router.push()` to the corresponding subpage. The `<TabsContent>` wrapper is omitted — the tab content is the child page itself.

### Tab Value Mapping

| Pathname                                      | Tab value     |
| --------------------------------------------- | ------------- |
| `/profile/settings`                           | `settings`    |
| `/profile/resumes` or `/profile/resumes/[id]` | `resumes`     |
| `/profile/preferences`                        | `preferences` |
| `/profile` (default)                          | `identity`    |

## Frontend — Identity Tab

### Component

**File:** `apps/web/src/modules/profile/identity/page/IdentityTabPage.tsx`

Read-only display of OAuth identity:

```tsx
export default function IdentityTabPage() {
  const { data, loading } = useMeQuery();
  const user = data?.me;

  if (loading && !user) return <Text>Loading...</Text>;
  if (!user) return null;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {user.avatarUrl ? (
        <Image src={user.avatarUrl} alt={user.name} width={96} height={96} className="rounded-full" />
      ) : (
        <div className="flex size-24 items-center justify-center rounded-full bg-bg-brand-subtle text-2xl font-semibold text-text-brand">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
      )}
      <div className="flex flex-col items-center gap-1">
        <Heading as="h2" size="lg">
          {user.name}
        </Heading>
        <Text size="sm" color="muted">
          {user.email}
        </Text>
      </div>
      <Text size="xs" color="muted">
        Managed by Google — not editable here.
      </Text>
    </div>
  );
}
```

## Frontend — Settings Tab

### Component

**File:** `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx`

Three setting cards, auto-saved on change:

```tsx
export default function SettingsTabPage() {
  const { data, loading } = useSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  // ... render 3 SettingCard components
}
```

### Setting Controls

| Setting          | Control               | Props                                                                                 |
| ---------------- | --------------------- | ------------------------------------------------------------------------------------- |
| Auto-fill        | `Toggle`              | `checked` from `settings.autoFillEnabled`, onChange calls `updateSettings`            |
| Auto-summary     | `Toggle`              | `checked` from `settings.autoSummaryEnabled`, onChange calls `updateSettings`         |
| Duplicate window | `Input` type="number" | `value` from `settings.duplicateWindowDays`, min=1, max=365, onChange debounced 500ms |

### Card Layout

Each setting is a card with `ListItemCard` base style or a simple bordered section:

```
Setting label + description (left) | Control (right)
```

## Frontend — Resumes Tab

### Extraction: `ResumesList`

**File:** `apps/web/src/modules/resumes/list/components/ResumesList.tsx`

Extract the content body from `ResumesPage` (lines 146–180) into a `ResumesList` component. This component receives no page chrome — it renders only the list state (skeleton / error / empty / cards).

```tsx
interface ResumesListProps {
  resumes: ResumeType[];
  loading: boolean;
  error?: ApolloError;
  onDelete: (id: string, title: string) => Promise<void>;
  onSetAsDefault: (id: string) => Promise<void>;
}
```

### Resumes Tab Page

**File:** `apps/web/src/modules/profile/resumes/page/ResumesTabPage.tsx`

Renders the tab content with its own action bar (no BackToLink — that's in the shared layout):

```tsx
export default function ResumesTabPage() {
  const { data, loading, error } = useResumesQuery({ fetchPolicy: "cache-and-network" });
  // ... setAddDialogOpen, queries/mutations same as ResumesPage
  // ... action bar: Add resume button
  // ... <ResumesList ... />
  // ... <AddResumeDialog ... />
  // ... <PreferencesDialog ... />  (modal still available for quick access)
}
```

### Resume Detail Page

**File:** `apps/web/src/modules/profile/resumes/[id]/page/ResumeDetailPage.tsx`

Nearly identical to `ResumeDetailsPage` with two changes:

- `BackToLink` href changes from `/resumes` to `/profile/resumes`
- `EntityNotFound` backHref changes to `/profile/resumes`
- Delete success redirect changes from `/resumes` to `/profile/resumes`

### Updated `ResumeCard` Link

`ResumeCard` hardcodes `href={/resumes/${resume.id}}`. This changes to `href={/profile/resumes/${resume.id}}`.

### Updated `AddResumeDialog` Navigation

`AddResumeDialog` hardcodes `router.push(/resumes/${data.createResume.id})`. Changes to `/profile/resumes/${id}`.

### Deleted Files

- `apps/web/src/app/(authenticated)/resumes/page.tsx`
- `apps/web/src/app/(authenticated)/resumes/[id]/page.tsx`

## Frontend — Work Preferences Tab

### Extraction: `WorkPreferencesEditor`

**File:** `apps/web/src/modules/work-preferences/components/WorkPreferencesEditor.tsx`

Extract state management, query, mutation, and form rendering from `PreferencesDialog` into a standalone component. The existing `PreferencesDialog` becomes a thin wrapper.

```tsx
interface WorkPreferencesEditorProps {
  mode: "inline" | "dialog";
  readOnly?: boolean;
  onClose?: () => void;
}
```

**`mode="inline"`**: Renders form directly with embedded header ("Work Preferences" + description) and footer (Add + Save/Cancel buttons). No dialog shell.

**`mode="dialog"`**: Renders inside a `<Dialog>` wrapper (the existing `PreferencesDialog`). The dialog provides title, description, and footer.

The extracted component handles:

- `useWorkPreferencesQuery()` + `useUpdateWorkPreferencesMutation()`
- Local state (`localItems`, `focusedId`, `saving`)
- All CRUD operations (`addPreference`, `updatePreference`, `removePreference`, `handleSave`)
- Loading and empty states

### Preferences Tab Page

**File:** `apps/web/src/modules/profile/preferences/page/PreferencesTabPage.tsx`

```tsx
export default function PreferencesTabPage() {
  return <WorkPreferencesEditor mode="inline" />;
}
```

### Updated `PreferencesDialog`

```tsx
export function PreferencesDialog({ open, onOpenChange, readOnly = false }: PreferencesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Work Preferences" description="...">
      <WorkPreferencesEditor mode="dialog" readOnly={readOnly} onClose={() => onOpenChange(false)} />
    </Dialog>
  );
}
```

## Frontend — Sidebar Changes

### User Card Changes (`Sidebar.tsx`)

Wrap the user card div (lines 162–195) in a `<Link href="/profile">`:

- Add `hover:bg-bg-surface-hover` and `cursor-pointer` to the card row
- Add a `CaretRightIcon` (or chevron) at the end of the row
- Keep `onClick={() => onClose?.()}` on the Link to close mobile sidebar

### Nav Items Changes

- Remove `{ href: "/resumes", label: "Resumes", icon: FilesIcon }` from `navItems`
- Change settings `bottomItem` from `href: "#"` to `href: "/profile/settings"`

### Remove Unused Import

`FilesIcon` from `@phosphor-icons/react` — remove if not used elsewhere.

## GraphQL Schema Changes Summary

| Operation        | Type     | File                                          |
| ---------------- | -------- | --------------------------------------------- |
| `settings`       | Query    | New — `apps/web/src/graphql/settings.graphql` |
| `updateSettings` | Mutation | New — `apps/web/src/graphql/settings.graphql` |

After backend changes: `pm2 restart api` → `pnpm --filter @job-tracker/web run codegen`.

## Build Order

Each step depends on all previous steps unless noted.

1. **Backend: UserSetting entity + migration** — entity, migration file, register in migrations index
2. **Backend: Settings module** — SettingsModule, SettingsService, SettingsResolver, UserSettingType, UpdateSettingsInput (depends on 1)
3. **Backend: Wire duplicate window** — replace hardcoded constant with settings service call in JobDuplicateService (depends on 2)
4. **Backend: pm2 restart + codegen** — restart API, run codegen to generate hooks (depends on 2, 3)
5. **Frontend: Profile shell** — route files (`layout.tsx` + `page.tsx` stubs), `usePathname()` tab sync (depends on 4)
6. **Frontend: Identity tab** — `IdentityTabPage.tsx`, wire to `/profile/page.tsx` (depends on 5)
7. **Frontend: Settings tab** — `SettingsTabPage.tsx`, `settings.graphql`, `useSettingsQuery/useUpdateSettingsMutation` (depends on 4, 5)
8. **Frontend: WorkPreferencesEditor extraction** — extract from PreferencesDialog, create dual-mode component (depends on 5)
9. **Frontend: Preferences tab** — `PreferencesTabPage.tsx` using `WorkPreferencesEditor mode="inline"` (depends on 8)
10. **Frontend: ResumesList extraction** — extract from ResumesPage, create reusable component (depends on 5)
11. **Frontend: Resumes tab page** — `ResumesTabPage.tsx` using `ResumesList` (depends on 10)
12. **Frontend: Resume detail under profile** — `ResumeDetailPage.tsx`, update back links, delete redirect (depends on 11)
13. **Frontend: Update ResumeCard + AddResumeDialog** — change hardcoded `/resumes` paths to `/profile/resumes` (depends on 12)
14. **Frontend: Remove old `/resumes` routes** — delete page files (depends on 13)
15. **Frontend: Sidebar changes** — user card clickable, remove "Resumes" nav item, update "Settings" link (depends on 5)
16. **Tests** — implement all tests defined in Test Coverage section (depends on all previous steps; must be done **last** after all implementation is verified)

## Files Changed

### Backend — New

| File                                                            | Description        |
| --------------------------------------------------------------- | ------------------ |
| `apps/api/src/database/entities/user-setting.entity.ts`         | UserSetting entity |
| `apps/api/src/database/migrations/<timestamp>-user-settings.ts` | Migration          |
| `apps/api/src/domains/settings/settings.module.ts`              | NestJS module      |
| `apps/api/src/domains/settings/settings.service.ts`             | Business logic     |
| `apps/api/src/domains/settings/settings.resolver.ts`            | GraphQL resolver   |
| `apps/api/src/domains/settings/user-setting.type.ts`            | GraphQL type       |
| `apps/api/src/domains/settings/update-settings.input.ts`        | Mutation input     |

### Backend — Modified

| File                                                   | Change                                              |
| ------------------------------------------------------ | --------------------------------------------------- |
| `apps/api/src/database/migrations/index.ts`            | Register new migration                              |
| `apps/api/src/domains/jobs/job-duplicate.constants.ts` | Remove `APPLICATION_DUPLICATE_PAIRING_WINDOW_MS`    |
| `apps/api/src/domains/jobs/` (duplicate service)       | Inject `SettingsService`, read window from settings |

### Frontend — New

| File                                                                         | Description               |
| ---------------------------------------------------------------------------- | ------------------------- |
| `apps/web/src/graphql/settings.graphql`                                      | Settings query + mutation |
| `apps/web/src/modules/profile/layout/page/ProfileShell.tsx`                  | Shared layout with tabs   |
| `apps/web/src/modules/profile/identity/page/IdentityTabPage.tsx`             | Identity tab              |
| `apps/web/src/modules/profile/settings/page/SettingsTabPage.tsx`             | Settings tab              |
| `apps/web/src/modules/profile/resumes/page/ResumesTabPage.tsx`               | Resumes list tab          |
| `apps/web/src/modules/profile/resumes/[id]/page/ResumeDetailPage.tsx`        | Resume editor tab         |
| `apps/web/src/modules/profile/preferences/page/PreferencesTabPage.tsx`       | Preferences tab           |
| `apps/web/src/modules/resumes/list/components/ResumesList.tsx`               | Extracted list component  |
| `apps/web/src/modules/work-preferences/components/WorkPreferencesEditor.tsx` | Dual-mode editor          |
| `apps/web/src/app/(authenticated)/profile/layout.tsx`                        | Route re-export           |
| `apps/web/src/app/(authenticated)/profile/page.tsx`                          | Route re-export           |
| `apps/web/src/app/(authenticated)/profile/settings/page.tsx`                 | Route re-export           |
| `apps/web/src/app/(authenticated)/profile/resumes/page.tsx`                  | Route re-export           |
| `apps/web/src/app/(authenticated)/profile/resumes/[id]/page.tsx`             | Route re-export           |
| `apps/web/src/app/(authenticated)/profile/preferences/page.tsx`              | Route re-export           |

### Frontend — Modified

| File                                                                     | Change                                                   |
| ------------------------------------------------------------------------ | -------------------------------------------------------- |
| `apps/web/src/modules/navigation/components/Sidebar.tsx`                 | Clickable user card, remove "Resumes", update "Settings" |
| `apps/web/src/modules/resumes/list/components/ResumeCard.tsx`            | Link href → `/profile/resumes/[id]`                      |
| `apps/web/src/modules/resumes/list/components/AddResumeDialog.tsx`       | Navigate to `/profile/resumes/[id]`                      |
| `apps/web/src/modules/resumes/details/page/ResumeDetailsPage.tsx`        | Update backHref + redirect paths                         |
| `apps/web/src/modules/work-preferences/components/PreferencesDialog.tsx` | Become thin wrapper around `WorkPreferencesEditor`       |

### Frontend — Deleted

| File                                                     | Description      |
| -------------------------------------------------------- | ---------------- |
| `apps/web/src/app/(authenticated)/resumes/page.tsx`      | Old list route   |
| `apps/web/src/app/(authenticated)/resumes/[id]/page.tsx` | Old detail route |

## Verification

1. `pnpm --filter api typecheck` — zero new errors
2. `pnpm --filter web typecheck` — zero new errors
3. `pnpm lint` — zero new warnings
4. `pnpm test` — existing tests pass
5. `pnpm knip` — no dead code
6. Manual: navigate to `/profile` — Identity tab renders with OAuth data
7. Manual: navigate to `/profile/settings` — toggles flip and persist on reload
8. Manual: navigate to `/profile/resumes` — list renders; create/edit/delete works
9. Manual: navigate to `/profile/preferences` — inline editor works
10. Manual: click user card in sidebar → navigates to `/profile`
11. Manual: "/resumes" route returns 404 (route removed)
12. Manual: duplicate window setting value is used when checking job duplicates

## Test Coverage

Tests MUST be implemented **last**, after every implementation step is complete and verified manually. Do not write tests before all code changes are done.

### API (`apps/api/src/`)

Framework: Vitest + SWC + node. Naming: `*.spec.ts`.

| File                                         | Type        | What to test                                                                                                       |
| -------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `domains/settings/settings.service.spec.ts`  | Unit        | `getSettings` creates row with defaults on first call; `updateSettings` partial update; auto-create on missing row |
| `domains/settings/settings.resolver.spec.ts` | Integration | `settings` query returns UserSetting; `updateSettings` mutation persists; unauthenticated returns 401              |

Pattern: mock `UserSettingRepository` via `as unknown as`, or NestJS `Test.createTestingModule` + `supertest` with `.overrideGuard()` for auth.

### Web (`apps/web/src/`)

Framework: Vitest + `@testing-library/react` + jsdom. Naming: `*.test.tsx` (components) / `*.test.ts` (hooks).

| File                                                                 | Type      | What to test                                                                                                       |
| -------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `modules/profile/layout/page/ProfileShell.test.tsx`                  | Component | Renders 4 tab triggers; active tab matches pathname; clicking tab navigates to correct subpage                     |
| `modules/profile/identity/page/IdentityTabPage.test.tsx`             | Component | Shows avatar + name + email; shows loading; shows initials when no avatarUrl                                       |
| `modules/profile/settings/page/SettingsTabPage.test.tsx`             | Component | Renders 3 settings; toggle onChange calls `updateSettings`; number input onChange debounced                        |
| `modules/profile/resumes/page/ResumesTabPage.test.tsx`               | Component | Shows empty state when no resumes; shows cards when data; create button opens dialog                               |
| `modules/profile/preferences/page/PreferencesTabPage.test.tsx`       | Component | Renders `WorkPreferencesEditor` in inline mode                                                                     |
| `modules/resumes/list/components/ResumesList.test.tsx`               | Component | Loading → skeleton; empty → empty state; error → error text; data → cards                                          |
| `modules/work-preferences/components/WorkPreferencesEditor.test.tsx` | Component | Inline mode: renders form directly; Dialog mode: renders inside Dialog; add/edit/remove items; save calls mutation |
| `modules/navigation/components/Sidebar.test.tsx`                     | Component | User card is a link to `/profile`; chevron visible; "Resumes" not in nav; "Settings" links to `/profile/settings`  |

Mock patterns:

- `vi.mock("next/navigation")` — `useRouter`, `usePathname`, `useSearchParams`
- `vi.mock("@/gql/hooks")` — partial override with `vi.importActual` for specific queries/mutations
- `vi.mock("@/hooks/useCurrentUser")` — return mock user

### E2E (`apps/web/e2e/`)

Framework: Playwright. Naming: `*.spec.ts`.

| File                  | What to test                                                                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/profile.spec.ts` | Login → navigate to `/profile` via sidebar user card → 4 tabs render → Settings toggle persists → create+delete resume → edit preferences |

Auth bypass pattern: `page.goto("/auth/google?returnTo=/profile")`.

## Architecture Decision Records

- [ADR-001](./adrs/adr-001.md) — Unified Profile Hub: single `/profile` page with tabs instead of separate `/settings` and `/resumes` routes
- [ADR-002](./adrs/adr-002.md) — Tab Subpages with Shared Layout: Next.js `layout.tsx` + individual `page.tsx` per tab
- [ADR-003](./adrs/adr-003.md) — User Settings as Typed Entity: typed `UserSetting` entity with explicit columns
- [ADR-004](./adrs/adr-004.md) — Resumes Extraction and Route Migration: extract `ResumesList`, remove old routes, recreate under `/profile/resumes/`
- [ADR-005](./adrs/adr-005.md) — Work Preferences Dual-Mode Component: extract `WorkPreferencesEditor` with `mode: "inline" | "dialog"`
