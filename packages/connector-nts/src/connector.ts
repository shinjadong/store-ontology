/**
 * NtsConnector — maps 국세청 사업자등록 상태조회 API to Store entity enrichment.
 *
 * Usage:
 *   const connector = new NtsConnector();
 *   const result = await connector.fetch({ businessNumber: "1234567890", apiKey: "YOUR_KEY" });
 *   if (result.success && result.data) {
 *     // merge result.data into Store entity
 *   }
 */

import type {
  Connector,
  ConnectorConfig,
  ConnectorResult,
} from "@store-ontology/core";
import type { NtsStatusResponse, StoreEnrichment } from "./types.js";

type NtsBusinessData = NtsStatusResponse["data"][0];

/**
 * Map NTS tax_type_cd to ontology TaxationType.
 *
 * NTS codes:
 * "01" = 일반과세자 → GENERAL
 * "02" = 간이과세자 → SIMPLIFIED
 * "03" = 면세사업자 → EXEMPT
 * "04" = 비과세(국가/지자체 등) → EXEMPT
 * "05" = 간이과세자(세금계산서 발급사업자) → SIMPLIFIED
 * "06" = 간이과세자(부가가치세법) → SIMPLIFIED
 * "07" = 간이과세자(부가가치세법, 세금계산서 발급) → SIMPLIFIED
 */
function mapTaxationType(
  taxTypeCd: string
): StoreEnrichment["taxationType"] {
  switch (taxTypeCd) {
    case "01":
      return "GENERAL";
    case "02":
    case "05":
    case "06":
    case "07":
      return "SIMPLIFIED";
    case "03":
    case "04":
      return "EXEMPT";
    default:
      // Unknown code — default to GENERAL as the most common type
      return "GENERAL";
  }
}

/**
 * Map NTS b_stt_cd to ontology BusinessStatus.
 *
 * "01" = 계속사업자 → ACTIVE
 * "02" = 휴업자 → SUSPENDED
 * "03" = 폐업자 → CLOSED
 */
function mapBusinessStatus(
  bSttCd: string
): StoreEnrichment["businessStatus"] {
  switch (bSttCd) {
    case "01":
      return "ACTIVE";
    case "02":
      return "SUSPENDED";
    case "03":
      return "CLOSED";
    default:
      return "ACTIVE";
  }
}

/**
 * Convert NTS date string (YYYYMMDD) to ISO 8601 (YYYY-MM-DD).
 * Returns undefined if the input is empty.
 */
function parseNtsDate(dateStr: string): string | undefined {
  if (!dateStr || dateStr.trim() === "") return undefined;
  // YYYYMMDD → YYYY-MM-DD
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
}

export class NtsConnector
  implements Connector<NtsBusinessData, Partial<StoreEnrichment>>
{
  readonly config: ConnectorConfig = {
    name: "국세청 사업자등록 상태조회",
    version: "0.1.0",
    sourceSystem: "nts-hometax",
  };

  /**
   * Map a single NTS business status record to StoreEnrichment.
   */
  map(raw: NtsBusinessData): Partial<StoreEnrichment> {
    const enrichment: Partial<StoreEnrichment> = {
      taxationType: mapTaxationType(raw.tax_type_cd),
      businessStatus: mapBusinessStatus(raw.b_stt_cd),
    };

    const closedDate = parseNtsDate(raw.end_dt);
    if (closedDate) {
      enrichment.closedDate = closedDate;
    }

    return enrichment;
  }

  /**
   * Fetch business registration status from NTS API.
   *
   * @param params.businessNumber - 사업자등록번호 (10-digit string, no dashes)
   * @param params.apiKey - 공공데이터포털 서비스 키 (encoded)
   */
  async fetch(
    params: Record<string, unknown>
  ): Promise<ConnectorResult<Partial<StoreEnrichment>>> {
    const { businessNumber, apiKey } = params as {
      businessNumber: string;
      apiKey: string;
    };

    const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(String(apiKey))}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ b_no: [String(businessNumber)] }),
      });

      if (!response.ok) {
        return {
          success: false,
          errors: [
            {
              code: `HTTP_${response.status}`,
              message: `NTS API returned ${response.status}: ${response.statusText}`,
            },
          ],
          metadata: {
            sourceSystem: this.config.sourceSystem,
            fetchedAt: new Date().toISOString(),
          },
        };
      }

      const body = (await response.json()) as NtsStatusResponse;

      if (!body.data || body.data.length === 0) {
        return {
          success: false,
          errors: [
            {
              code: "NO_DATA",
              message: `No data returned for business number: ${businessNumber}`,
            },
          ],
          metadata: {
            sourceSystem: this.config.sourceSystem,
            fetchedAt: new Date().toISOString(),
          },
        };
      }

      const mapped = this.map(body.data[0]);

      return {
        success: true,
        data: mapped,
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          {
            code: "FETCH_ERROR",
            message:
              error instanceof Error ? error.message : "Unknown fetch error",
            details: error,
          },
        ],
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Validate the mapped enrichment.
   * Always returns true for Partial<StoreEnrichment> since all fields are optional.
   */
  validate(_entity: Partial<StoreEnrichment>): boolean {
    return true;
  }
}
