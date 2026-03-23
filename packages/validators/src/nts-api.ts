/**
 * National Tax Service (국세청) API Client
 *
 * Uses the public data portal (data.go.kr) NTS Businessman API
 * via api.odcloud.kr endpoints.
 */

// ─── Types ──────────────────────────────────────────────

export type BusinessStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface NtsStatusResult {
  status: BusinessStatus;
  taxType: string;
  recentDate?: string;
}

export interface NtsValidateResult {
  valid: boolean;
  status: {
    code: string;
    message: string;
  };
}

export interface NtsValidateParams {
  businessNumber: string;
  /** 개업일자, format: yyyyMMdd */
  startDate: string;
  /** 대표자명 */
  representativeName: string;
  /** 상호명 (optional) */
  businessName?: string;
}

export interface NtsApiError {
  code: string;
  message: string;
}

// ─── Internal Types (NTS API response shapes) ───────────

interface NtsStatusApiResponse {
  status_code: string;
  match_cnt: number;
  request_cnt: number;
  data: Array<{
    b_no: string;
    b_stt: string;
    b_stt_cd: string;
    tax_type: string;
    tax_type_cd: string;
    end_dt: string;
    utcc_yn: string;
    tax_type_change_dt: string;
    invoice_apply_dt: string;
    rbf_tax_type: string;
    rbf_tax_type_cd: string;
  }>;
}

interface NtsValidateApiResponse {
  status_code: string;
  request_cnt: number;
  valid_cnt: number;
  data: Array<{
    b_no: string;
    valid: string;
    valid_msg: string;
    request_param: Record<string, string>;
    status: {
      b_no: string;
      b_stt: string;
      b_stt_cd: string;
      tax_type: string;
      tax_type_cd: string;
      end_dt: string;
      utcc_yn: string;
      tax_type_change_dt: string;
      invoice_apply_dt: string;
    };
  }>;
}

// ─── Constants ──────────────────────────────────────────

const NTS_BASE_URL = "https://api.odcloud.kr/api/nts-businessman/v1";

const STATUS_MAP: Record<string, BusinessStatus> = {
  "01": "ACTIVE",
  "02": "SUSPENDED",
  "03": "CLOSED",
};

// ─── Helpers ────────────────────────────────────────────

function stripHyphens(brn: string): string {
  return brn.replace(/[\s-]/g, "");
}

// ─── Public API ─────────────────────────────────────────

/**
 * Checks the current business status of a registration number
 * via the NTS status inquiry API.
 *
 * @param brn - Business registration number (10 digits, hyphens optional)
 * @param apiKey - Public data portal (data.go.kr) service key
 * @returns Business status result
 * @throws Error with NtsApiError shape on network or API failures
 */
export async function checkBusinessStatus(
  brn: string,
  apiKey: string,
): Promise<NtsStatusResult> {
  const cleanBrn = stripHyphens(brn);
  const url = `${NTS_BASE_URL}/status?serviceKey=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ b_no: [cleanBrn] }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw Object.assign(new Error(`NTS API error: ${response.status}`), {
        code: `HTTP_${response.status}`,
        message: errorText,
      } satisfies NtsApiError);
    }

    const json = (await response.json()) as NtsStatusApiResponse;

    if (!json.data || json.data.length === 0) {
      throw Object.assign(new Error("No data returned from NTS API"), {
        code: "NO_DATA",
        message: "NTS API returned empty data array",
      } satisfies NtsApiError);
    }

    const entry = json.data[0];
    const status = STATUS_MAP[entry.b_stt_cd];

    if (!status) {
      throw Object.assign(
        new Error(`Unknown status code: ${entry.b_stt_cd}`),
        {
          code: "UNKNOWN_STATUS",
          message: `Received unknown b_stt_cd: ${entry.b_stt_cd}`,
        } satisfies NtsApiError,
      );
    }

    return {
      status,
      taxType: entry.tax_type || entry.tax_type_cd || "",
      ...(entry.end_dt ? { recentDate: entry.end_dt } : {}),
    };
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      throw error; // Already a typed NtsApiError
    }
    throw Object.assign(
      new Error(
        `NTS API request failed: ${error instanceof Error ? error.message : String(error)}`,
      ),
      {
        code: "NETWORK_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown network error",
      } satisfies NtsApiError,
    );
  }
}

/**
 * Validates the authenticity of a business registration by cross-checking
 * the BRN with the representative name, start date, and optional business name.
 *
 * @param params - Validation parameters
 * @param apiKey - Public data portal (data.go.kr) service key
 * @returns Validation result
 * @throws Error with NtsApiError shape on network or API failures
 */
export async function validateBusinessAuthenticity(
  params: NtsValidateParams,
  apiKey: string,
): Promise<NtsValidateResult> {
  const url = `${NTS_BASE_URL}/validate?serviceKey=${encodeURIComponent(apiKey)}`;
  const cleanBrn = stripHyphens(params.businessNumber);

  const requestBody = {
    businesses: [
      {
        b_no: cleanBrn,
        start_dt: params.startDate,
        p_nm: params.representativeName,
        ...(params.businessName ? { b_nm: params.businessName } : {}),
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw Object.assign(new Error(`NTS API error: ${response.status}`), {
        code: `HTTP_${response.status}`,
        message: errorText,
      } satisfies NtsApiError);
    }

    const json = (await response.json()) as NtsValidateApiResponse;

    if (!json.data || json.data.length === 0) {
      throw Object.assign(new Error("No data returned from NTS API"), {
        code: "NO_DATA",
        message: "NTS API returned empty data array",
      } satisfies NtsApiError);
    }

    const entry = json.data[0];

    return {
      valid: entry.valid === "01",
      status: {
        code: entry.valid,
        message: entry.valid_msg || "",
      },
    };
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      throw error; // Already a typed NtsApiError
    }
    throw Object.assign(
      new Error(
        `NTS API request failed: ${error instanceof Error ? error.message : String(error)}`,
      ),
      {
        code: "NETWORK_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown network error",
      } satisfies NtsApiError,
    );
  }
}
