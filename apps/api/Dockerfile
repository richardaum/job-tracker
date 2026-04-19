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

# Use flat node_modules layout (no symlinks) so workspace .bin scripts resolve in Docker
RUN echo "node-linker=hoisted" > .npmrc

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

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

# Install production dependencies only (--ignore-scripts skips husky prepare hook)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main"]
