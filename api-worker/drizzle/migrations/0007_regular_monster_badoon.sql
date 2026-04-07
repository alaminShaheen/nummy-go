PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`tenant_id` text NOT NULL,
	`checkout_session_id` text,
	`customer_name` text,
	`customer_phone` text,
	`customer_email` text,
	`payment_method` text DEFAULT 'counter' NOT NULL,
	`fulfillment_method` text DEFAULT 'pickup' NOT NULL,
	`delivery_address` text,
	`is_pos_order` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_amount` integer NOT NULL,
	`special_instruction` text,
	`rejection_reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "user_id", "tenant_id", "checkout_session_id", "customer_name", "customer_phone", "customer_email", "payment_method", "fulfillment_method", "delivery_address", "is_pos_order", "status", "total_amount", "special_instruction", "rejection_reason", "created_at", "updated_at", "completed_at") SELECT "id", "user_id", "tenant_id", "checkout_session_id", "customer_name", "customer_phone", "customer_email", "payment_method", "fulfillment_method", "delivery_address", "is_pos_order", "status", "total_amount", "special_instruction", "rejection_reason", "created_at", "updated_at", "completed_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `orders_tenant_id_idx` ON `orders` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_session_idx` ON `orders` (`checkout_session_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_tenant_created_idx` ON `orders` (`tenant_id`,`created_at`);