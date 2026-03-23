import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { stores } from "./store";

/** Customer — nullable entity. phoneNumber stored as hash for privacy. */
export const customers = pgTable(
  "customers",
  {
    customerId: uuid("customer_id").defaultRandom().primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    phoneNumberHash: text("phone_number_hash"), // SHA-256 hash
    visitCount: integer("visit_count").notNull().default(0),
    totalSpent: integer("total_spent").notNull().default(0),
    lastVisitDate: date("last_visit_date"),
    tier: text("tier"), // BRONZE | SILVER | GOLD | VIP
    repeatRate: real("repeat_rate"), // 0.0~1.0
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("customers_store_idx").on(t.storeId)]
);
