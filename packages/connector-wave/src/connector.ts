/**
 * WAVE VMS connectors — map Hanwha WAVE API responses to Store Ontology entities.
 *
 * Two connectors:
 * 1. WaveDeviceConnector: WaveCamera → DeviceLike (device entity)
 * 2. WaveIncidentConnector: WaveEvent → IncidentLike (incident entity)
 */

import type {
  Connector,
  ConnectorConfig,
  ConnectorResult,
} from "@store-ontology/core";
import type { WaveCamera, WaveEvent } from "./types.js";
import { createWaveClient } from "./client.js";

// ─── Mapped Entity Shapes ────────────────────────────

/**
 * DeviceLike — the shape produced by mapping a WAVE camera
 * to the Store Ontology Device entity.
 */
export interface DeviceLike {
  /** Generated deterministic UUID from WAVE camera ID */
  deviceId: string;
  deviceType: "CCTV_CAMERA";
  manufacturer: "HANWHA" | "HIKVISION" | "DAHUA" | "OTHER";
  modelName: string;
  status: "ACTIVE" | "MALFUNCTION" | "INSTALLED";
  rtspUrl: string;
  onvifProfileSupport: string[];
  /** Original WAVE camera ID for reference */
  waveSourceId: string;
  /** WAVE server ID this camera belongs to */
  waveServerId: string;
}

/**
 * IncidentLike — the shape produced by mapping a WAVE event
 * to the Store Ontology Incident entity.
 * Returns null when the event is not incident-worthy (e.g., simple motion).
 */
export interface IncidentLike {
  incidentType:
    | "COMM_FAILURE"
    | "EQUIPMENT_MALFUNCTION"
    | "INTRUSION";
  triggeredAt: string;
  status: "TRIGGERED";
  /** Original WAVE event ID */
  waveSourceId: string;
  /** Associated camera ID (if any) */
  detectedByWaveCameraId?: string;
  caption?: string;
  description?: string;
}

// ─── Helper: deterministic UUID v5-style from WAVE ID ──

/**
 * Generate a deterministic UUID-like string from a WAVE camera ID.
 * Uses a simple hash-to-UUID approach (not cryptographic, just for stable mapping).
 */
