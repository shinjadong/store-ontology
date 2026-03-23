import { pgTable, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { stores } from "./store";

/**
 * Transaction — payment data mapped from VAN APIs (NICE, KCP, KSNET).
 *
 * PK is VAN TID (text), not UUID — the VAN transaction ID is the
 * natural key from the source system.
 *
 * Field names mirror NICE API response structure for 1:1 kinetic mapping.
 */
export const transactions = pgTable(
  "transactions",
  {
    transactionId: text("transaction_id").primaryKey(), // VAN TID
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    orderId: text("order_id"), // 가맹점 주문번호
    amount: integer("amount").notNull(),
    balanceAmount: integer("balance_amount"),
    payMethod: text("pay_method").notNull(), // CARD | BANK_TRANSFER | VIRTUAL_ACCOUNT | ...
    cardCode: text("card_code"), // 카드사 코드
    cardName: text("card_name"), // "삼성카드"
    cardNumber: text("card_number"), // 마스킹 XXXXXX****1234
    cardType: text("card_type"), // CREDIT | CHECK
    installmentMonths: integer("installment_months"), // 0 = 일시불
    approvalNumber: text("approval_number"), // 승인번호
    status: text("status").notNull().default("READY"), // READY | PAID | FAILED | CANCELLED | ...
    paidAt: timestamp("paid_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    vanProvider: text("van_provider"), // NICE | KCP | KSNET | KICC | SMARTRO
    pgProvider: text("pg_provider"),
    taxFreeAmount: integer("tax_free_amount"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("transactions_store_idx").on(t.storeId),
    index("transactions_status_idx").on(t.status),
    index("transactions_paid_at_idx").on(t.paidAt),
  ]
);
