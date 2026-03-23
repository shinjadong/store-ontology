/**
 * Hanwha Vision WAVE VMS REST API response types.
 *
 * Based on WAVE REST API v3 (https://docs.hanwhavision.com/wave).
 * Default server address: http://localhost:7001
 */

export interface WaveCamera {
  /** WAVE internal camera ID (UUID-like) */
  id: string;
  /** User-assigned camera name */
  name: string;
  /** RTSP stream URL */
  url: string;
  /** Current camera status */
  status: "Online" | "Offline" | "Unauthorized" | "Recording";
  /** Camera model (e.g., "XNO-8080R") */
  model?: string;
  /** Camera vendor/manufacturer (e.g., "Hanwha Techwin") */
  vendor?: string;
  /** Firmware version */
  firmware?: string;
  /** Physical/MAC address identifier */
  physicalId?: string;
  /** ID of the WAVE media server this camera is registered to */
  serverId: string;
}

export interface WaveEvent {
  /** WAVE event ID */
  id: string;
  /** Event type identifier */
  type: string;
  /** Event timestamp in Unix epoch milliseconds */
  timestamp: number;
  /** Associated camera ID (if applicable) */
  cameraId?: string;
  /** Short description/title */
  caption?: string;
  /** Detailed event description */
  description?: string;
  /** Event severity level */
  severity?: "info" | "warning" | "error";
}

export interface WaveSystemInfo {
  /** WAVE system display name */
  systemName: string;
  /** WAVE software version */
  version: string;
  /** List of media servers in this WAVE system */
  servers: Array<{
    id: string;
    name: string;
    status: "Online" | "Offline";
  }>;
}
