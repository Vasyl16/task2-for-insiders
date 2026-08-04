# --- Base ---
FROM node:20-alpine AS base
# Prisma's query engine needs OpenSSL at runtime; Alpine doesn't ship it.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma

# --- Dependencies (dev deps included, for building) ---
# `npm ci` runs Prisma's postinstall hook, which generates the client —
# no separate `prisma generate` step needed.
FROM base AS dependencies
RUN npm ci

# --- Build ---
FROM dependencies AS build
COPY . .
RUN npm run build

# --- Production ---
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
