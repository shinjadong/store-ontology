// ─── Connector Interface ─────────────────────────────
export type {
  Connector,
  ConnectorConfig,
  ConnectorResult,
  ConnectorError,
} from "./connector.js";

// ─── Palantir Compatibility ──────────────────────────
export {
  toObjectTypeId,
  toPropertyApiName,
  toLinkTypeId,
} from "./palantir.js";
export type { Facility, GeoJsonPoint } from "./palantir.js";

// ─── Enums (Zod schemas + TypeScript types) ──────────
export {
  // Store
  StoreType,
  TaxationType,
  // Contract
  ContractType,
  ContractStatus,
  SignedVia,
  EquipmentOwnership,
  // Device
  DeviceType,
  Manufacturer,
  DeviceStatus,
  CommunicationType,
  // Provider
  ProviderCategory,
  ApiType,
  // Transaction
  PayMethod,
  CardType,
  TransactionStatus,
  VanProvider,
  // Product
  ProductStatus,
  // Customer
  CustomerTier,
  // Incident
  IncidentType,
  IncidentStatus,
  // TaxRecord
  TaxRecordType,
  TaxRecordStatus,
  TaxRecordSource,
  // InsurancePolicy
  PolicyType,
  PolicyStatus,
} from "./enums.js";

// Re-export types
export type {
  StoreType as StoreTypeValue,
  TaxationType as TaxationTypeValue,
  ContractType as ContractTypeValue,
  ContractStatus as ContractStatusValue,
  DeviceType as DeviceTypeValue,
  PayMethod as PayMethodValue,
  TransactionStatus as TransactionStatusValue,
  IncidentType as IncidentTypeValue,
  TaxRecordType as TaxRecordTypeValue,
  PolicyType as PolicyTypeValue,
} from "./enums.js";
