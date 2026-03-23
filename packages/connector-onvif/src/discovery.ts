/**
 * WS-Discovery implementation for ONVIF camera discovery.
 *
 * Sends a SOAP Probe message via UDP multicast to the standard
 * WS-Discovery address (239.255.255.250:3702) and collects
 * ProbeMatch responses from ONVIF-compatible devices on the LAN.
 *
 * Phase A: lightweight regex-based XML extraction (no heavy XML parser).
 */

import dgram from "node:dgram";
import crypto from "node:crypto";
import type { OnvifDiscoveredDevice } from "./types.js";

const WS_DISCOVERY_MULTICAST = "239.255.255.250";
const WS_DISCOVERY_PORT = 3702;
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * SOAP Probe message template for ONVIF NetworkVideoTransmitter discovery.
 * The UNIQUE_ID placeholder is replaced with a fresh UUID per probe.
 */
const PROBE_MESSAGE = `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
            xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing"
            xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery"
            xmlns:dn="http://www.onvif.org/ver10/network/wsdl">
  <s:Header>
    <a:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</a:Action>
    <a:MessageID>uuid:UNIQUE_ID</a:MessageID>
    <a:To>urn:schemas-xmlsoap-org:ws:2005:04:discovery</a:To>
  </s:Header>
  <s:Body>
    <d:Probe>
      <d:Types>dn:NetworkVideoTransmitter</d:Types>
    </d:Probe>
  </s:Body>
</s:Envelope>`;

// ─── XML Extraction Helpers ────────────────────────────

/**
 * Extract text content between XML tags using regex.
 * Handles both prefixed (d:XAddrs) and unprefixed tags.
 */
function extractTagContent(xml: string, tagName: string): string | null {
  // Match with any namespace prefix: <prefix:tagName>...</prefix:tagName>
  const regex = new RegExp(`<[^>]*?${tagName}[^>]*>([\\s\\S]*?)<\\/[^>]*?${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract IP address from an XAddrs URL.
 * XAddrs typically looks like: http://192.168.1.100:80/onvif/device_service
 */
function extractIpFromXAddrs(xAddrs: string): string | null {
  // Take the first URL if multiple are space-separated
  const firstUrl = xAddrs.split(/\s+/)[0];
  const match = firstUrl.match(/\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
  return match ? match[1] : null;
}

/**
 * Parse a WS-Discovery ProbeMatch response into an OnvifDiscoveredDevice.
 * Returns null if essential fields (XAddrs, IP) cannot be extracted.
 */
function parseProbeResponse(xml: string): OnvifDiscoveredDevice | null {
  const xAddrs = extractTagContent(xml, "XAddrs");
  if (!xAddrs) return null;

  const ipAddress = extractIpFromXAddrs(xAddrs);
  if (!ipAddress) return null;

  const scopesRaw = extractTagContent(xml, "Scopes");
  const scopes = scopesRaw
    ? scopesRaw.split(/\s+/).filter((s) => s.length > 0)
    : [];

  const typesRaw = extractTagContent(xml, "Types");
  const types = typesRaw
    ? typesRaw.split(/\s+/).filter((t) => t.length > 0)
    : [];

  return { xAddrs, scopes, ipAddress, types };
}

// ─── Public API ────────────────────────────────────────

export interface DiscoverOptions {
  /** Discovery timeout in milliseconds (default: 5000) */
  timeout?: number;
}

/**
 * Discover ONVIF-compatible cameras on the local network via WS-Discovery.
 *
 * Sends a UDP multicast probe and collects responses for `timeout` ms.
 * Results are deduplicated by IP address.
 */
export async function discoverDevices(
  options?: DiscoverOptions
): Promise<OnvifDiscoveredDevice[]> {
  const timeout = options?.timeout ?? DEFAULT_TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const devices = new Map<string, OnvifDiscoveredDevice>();
    const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

    const timer = setTimeout(() => {
      socket.close();
      resolve(Array.from(devices.values()));
    }, timeout);

    socket.on("error", (err) => {
      clearTimeout(timer);
      socket.close();
      reject(err);
    });

    socket.on("message", (msg) => {
      const xml = msg.toString("utf-8");
      const device = parseProbeResponse(xml);

      if (device && !devices.has(device.ipAddress)) {
        devices.set(device.ipAddress, device);
      }
    });

    socket.bind(undefined, undefined, () => {
      const probeXml = PROBE_MESSAGE.replace(
        "UNIQUE_ID",
        crypto.randomUUID()
      );
      const buffer = Buffer.from(probeXml, "utf-8");

      socket.send(
        buffer,
        0,
        buffer.length,
        WS_DISCOVERY_PORT,
        WS_DISCOVERY_MULTICAST,
        (err) => {
          if (err) {
            clearTimeout(timer);
            socket.close();
            reject(err);
          }
        }
      );
    });
  });
}
