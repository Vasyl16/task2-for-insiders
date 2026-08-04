# --- Base ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma

# --- Dependencies (dev deps included, for building) ---
# `npm ci` runs Prisma's postinstall hook, which generates the client.
# Do not call `prisma generate` explicitly here: the CLI refuses to run
# while the schema has zero models, which is expected pre-domain-model.
FROM base AS dependencies
RUN npm ci

# --- Build ---
FROM dependencies AS build
COPY . .
RUN npm run build

# --- Production ---
FROM node:20-alpine AS production
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
