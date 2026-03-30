# Next.js + tRPC + Cloudflare Workers Template

This template provides a fully integrated setup of Next.js App Router, tRPC, and Cloudflare Workers, allowing you to build full-stack applications that run on the edge.

## Features

- [Next.js 15](https://nextjs.org/) with App Router for modern React development
- [TanStack Query](https://tanstack.com/query) for data fetching and caching
- [tRPC](https://trpc.io/) for end-to-end typesafe APIs
- [Cloudflare Workers](https://workers.cloudflare.com/) for edge computing
- [TypeScript](https://www.typescriptlang.org/) for type safety
- Full access to Cloudflare services (KV, D1, R2, AI, etc.)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v8 or later)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for Cloudflare Workers development

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

This will start the local development server with Cloudflare Workers runtime at http://localhost:8788.

## Cloudflare Worker Configuration

### Service Bindings and TypeScript

This template includes type definitions for Cloudflare Worker bindings. When adding service bindings or other Cloudflare resources, you should:

1. Generate TypeScript types for your bindings:

```bash
pnpm cf-typegen
```

This will create or update typings for your Cloudflare Worker environment.

2. Update the `CloudflareEnv` interface in `src/types/cloudflare.d.ts`:

```typescript
export interface CloudflareEnv {
  // Add your bindings here
  MY_KV: KVNamespace;
  DB: D1Database;
  MY_BUCKET: R2Bucket;
  // etc.
}
```

3. Use the typed bindings in your tRPC context and procedures:

```typescript
// In src/server/context.ts
export const createContext = (opts: CreateContextOptions): Context => {
  return {
    req: opts.req,
    env: opts.env,     // Typed CloudflareEnv
    cf: opts.cf,
    workerCtx: opts.workerCtx,
  };
};

// In your tRPC procedures (e.g., src/server/routers/example.ts)
export const exampleRouter = router({
  getData: publicProcedure.query(async ({ ctx }) => {
    // Access typed bindings
    const value = await ctx.env.MY_KV.get('some-key');
    const dbResult = await ctx.env.DB.prepare('SELECT * FROM users').all();
    return { value, dbResult };
  }),
});
```

### Configuring Bindings

Edit `wrangler.jsonc` to configure your Cloudflare services:

```jsonc
{
  "name": "customer-web",
  "compatibility_date": "2024-01-01",
  "main": ".vercel/output/static/_worker.js",
  "compatibility_flags": ["nodejs_compat"],

  // KV Namespaces
  "kv_namespaces": [
    {
      "binding": "MY_KV",
      "id": "your-kv-namespace-id"
    }
  ],

  // D1 Databases
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-database-name",
      "database_id": "your-database-id"
    }
  ]
}
```

## Deployment

To deploy your application to Cloudflare Workers:

1. Build and deploy:

```bash
pnpm deploy
```

This will build your Next.js application and deploy it to Cloudflare Workers.

### First Time Setup

1. Login to Cloudflare:

```bash
pnpm wrangler login
```

2. Deploy:

```bash
pnpm deploy
```

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/
│   │   │   └── trpc/
│   │   │       └── [trpc]/
│   │   │           └── route.ts    # tRPC API handler (like worker/index.ts)
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   │
│   ├── server/                 # Backend (tRPC)
│   │   ├── routers/            # tRPC route handlers
│   │   │   ├── _app.ts         # Main router
│   │   │   ├── example.ts      # Example procedures
│   │   │   └── cloudflare.ts   # Cloudflare service examples
│   │   ├── context.ts          # tRPC context creation
│   │   ├── trpc.ts             # tRPC setup
│   │   └── init.ts             # Service initialization
│   │
│   ├── trpc/                   # Frontend (tRPC client)
│   │   ├── client.ts           # tRPC React client
│   │   └── Provider.tsx        # tRPC provider wrapper
│   │
│   └── types/
│       └── cloudflare.d.ts     # Cloudflare binding types
│
├── wrangler.jsonc              # Cloudflare Worker configuration
├── next.config.ts              # Next.js configuration
└── package.json                # Scripts and dependencies
```

## How It Works

### tRPC API Handler

The `src/app/api/trpc/[trpc]/route.ts` file is the equivalent of your React app's `worker/index.ts`. It:

1. Gets the Cloudflare context (env, cf, ctx)
2. Initializes your services (database, etc.)
3. Handles all tRPC requests via Next.js routing

```typescript
// src/app/api/trpc/[trpc]/route.ts
const handler = (req: Request) => {
  const { env, cf, ctx } = getRequestContext();

  // Initialize services (like your React app)
  initializeServices(env);

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req, env, cf, workerCtx: ctx }),
  });
};
```

### Worker Entry Point

When deployed, Next.js generates a worker at `.vercel/output/static/_worker.js` that:
- Handles routing to your pages and API routes
- Provides access to Cloudflare bindings
- Runs on the Cloudflare Workers runtime

## Available Scripts

```bash
pnpm dev           # Start development with Cloudflare runtime
pnpm dev:next      # Start Next.js dev (faster, no Cloudflare)
pnpm build         # Build for production
pnpm deploy        # Build and deploy to Cloudflare
pnpm cf-typegen    # Generate Cloudflare binding types
pnpm lint          # Run ESLint
```

## Development Workflow

1. **Daily Development**: Use `pnpm dev` to develop with full Cloudflare runtime
2. **UI-Only Work**: Use `pnpm dev:next` for faster hot reload
3. **Before Deploying**: Run `pnpm cf-typegen` to ensure types are up to date
4. **Deploy**: Run `pnpm deploy` to push to production

## Differences from React Template

| Feature | React Template | Next.js Template |
|---------|---------------|------------------|
| Entry Point | `worker/index.ts` | `src/app/api/trpc/[trpc]/route.ts` |
| Routing | Manual in worker | Next.js App Router |
| Static Assets | `env.ASSETS.fetch()` | Next.js build output |
| tRPC Setup | Same | Same |
| Cloudflare Bindings | Same | Same |
| Context Creation | Same | Same |

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [tRPC Documentation](https://trpc.io/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
