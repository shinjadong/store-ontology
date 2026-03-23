import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { stores } from "./store";
import { devices } from "./device";
import { insurancePolicies } from "./insurance-policy";

/**
 * Incident — security events, equipment failures, customer complaints.
 * Maps to 출동경비 dispatch data and CCTV alert events.
 * Legal requirement: 경비업법 mandates response within 25 minutes.
 */
export const incidents = pgTable(
  "incidents",
  {
    incidentId: uuid("incident_id").defaultRandom().primaryKey(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.storeId),
    incidentType: text("incident_type").notNull(), // INTRUSION | FIRE | PANIC_BUTTON | ...
    triggeredAt: timestamp("triggered_at", { withTimezone: true }).notNull(),
    detectedByDeviceId: uuid("detected_by_device_id").references(
      () => devices.deviceId
    ),
    sensorZone: text("sensor_zone"), // 감지기 위치 설명
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    arrivedAt: timestamp("arrived_at", { withTimezone: true }),
    responseTimeMinutes: integer("response_time_minutes"), // 법정 25분 이내
    resolution: text("resolution"), // 조치 결과
    status: text("status").notNull().default("TRIGGERED"), // TRIGGERED | DISPATCHED | ARRIVED | RESOLVED | FALSE_ALARM
    linkedInsurancePolicyId: uuid("linked_insurance_policy_id").references(
      () => insurancePolicies.policyId
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("incidents_store_idx").on(t.storeId),
    index("incidents_type_idx").on(t.incidentType),
    index("incidents_status_idx").on(t.status),
    index("incidents_triggered_idx").on(t.triggeredAt),
  ]
);
