/**
 * ONVIF WS-Discovery raw response types.
 *
 * These types represent the data extracted from WS-Discovery
 * ProbeMatch responses when scanning the local network for
 * ONVIF-compatible cameras.
 */

export interface OnvifDiscoveredDevice {
  /** XAddrs from ProbeMatch — service endpoint URL */
  xAddrs: string;
  /** Scopes from ProbeMatch — contains model, manufacturer info */
  scopes: string[];
  /** IP address extracted from XAddrs */
  ipAddress: string;
  /** Device types from ProbeMatch */
  types: string[];
}

export interface OnvifDeviceInfo {
  ipAddress: string;
  manufacturer: string;
  model: string;
  xAddrs: string;
  scopes: string[];
}
