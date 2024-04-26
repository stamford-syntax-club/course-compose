FROM --platform=linux/amd64 node:20.9.0-alpine AS base

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"

RUN npm i -g pnpm@8.9.0 

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# -------------------------------------------------
FROM base AS pruner 
WORKDIR /app
RUN pnpm install -g turbo 
COPY . .
RUN turbo prune --scope=web --docker

# -------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json .
COPY pnpm-lock.yaml .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full .
COPY turbo.json .
RUN pnpm turbo run build --filter=web...

# -------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder /app/apps/web/next.config.js .
COPY --from=builder /app/apps/web/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/web/server.js"]
