/**
 * Email sender addresses for NummyGo transactional emails.
 *
 * Domain: contact.nummygo.ca (verified via Resend)
 */

export const EMAIL_FROM = {
	/** Order confirmations, status updates, and other customer-facing emails */
	ORDERS: 'NummyGo <orders@contact.nummygo.ca>',

	/** General notifications sent to tenants (new orders, cancellations, etc.) */
	NOTIFICATIONS: 'NummyGo <notifications@contact.nummygo.ca>',

	/** Catch-all / default sender */
	NO_REPLY: 'NummyGo <noreply@contact.nummygo.ca>',
} as const;

export type EmailFrom = (typeof EMAIL_FROM)[keyof typeof EMAIL_FROM];
