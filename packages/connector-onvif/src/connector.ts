/**
 * OnvifConnector — discovers ONVIF cameras on the local network
 * and maps them to Store Ontology Device entities.
 *
 * Follows the Connector<TRaw, TEntity> interface from @store-ontology/core.
 *
 * Phase A: WS-Discovery probe + basic device info extraction.
 * Phase B (future): full ONVIF profile querying, PTZ, streaming URLs.
 */

import { z } from "zod";
import type {
  Connector,
  ConnectorConfig,
  ConnectorResult,
} from "@store-ontology/core";
import {
  DeviceType,
  Manufacturer,
  DeviceStatus,
  CommunicationType,
} from "@store-ontology/core";
import type { OnvifDeviceInfo } from "./types.js";
import { discoverDevices, type DiscoverOptions } from "./discovery.js";
import { parseScopes } from "./parse.js";

// ─── Mapped Device Entity ──────────────────────────────

export const OnvifDeviceSchema = z.object({
  deviceType: DeviceType,
  manufacturer: Manufacturer,
  modelName: z.string(),
  status: DeviceStatus,
  /** RTSP URL — constructed from IP, actual path may vary per vendor */
  rtspUrl: z.string().nullable(),
  /** ONVIF profile support (e.g., ["S"]) */
  onvifProfileSupport: z.array(z.string()),
  communicationType: CommunicationType,
});

export type OnvifDevice = z.infer<typeof OnvifDeviceSchema>;

// ─── Manufacturer Detection ────────────────────────────

function normalizeManufacturer(raw: string): z.infer<typeof Manufacturer> {
  const lower = raw.toLowerCase();

  if (lower.includes("hanwha") || lower.includes("samsung")) return "HANWHA";
  if (lower.includes("hikvision")) return "HIKVISION";
  if (lower.includes("dahua")) return "DAHUA";

  return "OTHER";
}

// ─── Connector ─────────────────────────────────────────

export class OnvifConnector
  implements Connector<OnvifDeviceInfo, OnvifDevice>
{
  readonly config: ConnectorConfig = {
    name: "ONVIF Discovery Connector",
    version: "0.1.0",
    sourceSystem: "onvif",
  };

  /**
   * Map an OnvifDeviceInfo to a Store Ontology Device entity.
   */
  map(raw: OnvifDeviceInfo): OnvifDevice {
    const manufacturer = normalizeManufacturer(raw.manufacturer);

    return {
      deviceType: "CCTV_CAMERA",
      manufacturer,
      modelName: raw.model,
      status: "ACTIVE",
      rtspUrl: `rtsp://${raw.ipAddress}:554/profile2/media.smp`,
      onvifProfileSupport: ["S"],
      communicationType: "ETHERNET",
    };
  }

  /**
   * Discover ONVIF cameras on the local network and return mapped Device entities.
   *
   * @param params.timeout - Discovery timeout in ms (default: 5000)
   */
  async fetch(
    params: Record<string, unknown>
  ): Promise<ConnectorResult<OnvifDevice[]>> {
    const fetchedAt = new Date().toISOString();
    const timeout = typeof params.timeout === "number" ? params.timeout : undefined;
    const options: DiscoverOptions = { timeout };

    try {
      const discovered = await discoverDevices(options);

      const entities: OnvifDevice[] = discovered.map((d) => {
        const { manufacturer, model } = parseScopes(d.scopes);
        const info: OnvifDeviceInfo = {
          ipAddress: d.ipAddress,
          manufacturer,
          model,
          xAddrs: d.xAddrs,
          scopes: d.scopes,
        };
        return this.map(info);
      });

      return {
        success: true,
        data: entities,
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "DISCOVERY_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown discovery error",
            details: error,
          },
        ],
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt,
        },
      };
    }
  }

  /**
   * Validate a mapped device entity against the Zod schema.
   */
  validate(entity: OnvifDevice): boolean {
    const result = OnvifDeviceSchema.safeParse(entity);
    return result.success;
  }
}
