import { EmailTemplates } from '@nummygo/shared';

export default function Preview() {
  return EmailTemplates.OrderDeclinedEmail(PreviewProps);
}


export const PreviewProps = {
  tenantName: "Burger Palace",
  orderId: "01HWXZQPF9K3Y7M2N8VT6SCBE4",
  createdAt: Date.now(),
  totalCents: 2450,
  rejectionReason: "Sorry, we are out of ingredients for your order and cannot fulfil it at this time.",
  items: [
    { name: "Smash Burger Deluxe", quantity: 2, priceCents: 1200 },
    { name: "Sweet Potato Fries", quantity: 1, priceCents: 500 },
    { name: "Lemonade", quantity: 1, priceCents: 350 },
  ],
};
