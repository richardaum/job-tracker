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

# Compile directly with tsc — equivalent to nest build for projects without nest-cli.json
RUN /app/node_modules/.bin/tsc -p /app/apps/api/tsconfig.build.json

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
