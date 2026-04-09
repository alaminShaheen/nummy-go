CREATE TABLE `order_modifications` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`requested_changes` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`tenant_note` text,
	`created_at` integer NOT NULL,
	`reviewed_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `order_modifications_order_id_idx` ON `order_modifications` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_modifications_tenant_id_idx` ON `order_modifications` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `order_modifications_status_idx` ON `order_modifications` (`status`);--> statement-breakpoint
ALTER TABLE `tenants` ADD `order_modification_threshold` integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `scheduled_for` integer;--> statement-breakpoint
ALTER TABLE `orders` ADD `modification_status` text;--> statement-breakpoint
CREATE INDEX `orders_modification_status_idx` ON `orders` (`modification_status`);