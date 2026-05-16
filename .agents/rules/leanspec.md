# LeanSpec (`specs/`)

Numbered folders: `specs/<NNN-slug>/` with primary `README.md`. Chronicle: `specs/HISTORY.md`. Overview: `specs/README.md`. Config: `.lean-spec/config.json`.

## Source of truth

The primary `README.md` for a numbered spec is the source of truth for what that scope commits to: requirements, outcomes, and high-level design. When implementation changes that, update the spec in the same change set.

## Structure bands

| Range | Role |
|---|---|
| `001-*` … `006-*` | Archived (`status: archived`) |
| `007-*` … `011-*` | `docs-*` governance |
| `012-*` … `026-*` | Active product and technical scopes |

## Naming

Directory slugs under `specs/`: lowercase kebab-case. One primary outcome per spec.

## Traceability IDs

Use stable bracketed IDs: `[P-NNN]` (product), `[T-NNN]` (technical), `[R-NNN]` (roadmap), `[H-NNN]` (history). Reuse the same ID across specs. Do not embed traceability tokens in executable code (except comments with explanatory phrases).

## Workflow

- Prefer `pnpm exec lean-spec` for `create`, `update`, `validate`, `board`, `rel`
- Update `docs-roadmap`, `docs-state`, `docs-history` on meaningful increments
- Run `pnpm leanspec:sync-spec-indices` after creating/editing specs or traceability IDs
- CI runs `pnpm leanspec:sync-spec-indices -- --check`
- Pre-commit: `pnpm leanspec:validate`

## Spec indices

`specs/INDEX.md` is generated (YAML frontmatter only). Do not hand-edit. Listed in `.prettierignore`.
