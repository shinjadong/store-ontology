/**
 * 국세청 (National Tax Service) 사업자등록 상태조회 API response types.
 *
 * API endpoint: https://api.odcloud.kr/api/nts-businessman/v1/status
 * Data source: 공공데이터포털 (data.go.kr)
 */

export interface NtsStatusResponse {
  /** Number of business numbers requested */
  request_cnt: number;
  /** Status code from API (not HTTP status) */
  status_code: string;
  /** Array of business status results */
  data: Array<{
    /** 사업자등록번호 (10-digit, no dashes) */
    b_no: string;
    /** 납세자상태 텍스트 (e.g., "계속사업자", "휴업자", "폐업자") */
    b_stt: string;
    /** 납세자상태코드: "01"=계속, "02"=휴업, "03"=폐업 */
    b_stt_cd: string;
    /** 과세유형 텍스트 (e.g., "일반과세자", "간이과세자", "면세사업자") */
    tax_type: string;
    /** 과세유형코드: "01"=일반, "02"=간이, "03"=면세, "04"=비과세, "05"=간이(세금계산서발급), "06"=간이(부가가치세법), "07"=간이(부가가치세법)세금계산서발급 */
    tax_type_cd: string;
    /** 폐업일 (YYYYMMDD, 없으면 "") */
    end_dt: string;
    /** 단위과세전환여부 */
    utcc_yn: string;
    /** 과세유형전환일자 */
    tax_type_change_dt: string;
    /** 세금계산서적용일자 */
    invoice_apply_dt: string;
    /** 직전과세유형 텍스트 */
    rbf_tax_type: string;
    /** 직전과세유형코드 */
    rbf_tax_type_cd: string;
  }>;
}

/**
 * StoreEnrichment — partial enrichment data that can be merged
 * into the Store entity after NTS API lookup.
 */
export interface StoreEnrichment {
  /** Mapped taxation type from NTS tax_type_cd */
  taxationType: "GENERAL" | "SIMPLIFIED" | "EXEMPT";
  /** Mapped business status from NTS b_stt_cd */
  businessStatus: "ACTIVE" | "SUSPENDED" | "CLOSED";
  /** 폐업일 in ISO format (only present if business is closed) */
  closedDate?: string;
}
