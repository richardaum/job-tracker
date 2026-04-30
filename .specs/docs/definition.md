# Definition

Rules that apply only to files and workflows under `.specs/`.

## Naming

- Keep Beta1 records under `.specs/beta1/*` and use `.specs/*` root exclusively for active Beta2 planning and execution.
- Use lowercase kebab-case for scope filenames under `.specs/product` and `.specs/technical`.
- Keep one atomic outcome per scope file and avoid mixing business outcomes with implementation details.
- Keep terminology consistent across product, technical, and roadmap docs to preserve traceability.
- Write all `.specs` documentation in English.

## Process

- Use deterministic SDD update order: structure, templates, IDs, scoped writes, state update, then prepend history.
- Prioritize Beta2 sequence by business value and implementation dependency before marking any scope as active.
- Mark tasks done only after artifact existence, behavior checks, and gate command verification all pass.
- Record meaningful technical lessons in specs documentation when they affect future implementation choices.
- Treat memory gotchas as reusable constraints for tests, ports, and UI interaction reliability.
