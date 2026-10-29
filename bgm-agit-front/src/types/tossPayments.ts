export type PaymentOrderResponse = {
  orderId: string;
  amount: number;
  orderName: string;
  clientKey: string;
  // 월간패스 본인 1명분 할인액. amount 는 이미 할인된 금액이다
  discountAmount?: number;
  // LEGACY_DEPOSIT = 10월 이용분 예약금(전날까지 전액환불), DEPOSIT = 마작 대탁 예약금, FULL = 이용요금 전액
  paymentKind?: 'LEGACY_DEPOSIT' | 'DEPOSIT' | 'FULL';
  // 벙주 혜택가가 적용된 주문인지
  bungjuApplied?: boolean;
  // 혜택이 없었다면 낼 금액(정가)
  regularAmount?: number | null;
};

/** 결제창(API 개별 연동) 객체. 결제수단 선택·약관은 토스 결제창이 직접 그린다 */
export type TossPaymentWindow = {
  requestPayment: (options: {
    method: 'CARD';
    amount: { currency: 'KRW'; value: number };
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerName?: string;
  }) => Promise<void>;
};

export type TossPaymentsInstance = {
  payment: (options: { customerKey: string }) => TossPaymentWindow;
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}
