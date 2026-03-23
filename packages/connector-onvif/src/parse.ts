/**
 * ONVIF scope parser — extracts structured device info from
 * ONVIF scope URIs found in WS-Discovery ProbeMatch responses.
 *
 * ONVIF scopes follow the pattern:
 *   onvif://www.onvif.org/<category>/<value>
 *
 * Examples:
 *   onvif://www.onvif.org/manufacturer/Hanwha%20Techwin
 *   onvif://www.onvif.org/hardware/XNO-6080R
 *   onvif://www.onvif.org/name/CAMERA_01
 *   onvif://www.onvif.org/location/office
 */

const SCOPE_PREFIX = "onvif://www.onvif.org/";

/**
 * Extract manufacturer and model from ONVIF scope URIs.
 */
export function parseScopes(scopes: string[]): {
  manufacturer: string;
  model: string;
} {
  let manufacturer = "Unknown";
  let model = "Unknown";

  for (const scope of scopes) {
    if (!scope.startsWith(SCOPE_PREFIX)) continue;

    const path = scope.slice(SCOPE_PREFIX.length);
    const slashIndex = path.indexOf("/");
    if (slashIndex === -1) continue;

    const category = path.slice(0, slashIndex);
    const value = decodeURIComponent(path.slice(slashIndex + 1)).trim();

    if (!value) continue;

    switch (category) {
      case "manufacturer":
        manufacturer = value;
        break;
      case "hardware":
        model = value;
        break;
    }
  }

  return { manufacturer, model };
}
