import {
  pgTable,
  uuid,
  text,
  date,
  integer,
  real,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { owners } from "./owner";

/**
 * Store — the core node of the ontology.
 *
 * PK is 사업자등록번호 (business registration number), not UUID.
 * This is a deliberate Palantir-inspired choice: the real-world
 * identifier IS the primary key. Validated by @store-ontology/validators.
 *
 * Implements the Facility interface (Palantir cross-vertical compatibility).
 */
export const stores = pgTable(
  "stores",
  {
    storeId: text("store_id").primaryKey(), // 사업자등록번호 (e.g., "1234567890")
    businessName: text("business_name").notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => owners.ownerId),
    location: jsonb("location"), // GeoJSON Point: { type: "Point", coordinates: [lng, lat] }
    storeType: text("store_type").notNull().default("OTHER"),
    businessCategoryCode: text("business_category_code"), // 6-digit 국세청 업종코드
    taxationType: text("taxation_type"), // GENERAL | SIMPLIFIED | EXEMPT
    monthlyRevenueEstimate: integer("monthly_revenue_estimate"), // nullable — 아직 모르면 null
    openingDate: date("opening_date"),
    riskScore: real("risk_score"), // 0.0~1.0, nullable
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("stores_owner_idx").on(t.ownerId),
    index("stores_type_idx").on(t.storeType),
    index("stores_category_idx").on(t.businessCategoryCode),
  ]
);
