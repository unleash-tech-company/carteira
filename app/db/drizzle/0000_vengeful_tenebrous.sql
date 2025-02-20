CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_password" (
	"subscription_id" text PRIMARY KEY NOT NULL,
	"encrypted_password" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "subscription_user" (
	"id" text PRIMARY KEY NOT NULL,
	"subscription_id" text ,
	"user_id" text 
);
--> statement-breakpoint
ALTER TABLE "subscription_password" ADD CONSTRAINT "subscription_password_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_user" ADD CONSTRAINT "subscription_user_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_user" ADD CONSTRAINT "subscription_user_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;