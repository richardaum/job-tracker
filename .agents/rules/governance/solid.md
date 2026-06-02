# SOLID Principles

Every code change must be evaluated against SOLID. Violations accumulate technical debt — each exception is a deliberate tradeoff with a comment explaining why.

## Single Responsibility Principle (SRP)

A module should have one reason to change.

### Backend (NestJS)

| Layer | Responsibility | Does NOT own |
|-------|---------------|-------------|
| Entity | Shape + relations of a DB row | Queries, business rules |
| Repository (thin) | Read/write a table; joins for performance | Find-or-create, branching upserts, domain defaults |
| Service | Business flow, transactions, orchestration | Raw SQL, resolver DTO mapping |
| Resolver | GraphQL DTO mapping, auth guards, delegation | Business logic |
| Event | Signal something happened | Handling the consequence |

Reference: `backend/layer-repository.md`, `apps/api/src/domains/users/`.

**Examples:**

```ts
// ✓ Service delegates reads to repository
const entity = await this.repository.findById(id);

// ✓ Repository is thin — no branching logic
async findById(id: string): Promise<Entity | null> {
  return this.repo.findOne({ where: { id } });
}

// ✓ Resolver only maps DTOs and delegates
@Query(() => EntityType)
async entity(@Args("id") id: string) {
  return this.service.findById(id);
}
```

### Frontend (React)

| Unit | Responsibility | Does NOT own |
|------|---------------|-------------|
| View-model hook | Shape API data for display, loading/empty/error flags | Rendering, styling, DOM |
| Page/panel component | Layout, composition, event wiring | Data shaping, mutations inline |
| Presentational component | Render props as UI | API calls, complex state |
| Utility/helper | Pure transformation | Side effects, component imports |

**Examples:**

- Page component keeps data logic in a view-model hook: `const vm = useFeatureViewModel(id)`
- View-model hook returns only what the component renders: `{ data, loading, error }`
- View-model hook stays pure — no routing hooks, no side effects
- Each feature area in its own module, not one file

## Open/Closed Principle (OCP)

Open for extension, closed for modification.

### Backend

- Prefer event bus + subscriptions over adding fields to existing resolvers for new real-time data
- Add new resolver arguments rather than changing existing argument shapes
- Strategy pattern for variant behaviors instead of switch/if chains
- New domain entities get their own module, not bolted onto an existing one

### Frontend

- Component slots (`children`, `trailing`, slot systems) over boolean props that toggle internal branches
- Wrap third-party components behind a facade — changing the lib means changing one file, not 50
- Prefer route-driven composition over hardcoded lists with `if/else` — new items mount via route without editing the shell

**Examples:**

- New real-time data: add a subscription + event handler instead of adding fields to an existing resolver
- New variant behavior: add a strategy class instead of adding `if/else` branches
- New tab: create a route page and add a trigger — existing tabs untouched

## Liskov Substitution Principle (LSP)

Derived types must be substitutable for their base types.

### Backend

- GraphQL interface/union types: every implementation must satisfy the full contract
- TypeORM entity subclassing: child entities must not weaken parent constraints (nullable where parent is not null)
- Custom guards/interceptors must preserve the contract of the auth layer

### Frontend

- Component props extending a base type must accept all valid base values
- Slot/children APIs: a component that accepts `ReactNode` must render any valid node, not assume a specific shape
- Cache update functions must handle the full range of possible cache states

**Examples:**

- Extend base props without required extras: `type Props = BaseProps & { subtitle?: string }`
- Slot children must work with any valid `ReactNode` — test with different element types
- Cache update functions handle missing entities gracefully: guard before access

## Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use.

### Backend

- GraphQL input types: one input per mutation, not a shared mega-input with 15 optional fields used by different operations
- Repository interface: don't expose `findWithJoinsA`, `findWithJoinsB`, `findWithJoinsC` — compose in service or query builder
- Module exports: export only what other modules need, not the entire provider array

### Frontend

- Component props: split props by concern. Don't pass an entire entity to a component that only needs `title` and `status`
- View-model hook return: return only what the component renders, not the whole query result
- Avoid prop drilling: use slots or context for deeply nested data, not many props through multiple levels

**Examples:**

- Pass only the props a component needs: `<Card title={data.title} status={data.status} />` instead of the whole entity
- View-model returns a focused shape: `{ data, loading, error }` instead of the full query result
- Query fetches only fields the component renders

## Dependency Inversion Principle (DIP)

Depend on abstractions, not concretions.

### Backend

- Services depend on repository interfaces (TypeORM Repository pattern or custom interface), not on `EntityManager` directly (except in thin repo)
- Cross-module communication via `EventBus` + events, not direct service imports
- NestJS modules import other modules' exports, not their providers directly

### Frontend

- Components depend on `ReactNode` (props/children), not on specific component imports
- View-model hooks return plain objects, not query result types — consumers don't depend on external types
- Feature components depend on generated GraphQL types, not raw query documents
- Prefer a concept icon map over direct icon library imports — swap icon sets by changing the map

**Examples:**

- Import from module facade: `import { ModuleName }` instead of importing a service directly from another resolver
- Use generated hooks: `useXQuery()` instead of `useQuery(gql\`...\`)`
- Use concept map: `conceptIcon.edit` instead of a direct icon import
- View-model returns plain object: `{ data, loading, error }` instead of a query result type

## Checklist

Before submitting any PR or commit, check:

- [ ] SRP: can I name the single responsibility of each changed file in <10 words?
- [ ] OCP: if a new variant appears, how many files in my change set would need editing?
- [ ] LSP: do any type extensions in this change weaken their base contract?
- [ ] ISP: do any prop/interface groupings contain values unused by the consumer?
- [ ] DIP: am I importing a concrete implementation or an abstraction?
