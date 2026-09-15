export type PaymentOrderResponse = {
  orderId: string;
  amount: number;
  orderName: string;
  clientKey: string;
};

/** renderAgreement 가 발행하는 동의 상태. agreedRequiredTerms 가 false면 결제 요청이 거절된다. */
export type TossAgreementStatus = {
  agreedRequiredTerms: boolean;
  agreedTerms?: unknown;
};

/**
 * renderAgreement 반환 객체.
 * SDK 버전에 따라 on()이 없을 수 있어 옵셔널로 둔다(없으면 게이팅하지 않고 기존 동작 유지).
 */
export type TossAgreementWidget = {
  /** 현재 동의 상태를 즉시 읽는다. on()은 '변경' 시에만 오므로 초기값은 이쪽으로 seed 한다. */
  getAgreementStatus?: () => TossAgreementStatus | null | undefined;
  on?: (
    eventName: 'agreementStatusChange',
    callback: (status: TossAgreementStatus) => void,
  ) => void;
  destroy?: () => void;
};

export type TossPaymentWidgets = {
  setAmount: (amount: { currency: 'KRW'; value: number }) => Promise<void>;
  renderPaymentMethods: (options: { selector: string; variantKey?: string }) => Promise<void>;
  renderAgreement: (options: {
    selector: string;
    variantKey?: string;
  }) => Promise<TossAgreementWidget | void>;
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
