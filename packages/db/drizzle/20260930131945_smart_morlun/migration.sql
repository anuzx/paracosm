CREATE TYPE "Role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "Avatar" (
	"id" text PRIMARY KEY,
	"imageUrl" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "Element" (
	"id" text PRIMARY KEY,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"imageUrl" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mapElements" (
	"id" text PRIMARY KEY,
	"mapId" text NOT NULL,
	"elementId" text,
	"x" integer,
	"y" integer
);
--> statement-breakpoint
CREATE TABLE "Map" (
	"id" text PRIMARY KEY,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spaceElements" (
	"id" text PRIMARY KEY,
	"elementId" text NOT NULL,
	"spaceId" text NOT NULL,
	"x" integer NOT NULL,
	"y" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Space" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer,
	"thumbnail" text
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY,
	"username" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"avatarId" text,
	"role" "Role" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mapElements" ADD CONSTRAINT "mapElements_mapId_Map_id_fkey" FOREIGN KEY ("mapId") REFERENCES "Map"("id");--> statement-breakpoint
ALTER TABLE "mapElements" ADD CONSTRAINT "mapElements_elementId_Element_id_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id");--> statement-breakpoint
ALTER TABLE "spaceElements" ADD CONSTRAINT "spaceElements_elementId_Element_id_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id");--> statement-breakpoint
ALTER TABLE "spaceElements" ADD CONSTRAINT "spaceElements_spaceId_Space_id_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id");--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_avatarId_Avatar_id_fkey" FOREIGN KEY ("avatarId") REFERENCES "Avatar"("id");