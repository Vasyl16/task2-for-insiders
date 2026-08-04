# backend/CLAUDE.md

Guidance for anyone (human or AI) implementing features in this NestJS
backend. This is a bootstrap-only codebase: modules exist as empty shells.
Follow these conventions as business logic is added incrementally.

## Architecture Principles

- **Modular monolith.** Each domain (`auth`, `users`, `products`,
  `categories`, `cart`, `orders`, `analytics`) is a self-contained Nest
  module under `src/modules/`. Modules communicate through exported
  services, never by reaching into another module's internals.
- **Clean Architecture layering inside each module:**
  - `*.controller.ts` — HTTP boundary only. Parses/validates input (via
    DTOs + pipes), delegates to a service, shapes the response. No business
    rules here.
  - `*.service.ts` — application/business logic. Orchestrates repositories,
    other services, queues, cache. This is where use cases live.
  - Data access — go through Prisma (`PrismaService`, injected from
    `modules/database`) or a dedicated repository if a module's persistence
    logic grows complex enough to warrant one (see Repository Pattern below).
- **Infrastructure is isolated.** `modules/database`, `modules/redis`,
  `modules/bull`, `modules/health` are infrastructure-only — they expose
  clients/services but never contain business rules.
- **Cross-cutting concerns live in `common/`**, not inside feature modules:
  decorators, DTOs, enums, exceptions, filters, guards, interceptors,
  interfaces, pipes, utils, constants. If something is reusable across two
  or more feature modules, it belongs in `common/`.
- **Configuration is centralized** in `config/` (`configuration.ts` for the
  typed config object, `validation.ts` for the Joi schema, `env/` for typed
  env interfaces). Never read `process.env` directly outside of `config/` —
  always inject `ConfigService`.

## Module Boundaries

- A feature module may only import another feature module's exports (its
  `*.module.ts` `exports` array), never a private provider.
- Infrastructure modules (`database`, `redis`, `bull`) are marked `@Global()`
  so their services are available everywhere without explicit imports —
  don't re-export them from feature modules.
- New modules go in `src/modules/<name>/` and must follow the same shape:
  `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, and an
  `index.ts` barrel. Add a `dto/`, `repositories/`, or `entities/`
  subfolder only when the module actually needs one — don't pre-create
  empty subfolders.

## NestJS Conventions

- One class per file, file name matches class name in kebab-case
  (`products.service.ts` → `ProductsService`).
- Controllers stay thin: no `try/catch`, no direct Prisma calls, no
  business conditionals. If a controller method needs more than a few
  lines, that logic belongs in the service.
- Use constructor-based dependency injection exclusively — no property
  injection, no service locators, no manual `new`.
- Prefer `async/await` over raw Promise chains.
- Tag every controller with `@ApiTags()` and document endpoints with
  `@ApiOperation`/`@ApiResponse` as they're implemented (Swagger is already
  bootstrapped at `/api/docs`).

## Dependency Injection Rules

- Depend on abstractions (injection tokens / interfaces) when a provider
  could reasonably have more than one implementation (e.g. a cache client);
  depend on the concrete class when there's only ever one implementation
  (e.g. a module's own service).
- Shared infrastructure (`PrismaService`, `RedisService`, BullMQ
  connection) is injected via the global infrastructure modules — don't
  instantiate clients ad hoc inside a feature module.
- Keep constructors small. If a service needs more than ~4-5 injected
  dependencies, it's a sign the service is doing too much and should be
  split.

## DTO Rules

- Every controller input (body, query, params) gets an explicit DTO class
  in a `dto/` subfolder of the owning module — no inline object literals,
  no `any`.
- Separate DTOs by direction and purpose: `create-x.dto.ts`,
  `update-x.dto.ts` (typically `PartialType(CreateXDto)`), `x-query.dto.ts`
  for pagination/filtering. Don't reuse a create DTO as an update DTO.
- Response shapes that need transformation get their own DTO/serializer
  class using `class-transformer` (`@Expose`/`@Exclude`) rather than
  leaking Prisma models straight out of the controller.
- Shared, cross-module DTOs (e.g. a generic pagination query) go in
  `common/dto/`.

## Validation Rules

- All validation happens via `class-validator` decorators on DTOs. The
  global `ValidationPipe` (configured in `main.ts`) has `whitelist: true`,
  `forbidNonWhitelisted: true`, and `transform: true` — unknown fields are
  rejected, not silently dropped.
- Environment variables are validated once, at startup, via the Joi schema
  in `config/validation.ts`. If a feature needs a new env var, add it to
  `.env.example`, the relevant `config/env/*.env.ts` interface,
  `configuration.ts`, and `validation.ts` together.
- Never validate the same input twice in two different layers — validation
  belongs at the DTO/pipe boundary, not re-checked in the service.

## Error Handling Conventions

- Throw Nest's built-in HTTP exceptions (`NotFoundException`,
  `BadRequestException`, `ConflictException`, etc.) from services for
  expected failure cases — don't return sentinel values like `null` or
  `false` for "not found".
- Domain-specific exceptions (e.g. `InsufficientStockException`) live in
  `common/exceptions/` and should extend an appropriate `HttpException`
  subclass so they're caught consistently.
- The `GlobalExceptionFilter` (`common/filters/http-exception.filter.ts`) is
  the single place response shape/logging for uncaught exceptions is
  decided — don't add per-controller try/catch blocks that swallow or
  reshape errors; let them propagate to the filter.
- Never expose internal error details (stack traces, driver errors) in API
  responses outside of local development.

## Repository Pattern Expectations

- Simple modules may call `PrismaService` directly from their service
  class — this is fine as long as query logic stays simple and contained.
- Introduce a dedicated repository class (`<name>.repository.ts`) once a
  module's data-access logic involves non-trivial query composition,
  multiple call sites, or needs to be mocked heavily in unit tests. The
  repository is injected into the service; the service never imports
  `PrismaService` directly once a repository exists for that module.
- Repositories return domain-shaped data (or Prisma types), never
  Express/Nest-specific objects. Controllers never touch a repository
  directly.

## Naming Conventions

- Files: kebab-case, suffixed by role (`.module.ts`, `.controller.ts`,
  `.service.ts`, `.dto.ts`, `.guard.ts`, `.filter.ts`, `.interceptor.ts`,
  `.repository.ts`, `.entity.ts`).
- Classes: PascalCase matching the file's role
  (`CreateProductDto`, `ProductsRepository`, `JwtAuthGuard`).
- Injection tokens for non-class providers: `SCREAMING_SNAKE_CASE` (see
  `REDIS_CLIENT` in `modules/redis/redis.constants.ts` as the pattern).
- Route paths: plural, kebab-case, resource-oriented (`/products`,
  `/products/:id/reviews`).

## Barrel Exports

- Each module and each `common/` subfolder exposes an `index.ts` barrel.
  Import from the barrel (`from '../products'`) rather than reaching into
  a specific file (`from '../products/products.service'`) when consuming
  across module boundaries.
