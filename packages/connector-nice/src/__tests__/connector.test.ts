import { describe, it, expect } from "vitest";
import { NiceVanConnector } from "../connector.js";
import type { NicePaymentResponse } from "../types.js";
import cardFixture from "../__fixtures__/payment-card.json";

const connector = new NiceVanConnector();

// ─── Fixtures ───────────────────────────────────────────

const cardPayment = cardFixture as unknown as NicePaymentResponse;

const vbankPayment: NicePaymentResponse = {
  resultCode: "0000",
  resultMsg: "성공",
  tid: "nictest00m01012403271300005678",
  orderId: "ORDER-20240327-00043",
  amount: 120000,
  payMethod: "vbank",
  status: "ready",
};

const cancelledPayment: NicePaymentResponse = {
  resultCode: "0000",
  resultMsg: "성공",
  tid: "nictest00m01012403271400009999",
  orderId: "ORDER-20240327-00044",
  amount: 30000,
  balanceAmt: 0,
  payMethod: "card",
  approveNo: "30000020",
  status: "cancelled",
  paidAt: "2024-03-27T14:00:00+09:00",
  card: {
    cardCode: "11",
    cardName: "KB국민카드",
    cardNum: "411111****5678",
    cardQuota: "03",
    isInterestFree: true,
    cardType: "check",
  },
  cancels: [
    {
      cancelledAt: "2024-03-27T15:30:00+09:00",
      cancelAmount: 30000,
    },
  ],
};

// ─── map() Tests ────────────────────────────────────────

describe("NiceVanConnector.map()", () => {
  it("should map card payment fixture correctly", () => {
    const result = connector.map(cardPayment);

    expect(result.transactionId).toBe("nictest00m01012403271200001234");
    expect(result.orderId).toBe("ORDER-20240327-00042");
    expect(result.amount).toBe(45000);
    expect(result.balanceAmount).toBe(45000);
    expect(result.payMethod).toBe("CARD");
    expect(result.approvalNumber).toBe("30000015");
    expect(result.status).toBe("PAID");
    expect(result.paidAt).toBe("2024-03-27T12:34:56+09:00");
    expect(result.vanProvider).toBe("NICE");
  });

  it("should extract card fields correctly", () => {
    const result = connector.map(cardPayment);

    expect(result.cardCode).toBe("04");
    expect(result.cardName).toBe("삼성카드");
    expect(result.cardNumber).toBe("532691****1234");
    expect(result.cardType).toBe("CREDIT");
    expect(result.installmentMonths).toBe(0);
    expect(result.isInterestFree).toBe(false);
  });

  it("should map check card type correctly", () => {
    const result = connector.map(cancelledPayment);

    expect(result.cardType).toBe("CHECK");
    expect(result.installmentMonths).toBe(3);
    expect(result.isInterestFree).toBe(true);
  });

  it("should handle missing optional card fields", () => {
    const result = connector.map(vbankPayment);

    expect(result.cardCode).toBeUndefined();
    expect(result.cardName).toBeUndefined();
    expect(result.cardNumber).toBeUndefined();
    expect(result.cardType).toBeUndefined();
    expect(result.installmentMonths).toBeUndefined();
    expect(result.approvalNumber).toBeUndefined();
    expect(result.paidAt).toBeUndefined();
    expect(result.balanceAmount).toBeUndefined();
  });
});

// ─── Status Mapping ─────────────────────────────────────

describe("NiceVanConnector status mapping", () => {
  const statuses: Array<[string, string]> = [
    ["paid", "PAID"],
    ["ready", "READY"],
    ["failed", "FAILED"],
    ["cancelled", "CANCELLED"],
    ["partialCancelled", "PARTIAL_CANCELLED"],
    ["expired", "EXPIRED"],
  ];

  it.each(statuses)(
    'should map NICE status "%s" to "%s"',
    (niceStatus, expected) => {
      const raw: NicePaymentResponse = {
        ...cardPayment,
        status: niceStatus,
      };
      const result = connector.map(raw);
      expect(result.status).toBe(expected);
    }
  );

  it("should throw on unknown status", () => {
    const raw: NicePaymentResponse = {
      ...cardPayment,
      status: "unknown_status",
    };
    expect(() => connector.map(raw)).toThrow("Unknown status");
  });
});

// ─── PayMethod Mapping ──────────────────────────────────

describe("NiceVanConnector payMethod mapping", () => {
  const methods: Array<[string, string]> = [
    ["card", "CARD"],
    ["vbank", "VIRTUAL_ACCOUNT"],
    ["bank", "BANK_TRANSFER"],
    ["cellphone", "MOBILE"],
    ["kakaopay", "KAKAO_PAY"],
    ["naverpay", "NAVER_PAY"],
  ];

  it.each(methods)(
    'should map NICE payMethod "%s" to "%s"',
    (niceMethod, expected) => {
      const raw: NicePaymentResponse = {
        ...cardPayment,
        payMethod: niceMethod,
      };
      const result = connector.map(raw);
      expect(result.payMethod).toBe(expected);
    }
  );

  it("should throw on unknown payMethod", () => {
    const raw: NicePaymentResponse = {
      ...cardPayment,
      payMethod: "bitcoin",
    };
    expect(() => connector.map(raw)).toThrow("Unknown payMethod");
  });
});

// ─── Validate ───────────────────────────────────────────

describe("NiceVanConnector.validate()", () => {
  it("should return true for valid mapped entity", () => {
    const entity = connector.map(cardPayment);
    expect(connector.validate(entity)).toBe(true);
  });

  it("should return false for invalid entity", () => {
    const invalid = { transactionId: "test" } as any;
    expect(connector.validate(invalid)).toBe(false);
  });
});

// ─── Config ─────────────────────────────────────────────

describe("NiceVanConnector.config", () => {
  it("should have correct connector config", () => {
    expect(connector.config.name).toBe("NICE VAN Connector");
    expect(connector.config.version).toBe("0.1.0");
    expect(connector.config.sourceSystem).toBe("nice-van");
  });
});
