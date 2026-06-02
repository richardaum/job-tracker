# Repository Layer

## Thin repositories

A thin repository only translates read/write operations to the database: `find`, `save`, `insert`, `update`, optimized queries (joins instead of N+1), and methods that accept an optional `EntityManager` for transactional composition. It does not own business flow — no find-or-create, branching upserts, domain defaults (role, UUID), provider/use-case wrappers (`findByGoogleId`), or business invariants/exceptions. The service orchestrates "already exists? update : create", opens transactions, and turns `null` into domain errors. Quick rule: if the method describes *what to do* with data, it belongs in the service; if it describes *how to read/write a table*, it belongs in the repository.

Reference: `apps/api/src/domains/users/users.repository.ts` + `users.service.ts`, `apps/api/src/domains/jobs/jobs.repository.ts` (`EntityManager?` on write helpers).

## SOLID

See `solid.md` for the full reference.

- **SRP** — read/write a table; owns neither business flow nor domain defaults
- **OCP** — extend with new repository methods, not by adding parameters that branch internally
- **ISP** — expose focused finder methods or accept query builder composition instead of one mega-method with optional joins
- **DIP** — depend on TypeORM `Repository<T>` or a custom interface, never on concrete connection details
