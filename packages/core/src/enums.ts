import { z } from "zod";

// ─── Store ───────────────────────────────────────────
export const StoreType = z.enum([
  "RESTAURANT",
  "CAFE",
  "RETAIL",
  "HAIR_SALON",
  "CLINIC",
  "FRANCHISE",
  "UNMANNED",
  "OFFICE",
  "RESIDENTIAL",
  "OTHER",
]);
export type StoreType = z.infer<typeof StoreType>;

export const TaxationType = z.enum(["GENERAL", "SIMPLIFIED", "EXEMPT"]);
export type TaxationType = z.infer<typeof TaxationType>;

// ─── Contract ────────────────────────────────────────
export const ContractType = z.enum([
  "CCTV",
  "GUARD",
  "POS",
  "VAN",
  "INSURANCE",
  "DISPATCH",
  "DELIVERY",
  "TAX_SERVICE",
]);
export type ContractType = z.infer<typeof ContractType>;

export const ContractStatus = z.enum([
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "TERMINATED",
]);
export type ContractStatus = z.infer<typeof ContractStatus>;

export const SignedVia = z.enum([
  "DIRECT_MARKET",
  "AGENT_VISIT",
  "PHONE_TM",
  "ONLINE",
  "SELF",
]);
export type SignedVia = z.infer<typeof SignedVia>;

export const EquipmentOwnership = z.enum(["RENTAL", "PURCHASE"]);
export type EquipmentOwnership = z.infer<typeof EquipmentOwnership>;

// ─── Device ──────────────────────────────────────────
export const DeviceType = z.enum([
  "CCTV_CAMERA",
  "NVR",
  "DVR",
  "SENSOR_MAGNETIC",
  "SENSOR_PIR",
  "SENSOR_INFRARED",
  "SAFE_SENSOR",
  "PANIC_BUTTON",
  "MAIN_CONTROLLER",
  "POS_TERMINAL",
  "CARD_READER",
  "KIOSK",
  "TABLE_ORDER",
  "DOORBELL_CAM",
]);
export type DeviceType = z.infer<typeof DeviceType>;

export const Manufacturer = z.enum([
  "HANWHA",
  "HIKVISION",
  "DAHUA",
  "KT",
  "SAMSUNG",
  "PAYHERE",
  "NICE",
  "TOSS",
  "OTHER",
]);
export type Manufacturer = z.infer<typeof Manufacturer>;

export const DeviceStatus = z.enum([
  "ORDERED",
  "INSTALLED",
  "ACTIVE",
  "MALFUNCTION",
  "DECOMMISSIONED",
]);
export type DeviceStatus = z.infer<typeof DeviceStatus>;

export const CommunicationType = z.enum([
  "ETHERNET",
  "LTE",
  "WIFI",
  "SERIAL",
  "HYBRID",
]);
export type CommunicationType = z.infer<typeof CommunicationType>;

// ─── Provider ────────────────────────────────────────
export const ProviderCategory = z.enum([
  "SECURITY",
  "PAYMENT",
  "POS",
  "INSURANCE",
  "DELIVERY",
  "TAX_SERVICE",
  "TELECOM",
]);
export type ProviderCategory = z.infer<typeof ProviderCategory>;

export const ApiType = z.enum(["REST", "SOAP", "PROPRIETARY", "NONE"]);
export type ApiType = z.infer<typeof ApiType>;

// ─── Transaction ─────────────────────────────────────
export const PayMethod = z.enum([
  "CARD",
  "BANK_TRANSFER",
  "VIRTUAL_ACCOUNT",
  "MOBILE",
  "KAKAO_PAY",
  "NAVER_PAY",
  "ZERO_PAY",
  "CARROT_PAY",
  "CASH",
]);
export type PayMethod = z.infer<typeof PayMethod>;

export const CardType = z.enum(["CREDIT", "CHECK"]);
export type CardType = z.infer<typeof CardType>;

export const TransactionStatus = z.enum([
  "READY",
  "PAID",
  "FAILED",
  "CANCELLED",
  "PARTIAL_CANCELLED",
  "EXPIRED",
]);
export type TransactionStatus = z.infer<typeof TransactionStatus>;

export const VanProvider = z.enum([
  "NICE",
  "KCP",
  "KSNET",
  "KICC",
  "SMARTRO",
]);
export type VanProvider = z.infer<typeof VanProvider>;

// ─── Product ─────────────────────────────────────────
export const ProductStatus = z.enum(["ACTIVE", "SOLD_OUT", "DISCONTINUED"]);
export type ProductStatus = z.infer<typeof ProductStatus>;

// ─── Customer ────────────────────────────────────────
export const CustomerTier = z.enum(["BRONZE", "SILVER", "GOLD", "VIP"]);
export type CustomerTier = z.infer<typeof CustomerTier>;

// ─── Incident ────────────────────────────────────────
export const IncidentType = z.enum([
  "INTRUSION",
  "FIRE",
  "PANIC_BUTTON",
  "POWER_FAILURE",
  "COMM_FAILURE",
  "THEFT",
  "EQUIPMENT_MALFUNCTION",
  "COMPLAINT",
]);
export type IncidentType = z.infer<typeof IncidentType>;

export const IncidentStatus = z.enum([
  "TRIGGERED",
  "DISPATCHED",
  "ARRIVED",
  "RESOLVED",
  "FALSE_ALARM",
]);
export type IncidentStatus = z.infer<typeof IncidentStatus>;

// ─── TaxRecord ───────────────────────────────────────
export const TaxRecordType = z.enum([
  "VAT_RETURN",
  "INCOME_TAX",
  "ELECTRONIC_INVOICE",
  "CASH_RECEIPT",
  "CARD_SALES_AGGREGATE",
  "WITHHOLDING",
]);
export type TaxRecordType = z.infer<typeof TaxRecordType>;

export const TaxRecordStatus = z.enum([
  "DRAFT",
  "FILED",
  "AMENDED",
  "ACCEPTED",
]);
export type TaxRecordStatus = z.infer<typeof TaxRecordStatus>;

export const TaxRecordSource = z.enum([
  "HOMETAX_API",
  "POPBILL",
  "CODEF",
  "MANUAL",
]);
export type TaxRecordSource = z.infer<typeof TaxRecordSource>;

// ─── InsurancePolicy ─────────────────────────────────
export const PolicyType = z.enum([
  "FIRE",
  "LIABILITY",
  "THEFT",
  "COMPREHENSIVE",
]);
export type PolicyType = z.infer<typeof PolicyType>;

export const PolicyStatus = z.enum(["ACTIVE", "EXPIRED", "CLAIMED"]);
export type PolicyStatus = z.infer<typeof PolicyStatus>;
