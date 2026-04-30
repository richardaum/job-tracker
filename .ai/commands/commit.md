# /commit

Create separate commits for this repository, logically grouped by feature and scope. Commit everything that is currently changed.

## Goal

Turn the current working tree into a clean sequence of atomic commits, where each commit represents one coherent intent (feature, fix, refactor, docs, test, generated code update, etc).

## Required behavior

1. Inspect all changed files (staged + unstaged + untracked).
2. Build a grouping plan before committing:
   - group by feature/scope, not by file type alone
   - keep generated files with the source changes that require them
3. Stage and commit each group separately.
4. Continue until there are no remaining changes.
5. Do not push unless explicitly requested.

## Safety rules

- Never use destructive history edits (`reset --hard`, force push, etc.).
- Do not amend existing commits unless explicitly requested.
- If unsure where a file belongs, include it in the smallest sensible scope and continue.
- Skip files that look like secrets (`.env`, credentials, tokens) and report them.

## Commit quality

- Prefer Conventional Commit style when possible (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Message should explain the intent and why.
- Keep commits small, reviewable, and internally consistent.

## Suggested execution flow

1. `git status --short`
2. `git diff --staged --name-only && git diff --name-only && git ls-files --others --exclude-standard`
3. Propose grouping in 1-2 lines per commit.
4. For each group:
   - `git add <paths...>`
   - `git commit -m "<type(scope): message>"`
5. Finish with:
   - `git status --short`
   - concise summary of commits created

## Command intent

When user runs `/commit`, execute this workflow immediately with minimal back-and-forth.
