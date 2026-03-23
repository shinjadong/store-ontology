import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { stores } from "./store";

/** Product — nullable entity for franchise/retail use cases. */
export const products = pgTable(
  "products",
  {
    productId: uuid("product_id").defaultRandom().primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    productName: text("product_name").notNull(),
    category: text("category"),
    price: integer("price").notNull(),
    costPrice: integer("cost_price"), // 원가, nullable
    barcode: text("barcode"),
    stockQuantity: integer("stock_quantity"),
    vatIncluded: boolean("vat_included").notNull().default(true),
    status: text("status").notNull().default("ACTIVE"), // ACTIVE | SOLD_OUT | DISCONTINUED
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("products_store_idx").on(t.storeId)]
);
