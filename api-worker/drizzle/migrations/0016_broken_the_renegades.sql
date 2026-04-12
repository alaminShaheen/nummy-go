ALTER TABLE `orders` ADD `delay_minutes` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `delay_message` text;