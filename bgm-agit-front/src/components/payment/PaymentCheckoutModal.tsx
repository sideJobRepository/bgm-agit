import { useEffect, useRef, useState } from 'react';
import { toast } from '../../utils/toast';
import type { CustomUser } from '../../types/user.ts';
import type { PaymentOrderResponse, TossPaymentWindow } from '../../types/tossPayments.ts';
import { getPaymentErrorCode, toPaymentErrorMessage } from '../../config/paymentErrors.ts';
import { reportPaymentFailure } from '../../utils/paymentReport.ts';
import { Overlay, Modal, Header, Title, CloseButton, Summary, NoticeBox, PayButton } from './PaymentCheckoutModal.styles.ts';

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
  const paymentRef = useRef<TossPaymentWindow | null>(null);
  const renderedOrderId = useRef<string | null>(null);

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
      // API 개별 연동 키(ck_). 위젯 키(gck_)를 넣으면 결제창 호출에서 INVALID_API_KEY 가 난다
      if (!/^test_ck_|^live_ck_/.test(order.clientKey)) {
        throw new Error('토스 clientKey 형식이 올바르지 않습니다.');
      }
      if (!order.amount || order.amount < 1000) {
        throw new Error('결제 금액이 올바르지 않습니다.');
      }

      await loadTossPaymentsScript();
      if (!window.TossPayments) {
        throw new Error('토스페이먼츠 SDK를 초기화할 수 없습니다.');
      }

      paymentRef.current = window.TossPayments(order.clientKey)
          .payment({ customerKey: `bgmagit_${user.id}` });

      if (alive) {
        setReady(true);
      }
    }

    initializePayment().catch(error => {
      if (!alive) {
        return;
      }
      console.error(error);
      // 결제창 초기화 실패도 서버에 남긴다(READY 로만 남은 주문의 원인 추적)
      reportPaymentFailure(
        order.orderId,
        'WIDGET_INIT_FAILED',
        error instanceof Error ? error.message : String(error),
      );
      toast.error(getPaymentErrorMessage(error), { toastId: `payment-widget-${order.orderId}` });
      onClose();
    });

    return () => {
      alive = false;
    };
  }, [order, user.id, onClose]);

  async function requestPayment() {
    if (!paymentRef.current) {
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

      await paymentRef.current?.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: order.amount },
        ...paymentOptions,
      });
    } catch (error) {
      console.error(error);
      // 사용자가 결제창을 닫거나 취소한 경우는 조용히 무시 (실패 토스트 X)
      const message = toPaymentErrorMessage(error);
      if (message) {
        toast.error(message);
        reportPaymentFailure(order.orderId, getPaymentErrorCode(error), message);
      }
      setPaying(false);
    }
  }

  return (
    <Overlay>
      <Modal>
        <Header>
          <Title>예약 결제</Title>
          <CloseButton type="button" onClick={onClose}>
            닫기
          </CloseButton>
        </Header>
        <Summary>
          <strong>{order.orderName}</strong>
          <span>{order.amount.toLocaleString()}원</span>
        </Summary>
        <NoticeBox>
          이 결제는 예약 확정을 위한 결제입니다.
          <br />
          결제 금액은 {order.amount.toLocaleString()}원입니다. 금액은 서버가 예약 인원과 날짜로
          계산합니다.
          <br />
          환불은 이용일 48시간 전까지 100%, 24시간 전까지 50%, 그 이후(당일·노쇼 포함)에는
          불가합니다.
        </NoticeBox>
        <PayButton type="button" onClick={requestPayment} disabled={!ready || paying}>
          {paying ? '결제 요청 중' : `${order.amount.toLocaleString()}원 결제하기`}
        </PayButton>
      </Modal>
    </Overlay>
  );
}
