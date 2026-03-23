import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const owners = pgTable("owners", {
  ownerId: uuid("owner_id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
