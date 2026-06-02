# Documentation MDX Conventions

## Language

All documentation in this repository is written in English — including `docs/**/*.mdx`, LeanSpec under `specs/`, root and package README files, Storybook documentation, agent skills.

## Format

- Files under `docs/` are `.mdx` (required for Storybook integration)
- LeanSpec specs are `.md` (under `specs/`)

## No `---` before headings

Do not place a thematic break (`---`) directly above any Markdown heading. Use blank lines only.

## Uppercase stems

Files named `*.md` / `*.mdx` must use uppercase ASCII basenames (e.g. `README.md`, `PROJECT.mdx`, `COSTS.mdx`). Exceptions:
- Slash-command sources under `.ai/commands/` use lowercase
- Generated `docs/specs/<NNN-slug>.mdx` mirror the lowercase kebab-case folder name
