import { config } from 'dotenv';
config({ path: 'api-worker/.dev.vars' });

import { getDb, initDb } from './packages/shared/src/db';
import { orders } from './packages/shared/src/db/schema';
import { orderResponseSchema } from './packages/shared/src/models/dtos/orders';
import { desc } from 'drizzle-orm';
import { z } from 'zod';

async function run() {
  try {
    initDb({ DB: process.env.DB } as any);
    const rows = await getDb().select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
    
    // simulate rowToOrder
    const mapped = rows.map(r => ({
      ...r,
      userId: r.userId ?? null,
      checkoutSessionId: r.checkoutSessionId ?? null,
      customerName: r.customerName ?? null,
      customerPhone: r.customerPhone ?? null,
      customerEmail: r.customerEmail ?? null,
      deliveryAddress: r.deliveryAddress ?? null,
      specialInstruction: r.specialInstruction ?? null,
      rejectionReason: r.rejectionReason ?? null,
      scheduledFor: r.scheduledFor ?? null,
      modificationStatus: r.modificationStatus ?? null,
      updatedAt: r.updatedAt ?? null,
      completedAt: r.completedAt ?? null,
    }));

    try {
        const parsed = z.array(orderResponseSchema).parse(mapped);
        console.log("Parse Success!");
    } catch(e) {
        console.error("PARSE FAILED!");
        console.error(JSON.stringify(e.errors, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}
run();
