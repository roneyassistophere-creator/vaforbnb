# syntax=docker/dockerfile:1
# --------------------------------------------------------------------------
# VA for BnB: one Dockerfile, four targets
#   dev      → `next dev` with hot reload (source is bind-mounted by compose)
#   migrate  → applies database migrations with drizzle-kit, then exits
#   builder  → `next build` (standalone output)
#   runner   → small production image that runs the standalone server
# --------------------------------------------------------------------------

FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies once, reused by every other stage.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Development ----------------------------------------------------------
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

# ---- Database migrations --------------------------------------------------
FROM base AS migrate
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY scripts ./scripts
COPY src/db ./src/db
COPY src/data ./src/data
COPY src/lib/tools ./src/lib/tools
# Apply migrations, then add any seed rows that don't exist yet.
CMD ["sh", "-c", "npx drizzle-kit migrate && npx tsx scripts/seed.ts"]

# ---- Production build -----------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN npm run build

# ---- Production runtime ---------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
