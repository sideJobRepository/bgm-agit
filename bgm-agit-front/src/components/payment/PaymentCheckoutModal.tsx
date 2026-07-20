import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import type { CustomUser } from '../../types/user.ts';
import type {
  PaymentOrderResponse,
  TossPaymentWidgets,
  TossPaymentWindow,
} from '../../types/tossPayments.ts';

type PaymentCheckoutModalProps = {
  order: PaymentOrderResponse;
  user: CustomUser;
  onClose: () => void;
};

const TOSS_SDK_URL = 'https://js.tosspayments.com/v2/standard';

function loadTossPaymentsScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.TossPayments) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TOSS_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('토스페이먼츠 SDK 로드 실패')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = TOSS_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('토스페이먼츠 SDK 로드 실패'));
    document.head.appendChild(script);
  });
}

function getPaymentErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return `결제창을 불러오지 못했습니다. (${error.message})`;
  }
  return '결제창을 불러오지 못했습니다.';
}

export default function PaymentCheckoutModal({ order, user, onClose }: PaymentCheckoutModalProps) {
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const widgetsRef = useRef<TossPaymentWidgets | null>(null);
  const paymentRef = useRef<TossPaymentWindow | null>(null);
  const renderedOrderId = useRef<string | null>(null);
  const isWidgetKey = /^test_gck_|^live_gck_/.test(order.clientKey);
  const isPaymentKey = /^test_ck_|^live_ck_/.test(order.clientKey);

  useEffect(() => {
    let alive = true;

    async function initializePayment() {
      if (renderedOrderId.current === order.orderId) {
        return;
      }
      renderedOrderId.current = order.orderId;
      setReady(false);

      if (!order.clientKey) {
        throw new Error('토스 clientKey가 비어 있습니다.');
      }
      if (!isWidgetKey && !isPaymentKey) {
        throw new Error('토스 clientKey 형식이 올바르지 않습니다.');
      }
      if (!order.amount || order.amount < 1000) {
        throw new Error('결제 금액이 올바르지 않습니다.');
      }

      await loadTossPaymentsScript();
      if (!window.TossPayments) {
        throw new Error('토스페이먼츠 SDK를 초기화할 수 없습니다.');
      }

      const tossPayments = window.TossPayments(order.clientKey);

      if (isWidgetKey) {
        const widgets = tossPayments.widgets({ customerKey: `bgmagit_${user.id}` });
        widgetsRef.current = widgets;

        await widgets.setAmount({ currency: 'KRW', value: order.amount });
        await widgets.renderPaymentMethods({ selector: '#payment-methods', variantKey: 'DEFAULT' });
        await widgets.renderAgreement({ selector: '#payment-agreement', variantKey: 'AGREEMENT' });
      } else {
        paymentRef.current = tossPayments.payment({ customerKey: `bgmagit_${user.id}` });
      }

      if (alive) {
        setReady(true);
      }
    }

    initializePayment().catch(error => {
      if (!alive) {
        return;
      }
      console.error(error);
      toast.error(getPaymentErrorMessage(error), { toastId: `payment-widget-${order.orderId}` });
      onClose();
    });

    return () => {
      alive = false;
    };
  }, [isPaymentKey, isWidgetKey, order, user.id, onClose]);

  async function requestPayment() {
    if (!widgetsRef.current && !paymentRef.current) {
      return;
    }

    setPaying(true);
    try {
      const paymentOptions = {
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: user.name,
      };

      if (widgetsRef.current) {
        await widgetsRef.current.requestPayment(paymentOptions);
        return;
      }

      await paymentRef.current?.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: order.amount },
        ...paymentOptions,
      });
    } catch (error) {
      console.error(error);
      toast.error('결제 요청이 취소되었거나 실패했습니다.');
      setPaying(false);
    }
  }

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>예약금 결제</Title>
          <CloseButton type="button" onClick={onClose}>
            닫기
          </CloseButton>
        </Header>
        <Summary>
          <strong>{order.orderName}</strong>
          <span>{order.amount.toLocaleString()}원</span>
        </Summary>
        <NoticeBox>
          이 결제는 예약 확정을 위한 예약금 결제입니다.
          <br />
          예약금은 M Room 30,000원, 그 외 예약 10,000원이며 잔여 이용요금은 현장에서 결제합니다.
          <br />
          예약일 당일 취소 및 노쇼 시 예약금은 환불되지 않습니다.
        </NoticeBox>
        {isWidgetKey ? (
          <>
            <WidgetBox id="payment-methods" />
            <WidgetBox id="payment-agreement" />
          </>
        ) : (
          <GuideBox>
            개발용 API 개별 연동 키로 카드 결제창을 실행합니다. 결제수단 선택 UI가 필요하면
            토스 결제위젯 키를 사용하세요.
          </GuideBox>
        )}
        <PayButton type="button" onClick={requestPayment} disabled={!ready || paying}>
          {paying ? '결제 요청 중' : `${order.amount.toLocaleString()}원 결제하기`}
        </PayButton>
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
`;

const Modal = styled.div`
  width: min(640px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 8px;
  background: #fff;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
`;

const CloseButton = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
`;

const Summary = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 16px;
`;

const NoticeBox = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #f2f7f5;
  color: #1a7d55;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
`;

const WidgetBox = styled.div`
  margin-top: 12px;
`;

const GuideBox = styled.div`
  margin-top: 12px;
  padding: 14px;
  border-radius: 8px;
  background: #f7f8f8;
  color: #555;
  font-size: 14px;
  line-height: 1.5;
`;

const PayButton = styled.button`
  width: 100%;
  margin-top: 18px;
  padding: 14px 18px;
  border: 0;
  border-radius: 6px;
  background: #1a7d55;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;
