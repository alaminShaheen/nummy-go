// Raw tuple used by Drizzle's text({ enum }) column definition.
// The canonical OrderStatus type lives in models/enums.ts.
export const ORDER_STATUS = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
] as const;

export const PAYMENT_METHOD = [
  'card',
  'counter',
] as const;
