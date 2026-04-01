CREATE TABLE `menu_item_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `menu_item_categories_tenant_idx` ON `menu_item_categories` (`tenant_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_menu_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`category_id` text,
	`name` text NOT NULL,
	`description` text,
	`image_url` text,
	`price` real NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `menu_item_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_menu_items`("id", "tenant_id", "category_id", "name", "description", "image_url", "price", "is_available", "is_featured", "created_at", "updated_at") SELECT "id", "tenant_id", "category_id", "name", "description", "image_url", "price", "is_available", "is_featured", "created_at", "updated_at" FROM `menu_items`;--> statement-breakpoint
DROP TABLE `menu_items`;--> statement-breakpoint
ALTER TABLE `__new_menu_items` RENAME TO `menu_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `menu_items_tenant_id_idx` ON `menu_items` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `menu_items_category_idx` ON `menu_items` (`category_id`);--> statement-breakpoint
CREATE INDEX `menu_items_tenant_featured_idx` ON `menu_items` (`tenant_id`,`is_featured`);--> statement-breakpoint
ALTER TABLE `user` ADD `role` text DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `tenants` ADD `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;