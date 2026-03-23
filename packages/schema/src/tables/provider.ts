import { pgTable, uuid, text, real, timestamp } from "drizzle-orm/pg-core";

export const providers = pgTable("providers", {
  providerId: uuid("provider_id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // e.g., "SK쉴더스(캡스)"
  providerCategory: text("provider_category").notNull(), // SECURITY | PAYMENT | POS | ...
  serviceLines: text("service_lines").array(), // ["무인경비", "뷰가드AI", "출동경비"]
  apiEndpoint: text("api_endpoint"), // nullable — URL if API exists
  apiType: text("api_type").default("NONE"), // REST | SOAP | PROPRIETARY | NONE
  commissionStructure: text("commission_structure"), // "건당 3만원" or "월정액 기반"
  marketSharePct: real("market_share_pct"), // e.g., 0.506 for 에스원
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
