export type PaymentOrderResponse = {
  orderId: string;
  amount: number;
  orderName: string;
  clientKey: string;
};

export type TossPaymentWidgets = {
  setAmount: (amount: { currency: 'KRW'; value: number }) => Promise<void>;
  renderPaymentMethods: (options: { selector: string; variantKey?: string }) => Promise<void>;
  renderAgreement: (options: { selector: string; variantKey?: string }) => Promise<void>;
  requestPayment: (options: {
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerName?: string;
  }) => Promise<void>;
};

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
  widgets: (options: { customerKey: string }) => TossPaymentWidgets;
  payment: (options: { customerKey: string }) => TossPaymentWindow;
};

declare global {
  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}
