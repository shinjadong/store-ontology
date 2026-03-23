import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { stores } from "./store";
import { contracts } from "./contract";

export const devices = pgTable(
  "devices",
  {
    deviceId: uuid("device_id").defaultRandom().primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    contractId: uuid("contract_id").references(() => contracts.contractId),
    deviceType: text("device_type").notNull(), // CCTV_CAMERA | NVR | SENSOR_* | POS_TERMINAL | ...
    manufacturer: text("manufacturer").default("OTHER"), // HANWHA | HIKVISION | SAMSUNG | ...
    modelName: text("model_name"),
    serialNumber: text("serial_number"),
    installedDate: date("installed_date"),
    status: text("status").notNull().default("ORDERED"), // ORDERED | INSTALLED | ACTIVE | MALFUNCTION | DECOMMISSIONED
    onvifProfileSupport: text("onvif_profile_support").array(), // ["S", "T", "G", "M"]
    rtspUrl: text("rtsp_url"),
    communicationType: text("communication_type"), // ETHERNET | LTE | WIFI | SERIAL | HYBRID
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("devices_store_idx").on(t.storeId),
    index("devices_type_idx").on(t.deviceType),
    index("devices_status_idx").on(t.status),
  ]
);
