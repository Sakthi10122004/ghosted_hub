FROM node:24-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm

# Install turbo globally
RUN npm install -g turbo

COPY . .
RUN turbo prune @ghosted/api --docker

FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable pnpm

# First install dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Then build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN pnpm turbo build --filter=@ghosted/api...

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=installer /app .

CMD ["node", "apps/api/dist/main.js"]
