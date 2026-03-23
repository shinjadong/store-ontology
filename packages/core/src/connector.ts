/**
 * Connector interface — the contract for all data source integrations.
 *
 * Open-source connectors (VAN, NTS, ONVIF, WAVE) and proprietary
 * security connectors (CAPS, S1, KT) all implement this same interface.
 *
 * Inspired by Palantir Foundry's Kinetic Layer pattern:
 * raw data source → map() → validated ontology entity.
 */

export interface ConnectorConfig {
  /** Human-readable connector name */
  name: string;
  /** Semantic version */
  version: string;
  /** Source system identifier (e.g., "nice-van", "nts-hometax", "onvif") */
  sourceSystem: string;
}

export interface ConnectorError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ConnectorResult<T> {
  success: boolean;
  data?: T;
  errors?: ConnectorError[];
  metadata: {
    sourceSystem: string;
    /** ISO 8601 timestamp */
    fetchedAt: string;
    /** SHA-256 hash of raw response for integrity */
    rawResponseHash?: string;
  };
}

export interface Connector<TRaw, TEntity> {
  readonly config: ConnectorConfig;

  /** Transform raw API/protocol response to ontology entity */
  map(raw: TRaw): TEntity;

  /** Fetch from source system and return mapped entity */
  fetch(
    params: Record<string, unknown>
  ): Promise<ConnectorResult<TEntity | TEntity[]>>;

  /** Validate the mapped entity against its Zod schema */
  validate(entity: TEntity): boolean;
}
