/**
 * NICE Pay API authentication helpers.
 *
 * NICE Pay V2 API uses HTTP Basic Authentication:
 * Authorization: Basic base64(clientKey:secretKey)
 */

/**
 * Create a Basic Authentication header value for NICE Pay API.
 *
 * @param clientKey - Merchant client key issued by NICE
 * @param secretKey - Merchant secret key issued by NICE
 * @returns Authorization header value: "Basic " + base64(clientKey:secretKey)
 */
export function createBasicAuthHeader(
  clientKey: string,
  secretKey: string
): string {
  const credentials = `${clientKey}:${secretKey}`;
  const encoded = btoa(credentials);
  return `Basic ${encoded}`;
}
