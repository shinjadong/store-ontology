/**
 * NiceVanConnector — maps NICE VAN payment API responses
 * to Store Ontology Transaction entities.
 *
 * Follows the Connector<TRaw, TEntity> interface from @store-ontology/core.
 */

import { z } from "zod";
import type {
  Connector,
  ConnectorConfig,
  ConnectorResult,
} from "@store-ontology/core";
import {
  PayMethod,
  CardType,
  TransactionStatus,
  VanProvider,
} from "@store-ontology/core";
import type { NicePaymentResponse } from "./types.js";
import { createBasicAuthHeader } from "./auth.js";

// ─── Mapped Transaction Entity ──────────────────────────

export const NiceTransactionSchema = z.object({
  transactionId: z.string(),
  orderId: z.string(),
  amount: z.number(),
  balanceAmount: z.number().optional(),
  payMethod: PayMethod,
  cardCode: z.string().optional(),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardType: CardType.optional(),
  installmentMonths: z.number().optional(),
  isInterestFree: z.boolean().optional(),
  approvalNumber: z.string().optional(),
  status: TransactionStatus,
  paidAt: z.string().optional(),
  vanProvider: VanProvider,
});

export type NiceTransaction = z.infer<typeof NiceTransactionSchema>;

// ─── Mapping Helpers ────────────────────────────────────

const PAY_METHOD_MAP: Record<string, z.infer<typeof PayMethod>> = {
  card: "CARD",
  vbank: "VIRTUAL_ACCOUNT",
  bank: "BANK_TRANSFER",
  cellphone: "MOBILE",
  kakaopay: "KAKAO_PAY",
  naverpay: "NAVER_PAY",
};

const STATUS_MAP: Record<string, z.infer<typeof TransactionStatus>> = {
  paid: "PAID",
  ready: "READY",
  failed: "FAILED",
  cancelled: "CANCELLED",
  partialCancelled: "PARTIAL_CANCELLED",
  expired: "EXPIRED",
};

const CARD_TYPE_MAP: Record<string, z.infer<typeof CardType>> = {
  credit: "CREDIT",
  check: "CHECK",
};

// ─── Connector ──────────────────────────────────────────

export class NiceVanConnector
  implements Connector<NicePaymentResponse, NiceTransaction>
{
  readonly config: ConnectorConfig = {
    name: "NICE VAN Connector",
    version: "0.1.0",
    sourceSystem: "nice-van",
  };

  /**
   * Map a raw NICE payment response to an ontology Transaction entity.
   */
  map(raw: NicePaymentResponse): NiceTransaction {
    const payMethod = PAY_METHOD_MAP[raw.payMethod];
    if (!payMethod) {
      throw new Error(`Unknown payMethod: ${raw.payMethod}`);
    }

    const status = STATUS_MAP[raw.status];
    if (!status) {
      throw new Error(`Unknown status: ${raw.status}`);
    }

    const entity: NiceTransaction = {
      transactionId: raw.tid,
      orderId: raw.orderId,
      amount: raw.amount,
      balanceAmount: raw.balanceAmt,
      payMethod,
      approvalNumber: raw.approveNo,
      status,
      paidAt: raw.paidAt,
      vanProvider: "NICE",
    };

    if (raw.card) {
      entity.cardCode = raw.card.cardCode;
      entity.cardName = raw.card.cardName;
      entity.cardNumber = raw.card.cardNum;
      entity.cardType = CARD_TYPE_MAP[raw.card.cardType];
      entity.installmentMonths = parseInt(raw.card.cardQuota, 10);
      entity.isInterestFree = raw.card.isInterestFree;
    }

    return entity;
  }

  /**
   * Fetch a payment transaction from the NICE API and return mapped entity.
   *
   * @param params.tid - NICE transaction ID
   * @param params.clientKey - NICE API client key
   * @param params.secretKey - NICE API secret key
   */
  async fetch(
    params: Record<string, unknown>
  ): Promise<ConnectorResult<NiceTransaction>> {
    const { tid, clientKey, secretKey } = params as {
      tid: string;
      clientKey: string;
      secretKey: string;
    };

    const fetchedAt = new Date().toISOString();

    try {
      const response = await fetch(
        `https://api.nicepay.co.kr/v1/payments/${tid}`,
        {
          method: "GET",
          headers: {
            Authorization: createBasicAuthHeader(clientKey, secretKey),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        return {
          success: false,
          errors: [
            {
              code: `HTTP_${response.status}`,
              message: `NICE API responded with ${response.status}: ${response.statusText}`,
            },
          ],
          metadata: {
            sourceSystem: this.config.sourceSystem,
            fetchedAt,
          },
        };
      }

      const raw = (await response.json()) as NicePaymentResponse;

      if (raw.resultCode !== "0000") {
        return {
          success: false,
          errors: [
            {
              code: raw.resultCode,
              message: raw.resultMsg,
            },
          ],
          metadata: {
            sourceSystem: this.config.sourceSystem,
            fetchedAt,
          },
        };
      }

      const entity = this.map(raw);

      return {
        success: true,
        data: entity,
        metadata: {
          sourceSystem: this.config.sourceSystem,
          fetchedAt,
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
          fetchedAt,
        },
      };
    }
  }

  /**
   * Validate a mapped transaction entity against the Zod schema.
   */
  validate(entity: NiceTransaction): boolean {
    const result = NiceTransactionSchema.safeParse(entity);
    return result.success;
  }
}
