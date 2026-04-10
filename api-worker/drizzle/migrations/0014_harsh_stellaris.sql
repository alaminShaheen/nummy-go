ALTER TABLE `tenants` ADD `social_links` text;--> statement-breakpoint
ALTER TABLE `tenants` DROP COLUMN `accepts_downpayment`;--> statement-breakpoint
ALTER TABLE `tenants` DROP COLUMN `downpayment_percentage`;