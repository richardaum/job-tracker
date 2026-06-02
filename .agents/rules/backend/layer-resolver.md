# Resolver Layer

## Responsibility

GraphQL DTO mapping, auth guards, delegation to services. Does NOT own business logic, raw SQL, or `@InjectRepository`.

## Pattern

```ts
@Resolver(() => XxxType)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.User)
export class XxxResolver {
  constructor(private readonly service: XxxService) {}

  @Query(() => [XxxType])
  async xxxList(@CurrentUser() user: { userId: string }): Promise<XxxType[]> {
    return this.service.findAll(user.userId);
  }

  @Mutation(() => DeleteMutationPayloadType)
  async deleteXxx(
    @Args("id", { type: () => ID }) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteMutationPayloadType> {
    await this.service.remove(id, user.userId);
    return { success: true, deletedId: id };
  }
}
```

| Aspect | Convention |
|---|---|
| Guards | `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(RoleEnum.User)` on **every** resolver class. |
| Auth | `@CurrentUser()` extracts `{ userId: string }`. Pass to service in every query/mutation. |
| Delegation | One-line delegation to service — no branching, no business logic. |
| No repos | Never inject `Repository` or `@InjectRepository` in resolvers. |
| Delete mutations | Return `DeleteMutationPayloadType` — `{ success: true, deletedId: id }`. |
| Input types | Separate `@InputType()` class per mutation — not reused from service DTOs. |

## ResolveField

Use a separate resolver class for cross-type field resolution:

```ts
@Resolver(() => XxxType)
export class YyyOnXxxResolver {
  constructor(private readonly service: YyyService) {}

  @ResolveField(() => YyyType, { nullable: true })
  async yyy(@Parent() xxx: XxxType, @CurrentUser() user: { userId: string }) {
    return this.service.findForXxx(xxx.id, user.userId);
  }
}
```

## SOLID

See `solid.md` for the full reference.

- **SRP** — maps DTOs, applies guards, delegates to service; contains zero business logic
- **OCP** — add new resolver arguments instead of changing existing argument shapes; new behaviors get new resolvers
- **ISP** — one input type per mutation, not a shared mega-input used by different operations
- **DIP** — depends on service abstractions; never injects repositories or EntityManager directly

## Canonical references

- `apps/api/src/domains/jobs/jobs.resolver.ts` — queries, mutations, guards, delegation
- `apps/api/src/domains/match-analysis/match-analysis.resolver.ts` — `@ResolveField` cross-type resolution
- `apps/api/src/domains/jobs/jobs-events.resolver.ts` — `@Subscription()` (see `subscription-layer.md`)
