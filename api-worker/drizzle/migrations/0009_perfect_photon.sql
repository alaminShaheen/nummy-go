ALTER TABLE `tenants` ADD `promotional_heading` text;--> statement-breakpoint
ALTER TABLE `tenants` ADD `description` text;--> statement-breakpoint
ALTER TABLE `tenants` ADD `accepts_downpayment` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tenants` ADD `downpayment_percentage` integer;