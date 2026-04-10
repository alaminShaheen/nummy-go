import { EmailTemplates } from '@nummygo/shared';

export default function Preview() {
  return EmailTemplates.OrderConfirmationEmail(PreviewProps);
}

// ── Realistic sample data ─────────────────────────────────────────────────
export const PreviewProps = {
  tenantName: "Dhaka Kitchen",
  orderId: "01HWXZQPF9K3Y7M2N8VT6SCBE4",
  createdAt: Date.now(),
  totalCents: 5247,
  customerName: "Jane Smith",
  customerEmail: "jane.smith@email.com",
  customerPhone: "+1 (415) 555-1234",
  fulfillmentMethod: "pickup" as const,
  paymentMethod: "Mastercard",
  trackingUrl: "https://nummygo.ca/track/01HWXZQPF9K3Y7M2N8VT6SCBE4",
  items: [
    { name: "Chicken Biryani", quantity: 2, priceCents: 2600 },
    { name: "Beef Tehari", quantity: 1, priceCents: 1500 },
    { name: "Borhani", quantity: 2, priceCents: 800 },
  ],
};
