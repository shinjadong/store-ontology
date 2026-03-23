/**
 * Palantir Foundry compatibility layer.
 *
 * Design principle: Store Ontology should plug into Palantir Foundry
 * like a module. If Palantir wants Korean SMB data, buying this
 * ontology is cheaper than building it.
 *
 * Naming conventions follow Palantir's official rules:
 * - Object Type API Name: PascalCase (Store, Contract, Device)
 * - Object Type ID: kebab-case (store, contract, device)
 * - Property API Name: camelCase (storeId, monthlyFee)
 * - Link Type: snake_case verb (operates, installed_at)
 */

/**
 * Convert PascalCase Object Type name to kebab-case ID.
 * e.g., "InsurancePolicy" → "insurance-policy"
 */
export function toObjectTypeId(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Ensure property name is camelCase.
 * e.g., "store_id" → "storeId", "StoreId" → "storeId"
 */
export function toPropertyApiName(name: string): string {
  const camel = name.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  return camel.charAt(0).toLowerCase() + camel.slice(1);
}

/**
 * Ensure link type is snake_case verb.
 * e.g., "installedAt" → "installed_at"
 */
export function toLinkTypeId(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * Facility interface — Palantir-compatible abstract type.
 *
 * In Palantir Foundry, interfaces enable object type polymorphism.
 * `Store` implements `Facility`, so does `ManufacturingPlant`, `Warehouse`, etc.
 * This allows cross-vertical analytics across Palantir's Korean customer base.
 */
export interface Facility {
  facilityName: string;
  location: GeoJsonPoint | null;
  facilityType: string;
}

/**
 * GeoJSON Point (RFC 7946).
 * Used for all location data in the ontology.
 */
export interface GeoJsonPoint {
  type: "Point";
  coordinates: [longitude: number, latitude: number];
}
