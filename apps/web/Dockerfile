FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ── Install + build ───────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY . .
# node-linker=hoisted makes pnpm create flat node_modules (no symlinks)
# so Next.js standalone file tracer can correctly bundle all dependencies
RUN echo "node-linker=hoisted" >> .npmrc
RUN pnpm install --no-frozen-lockfile
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
# NEXT_PUBLIC_MAPBOX_TOKEN is written to apps/web/.env.production.local on the server
# by the deploy workflow (from the MAPBOX_TOKEN GitHub secret) before docker build runs.
RUN pnpm --filter web db:generate
RUN pnpm --filter web build

# ── Production image ──────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public            ./apps/web/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
