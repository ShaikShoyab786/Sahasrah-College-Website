# Sahasara Junior College

A connected public college website and protected admin dashboard for managing the institution's identity and homepage hero.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/sahasara-college run dev` — run the public website and admin dashboard
- `pnpm --filter @workspace/api-server run prisma:generate` — generate the Prisma client
- `pnpm --filter @workspace/api-server run db:push` — apply the Prisma schema in development
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`
- Optional env: `UPLOAD_DIR` (defaults to `./uploads`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Prisma ORM for the Sahasara application
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/sahasara-college/` — React/Vite public website and admin dashboard
- `artifacts/api-server/` — Express API, authentication, uploads, and Prisma schema
- `lib/api-spec/openapi.yaml` — source of truth for API contracts and generated clients
- `artifacts/api-server/prisma/schema.prisma` — application data model

## Architecture decisions

- Public content uses singleton `SiteSettings` and `HomepageHero` records for the first vertical slice.
- Admin authentication uses opaque, hashed database sessions in an HTTP-only cookie.
- Uploaded images are stored under `UPLOAD_DIR`; Docker deployments must mount that directory as a persistent volume.
- The frontend always reads editable identity and hero content from `/api`, with safe placeholders only when public reads fail.

## Product

- Responsive public homepage with dynamic college identity, calls to action, contact details, and hero content.
- Secure admin login and protected editors for site identity and homepage hero.
- Authenticated logo and hero image upload.
- Separate frontend/backend Dockerfiles plus a local/Coolify-compatible Compose stack.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run OpenAPI codegen after changing `lib/api-spec/openapi.yaml`.
- Run Prisma generate after changing `schema.prisma`, then apply `db:push` in development.
- Do not remove the persistent upload volume in Docker/Coolify or uploaded branding images will be lost.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
