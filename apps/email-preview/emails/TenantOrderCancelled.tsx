import { EmailTemplates } from '@nummygo/shared';

export default function Preview() {
  return EmailTemplates.TenantOrderCancelledEmail(PreviewProps);
}


export const PreviewProps = {
  tenantName: "Burger Palace",
  orderId: "01HWXZQPF9K3Y7M2N8VT6SCBE4",
  createdAt: Date.now(),
  totalCents: 2450,
  customerName: "Alex Johnson",
  rejectionReason: "I accidentally ordered the wrong items, sorry!",
  items: [
    { name: "Smash Burger Deluxe", quantity: 2, priceCents: 1200 },
    { name: "Sweet Potato Fries", quantity: 1, priceCents: 500 },
    { name: "Lemonade", quantity: 1, priceCents: 350 },
  ],
};
