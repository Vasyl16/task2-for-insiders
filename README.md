# Mini Marketplace

A monorepo for a mini e-commerce marketplace: a NestJS API and a React
storefront/admin dashboard, sharing a single repository but deployed and
developed as independent applications.

## Project Overview

The marketplace lets shoppers register, browse products by category, manage
a cart, and check out, while admins manage the product catalog, categories,
and order lifecycle. The backend exposes a REST API secured with JWT
access/refresh tokens; the frontend consumes it as a decoupled SPA.
Checkout is processed asynchronously via a Redis-backed BullMQ queue, which
decrements stock and sends an order receipt email (via Resend) once
processing completes.

## Tech Stack

**Backend** (`backend/`)
- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- Redis (caching) + BullMQ (async order processing)
- JWT access/refresh authentication, role-based guards
- Resend (transactional email — order receipts)
- Swagger/OpenAPI, Helmet, class-validator, rate limiting
- Jest (unit + e2e)
- Docker

**Frontend** (`frontend/`)
- React + TypeScript + Vite
- Feature-Sliced Design (FSD) architecture
- React Router, TanStack Query, Axios
- React Hook Form + Zod
- Tailwind CSS
- Vitest + Testing Library
- Storybook

## Folder Structure

```
/
├── backend/                 NestJS API
│   ├── src/
│   │   ├── common/          decorators, dto, exceptions, filters, guards, pipes, utils (cross-cutting)
│   │   ├── config/          typed configuration + env validation
│   │   └── modules/
│   │       ├── auth/ users/ products/ categories/ cart/ orders/ analytics/ email/   (feature modules)
│   │       └── database/ redis/ bull/ health/                                       (infrastructure modules)
│   ├── prisma/                schema.prisma + migrations (User, Product, Category, Cart, CartItem, Order, OrderItem, OrderStatusHistory, RefreshToken)
│   ├── test/                  e2e tests (Jest)
│   ├── scripts/                operational scripts (e.g. seed-products.ts)
│   ├── .claude/ CLAUDE.md     backend-specific conventions
│   └── Dockerfile
│
├── frontend/                 React SPA
│   ├── src/
│   │   ├── app/               providers, routes, global styles, composition root
│   │   ├── pages/              home, product, cart, checkout, orders, profile, login, register, admin/*, not-found
│   │   ├── widgets/             layouts (MainLayout, AdminLayout)
│   │   ├── features/             auth, add-to-cart, manage-cart-item, checkout, catalog-search,
│   │   │                          manage-products, manage-categories, manage-order-status,
│   │   │                          update-profile, change-password, export-sales-csv
│   │   ├── entities/             product, category, cart, order, user, session, analytics
│   │   └── shared/                api, config, hooks, lib, types, ui, utils
│   ├── .storybook/
│   ├── .claude/ CLAUDE.md       frontend-specific conventions
│   └── Dockerfile
│
├── .github/workflows/ci.yml  backend Jest (unit + e2e) against ephemeral Postgres/Redis service containers
├── docker-compose.yml        postgres + redis + migrate + backend + frontend
└── .gitignore
```

## How to Run

### Prerequisites
- Node.js 20+
- Docker (for Postgres/Redis, or the full stack)

### Local development (apps run natively, infra in Docker)

```bash
# 1. Start Postgres + Redis (Postgres is exposed on localhost:5433 by default)
docker compose up -d postgres redis

# 2. Backend
cd backend
cp .env.example .env
# Point DATABASE_URL at the Docker Postgres above:
# DATABASE_URL=postgresql://marketplace:marketplace@localhost:5433/marketplace?schema=public
npm install
npm run prisma:generate
npm run prisma:migrate      # applies migrations in backend/prisma/migrations
npm run start:dev           # http://localhost:3000/api — Swagger at /api/docs

# 3. Frontend (separate terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

### Full stack via Docker Compose

```bash
docker compose up --build
```

Backend: http://localhost:3000/api — Frontend: http://localhost:5173

Compose ships with sensible defaults and does not require `backend/.env`.
The `migrate` service runs `prisma migrate deploy` before `backend` starts.
Postgres is published on port **5433** by default to avoid conflicts with a
local PostgreSQL install on 5432. Override ports via `.env` (see `.env.example`).

### Tests

```bash
# Backend — unit + e2e (Jest)
cd backend
npm test           # unit
npm run test:e2e   # e2e, needs Postgres + Redis reachable (see .env)

# Frontend — unit (Vitest)
cd frontend
npm test
```

CI (`.github/workflows/ci.yml`) runs the backend Jest suite against
ephemeral Postgres/Redis service containers on every push/PR to `main`.

## Implemented Features

- **Auth** — register/login, JWT access tokens + httpOnly-cookie refresh
  tokens with rotation, role-based guards (`RolesGuard`/`@Roles`).
- **Users** — profile view/update, password change.
- **Categories** — CRUD, admin-only mutations.
- **Products** — CRUD, listing/search/filtering/pagination, soft
  delete/restore, Redis-cached reads, admin-only mutations.
- **Cart** — add/update/remove items, persisted per user, stock validation.
- **Orders** — checkout, order status lifecycle + history, async
  post-checkout processing via BullMQ (stock decrement, Resend receipt
  email).
- **Analytics** — admin dashboard reporting, CSV sales export.
- **Frontend** — storefront (browse/search/cart/checkout/order history) and
  an admin dashboard (products/categories/orders/analytics) built on the
  above APIs, following the FSD layering in
  [`frontend/CLAUDE.md`](frontend/CLAUDE.md).

Conventions for extending either app are documented in
[`backend/CLAUDE.md`](backend/CLAUDE.md) and
[`frontend/CLAUDE.md`](frontend/CLAUDE.md).
