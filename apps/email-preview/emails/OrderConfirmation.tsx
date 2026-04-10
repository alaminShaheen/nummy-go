import { EmailTemplates } from '@nummygo/shared';

export default function Preview() {
  return EmailTemplates.OrderConfirmationEmail(PreviewProps);
}

// Preview props — these populate the template in the browser preview
export const PreviewProps = {
  tenantName: "Burger Palace",
  orderId: "01HWXZQPF9K3Y7M2N8VT6SCBE4",
  createdAt: Date.now(),
  totalCents: 2450,
  customerName: "Alex Johnson",
  customerEmail: "alex@example.com",
  customerPhone: "+1 (555) 234-5678",
  items: [
    { name: "Smash Burger Deluxe", quantity: 2, priceCents: 1200 },
    { name: "Sweet Potato Fries", quantity: 1, priceCents: 500 },
    { name: "Lemonade", quantity: 1, priceCents: 350 },
  ],
};
