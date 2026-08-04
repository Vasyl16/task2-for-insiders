# frontend/CLAUDE.md

Guidance for anyone (human or AI) implementing features in this React
frontend. This is a bootstrap-only codebase: pages are empty stubs and
`features/`/`entities/` are unpopulated. Follow these conventions as UI is
added incrementally.

## Feature-Sliced Design (FSD) Rules

Layers, top to bottom, each may only import from layers **below** it:

```
app        — providers, routing, global styles, composition root
pages      — route-level components; compose widgets/features/entities
widgets    — large, self-contained UI blocks (layouts, headers, sidebars)
features   — user interactions (add-to-cart, login-form, filter-products)
entities   — domain nouns (product, user, order, category)
shared     — generic, business-agnostic code (api, config, hooks, lib, types, ui, utils)
```

- **Import direction is strictly downward.** `pages` can import from
  `widgets`, `features`, `entities`, `shared`. `entities` can only import
  from `shared`. Never import "sideways" (one `feature` importing another
  `feature`, one `entity` importing another `entity`) — if two slices need
  to share something, lift it to `shared` or compose them at a higher
  layer (`widgets`/`pages`).
- **Every slice exposes a public API via `index.ts`.** Import
  `from '@/entities/product'`, never
  `from '@/entities/product/model/use-product'`. Only what's exported from
  the barrel is part of the slice's contract.
- Segments within a slice follow `ui/`, `model/`, `api/`, `lib/` — don't
  invent new segment names; if something doesn't fit, it likely belongs in
  `shared/` instead.
- `app/` is the only layer allowed to know about every other layer — it's
  the composition root (providers, router, global styles).

## Folder Ownership

- `shared/ui` — dumb, reusable, business-agnostic components (Button,
  Input, Card). No API calls, no routing, no knowledge of domain entities.
- `shared/api` — the Axios instance and any generic API utilities (error
  normalization, interceptors). Entity/feature-specific request functions
  live inside their own slice's `api/` segment, built on top of this.
- `shared/hooks`, `shared/lib`, `shared/utils` — generic, cross-cutting
  helpers with zero domain knowledge. If a hook/util only makes sense for
  one entity or feature, it belongs in that slice instead.
- `widgets/layouts` — page shells (`MainLayout`, `AdminLayout`) rendered
  via `<Outlet />` from the router. Layouts own chrome (nav, sidebar,
  footer), not page content.
- `app/routes` — the single source of truth for route paths (`paths.ts`)
  and the router definition (`routes.tsx`). Don't hardcode path strings
  elsewhere.
- `app/providers` — one file per provider, composed together in
  `providers/index.tsx` as `AppProviders`.

## Component Conventions

- One component per file, named exports (not default exports), file name
  matches the component name in PascalCase (`ProductCard.tsx` →
  `ProductCard`).
- Component props are typed with an explicit `interface <Name>Props`
  directly above the component — no inline prop types for anything beyond
  one trivial primitive.
- Presentational components (in `shared/ui`, entity `ui/` segments) don't
  fetch data or read routing state — they receive everything via props.
  Data-fetching happens in `features`/`entities` `api/` hooks or in
  `pages`, and gets passed down.
- Pages stay thin: compose widgets/features/entities, don't hold business
  logic or complex local state themselves.

## React Query Conventions

- One `QueryClient` for the whole app, created once in
  `app/providers/query-provider.tsx` — never instantiate a second client.
- Query keys are defined as factories colocated with the entity/feature
  that owns them (e.g. `entities/product/model/query-keys.ts`), not as
  ad-hoc arrays scattered across components. This keeps invalidation
  consistent.
- **Mutation/query separation:** reads live in an entity's `api/` segment
  as `use-<entity>.ts` / `use-<entity>-list.ts` query hooks. Writes
  (create/update/delete) live in the owning `feature`'s `api/` segment as
  `use-<action>.ts` mutation hooks (e.g.
  `features/add-to-cart/api/use-add-to-cart.ts`), since a mutation is a
  user interaction, not a domain fact.
- Mutations invalidate the specific query keys they affect (via the entity's
  query-key factory) in `onSuccess` — avoid blanket
  `queryClient.invalidateQueries()` with no key.
- Server state (anything from the API) belongs in React Query's cache, not
  duplicated into component state or a separate store.

## State Management Guidelines

- **Server state** → TanStack Query, always. Never mirror API data into
  `useState`/context.
- **Local UI state** (form inputs before submit, toggle/open state,
  in-progress wizard step) → `useState`/`useReducer` inside the component
  or feature that owns it.
- **Cross-cutting client state** that multiple unrelated components need
  (theme, auth session) → a dedicated provider in `app/providers/`, not a
  global mutable singleton.
- **Form state** → React Hook Form, with a Zod schema for validation
  (`zodResolver`). The schema lives next to the form (feature's `model/`
  segment) and is the single source of truth for both validation and
  inferred TypeScript types.
- Don't introduce a global state library (Redux/Zustand/Jotai) preemptively
  — the combination of React Query (server state) + React Hook Form (form
  state) + local component state covers most needs. Revisit only if a
  concrete cross-cutting client-state need emerges.

## Naming Conventions

- Components/hooks/types: PascalCase for components (`ProductCard`),
  camelCase prefixed with `use` for hooks (`useAddToCart`).
- Files: match the export — `ProductCard.tsx` for components, kebab-case
  for non-component modules (`query-keys.ts`, `axios-instance.ts`).
- Route paths: defined once in `app/routes/paths.ts`, referenced by name
  everywhere else (`paths.admin.products`, not `'/admin/products'`).
- Zod schemas: `<name>Schema` (e.g. `loginSchema`), inferred types as
  `<Name>` via `z.infer<typeof loginSchema>`.

## Import Rules

- Use the `@/` alias (mapped to `src/`) for cross-layer imports; use
  relative imports only within the same slice.
- Import only from a slice's barrel (`index.ts`), never reach into an
  internal file path of another slice.
- No circular imports between slices — the FSD layer order above exists
  precisely to prevent them.
