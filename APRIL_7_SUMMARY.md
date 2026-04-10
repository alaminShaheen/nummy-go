# NummyGo Platform — April 7 Technical Implementation Summary

This document serves as the cohesive, master technical log of the features architected and integrated into the NummyGo Nx monorepo on **April 7**. The primary objective today was enabling multi-tenant payment systems, real-time checkout flows, building the live order tracking portal, and fortifying data transfers between the SQLite database and the UI layer.

---

## 1. Multi-Partner Cart Management

### Feature Description
NummyGo allows customers to add items from *multiple different restaurants* into a single session cart. We engineered an isolated mapping system so each vendor defines their own Fulfillment Method (Pickup vs Delivery) and Payment Method (Pay at Store vs Card). The customer manages all of this gracefully in a unified side-drawer interface.

### Files Edited
- `apps/web/src/hooks/useCart.ts`
- `apps/web/src/components/CartDrawer.tsx`

### Technical Implementation

We partitioned the cart into grouped objects based on `tenantId`. A `VendorSettings` state manages exact configurations for each subset order.

```tsx
// apps/web/src/components/CartDrawer.tsx
const [vendorSettings, setVendorSettings] = useState<Record<string, {
    paymentMethod: 'counter' | 'card',
    fulfillmentMethod: 'pickup' | 'delivery',
    specialInstruction: string
}>>({});

// Grouping logic for the unified checkout submission
const finalCart = cart.flatMap(v => {
    const settings = vendorSettings[v.tenantId];
    if (!settings) return [];
    return [{
        tenantId: v.tenantId,
        items: v.items.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
        specialInstruction: settings.specialInstruction || undefined,
        paymentMethod: settings.paymentMethod,
        fulfillmentMethod: settings.fulfillmentMethod,
    }];
});
```

---

## 2. Universal Checkout Architecture

### Feature Description
We created a robust `/checkout` page equipped with schema-driven validation. The checkout infers whether any vendor mandates online card payment, dynamically switching out the Place Order functionality to trigger Stripe UI modals if necessary. Upon a successful push, the custom backend splits the session out into parallel independent Orders.

### Files Edited
- `apps/web/src/app/checkout/page.tsx`
- `packages/shared/src/models/dtos/orders.ts`
- `api-worker/src/services/orderService.ts`

### Technical Implementation
The frontend enforces required fields strictly using Zod (`customerCheckoutSchema`). Importantly, the UI *does not* send calculated prices to the Worker (preventing tampering). It sends `{ menuItemId, quantity }`.

```typescript
// api-worker/src/services/orderService.ts
export async function placeCheckoutOrder(env: Env, input: CustomerCheckoutDto) {
  // Generates a session ID to link all independent restaurant orders
  const sessionId = ulid(); 

  for (const group of input.cart) {
      // Prices are independently cross-verified and queried directly from DB natively in cents.
      const resolvedItems = await Promise.all(
        group.items.map(async (line) => {
          const menuItem = await getMenuItemById(line.menuItemId);
          return { ...line, unitPrice: menuItem.price }; // DB explicitly returns cents
        }),
      );

      // We recalculate securely backend-side
      const totalAmount = resolvedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      // Saves standard record
      const orderRecord = { ... }; 
  }
}
```

---

## 3. Real-Time Customer Order Tracking (Durable Objects)

### Feature Description
We implemented a live-tracking session that tracks a group of standard orders using `checkoutSessionId`. When an order is placed, the user is instantly redirected to `/track/[sessionId]`. As individual vendors hit "Accept" or "Preparing" on their POS, WebSockets broadcast this event directly to the customer's phone without requiring application refreshes.

### Files Edited
- `apps/web/src/hooks/useWebSocket.ts`
- `apps/web/src/app/track/[sessionId]/page.tsx`
- `api-worker/src/workers/ApiWorker.ts`

### Technical Implementation
We heavily refactored `useWebSocket.ts` to support both Tenant (dashboard) namespaces and Session (customer) namespaces.

```typescript
// apps/web/src/hooks/useWebSocket.ts
export function useWebSocket({ tenantId, sessionId, onMessage }: UseWebSocketOptions) {
  useEffect(() => {
    // Dynamic Cloudflare DO endpoint mapping
    const wsUrl = tenantId 
        ? `${env.NEXT_PUBLIC_WS_URL}/ws/tenant/${tenantId}` 
        : `${env.NEXT_PUBLIC_WS_URL}/ws/session/${sessionId}`;
    
    // ...
  });
}
```

On the tracking UI side (`page.tsx`), we use a React Query cache invalidation technique. When the socket acknowledges an event, the UI re-queries TRPC seamlessly.

```tsx
// apps/web/src/app/track/[sessionId]/page.tsx
useWebSocket({
  sessionId,
  onMessage: (msg: any) => {
    if (msg.type === 'ORDER_UPDATED' || msg.type === 'ORDER_CREATED') {
      // TRPC cache snap overrides the state to animate the progress bar
      queryClient.invalidateQueries({
        queryKey: [['customer', 'getCheckoutGroup'], { input: { checkoutSessionId: sessionId }, type: 'query' }],
      });
    }
  },
});
```

---

## 4. API Layer Strict DTO Transformation (Cents ⇆ Dollars)

### Feature Description
Instead of executing math manually randomly across front-end components (`item.price / 100`), we structured pure Data Transfer Objects (DTOs). SQLite natively stores decimals cleanly as integers (`cents`). We enforce strict boundaries where TRPC and WebSockets convert Db Cents into strict React-ready Floating Decimals *before* leaving the backend server natively.

### Files Edited
- `packages/shared/src/models/schemas.ts`
- `packages/shared/src/models/dtos/orders.ts` & `menu-items.ts`
- `api-worker/src/trpc/routers/tenantRouter.ts` (and `customerRouter.ts`)
- `api-worker/src/services/orderService.ts`

### Technical Implementation
First, we built the `.transform()` directly in our Zod validations.
```typescript
// packages/shared/src/models/schemas.ts
export const outputPriceSchema = z.number().transform((val) => parseFloat((val / 100).toFixed(2)));
```

Next, we securely mapped that to `OrderResponseSchema`, allowing TRPC's `.output()` function to intercept database arrays naturally:
```typescript
// api-worker/src/trpc/routers/customerRouter.ts
getCheckoutGroup: publicProcedure
    .input(z.object({ checkoutSessionId: z.string() }))
    // Validates JSON array boundaries and automatically triggers `outputPriceSchema` transformation
    .output(z.array(orderResponseSchema)) 
    .query(async ({ input, ctx }) => {
        return await fetchCheckoutSession(ctx.env, input);
    }),
```

Finally, we adapted `rowToOrder()` mapping in `orderService.ts` to instantly push dollar translations so WebSocket broadcasts stay 100% in parity with our REST TRPC APIs!
```typescript
// api-worker/src/services/orderService.ts
function rowToOrder(row) {
  return {
    ...row,
    // Safely transforms to generic float for the WS broadcasts
    totalAmount: parseFloat((row.totalAmount / 100).toFixed(2)), 
  };
}
```
