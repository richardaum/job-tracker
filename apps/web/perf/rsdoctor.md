# Rsdoctor (dev compile)

1. Run in a separate worktree: `pnpm perf:rsdoctor:dev`
2. Visit slow routes once (cold) and then again (warm).
3. Open reports in `apps/web/.rsdoctor/`.
4. Prioritize hotspots in `loaders`, `plugins`, and slow modules.

Acceptable metrics:

- `warm`: target `<=1500ms`, acceptable `<=2000ms`, critical `>2500ms`
- `cold`: target `<=3500ms`, acceptable `<=5000ms`, critical `>6500ms`
