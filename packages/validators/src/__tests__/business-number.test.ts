import { describe, it, expect } from "vitest";
import {
  validateBusinessNumber,
  parseBusinessNumber,
  formatBusinessNumber,
} from "../business-number.js";

// ─── Helper: generate a valid BRN from first 9 digits ──

function makeValidBrn(first9: string): string {
  const digits = first9.split("").map(Number);
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * weights[i];
  }
  sum += Math.floor((digits[8] * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;
  return first9 + String(checkDigit);
}

// ─── Known valid BRNs (computed via algorithm) ──────────

// 101-01-0001X → Individual Taxable (category 01)
const VALID_INDIVIDUAL = makeValidBrn("101010001");
// 214-90-1234X → Individual Exempt (category 90)
const VALID_EXEMPT = makeValidBrn("214901234");
// 110-81-0001X → Corporate HQ (category 81)
const VALID_CORPORATE_HQ = makeValidBrn("110810001");
// 120-86-5678X → Corporate HQ (category 86)
const VALID_CORPORATE_HQ_86 = makeValidBrn("120865678");
// 105-82-0010X → Non-profit (category 82)
const VALID_NON_PROFIT = makeValidBrn("105820010");
// 130-85-9999X → Corporate Branch (category 85)
const VALID_BRANCH = makeValidBrn("130859999");

describe("validateBusinessNumber", () => {
  it("validates a correct individual taxable BRN", () => {
    const result = validateBusinessNumber(VALID_INDIVIDUAL);
    expect(result.valid).toBe(true);
    expect(result.taxOfficeCode).toBe("101");
    expect(result.businessType).toBe("INDIVIDUAL_TAXABLE");
    expect(result.error).toBeUndefined();
  });

  it("validates a correct individual exempt BRN", () => {
    const result = validateBusinessNumber(VALID_EXEMPT);
    expect(result.valid).toBe(true);
    expect(result.businessType).toBe("INDIVIDUAL_EXEMPT");
  });

  it("validates a correct corporate HQ BRN (81)", () => {
    const result = validateBusinessNumber(VALID_CORPORATE_HQ);
    expect(result.valid).toBe(true);
    expect(result.businessType).toBe("CORPORATE_HQ");
  });

  it("validates a correct corporate HQ BRN (86)", () => {
    const result = validateBusinessNumber(VALID_CORPORATE_HQ_86);
    expect(result.valid).toBe(true);
    expect(result.businessType).toBe("CORPORATE_HQ");
  });

  it("validates a correct non-profit BRN", () => {
    const result = validateBusinessNumber(VALID_NON_PROFIT);
    expect(result.valid).toBe(true);
    expect(result.businessType).toBe("NON_PROFIT");
  });

  it("validates a correct corporate branch BRN", () => {
    const result = validateBusinessNumber(VALID_BRANCH);
    expect(result.valid).toBe(true);
    expect(result.businessType).toBe("CORPORATE_BRANCH");
  });

  it("accepts hyphenated format", () => {
    const formatted = `${VALID_INDIVIDUAL.slice(0, 3)}-${VALID_INDIVIDUAL.slice(3, 5)}-${VALID_INDIVIDUAL.slice(5)}`;
    const result = validateBusinessNumber(formatted);
    expect(result.valid).toBe(true);
  });

  it("rejects a BRN with wrong check digit", () => {
    // Flip the last digit
    const lastDigit = parseInt(VALID_INDIVIDUAL[9], 10);
    const wrongDigit = (lastDigit + 1) % 10;
    const invalid = VALID_INDIVIDUAL.slice(0, 9) + String(wrongDigit);
    const result = validateBusinessNumber(invalid);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid check digit");
  });

  it("rejects a BRN with wrong length", () => {
    const result = validateBusinessNumber("12345");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("10 digits");
  });

  it("rejects a BRN with non-digit characters", () => {
    const result = validateBusinessNumber("12345678ab");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("only digits");
  });

  it("rejects a BRN with unassigned category code", () => {
    // Category 80 is unassigned
    const brn = makeValidBrn("101800001");
    const result = validateBusinessNumber(brn);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown category code");
  });
});

describe("parseBusinessNumber", () => {
  it("parses a valid BRN into parts", () => {
    const parts = parseBusinessNumber(VALID_INDIVIDUAL);
    expect(parts).not.toBeNull();
    expect(parts!.taxOfficeCode).toBe("101");
    expect(parts!.categoryCode).toBe("01");
    expect(parts!.serialNumber).toBe("0001");
    expect(parts!.checkDigit).toBe(VALID_INDIVIDUAL[9]);
  });

  it("parses a hyphenated BRN", () => {
    const formatted = `${VALID_EXEMPT.slice(0, 3)}-${VALID_EXEMPT.slice(3, 5)}-${VALID_EXEMPT.slice(5)}`;
    const parts = parseBusinessNumber(formatted);
    expect(parts).not.toBeNull();
    expect(parts!.taxOfficeCode).toBe("214");
    expect(parts!.categoryCode).toBe("90");
    expect(parts!.serialNumber).toBe("1234");
  });

  it("returns null for invalid input", () => {
    expect(parseBusinessNumber("short")).toBeNull();
    expect(parseBusinessNumber("abcdefghij")).toBeNull();
    expect(parseBusinessNumber("")).toBeNull();
  });
});

describe("formatBusinessNumber", () => {
  it("formats raw digits as XXX-XX-XXXXX", () => {
    expect(formatBusinessNumber(VALID_INDIVIDUAL)).toBe(
      `${VALID_INDIVIDUAL.slice(0, 3)}-${VALID_INDIVIDUAL.slice(3, 5)}-${VALID_INDIVIDUAL.slice(5)}`,
    );
  });

  it("reformats an already-hyphenated BRN", () => {
    const input = `${VALID_INDIVIDUAL.slice(0, 3)}-${VALID_INDIVIDUAL.slice(3, 5)}-${VALID_INDIVIDUAL.slice(5)}`;
    expect(formatBusinessNumber(input)).toBe(input);
  });

  it("returns original string for invalid input", () => {
    expect(formatBusinessNumber("abc")).toBe("abc");
    expect(formatBusinessNumber("12345")).toBe("12345");
  });
});
