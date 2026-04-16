import { EmailTemplates } from '@nummygo/shared';

export default function Preview() {
  return EmailTemplates.OrderConfirmationEmail(PreviewProps);
}

// ── Multi-vendor sample data ──────────────────────────────────────────────
export const PreviewProps = {
  checkoutSessionId: "01HWXZQPF9K3Y7M2N8VT6SCBE4",
  createdAt: Date.now(),
  totalCents: 6746,
  trackingUrl: "https://nummygo.ca/track/01HWXZQPF9K3Y7M2N8VT6SCBE4",
  vendorOrders: [
    {
      orderId: "01HWXZQPF9K3Y7M2N8VT6SCBE4",
      tenantName: "Dhaka Kitchen",
      tenantEmail: "support@dhakakitchen.com",
      tenantPhone: "+1 (415) 555-9876",
      fulfillmentMethod: "pickup" as const,
      paymentMethod: "Mastercard",
      totalCents: 4633,
      items: [
        { name: "Chicken Biryani", quantity: 2, priceCents: 2600 },
        { name: "Beef Tehari", quantity: 1, priceCents: 1500 },
        { name: "Borhani", quantity: 2, priceCents: 800 },
      ],
    },
    {
      orderId: "01HWXZQPF9K3Y7M2N8VT6SCBE5",
      tenantName: "Pizza Palace",
      tenantEmail: "hello@pizzapalace.com",
      tenantPhone: "+1 (416) 555-1234",
      fulfillmentMethod: "delivery" as const,
      paymentMethod: "Visa",
      totalCents: 2113,
      items: [
        { name: "Margherita Pizza", quantity: 1, priceCents: 1800 },
      ],
    },
  ],
};
