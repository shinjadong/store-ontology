/**
 * Korean Business Registration Number (사업자등록번호) Validation
 *
 * Format: XXX-XX-XXXXX (10 digits)
 *   - Digits 1-3: Tax office code (세무서코드)
 *   - Digits 4-5: Classification code (업태구분코드)
 *   - Digits 6-9: Serial number (일련번호)
 *   - Digit 10:   Check digit (검증번호)
 */

// ─── Types ──────────────────────────────────────────────

export type BusinessType =
  | "INDIVIDUAL_TAXABLE" // 개인과세 (01-79)
  | "INDIVIDUAL_EXEMPT" // 개인면세 (90-99)
  | "CORPORATE_HQ" // 영리법인본점 (81, 86-88)
  | "NON_PROFIT" // 비영리법인 (82)
  | "CORPORATE_BRANCH"; // 법인지점 (85)

export interface BusinessNumberValidation {
  valid: boolean;
  taxOfficeCode: string;
  businessType: string;
  error?: string;
}

export interface BusinessNumberParts {
  taxOfficeCode: string;
  categoryCode: string;
  serialNumber: string;
  checkDigit: string;
}

// ─── Constants ──────────────────────────────────────────

const CHECK_WEIGHTS = [1, 3, 7, 1, 3, 7, 1, 3, 5] as const;

// ─── Helpers ────────────────────────────────────────────

/**
 * Strips hyphens and whitespace, returning only digits.
 */
function sanitize(brn: string): string {
  return brn.replace(/[\s-]/g, "");
}

/**
 * Determines the business type from the 2-digit category code (digits 4-5).
 */
function classifyBusinessType(categoryCode: string): BusinessType | null {
  const code = parseInt(categoryCode, 10);
  if (isNaN(code) || code < 1 || code > 99) return null;

  if (code >= 1 && code <= 79) return "INDIVIDUAL_TAXABLE";
  if (code >= 90 && code <= 99) return "INDIVIDUAL_EXEMPT";
  if (code === 81 || (code >= 86 && code <= 88)) return "CORPORATE_HQ";
  if (code === 82) return "NON_PROFIT";
  if (code === 85) return "CORPORATE_BRANCH";

  // codes 80, 83, 84, 89 are unassigned
  return null;
}

/**
 * Computes the check digit for the first 9 digits of a BRN.
 */
function computeCheckDigit(digits: number[]): number {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * CHECK_WEIGHTS[i];
  }
  sum += Math.floor((digits[8] * 5) / 10);
  return (10 - (sum % 10)) % 10;
}

// ─── Public API ─────────────────────────────────────────

/**
 * Validates a Korean Business Registration Number (사업자등록번호).
 *
 * @param brn - The business registration number (with or without hyphens)
 * @returns Validation result with business type info
 */
export function validateBusinessNumber(brn: string): BusinessNumberValidation {
  const raw = sanitize(brn);

  if (raw.length !== 10) {
    return {
      valid: false,
      taxOfficeCode: "",
      businessType: "",
      error: "Business number must be exactly 10 digits",
    };
  }

  if (!/^\d{10}$/.test(raw)) {
    return {
      valid: false,
      taxOfficeCode: "",
      businessType: "",
      error: "Business number must contain only digits",
    };
  }

  const digits = raw.split("").map(Number);
  const taxOfficeCode = raw.slice(0, 3);
  const categoryCode = raw.slice(3, 5);

  const businessType = classifyBusinessType(categoryCode);
  if (!businessType) {
    return {
      valid: false,
      taxOfficeCode,
      businessType: "",
      error: `Unknown category code: ${categoryCode}`,
    };
  }

  const expectedCheckDigit = computeCheckDigit(digits);
  if (expectedCheckDigit !== digits[9]) {
    return {
      valid: false,
      taxOfficeCode,
      businessType,
      error: `Invalid check digit: expected ${expectedCheckDigit}, got ${digits[9]}`,
    };
  }

  return {
    valid: true,
    taxOfficeCode,
    businessType,
  };
}

/**
 * Parses a business registration number into its component parts.
 *
 * @param brn - The business registration number (with or without hyphens)
 * @returns Parsed parts, or null if the format is invalid
 */
export function parseBusinessNumber(brn: string): BusinessNumberParts | null {
  const raw = sanitize(brn);

  if (raw.length !== 10 || !/^\d{10}$/.test(raw)) {
    return null;
  }

  return {
    taxOfficeCode: raw.slice(0, 3),
    categoryCode: raw.slice(3, 5),
    serialNumber: raw.slice(5, 9),
    checkDigit: raw.slice(9, 10),
  };
}

/**
 * Formats a 10-digit business registration number as XXX-XX-XXXXX.
 *
 * @param brn - Raw digits or already-formatted string
 * @returns Formatted string, or the original if invalid
 */
export function formatBusinessNumber(brn: string): string {
  const raw = sanitize(brn);

  if (raw.length !== 10 || !/^\d{10}$/.test(raw)) {
    return brn;
  }

  return `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5)}`;
}
