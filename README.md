# Mini Marketplace

A monorepo bootstrap for a mini e-commerce marketplace: a NestJS API and a
React storefront/admin dashboard, sharing a single repository but deployed
and developed as independent applications.

> **Status:** architecture bootstrap only. No business logic, no database
> schema, no auth implementation, no API endpoints, no UI — see
> [Future Implementation Plan](#future-implementation-plan).

## Project Overview

The marketplace lets shoppers browse products by category, manage a cart,
and check out, while admins manage the product catalog, categories, and
orders. The backend exposes a REST API secured with JWT; the frontend
consumes it as a decoupled SPA. Background jobs (e.g. order processing,
notifications) run through a Redis-backed queue.

## Tech Stack

**Backend** (`backend/`)
- NestJS + TypeScript
- Prisma ORM + PostgreSQL
- Redis + BullMQ (background jobs/queues)
- JWT authentication
- Swagger/OpenAPI, Helmet, class-validator, rate limiting
- Docker

**Frontend** (`frontend/`)
- React + TypeScript + Vite
- Feature-Sliced Design (FSD) architecture
- React Router, TanStack Query, Axios
- React Hook Form + Zod
- Tailwind CSS
- Storybook

## Folder Structure

```
/
├── backend/                 NestJS API
│   ├── src/
│   │   ├── common/          decorators, dto, filters, guards, pipes, ... (cross-cutting)
│   │   ├── config/          typed configuration + env validation
│   │   └── modules/
│   │       ├── auth/ users/ products/ categories/ cart/ orders/ analytics/   (feature modules)
│   │       └── database/ redis/ bull/ health/                                (infrastructure modules)
│   ├── prisma/               schema.prisma (no models yet)
│   ├── test/                 e2e tests
│   ├── scripts/               operational scripts
│   ├── .claude/ CLAUDE.md    backend-specific conventions
│   └── Dockerfile
│
├── frontend/                 React SPA
│   ├── src/
│   │   ├── app/              providers, routes, global styles, composition root
│   │   ├── pages/             route-level components (Home, Product, Cart, Checkout, Profile, Admin*, 404)
│   │   ├── widgets/            layouts (MainLayout, AdminLayout)
│   │   ├── features/            user-interaction slices (empty — added incrementally)
│   │   ├── entities/            domain-noun slices (empty — added incrementally)
│   │   └── shared/               api, config, hooks, lib, types, ui, utils
│   ├── .storybook/
│   ├── .claude/ CLAUDE.md      frontend-specific conventions
│   └── Dockerfile
│
├── docker-compose.yml        postgres + redis + backend + frontend
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
# When using the Docker Postgres above, set in .env:
# DATABASE_URL=postgresql://marketplace:marketplace@localhost:5433/marketplace?schema=public
npm install
npm run prisma:generate
npm run start:dev          # http://localhost:3000/api — Swagger at /api/docs

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
Postgres is published on port **5433** by default to avoid conflicts with a
local PostgreSQL install on 5432. Override ports via `.env` (see `.env.example`).

## Future Implementation Plan

This bootstrap intentionally contains no business logic. Planned
implementation order:

1. **Database schema** — define Prisma models (User, Product, Category,
   Cart, Order, ...) and initial migration.
2. **Auth** — JWT access/refresh flow, guards, roles.
3. **Users** — profile management.
4. **Categories** — CRUD, admin-only mutations.
5. **Products** — CRUD, listing/search/filtering, admin-only mutations.
6. **Cart** — add/remove/update items, persisted per user.
7. **Orders** — checkout flow, order status lifecycle, BullMQ jobs for
   post-checkout processing.
8. **Analytics** — basic marketplace/admin reporting.
9. **Frontend UI** — implement pages/features/entities/widgets on top of
   the corresponding backend features, in the same order.

Each step follows the conventions documented in
[`backend/CLAUDE.md`](backend/CLAUDE.md) and
[`frontend/CLAUDE.md`](frontend/CLAUDE.md).
