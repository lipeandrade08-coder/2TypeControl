CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer` text NOT NULL,
	`channel` text DEFAULT 'Site' NOT NULL,
	`detail` text NOT NULL,
	`total` integer NOT NULL,
	`time` text NOT NULL,
	`status` text DEFAULT 'Novo' NOT NULL,
	`fee_pending` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
