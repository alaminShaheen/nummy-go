import React from 'react';
import { Resend } from 'resend';
import { EmailTemplates } from '@nummygo/shared';
import type { Env } from '../index';
import type { Order } from '@nummygo/shared/models';

export class EmailService {
  private resend: Resend;

  constructor(env: Env) {
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

  async sendOrderConfirmation(order: Order, customerEmail: string) {
    if (!customerEmail) return null;
    try {
      return await this.resend.emails.send({
        from: 'NummyGo <onboarding@resend.dev>',
        to: customerEmail,
        subject: `Order Confirmed: #${order.id.slice(-6).toUpperCase()}`,
        react: EmailTemplates.OrderConfirmationEmail({
          tenantName: 'NummyGo Tenant',
          orderId: order.id,
          createdAt: order.createdAt,
          totalCents: order.totalAmount,
          customerName: order.customerName || 'Customer',
          customerEmail,
          customerPhone: order.customerPhone || undefined,
          items: this.buildItems(order),
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
        from: 'NummyGo <onboarding@resend.dev>',
        to: customerEmail,
        subject: `Order Update: #${order.id.slice(-6).toUpperCase()}`,
        react: EmailTemplates.OrderDeclinedEmail({
          tenantName: 'NummyGo Tenant',
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
        from: 'NummyGo <onboarding@resend.dev>',
        to: tenantEmail,
        subject: `NummyGo: New Order #${order.id.slice(-6).toUpperCase()}`,
        react: EmailTemplates.TenantNewOrderEmail({
          tenantName,
          orderId: order.id,
          createdAt: order.createdAt,
          totalCents: order.totalAmount,
          customerName: order.customerName || 'Customer',
          customerEmail: order.customerEmail || 'Guest',
          customerPhone: order.customerPhone || undefined,
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
        from: 'NummyGo <onboarding@resend.dev>',
        to: tenantEmail,
        subject: `NummyGo: Order Cancelled #${order.id.slice(-6).toUpperCase()}`,
        react: EmailTemplates.TenantOrderCancelledEmail({
          tenantName,
          orderId: order.id,
          createdAt: order.createdAt,
          totalCents: order.totalAmount,
          customerName: order.customerName || 'Customer',
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
