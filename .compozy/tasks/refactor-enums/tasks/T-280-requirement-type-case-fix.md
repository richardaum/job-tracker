# T-280: Fix `RequirementType` Case Mismatch in Web

**Status:** pending · **Phase:** 0 · **Priority:** high · **Dependencies:** none

## Context

Migration T-223 (`1767200000000-normalize-enum-values-uppercase`) converteu `fit_analysis.items[].type` no JSONB de lowercase (`must_have`, `nice_to_have`, `soft_skill`) para uppercase (`MUST_HAVE`, `NICE_TO_HAVE`, `SOFT_SKILL`). O backend (`RequirementTypeEnum`) e o codegen já usam uppercase. Mas 3 arquivos no web ainda comparam contra lowercase — idêntico ao bug de case-sensitivity entre GraphQL (uppercase) e SSE (lowercase) já corrigido anteriormente.

**Consequência:**

- `TypeBadge` nunca aplica classes CSS corretas (cores por tipo)
- `formatRequirementType` nunca casa e retorna string bruta uppercase como fallback
- `RelevanceIcon` nunca renderiza ícone

## Files to Modify

### 1. `apps/web/src/modules/applications/shared/utils/fitFormat.ts`

**Linhas 26-28** — substituir lowercase por uppercase:

```ts
// Before
if (type === "must_have") return "Required";
if (type === "nice_to_have") return "Plus";
if (type === "soft_skill") return "Soft Skill";

// After
if (type === "MUST_HAVE") return "Required";
if (type === "NICE_TO_HAVE") return "Plus";
if (type === "SOFT_SKILL") return "Soft Skill";
```

### 2. `apps/web/src/modules/applications/details/components/TypeBadge.tsx`

**Linhas 14-15** — mapa de bg:

```ts
// Before
type === "must_have" && "bg-bg-info-subtle",
type === "nice_to_have" && "bg-bg-success-subtle",

// After
type === "MUST_HAVE" && "bg-bg-info-subtle",
type === "NICE_TO_HAVE" && "bg-bg-success-subtle",
```

**Linha 19:**

```ts
// Before
type === "nice_to_have" && (...)
// After
type === "NICE_TO_HAVE" && (...)
```

**Linhas 28-30** — mapa de text color:

```ts
// Before
type === "must_have" && "text-blue-600",
type === "nice_to_have" && "text-green-600",
type === "soft_skill" && "text-text-muted",

// After
type === "MUST_HAVE" && "text-blue-600",
type === "NICE_TO_HAVE" && "text-green-600",
type === "SOFT_SKILL" && "text-text-muted",
```

### 3. `apps/web/src/modules/fit-analyses/details/components/RelevanceIcon.tsx`

**Linhas 55, 66, 77:**

```ts
// Before
if (type === "must_have") return <Star weight="fill" ... />
if (type === "nice_to_have") return <PlusCircle weight="fill" ... />
if (type === "soft_skill") return <Heart weight="fill" ... />

// After
if (type === "MUST_HAVE") return <Star weight="fill" ... />
if (type === "NICE_TO_HAVE") return <PlusCircle weight="fill" ... />
if (type === "SOFT_SKILL") return <Heart weight="fill" ... />
```

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm --filter @job-tracker/web run test
```

## Rollback

Reverter as 12 strings para lowercase.
