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
import { providers } from "./provider";

/**
 * Contract — every relationship between a Store and a Provider
 * is mediated by a Contract.
 *
 * The `signedVia` field is the VALVE: when its value is "DIRECT_MARKET",
 * it means the contract was brokered through our platform.
 */
export const contracts = pgTable(
  "contracts",
  {
    contractId: uuid("contract_id").defaultRandom().primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.providerId),
    contractType: text("contract_type").notNull(), // CCTV | GUARD | POS | VAN | ...
    monthlyFee: integer("monthly_fee").notNull(),
    installationFee: integer("installation_fee"),
    activationFee: integer("activation_fee"),
    contractStart: date("contract_start").notNull(),
    contractEnd: date("contract_end"), // nullable — 무약정이면 null
    contractPeriodMonths: integer("contract_period_months"), // 12 | 24 | 36 | 60
    earlyTerminationPenalty: text("early_termination_penalty"), // 위약금 구조 설명
    equipmentOwnership: text("equipment_ownership").default("RENTAL"), // RENTAL | PURCHASE
    status: text("status").notNull().default("PENDING"), // PENDING | ACTIVE | SUSPENDED | TERMINATED
    signedVia: text("signed_via").notNull().default("SELF"), // DIRECT_MARKET | AGENT_VISIT | PHONE_TM | ONLINE | SELF
    compensationLimit: text("compensation_limit"), // 보상한도 구조
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("contracts_store_idx").on(t.storeId),
    index("contracts_provider_idx").on(t.providerId),
    index("contracts_status_idx").on(t.status),
    index("contracts_signed_via_idx").on(t.signedVia),
  ]
);
