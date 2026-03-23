import { relations } from "drizzle-orm";
import { owners } from "./tables/owner";
import { stores } from "./tables/store";
import { providers } from "./tables/provider";
import { contracts } from "./tables/contract";
import { devices } from "./tables/device";
import { transactions } from "./tables/transaction";
import { products } from "./tables/product";
import { customers } from "./tables/customer";
import { incidents } from "./tables/incident";
import { taxRecords } from "./tables/tax-record";
import { insurancePolicies } from "./tables/insurance-policy";

/**
 * Link Types — Palantir-style relationship definitions.
 *
 * Naming: snake_case verbs following Palantir convention.
 * operates:      Owner → Store (one-to-many)
 * installed_at:  Device → Store (many-to-one)
 * governs:       Contract → Device[] (one-to-many)
 * provided_by:   Contract → Provider (many-to-one)
 * signed_at:     Contract → Store (many-to-one)
 * recorded_for:  Transaction → Store (many-to-one)
 * triggered_at:  Incident → Store (many-to-one)
 * detected_by:   Incident → Device (many-to-one)
 * filed_for:     TaxRecord → Store (many-to-one)
 * covers:        InsurancePolicy → Store (many-to-one)
 */

// Owner ←→ Store (operates)
export const ownersRelations = relations(owners, ({ many }) => ({
  stores: many(stores),
}));

// Store ←→ everything
export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(owners, {
    fields: [stores.ownerId],
    references: [owners.ownerId],
  }),
  contracts: many(contracts),
  devices: many(devices),
  transactions: many(transactions),
  products: many(products),
  customers: many(customers),
  incidents: many(incidents),
  taxRecords: many(taxRecords),
  insurancePolicies: many(insurancePolicies),
}));

// Provider ←→ Contract (provided_by)
export const providersRelations = relations(providers, ({ many }) => ({
  contracts: many(contracts),
}));

// Contract ←→ Store, Provider, Device
export const contractsRelations = relations(contracts, ({ one, many }) => ({
  store: one(stores, {
    fields: [contracts.storeId],
    references: [stores.storeId],
  }),
  provider: one(providers, {
    fields: [contracts.providerId],
    references: [providers.providerId],
  }),
  devices: many(devices),
}));

// Device ←→ Store, Contract
export const devicesRelations = relations(devices, ({ one }) => ({
  store: one(stores, {
    fields: [devices.storeId],
    references: [stores.storeId],
  }),
  contract: one(contracts, {
    fields: [devices.contractId],
    references: [contracts.contractId],
  }),
}));

// Transaction → Store
export const transactionsRelations = relations(transactions, ({ one }) => ({
  store: one(stores, {
    fields: [transactions.storeId],
    references: [stores.storeId],
  }),
}));

// Product → Store
export const productsRelations = relations(products, ({ one }) => ({
  store: one(stores, {
    fields: [products.storeId],
    references: [stores.storeId],
  }),
}));

// Customer → Store
export const customersRelations = relations(customers, ({ one }) => ({
  store: one(stores, {
    fields: [customers.storeId],
    references: [stores.storeId],
  }),
}));

// Incident → Store, Device, InsurancePolicy
export const incidentsRelations = relations(incidents, ({ one }) => ({
  store: one(stores, {
    fields: [incidents.storeId],
    references: [stores.storeId],
  }),
  detectedByDevice: one(devices, {
    fields: [incidents.detectedByDeviceId],
    references: [devices.deviceId],
  }),
  linkedInsurancePolicy: one(insurancePolicies, {
    fields: [incidents.linkedInsurancePolicyId],
    references: [insurancePolicies.policyId],
  }),
}));

// TaxRecord → Store
export const taxRecordsRelations = relations(taxRecords, ({ one }) => ({
  store: one(stores, {
    fields: [taxRecords.storeId],
    references: [stores.storeId],
  }),
}));

// InsurancePolicy → Store
export const insurancePoliciesRelations = relations(
  insurancePolicies,
  ({ one }) => ({
    store: one(stores, {
      fields: [insurancePolicies.storeId],
      references: [stores.storeId],
    }),
  })
);
