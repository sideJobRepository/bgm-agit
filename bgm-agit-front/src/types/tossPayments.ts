export type PaymentOrderResponse = {
  orderId: string;
  amount: number;
  orderName: string;
  clientKey: string;
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
