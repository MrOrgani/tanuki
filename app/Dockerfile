# Install dependencies only when needed
FROM node:16-bullseye-slim as deps
RUN apt-get update
# Required for prisma to be happy when generating types from schema
RUN apt-get install -y openssl

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:16-bullseye-slim  AS builder
RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM node:16-bullseye-slim  AS runner
WORKDIR /app

ENV NODE_ENV production
ENV APP_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder ./app ./

# Resolves write access issue with next Image component
RUN mkdir -p build/cache/images && chown nextjs:nodejs build/cache/images     

USER nextjs

EXPOSE 3000

CMD ["node", "build/server.js"]