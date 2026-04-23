# Product Scope: typeorm-data-layer

## Objective

- [P-94] The API must keep the same observable persistence behavior for users, applications, stage events, and notes while replacing the Drizzle stack with TypeORM integrated into NestJS.

## In Scope

- [P-95] All existing authenticated flows that read or write job applications, stage history, and notes must continue to work without users changing how they use the product.
- [P-96] Local and CI database setup must remain a single documented path (`db:migrate` before `dev` or image run) with deterministic schema application on a fresh database.
- [P-97] Operators who already applied Drizzle migrations must have a documented one-time cutover so the new migration journal does not re-apply destructive DDL.

## Out of Scope

- [P-98] Changing GraphQL shapes, business rules for compensation, or stage and note semantics beyond what is required to preserve parity with the previous implementation.

## Acceptance Criteria

- [P-99] After migration, API lint, typecheck, and automated tests pass with the same coverage expectations as before the ORM swap.
- [P-100] A fresh PostgreSQL database reaches the same table and enum definitions as the previous squashed Drizzle baseline after running the new migration command once.
