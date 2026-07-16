import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import type { CustomUser } from '../../types/user.ts';
import type { PaymentOrderResponse, TossPaymentWidgets } from '../../types/tossPayments.ts';

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

export default function PaymentCheckoutModal({ order, user, onClose }: PaymentCheckoutModalProps) {
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const widgetsRef = useRef<TossPaymentWidgets | null>(null);
  const renderedOrderId = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function renderWidget() {
      if (renderedOrderId.current === order.orderId) {
        return;
      }
      renderedOrderId.current = order.orderId;
      setReady(false);

      await loadTossPaymentsScript();
      if (!window.TossPayments) {
        throw new Error('토스페이먼츠 SDK를 초기화할 수 없습니다.');
      }

      const tossPayments = window.TossPayments(order.clientKey);
      const widgets = tossPayments.widgets({ customerKey: `bgmagit_${user.id}` });
      widgetsRef.current = widgets;

      await widgets.setAmount({ currency: 'KRW', value: order.amount });
      await widgets.renderPaymentMethods({ selector: '#payment-methods', variantKey: 'DEFAULT' });
      await widgets.renderAgreement({ selector: '#payment-agreement', variantKey: 'AGREEMENT' });

      if (alive) {
        setReady(true);
      }
    }

    renderWidget().catch(error => {
      console.error(error);
      toast.error('결제창을 불러오지 못했습니다.');
      onClose();
    });

    return () => {
      alive = false;
    };
  }, [order, user.id, onClose]);

  async function requestPayment() {
    if (!widgetsRef.current) {
      return;
    }

    setPaying(true);
    try {
      await widgetsRef.current.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: user.name,
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
        <WidgetBox id="payment-methods" />
        <WidgetBox id="payment-agreement" />
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

const WidgetBox = styled.div`
  margin-top: 12px;
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
