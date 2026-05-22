# T-285: Create `RoleEnum`

**Status:** pending · **Phase:** 4 · **Priority:** medium · **Dependencies:** none

## Context

`UserEntity.role` usa `@Column({ type: "enum", enum: ["user"], enumName: "role" })` — o PG já tem o enum type `role`, mas o TS usa union literal `"user"`. Substituir por `RoleEnum` formal.

## Steps

### Step 1 — Criar arquivo do enum

Criar `apps/api/src/domains/users/role.enum.ts`:

```ts
export enum RoleEnum {
  USER = "user",
}
```

Nota: sem `registerEnumType` (não exposto no GraphQL diretamente — role é interno de auth).

### Step 2 — Atualizar entity

`apps/api/src/database/entities/user.entity.ts:28-29`:

```ts
// Before
@Column({ type: "enum", enum: ["user"], enumName: "role", default: "user" })
role!: "user";

// After
@Column({ type: "enum", enum: RoleEnum, enumName: "role", default: RoleEnum.USER })
role!: RoleEnum;
```

Adicionar import.

### Step 3 — Atualizar middleware

`apps/api/src/graphql/graphql-sse.middleware.ts:41`:

```ts
// Before
if (!dbUser || dbUser.role !== "user")

// After
if (!dbUser || dbUser.role !== RoleEnum.USER)
```

### Step 4 — Atualizar repository

`apps/api/src/domains/users/users.repository.ts:60`:

```ts
// Before
role: "user";

// After
role: RoleEnum.USER;
```

### Step 5 — Atualizar spec files (API)

Arquivos com `role: "user"`:

- `apps/api/src/domains/users/users.service.spec.ts:13`
- `apps/api/src/domains/users/users.repository.spec.ts:43`
- `apps/api/src/domains/auth/roles.guard.spec.ts:28,31,42`
- `apps/api/src/domains/auth/auth.service.spec.ts:16`
- `apps/api/src/domains/auth/auth.resolver.spec.ts:25`
- `apps/api/src/domains/auth/auth.controller.spec.ts:23`
- `apps/api/src/domains/applications/applications.repository.spec.ts:36,120`
- `apps/api/src/domains/sources/sources.repository.spec.ts:32`
- `apps/api/src/domains/notes/notes.repository.spec.ts:33`

Substituir `"user"` por `RoleEnum.USER`.

### Step 6 — Atualizar web/e2e specs

- `apps/web/src/hooks/useCurrentUser.test.ts:27`: `role: RoleEnum.USER`
- `apps/web/e2e/applications.spec.ts:17`: `role: "USER"` (string em mock de API)

### Step 7 — `@Roles("user")` nos resolvers

11 resolvers usam `@Roles("user")`. O guard NestJS compara strings — manter `"user"` (não trocar por `RoleEnum.USER` a menos que o guard aceite enum). Verificar implementação de `RolesGuard`.

Recomendação: se `RolesGuard` compara `user.role === requiredRole` e `user.role` agora é `RoleEnum.USER`, então `@Roles(RoleEnum.USER)` seria o correto. Verificar antes de alterar.

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Nota

`RoleEnum` não é registrado no GraphQL — role é interno de autorização, não exposto na API pública.
