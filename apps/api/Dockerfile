# ---- Stage 1: builder ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

# Copy workspace manifests and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./

# Copy app and packages manifests (needed for workspace dependency resolution)
COPY apps/api/package.json ./apps/api/package.json
COPY packages/ ./packages/

# Install only deps needed by the API and its workspace dependencies
RUN pnpm --filter @job-tracker/api... install --frozen-lockfile

# Copy app source
COPY apps/api/ ./apps/api/

# Build workspace packages to CJS (compile dist/ but keep original package.json for the API build)
RUN pnpm --filter @job-tracker/html-sanitize build && \
    pnpm --filter @job-tracker/logger build && \
    pnpm --filter @job-tracker/tiptap build && \
    pnpm --filter @job-tracker/try-run build

# Build (same command as local: nest build && tsc-alias)
RUN pnpm --filter @job-tracker/api build

# After the API build, point workspace packages' main/export to compiled CJS dist
RUN for pkg in html-sanitize logger tiptap try-run; do \
      node -e "const p=require('./packages/'+process.argv[1]+'/package.json');p.main='./dist/index.js';p.types='./dist/index.d.ts';delete p.type;require('fs').writeFileSync('./packages/'+process.argv[1]+'/package.json',JSON.stringify(p,null,2)+'\n')" "$pkg"; \
    done

# ---- Stage 2: production ----
FROM node:22-alpine AS production

WORKDIR /app

# Install pnpm (needed to prune/install production deps)
RUN corepack enable && corepack prepare pnpm@10.8.1 --activate

# Copy workspace manifests and lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy app manifest
COPY apps/api/package.json ./apps/api/package.json
COPY packages/ ./packages/

# Install production dependencies only for the API
RUN pnpm --filter @job-tracker/api... install --frozen-lockfile --prod --ignore-scripts

# Override workspace packages with compiled CJS output from builder
COPY --from=builder /app/packages/html-sanitize/dist ./packages/html-sanitize/dist
COPY --from=builder /app/packages/html-sanitize/package.json ./packages/html-sanitize/package.json
COPY --from=builder /app/packages/logger/dist ./packages/logger/dist
COPY --from=builder /app/packages/logger/package.json ./packages/logger/package.json
COPY --from=builder /app/packages/tiptap/dist ./packages/tiptap/dist
COPY --from=builder /app/packages/tiptap/package.json ./packages/tiptap/package.json
COPY --from=builder /app/packages/try-run/dist ./packages/try-run/dist
COPY --from=builder /app/packages/try-run/package.json ./packages/try-run/package.json

# Copy built output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy entrypoint
COPY apps/api/docker-entrypoint.sh ./apps/api/docker-entrypoint.sh
RUN chmod +x ./apps/api/docker-entrypoint.sh

WORKDIR /app/apps/api

ARG PORT=3001
EXPOSE $PORT

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
