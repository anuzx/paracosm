import { integer, pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const roleEnum = pgEnum("Role", ["admin", "user"]);

export const users = pgTable("User", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  username: text("username").notNull().unique(),

  password: text("password").notNull(),

  avatarId: text("avatarId").references(() => avatars.id),

  role: roleEnum("role").notNull(),
});

export const spaces = pgTable("Space", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  name: text("name").notNull(),

  width: integer("width").notNull(),

  height: integer("height"),

  thumbnail: text("thumbnail"),
});

export const elements = pgTable("Element", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  width: integer("width").notNull(),

  height: integer("height").notNull(),

  imageUrl: text("imageUrl").notNull(),
});

export const spaceElements = pgTable("spaceElements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  elementId: text("elementId")
    .notNull()
    .references(() => elements.id),

  spaceId: text("spaceId")
    .notNull()
    .references(() => spaces.id),

  x: integer("x").notNull(),

  y: integer("y").notNull(),
});

export const maps = pgTable("Map", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  width: integer("width").notNull(),

  height: integer("height").notNull(),

  name: text("name").notNull(),
});

export const mapElements = pgTable("mapElements", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  mapId: text("mapId")
    .notNull()
    .references(() => maps.id),

  elementId: text("elementId").references(() => elements.id),

  x: integer("x"),

  y: integer("y"),
});

export const avatars = pgTable("Avatar", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),

  imageUrl: text("imageUrl"),

  name: text("name"),
});
