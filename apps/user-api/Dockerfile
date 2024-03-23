# ---- Build Stage ----
FROM node:alpine AS builder

WORKDIR /app

COPY ./apps/user-api/ .

COPY ./packages/prisma/schema.prisma .

RUN npm i -g pnpm && pnpm i

ARG DATABASE_URL
ARG PRISMA_PROVIDER
ARG PRISMA_OUTPUT

ENV DATABASE_URL $DATABASE_URL
ENV PRISMA_PROVIDER prisma-client-js 
ENV PRISMA_OUTPUT ./.prisma/client

RUN pnpm prisma generate --schema=schema.prisma 

RUN pnpm run build 

# ---- Production Stage ----
FROM node:alpine

WORKDIR /app

# Setting environment variable to production
ENV NODE_ENV=production

# Copy only the built code and package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.prisma/client ./.prisma/client
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm i --omit=dev 

EXPOSE 8004

CMD ["npm", "start"]
