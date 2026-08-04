# --- Base ---
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma

# --- Dependencies ---
FROM base AS dependencies
RUN npm ci
RUN npx prisma generate

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
RUN npm ci --omit=dev
RUN npx prisma generate
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
