# Sakwa Agro Enterprise

Record-keeping for rice buying, selling, and investor capital. Payments happen offline. The system keeps every role looking at the same books.

Two apps share one backend:

| App | Domain | Purpose |
| --- | --- | --- |
| `apps/landing` | sakwaagro.com | Public site and investor enquiry form |
| `apps/platform` | app.sakwaagro.com | Login and the seven role dashboards |

No payment is taken on the site.

## What is in this repo

- Landing page (static Next.js export)
- Platform PWA with Admin, Director, Accountant, Store, Field buyer, Investor, Customer
- Supabase schema, RLS, views, audit log, notification triggers
- Shared UI, types, validators, money helpers, email templates

Code is written. Dependencies are not installed in this pass.

## Placeholders the owner must fill

These appear on the landing page until real figures are supplied. Do not invent replacements.

- `[Phone number]`
- `[WhatsApp number in international format, digits only]`
- `[Contact email]`
- `[Office address]`
- `[Operating locations]`
- `[Years operating]`
- `[Number of bags supplied]`
- `[Number of customers served]`
- `[Number of warehouses]`
- `[Warehouse location 1]` and `[Warehouse location 2]` in `supabase/seed.sql`
- `[Directors group email]`

Set them in `.env.local` using the keys in `.env.example`.

## Pending business rules (do not guess)

Built as isolated, env-driven settings. Confirm before treating them as product truth.

1. **Investor return formula.** `RETURN_FORMULA_KIND` is `fixed_weekly_percent` or `profit_share`. `RETURN_WEEKLY_PERCENT_BPS` is the weekly percent in basis points (200 = 2%). The calculator lives in `packages/utils/src/investor-returns.ts`. Accountant can write weekly rows; those rows are not a confirmed policy.
2. **Who confirms a customer has paid.** `PAYMENT_CONFIRMED_BY_ROLE` (default `accountant`).
3. **Who marks a profit request as paid.** `WITHDRAWAL_MARKED_PAID_BY_ROLE` (default `accountant`).
4. **Who assigns a store to an order.** `ORDER_WAREHOUSE_ASSIGNED_BY` (default `warehouse`). The accountant can also set a store when saving the price.

Store staff can belong to several stores.

## Stack notes

- Next.js 16.4.3. Route protection is `apps/platform/src/proxy.ts` (Next 16 replacement for `middleware.ts`).
- TypeScript 5.9.3 (current stable; 7.x is not used).
- Tailwind CSS 4.3.3.
- pnpm 10.18.3, Turbo 2.11.10.
- Money is bigint kobo. Display is Africa/Lagos.
- Client-generated UUIDs so offline writes can retry without duplicates.

## Setup (when you are ready to install)

```bash
corepack enable
pnpm install
cp .env.example apps/landing/.env.local
cp apps/platform/.env.example apps/platform/.env.local
```

Local demo (no Docker, no database): keep `NEXT_PUBLIC_DEMO_MODE=true` in `apps/platform/.env.local` and sign in with the emails in `demo.md`.

When you are ready for a real project:

```bash
supabase start
supabase db reset
```

Set `NEXT_PUBLIC_DEMO_MODE=false` and put the real project URL and keys in `.env.local`. `pnpm demo:clear` removes seeded demo users from local Postgres. Customers can also sign up at `/signup`. After the first admin exists, create other people from `/admin/users`.

Run:

```bash
pnpm dev:landing    # http://localhost:3000
pnpm dev:platform   # http://localhost:3001
```

Landing enquiry posts to `NEXT_PUBLIC_ENQUIRY_ENDPOINT` (platform `/api/enquiries`).

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Both apps |
| `pnpm lint` | ESLint, 400-line cap |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest (money rules + mapping) |
| `pnpm --filter @sakwa/platform e2e` | Playwright (needs a running platform) |
| `pnpm build` | Both apps |

## Deploy

Two Vercel projects from this repo:

- Landing: root directory `apps/landing`, static export
- Platform: root directory `apps/platform`

Point `sakwaagro.com` at landing and `app.sakwaagro.com` at platform. Set env vars per project. Apply `supabase/migrations` to the hosted project.

## Email

- Enquiry emails send from the platform API via Resend.
- In-app notices are written by database triggers.
- `supabase/functions/notify-email` sends other notices. Wire it as a Database Webhook on `notifications` insert, with header `x-sakwa-secret`.

## Offline

Field buyers and store staff can record deliveries, confirmations, and releases with no network. Writes sit in a Dexie outbox and sync when the connection returns. The top bar shows online state and a pending count.

## Roles

| Route | Who | What they do |
| --- | --- | --- |
| `/admin` | Admin | People, stores, history |
| `/director` | Director | Watch field buyers and stores, profit requests, enquiries |
| `/accountant` | Accountant | Cash given, orders, payments, other money, capital, returns, profit paid, reports |
| `/warehouse` | Store | Incoming, outgoing, stock |
| `/agent` | Field buyer | Cash received, deliveries, balance |
| `/investor` | Investor | Own capital, returns, profit out |
| `/customer` | Customer | Orders and profile |

## Architecture

Feature folders own services (Supabase), hooks (TanStack Query + realtime), and presentational components. Pages compose those. Shared UI lives in `packages/ui`. Calculations live in `packages/utils` and are unit tested.

Balances are derived. There is no editable running total for cash, stock, profit, or withdrawable profit.
