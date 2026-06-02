# Service Layer

## Responsibility

Business flow, transactions, orchestration. Does NOT own raw SQL, resolver DTO mapping, or GraphQL concerns.

## Pattern

```ts
@Injectable()
export class XxxService {
  private readonly logger = new Logger(XxxService.name);

  constructor(
    @InjectRepository(SomeEntity)
    private readonly someRepo: Repository<SomeEntity>,
    private readonly repo: XxxRepository,
    private readonly otherService: OtherService,
    private readonly eventBus: XxxEventBus,
  ) {}
}
```

| Aspect | Convention |
|---|---|
| Injection | `@InjectRepository()` for TypeORM entities; constructor for custom repos/services. `forwardRef()` for circular deps. |
| Flow | Validate input, delegate to repos, emit events. No raw SQL. |
| Transactions | `this.repo.manager.transaction(async (em) => { ... })` for atomic multi-table writes. |
| Errors | `BadRequestException`, `NotFoundException`. Never let raw DB errors escape. |
| Async safety | `tryRun()` from `@job-tracker/try-run` for fire-and-forget calls. |
| DTOs | Local `type CreateDto = { ... }` — plain objects, not GraphQL inputs. |
| Startup recovery | `OnModuleInit` to reset stale `PROCESSING` records to `FAILED`. |
| Events | Emit `DomainEvent` subclasses via `this.eventBus.emit(...)` after mutations. |

## Service does NOT

- Run raw SQL queries (delegate to repository)
- Map to GraphQL types (that is the resolver's job)
- Access `@CurrentUser` or HTTP context
- Import from `type-graphql` or `@nestjs/graphql`

## SOLID

See `solid.md` for the full reference.

- **SRP** — owns business flow, orchestration, and transactions; does not write raw SQL or map GraphQL DTOs
- **OCP** — extend via new service methods or strategy classes, not by adding flags that branch inside existing methods
- **ISP** — each public method serves a specific use case; avoid mega-methods that conditionally skip steps
- **DIP** — depends on repository interfaces, other service abstractions, and `EventBus` — never on resolvers or GraphQL types

## Canonical references

- `apps/api/src/domains/jobs/jobs.service.ts` — complex orchestration
- `apps/api/src/domains/users/users.service.ts` — simpler CRUD + transaction
- `apps/api/src/domains/match-analysis/match-analysis.service.ts` — background processing + stale recovery
