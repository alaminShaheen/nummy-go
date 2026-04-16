import React from 'react';
import { Resend } from 'resend';
import { EmailTemplates, EMAIL_FROM } from '@nummygo/shared';
import type { Env } from '../index';
import type { Order, Tenant } from '@nummygo/shared/models';

export class EmailService {
  private resend: Resend;
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    const key = env.RESEND_API_KEY;
    console.log('[EmailService] RESEND_API_KEY present?', !!key, '| starts with re_?', key?.startsWith('re_'));
    this.resend = new Resend(key || 're_dummy_key');
  }

  private buildItems(order: any) {
    if (order.items && Array.isArray(order.items)) {
      return order.items;
    }
    return [{ name: 'Custom Order Item', quantity: 1, priceCents: order.totalAmount }];
  }

  // ── CUSTOMER NOTIFICATIONS ───────────────────────────────────────────────

  /**
   * Send a single consolidated order confirmation email per checkout session.
   * Groups all vendor orders into one email with a single tracking link.
   */
  async sendOrderConfirmation(
    checkoutSessionId: string,
    orders: Order[],
    tenantMap: Map<string, { name?: string; email?: string | null; phoneNumber?: string | null }>,
    customerEmail: string,
  ) {
    if (!customerEmail || orders.length === 0) return null;

    const grandTotal = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    const vendorOrders = orders.map((order) => {
      const info = tenantMap.get(order.tenantId);
      return {
        orderId: order.id,
        tenantName: info?.name || 'nummyGo Tenant',
        tenantEmail: info?.email || undefined,
        tenantPhone: info?.phoneNumber || undefined,
        fulfillmentMethod: (order.fulfillmentMethod || 'pickup') as 'pickup' | 'delivery',
        paymentMethod: order.paymentMethod || 'Cash',
        items: this.buildItems(order),
        totalCents: order.totalAmount,
      };
    });

    const shortId = checkoutSessionId.slice(-6).toUpperCase();

    try {
      return await this.resend.emails.send({
        from: EMAIL_FROM.ORDERS,
        to: customerEmail,
        subject: `Order Confirmed: #${shortId}`,
        react: EmailTemplates.OrderConfirmationEmail({
          checkoutSessionId,
          createdAt: orders[0]!.createdAt,
          totalCents: grandTotal,
          trackingUrl: `https://nummygo.ca/track/${checkoutSessionId}`,
          vendorOrders,
        }),
      });
    } catch (err) {
      console.error('[EmailService] Failed to send confirmation email', err);
      return null;
    }
  }

  async sendOrderDeclined(order: Order, customerEmail: string) {
    if (!customerEmail) return null;
    try {
      return await this.resend.emails.send({
        from: EMAIL_FROM.ORDERS,
        to: customerEmail,
        subject: `Order Update: #${order.id.slice(-6).toUpperCase()}`,
        react: EmailTemplates.OrderDeclinedEmail({
          tenantName: 'nummyGo Tenant',
          orderId: order.id,
          createdAt: order.createdAt,
          totalCents: order.totalAmount,
          rejectionReason: order.rejectionReason || 'No reason provided.',
          items: this.buildItems(order),
        }),
      });
    } catch (err) {
      console.error('[EmailService] Failed to send declined email', err);
      return null;
    }
  }

  // ── TENANT NOTIFICATIONS ─────────────────────────────────────────────────

  async sendTenantNewOrder(order: Order, tenantName: string, tenantEmail: string) {
    if (!tenantEmail) return null;
    console.log('Sending tenant new order email to', tenantEmail);
    try {
      return await this.resend.emails.send({
        from: EMAIL_FROM.NOTIFICATIONS,
        to: tenantEmail,
        subject: `nummyGo: New Order #${order.id.slice(-6).toUpperCase()}`,
        react: EmailTemplates.TenantNewOrderEmail({
          tenantName,
          orderId: order.id,
          createdAt: order.createdAt,
          totalCents: order.totalAmount,
          customerName: order.customerName || 'Customer',
          customerEmail: order.customerEmail || 'Guest',
          customerPhone: order.customerPhone || undefined,
          dashboardUrl: this.env.CUSTOMER_WEB_URL ? `${this.env.CUSTOMER_WEB_URL}/tenant/orders` : 'https://nummygo.ca/tenant/orders',
          items: this.buildItems(order),
        }),
      });
    } catch (err) {
      console.error('[EmailService] Failed to send tenant new order email', err);
      return null;
    }
  }

  async sendTenantOrderCancelled(order: Order, tenantName: string, tenantEmail: string) {
    if (!tenantEmail) return null;
    try {
      return await this.resend.emails.send({
        from: EMAIL_FROM.NOTIFICATIONS,
        to: tenantEmail,
        subject: `nummyGo: Order Cancelled #${order.id.slice(-6).toUpperCase()}`,
        react: EmailTemplates.TenantOrderCancelledEmail({
          tenantName,
          orderId: order.id,
          createdAt: order.createdAt,
          totalCents: order.totalAmount,
          customerName: order.customerName || 'Customer',
          customerEmail: order.customerEmail || 'Guest',
          customerPhone: order.customerPhone || undefined,
          rejectionReason: order.rejectionReason || 'Cancelled by customer',
          items: this.buildItems(order),
        }),
      });
    } catch (err) {
      console.error('[EmailService] Failed to send tenant cancellation email', err);
      return null;
    }
  }
}
