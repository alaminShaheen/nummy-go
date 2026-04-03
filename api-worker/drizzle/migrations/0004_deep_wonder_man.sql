PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`phone_number` text,
	`email` text,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'customer' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "name", "phone_number", "email", "email_verified", "image", "role", "created_at", "updated_at") SELECT "id", "name", "phone_number", "email", "email_verified", "image", "role", "created_at", "updated_at" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_phone_number_unique` ON `user` (`phone_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `users_phone_idx` ON `user` (`phone_number`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `__new_tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`phone_number` text NOT NULL,
	`email` text,
	`business_hours` text,
	`accepts_orders` integer DEFAULT true NOT NULL,
	`closed_until` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tenants`("id", "user_id", "slug", "name", "phone_number", "email", "business_hours", "accepts_orders", "closed_until", "is_active", "onboarding_completed", "created_at", "updated_at") SELECT "id", "user_id", "slug", "name", "phone_number", "email", "business_hours", "accepts_orders", "closed_until", "is_active", "onboarding_completed", "created_at", "updated_at" FROM `tenants`;--> statement-breakpoint
DROP TABLE `tenants`;--> statement-breakpoint
ALTER TABLE `__new_tenants` RENAME TO `tenants`;--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_unique` ON `tenants` (`slug`);--> statement-breakpoint
CREATE INDEX `tenants_name_idx` ON `tenants` (`name`);--> statement-breakpoint
CREATE INDEX `tenants_accepts_orders_idx` ON `tenants` (`accepts_orders`);--> statement-breakpoint
CREATE TABLE `__new_menu_item_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_menu_item_categories`("id", "tenant_id", "name", "sort_order", "created_at", "updated_at") SELECT "id", "tenant_id", "name", "sort_order", "created_at", "updated_at" FROM `menu_item_categories`;--> statement-breakpoint
DROP TABLE `menu_item_categories`;--> statement-breakpoint
ALTER TABLE `__new_menu_item_categories` RENAME TO `menu_item_categories`;--> statement-breakpoint
CREATE INDEX `menu_item_categories_tenant_idx` ON `menu_item_categories` (`tenant_id`);--> statement-breakpoint
CREATE TABLE `__new_menu_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`category_id` text,
	`name` text NOT NULL,
	`description` text,
	`image_url` text,
	`price` integer NOT NULL,
	`is_available` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `menu_item_categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_menu_items`("id", "tenant_id", "category_id", "name", "description", "image_url", "price", "is_available", "is_featured", "created_at", "updated_at") SELECT "id", "tenant_id", "category_id", "name", "description", "image_url", "price", "is_available", "is_featured", "created_at", "updated_at" FROM `menu_items`;--> statement-breakpoint
DROP TABLE `menu_items`;--> statement-breakpoint
ALTER TABLE `__new_menu_items` RENAME TO `menu_items`;--> statement-breakpoint
CREATE INDEX `menu_items_tenant_id_idx` ON `menu_items` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `menu_items_category_idx` ON `menu_items` (`category_id`);--> statement-breakpoint
CREATE INDEX `menu_items_tenant_featured_idx` ON `menu_items` (`tenant_id`,`is_featured`);--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`tenant_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_amount` integer NOT NULL,
	`special_instruction` text,
	`created_at` integer NOT NULL,
	`updated_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "user_id", "tenant_id", "status", "total_amount", "special_instruction", "created_at", "updated_at", "completed_at") SELECT "id", "user_id", "tenant_id", "status", "total_amount", "special_instruction", "created_at", "updated_at", "completed_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
CREATE INDEX `orders_tenant_id_idx` ON `orders` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `orders_tenant_created_idx` ON `orders` (`tenant_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`order_id` text NOT NULL,
	`menu_item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`total_price` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_order_items`("id", "tenant_id", "order_id", "menu_item_id", "quantity", "total_price", "created_at") SELECT "id", "tenant_id", "order_id", "menu_item_id", "quantity", "total_price", "created_at" FROM `order_items`;--> statement-breakpoint
DROP TABLE `order_items`;--> statement-breakpoint
ALTER TABLE `__new_order_items` RENAME TO `order_items`;--> statement-breakpoint
CREATE INDEX `order_items_tenant_id_idx` ON `order_items` (`tenant_id`);--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_menu_item_id_idx` ON `order_items` (`menu_item_id`);