import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { stores } from "./store";

export const insurancePolicies = pgTable(
  "insurance_policies",
  {
    policyId: uuid("policy_id").defaultRandom().primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    policyType: text("policy_type").notNull(), // FIRE | LIABILITY | THEFT | COMPREHENSIVE
    insurer: text("insurer").notNull(), // "삼성화재"
    monthlyPremium: integer("monthly_premium").notNull(),
    coverageLimit: integer("coverage_limit").notNull(), // 보상한도
    policyStart: date("policy_start").notNull(),
    policyEnd: date("policy_end"),
    status: text("status").notNull().default("ACTIVE"), // ACTIVE | EXPIRED | CLAIMED
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("insurance_policies_store_idx").on(t.storeId)]
);
