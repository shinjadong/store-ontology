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

/**
 * TaxRecord — tax filing data from 국세청/HomeTax/PopBill/CODEF.
 *
 * Covers: 부가세 신고, 종소세, 전자세금계산서, 현금영수증, 카드매출집계.
 * Period format: "2026-H1" (half-year), "2026-Q1" (quarter).
 */
export const taxRecords = pgTable(
  "tax_records",
  {
    taxRecordId: uuid("tax_record_id").defaultRandom().primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    recordType: text("record_type").notNull(), // VAT_RETURN | INCOME_TAX | ELECTRONIC_INVOICE | ...
    period: text("period").notNull(), // "2026-H1", "2026-Q1"
    filingDate: date("filing_date"),
    supplyCostTotal: integer("supply_cost_total"), // 공급가액 합계
    taxTotal: integer("tax_total"), // 세액 합계
    totalAmount: integer("total_amount"), // 합계금액
    ntsConfirmNumber: text("nts_confirm_number"), // 국세청승인번호
    status: text("status").notNull().default("DRAFT"), // DRAFT | FILED | AMENDED | ACCEPTED
    source: text("source").notNull().default("MANUAL"), // HOMETAX_API | POPBILL | CODEF | MANUAL
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("tax_records_store_idx").on(t.storeId),
    index("tax_records_type_idx").on(t.recordType),
    index("tax_records_period_idx").on(t.period),
  ]
);
