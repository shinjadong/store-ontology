/**
 * WAVE VMS REST API client.
 *
 * Provides typed access to Hanwha Vision WAVE VMS REST API v3.
 * Uses Basic Auth (username:password) over HTTP/HTTPS.
 *
 * Default WAVE server: http://localhost:7001
 */

import type { WaveSystemInfo, WaveCamera, WaveEvent } from "./types.js";

export interface WaveClientOptions {
  /** Base URL of the WAVE server (e.g., "http://192.168.1.100:7001") */
  baseUrl: string;
  /** Authentication credentials */
  auth: {
    username: string;
    password: string;
  };
}

export interface WaveClient {
  /** Get WAVE system information including server list */
  getSystemInfo(): Promise<WaveSystemInfo>;
  /** Get all cameras registered in the WAVE system */
  getCameras(): Promise<WaveCamera[]>;
  /** Get events, optionally filtered by start time */
  getEvents(since?: Date): Promise<WaveEvent[]>;
}

/**
 * Create a WAVE VMS REST API client.
 *
 * @example
 * ```ts
 * const client = createWaveClient("http://192.168.1.100:7001", {
 *   username: "admin",
 *   password: "password123",
 * });
 * const cameras = await client.getCameras();
 * ```
 */
export function createWaveClient(
  baseUrl: string,
  auth: { username: string; password: string }
): WaveClient {
  const authHeader =
    "Basic " + btoa(`${auth.username}:${auth.password}`);

  async function request<T>(endpoint: string): Promise<T> {
    const url = `${baseUrl.replace(/\/+$/, "")}${endpoint}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `WAVE API error: ${response.status} ${response.statusText} for ${endpoint}`
      );
    }

    return response.json() as Promise<T>;
  }

  return {
    async getSystemInfo(): Promise<WaveSystemInfo> {
      return request<WaveSystemInfo>("/rest/v3/system/info");
    },

    async getCameras(): Promise<WaveCamera[]> {
      return request<WaveCamera[]>("/rest/v3/devices");
    },

    async getEvents(since?: Date): Promise<WaveEvent[]> {
      const endpoint = since
        ? `/rest/v3/events?from=${since.getTime()}`
        : "/rest/v3/events";
      return request<WaveEvent[]>(endpoint);
    },
  };
}
