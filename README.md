# NummyGo

A real-time food ordering platform that connects customers and restaurant tenants. Customers browse and place orders; tenants manage their kitchen queue live as orders come in.

---

## What it does

**For customers**
- Place food orders and track their status in real time
- See instant updates as the kitchen accepts, prepares, and readies their order

**For tenants (restaurants)**
- View an incoming order dashboard that updates live without refreshing
- Move orders through the kitchen pipeline — pending → preparing → ready → completed
- Cancel orders directly from the dashboard

Updates on both sides are pushed instantly over WebSockets, so neither party needs to poll or refresh.

---

## App structure

```
nummy-go/
├── apps/
│   ├── customer-web/     Next.js app for customers (ordering + order tracking)
│   └── tenant-web/       Next.js app for restaurant tenants (order dashboard)
│
├── api-worker/           Cloudflare Worker — the backend
│                         Handles all tRPC API routes, business logic,
│                         database access, and WebSocket connections
│
└── packages/
    └── shared/           Shared code used across the whole repo
                          — database schema and queries (Drizzle ORM)
                          — TypeScript types and Zod validation schemas
                          — reusable UI components
```

### How the pieces connect

```
customer-web  ──┐
                │  tRPC (HTTP)   ┌── Cloudflare D1 (SQLite database)
tenant-web    ──┤ ─────────────► │
                │  WebSocket     └── Durable Objects (live WebSocket rooms,
                └────────────►       one per tenant)
```

Both front-end apps are static Next.js exports hosted on Cloudflare. The `api-worker` is a Cloudflare Worker that serves all API requests and manages real-time WebSocket connections through Cloudflare Durable Objects — one persistent room per tenant, so all devices watching the same restaurant stay in sync instantly.

---

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 10+
- A [Cloudflare account](https://dash.cloudflare.com) with a D1 database created

### Install dependencies
```bash
pnpm install
```

### Configure the API worker
1. Open `api-worker/wrangler.jsonc` and replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` with your D1 database ID.
2. Run migrations to set up the database schema:
   ```bash
   pnpm --filter api-worker db:migrate
   ```

### Run locally
```bash
# Start the API worker (port 8787)
pnpm --filter api-worker dev

# Start the customer app (port 3000)
pnpm --filter customer-web dev

# Start the tenant dashboard (port 3001)
pnpm --filter tenant-web dev
```

### Deploy
```bash
pnpm --filter api-worker deploy
pnpm --filter customer-web deploy
pnpm --filter tenant-web deploy
```
