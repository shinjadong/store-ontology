/**
 * NICE Pay API raw response types.
 *
 * These types represent the raw JSON shape returned by
 * the NICE VAN payment gateway (https://api.nicepay.co.kr).
 */

export interface NiceCardInfo {
  /** Card issuer code (e.g., "04" for Samsung) */
  cardCode: string;
  /** Card issuer name (e.g., "삼성카드") */
  cardName: string;
  /** Masked card number: XXXXXX****1234 */
  cardNum: string;
  /** Installment months: "00" = lump sum, "03" = 3 months */
  cardQuota: string;
  /** Whether interest-free installment */
  isInterestFree: boolean;
  /** "credit" or "check" (debit) */
  cardType: string;
}

export interface NiceCancelInfo {
  /** ISO 8601 cancellation timestamp */
  cancelledAt: string;
  /** Cancelled amount in KRW */
  cancelAmount: number;
}

export interface NicePaymentResponse {
  /** Result code: "0000" = success */
  resultCode: string;
  /** Result message */
  resultMsg: string;
  /** NICE transaction ID */
  tid: string;
  /** Merchant order ID */
  orderId: string;
  /** Total amount in KRW */
  amount: number;
  /** Remaining balance after partial cancel */
  balanceAmt?: number;
  /** Payment method: "card", "vbank", "bank", "cellphone", "naverpay", "kakaopay" */
  payMethod: string;
  /** Approval number from card company / bank */
  approveNo?: string;
  /** Transaction status */
  status: string;
  /** ISO 8601 payment timestamp */
  paidAt?: string;
  /** Card payment details (present when payMethod = "card") */
  card?: NiceCardInfo;
  /** Cancellation history */
  cancels?: NiceCancelInfo[];
}
