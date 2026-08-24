# Radiant Smile Dental Clinic — Dental Clinic Management System

A full-stack dental clinic management system for patient records, appointments, billing, and inventory.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/dental-clinic run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + shadcn/ui + wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB tables: patients, appointments, bills, inventory
- `artifacts/api-server/src/routes/` — API route handlers (patients, appointments, billing, inventory, dashboard)
- `artifacts/api-server/src/routes/helpers.ts` — shared response serializers
- `artifacts/dental-clinic/src/pages/` — frontend pages per domain
- `artifacts/dental-clinic/src/index.css` — design tokens (ocean blue primary palette)

## Architecture decisions

- OpenAPI-first: all contracts live in `lib/api-spec/openapi.yaml`; never hand-write types that codegen produces
- Date fields (`dateOfBirth`, `appointmentDate`, `dueDate`) use Drizzle `date({ mode: "string" })` columns and need explicit `.toISOString().slice(0,10)` coercion from Zod-parsed `Date` objects before DB inserts
- `bills.items` and `bills.totalAmount` stored as JSONB and numeric strings respectively; always cast back with `Number()` in response helpers
- Dashboard summary endpoint aggregates all stats in a single `Promise.all` for performance
- Circular import avoided by centralizing all DB response mappers in `artifacts/api-server/src/routes/helpers.ts`

## Product

- **Dashboard** — today's appointments, patient count, revenue summary, low-stock alerts
- **Patients** — searchable patient records with insurance info, history tabs (appointments + bills)
- **Appointments** — schedule management with date/status filters, dentist assignment, procedure types
- **Billing** — invoice tracking with line items, payment recording, overdue flagging
- **Inventory** — supply management with category filters and low-stock alerts

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, always run `pnpm --filter @workspace/api-spec run codegen` AND `pnpm run typecheck:libs` before touching server routes
- Zod schemas generated from `format: date` OpenAPI fields produce `Date` objects — convert to string before Drizzle inserts
- `pnpm --filter @workspace/db run push-force` if push fails with column conflicts

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