function waveIdToUuid(waveId: string): string {
  // Simple deterministic mapping: pad/hash the WAVE ID into UUID format.
  // In production, use UUID v5 with a namespace. For now, create a stable ID.
  const hex = Array.from(waveId)
    .reduce((hash, char) => {
      const updated = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
      return updated;
    }, 0)
    .toString(16)
    .replace("-", "")
    .padStart(8, "0");

  const padded = (hex + waveId.replace(/[^a-f0-9]/gi, "")).padEnd(
    32,
    "0"
  );
  const h = padded.slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

/**
 * Detect manufacturer from WAVE camera vendor string.
 */
function detectManufacturer(
  vendor?: string
): DeviceLike["manufacturer"] {
  if (!vendor) return "OTHER";
  const v = vendor.toLowerCase();
  if (v.includes("hanwha") || v.includes("samsung techwin") || v.includes("wisenet"))
    return "HANWHA";
  if (v.includes("hikvision")) return "HIKVISION";
  if (v.includes("dahua")) return "DAHUA";
  return "OTHER";
}

// ─── WaveDeviceConnector ─────────────────────────────

export class WaveDeviceConnector
  implements Connector<WaveCamera, DeviceLike>
{
  readonly config: ConnectorConfig = {
    name: "Hanwha WAVE VMS Device Connector",
    version: "0.1.0",
    sourceSystem: "wave-vms",
  };

  /**
   * Map a WAVE camera to a DeviceLike entity.
   */
  map(raw: WaveCamera): DeviceLike {
    const manufacturer = detectManufacturer(raw.vendor);

    // Map WAVE status to ontology DeviceStatus
    let status: DeviceLike["status"];
    switch (raw.status) {
      case "Online":
      case "Recording":
        status = "ACTIVE";
        break;
      case "Offline":
        status = "MALFUNCTION";
        break;
      case "Unauthorized":
        // Unauthorized means the camera exists but credentials are wrong
        status = "INSTALLED";
        break;
      default:
        status = "MALFUNCTION";
    }

    return {
      deviceId: waveIdToUuid(raw.id),
      deviceType: "CCTV_CAMERA",
      manufacturer,
      modelName: raw.model ?? raw.name,
      status,
      rtspUrl: raw.url,
      // Default ONVIF profiles for Hanwha cameras (Profile S for streaming, T for advanced)
      onvifProfileSupport:
        manufacturer === "HANWHA" ? ["S", "T"] : ["S"],
      waveSourceId: raw.id,
      waveServerId: raw.serverId,
    };
  }

  /**
   * Fetch all cameras from WAVE and map to DeviceLike entities.
   *
   * @param params.baseUrl - WAVE server URL (e.g., "http://192.168.1.100:7001")
   * @param params.username - WAVE admin username
   * @param params.password - WAVE admin password
   */
  async fetch(
    params: Record<string, unknown>
  ): Promise<ConnectorResult<DeviceLike[]>> {
    const { baseUrl, username, password } = params as {
      baseUrl: string;
      username: string;
      password: string;
    };

    try {
      const client = createWaveClient(baseUrl, { username, password });
      const cameras = await client.getCameras();
      const devices = cameras.map((cam) => this.map(cam));

      return {
        success: true,
        data: devices,
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "WAVE_FETCH_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Unknown WAVE API error",
            details: error,
          },
        ],
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Validate a DeviceLike entity.
   */
  validate(entity: DeviceLike): boolean {
    return (
      typeof entity.deviceId === "string" &&
      entity.deviceId.length > 0 &&
      entity.deviceType === "CCTV_CAMERA" &&
      typeof entity.rtspUrl === "string"
    );
  }
}

// ─── WaveIncidentConnector ───────────────────────────

/**
 * Map WAVE event types to ontology IncidentType.
 * Returns null for events that are not incident-worthy.
 */
function mapEventToIncidentType(
  event: WaveEvent
): IncidentLike["incidentType"] | null {
  switch (event.type) {
    case "device_disconnected":
      return "COMM_FAILURE";
    case "device_ip_conflict":
      return "EQUIPMENT_MALFUNCTION";
    case "analytics":
      // Only analytics events with error severity are treated as incidents
      if (event.severity === "error") return "INTRUSION";
      return null;
    case "motion":
      // Simple motion is not an incident
      return null;
    default:
      // Unknown event types with error severity may be incidents
      if (event.severity === "error") return "EQUIPMENT_MALFUNCTION";
      return null;
  }
}

export class WaveIncidentConnector
  implements Connector<WaveEvent, IncidentLike | null>
{
  readonly config: ConnectorConfig = {
    name: "Hanwha WAVE VMS Incident Connector",
    version: "0.1.0",
    sourceSystem: "wave-vms",
  };

  /**
   * Map a WAVE event to an IncidentLike entity.
   * Returns null if the event is not incident-worthy (e.g., simple motion).
   */
  map(raw: WaveEvent): IncidentLike | null {
    const incidentType = mapEventToIncidentType(raw);
    if (incidentType === null) return null;

    return {
      incidentType,
      triggeredAt: new Date(raw.timestamp).toISOString(),
      status: "TRIGGERED",
      waveSourceId: raw.id,
      detectedByWaveCameraId: raw.cameraId,
      caption: raw.caption,
      description: raw.description,
    };
  }

  /**
   * Fetch events from WAVE and map to IncidentLike entities.
   * Non-incident events (motion, info-level) are filtered out.
   *
   * @param params.baseUrl - WAVE server URL
   * @param params.username - WAVE admin username
   * @param params.password - WAVE admin password
   * @param params.since - Optional ISO 8601 string to fetch events after this time
   */
  async fetch(
    params: Record<string, unknown>
  ): Promise<ConnectorResult<IncidentLike[]>> {
    const { baseUrl, username, password, since } = params as {
      baseUrl: string;
      username: string;
      password: string;
      since?: string;
    };

    try {
      const client = createWaveClient(baseUrl, { username, password });
      const sinceDate = since ? new Date(since) : undefined;
      const events = await client.getEvents(sinceDate);

      // Map and filter: only keep incident-worthy events
      const incidents = events
        .map((evt) => this.map(evt))
        .filter((item): item is IncidentLike => item !== null);

      return {
        success: true,
        data: incidents,
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "WAVE_FETCH_ERROR",
            message:
              error instanceof Error
                ? error.message
                : "Unknown WAVE API error",
            details: error,
          },
        ],
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Validate an IncidentLike entity.
   */
  validate(entity: IncidentLike | null): boolean {
    if (entity === null) return true;
    return (
      typeof entity.incidentType === "string" &&
      typeof entity.triggeredAt === "string" &&
      entity.status === "TRIGGERED"
    );
  }
}
