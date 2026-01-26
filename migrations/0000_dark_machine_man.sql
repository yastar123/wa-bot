CREATE TABLE "chats" (
	"jid" text PRIMARY KEY NOT NULL,
	"name" text,
	"unread_count" integer DEFAULT 0,
	"last_message_timestamp" timestamp,
	"is_online" boolean DEFAULT false,
	"last_seen" timestamp,
	"is_typing" boolean DEFAULT false,
	"is_marked_unread" boolean DEFAULT false NOT NULL,
	"is_group" boolean DEFAULT false NOT NULL,
	"group_description" text,
	"last_message_from_me" boolean DEFAULT false,
	"is_pinned" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"jid" text PRIMARY KEY NOT NULL,
	"name" text,
	"push_name" text,
	"verified_name" text,
	"profile_picture_url" text,
	"status" text
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"chat_jid" text NOT NULL,
	"sender_jid" text NOT NULL,
	"sender_name" text,
	"content" text,
	"content_type" text DEFAULT 'text' NOT NULL,
	"file_url" text,
	"file_name" text,
	"timestamp" timestamp DEFAULT now(),
	"from_me" boolean DEFAULT false,
	"status" text DEFAULT 'sent' NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"auto_reply_enabled" boolean DEFAULT true NOT NULL,
	"auto_reply_message" text DEFAULT 'Hello! This is an automated message.' NOT NULL,
	"bot_persona" text DEFAULT 'You are a helpful assistant.' NOT NULL
);
