// ─── Business Number Validation ─────────────────────────
export {
  validateBusinessNumber,
  parseBusinessNumber,
  formatBusinessNumber,
} from "./business-number.js";

export type {
  BusinessType,
  BusinessNumberValidation,
  BusinessNumberParts,
} from "./business-number.js";

// ─── NTS API Client ────────────────────────────────────
export {
  checkBusinessStatus,
  validateBusinessAuthenticity,
} from "./nts-api.js";

export type {
  BusinessStatus,
  NtsStatusResult,
  NtsValidateResult,
  NtsValidateParams,
  NtsApiError,
} from "./nts-api.js";
