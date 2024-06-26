# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY ./apps/ramune/package.json ./apps/ramune/bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY ./apps/ramune/package.json ./apps/ramune/bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY ./apps/ramune .

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
RUN bun run build

# copy production dependencies and source code into final image
FROM node:20.11.1-alpine AS release
WORKDIR /usr/src/app
COPY --from=install /temp/prod/node_modules ./node_modules
COPY --from=prerelease /usr/src/app/dist ./dist
COPY --from=prerelease /usr/src/app/package.json ./

ENV NODE_ENV=production

# run the app
CMD ["node", "./dist/index.js"]
