import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';
import { ResultBox, ResultCard, IconCircle, ButtonRow } from './PaymentSuccess.styles.ts';
import { toast } from '../utils/toast';
import api from '../utils/axiosInstance.ts';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const called = useRef(false);
  const [message, setMessage] = useState('결제 승인 중입니다.');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [showRoomNotice, setShowRoomNotice] = useState(false);

  useEffect(() => {
    if (called.current) {
      return;
    }
    called.current = true;

    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setMessage('결제 승인 정보가 올바르지 않습니다.');
      return;
    }

    api
      .post('/bgm-agit/payments/confirm', {
        paymentKey,
        orderId,
        amount: Number(amount),
      })
      .then(res => {
        const data = res?.data as
          | { receiptUrl?: string | null; oneRoomPerDay?: boolean }
          | undefined;
        const url = data?.receiptUrl ?? null;
        const roomNotice = !!data?.oneRoomPerDay;
        setReceiptUrl(url);
        setShowRoomNotice(roomNotice);
        toast.success('예약 결제가 완료되었습니다.');
        // 영수증이 있거나 이용 안내를 읽어야 하면 자동 이동하지 않는다
        if (url || roomNotice) {
          // 영수증을 확인할 수 있도록 자동 이동하지 않고 사용자가 직접 이동
          setMessage('예약이 확정되었습니다.');
        } else {
          setMessage('예약이 확정되었습니다. 예약내역으로 이동합니다.');
          window.setTimeout(() => navigate('/reservationList'), 1200);
        }
      })
      .catch(error => {
        console.error(error);
        // 슬롯 선점(409)·미지원 결제수단처럼 사유가 분명한 건 서버 메시지를 그대로 보여준다
        const serverMessage = (error?.response?.data as { message?: string } | undefined)?.message;
        toast.error(serverMessage ?? '결제 승인 처리에 실패했습니다.');
        setMessage(serverMessage ?? '결제 승인 처리에 실패했습니다. 관리자에게 문의해주세요.');
      });
  }, [navigate, searchParams]);

  return (
    <ResultBox>
      <ResultCard>
        <IconCircle aria-hidden="true">
          <FaCheck />
        </IconCircle>
        <h2>결제 완료</h2>
        <p>{message}</p>
        {/* 하루 1룸 안내는 11/2 이후 룸 예약 결제가 승인됐을 때만(서버가 oneRoomPerDay 로 알려 준다) */}
        {showRoomNotice && (
          <ul
            style={{ margin: 0, paddingLeft: 18, textAlign: 'left', fontSize: 13, lineHeight: 1.7 }}
          >
            <li>
              회원 1명당 하루 1개의 룸만 예약할 수 있습니다. 한 룸을 예약해서 계속 이용해 주세요.
            </li>
            <li>퇴실하시거나 식사 등으로 외출하시면 해당 룸의 예약 권한이 사라집니다.</li>
            <li>예약 후 추가되는 인원(당일·현장 추가)은 일반 요금으로 받습니다.</li>
            <li>
              환불은 이용일 48시간 전까지 100%, 24시간 전까지 50%, 그 이후(당일·노쇼 포함)에는
              불가합니다. 인원을 줄이실 때도 같은 기준입니다.
            </li>
          </ul>
        )}
        <ButtonRow>
          {receiptUrl && (
            <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
              영수증 보기
            </a>
          )}
          <button type="button" onClick={() => navigate('/reservationList')}>
            예약내역으로 이동
          </button>
        </ButtonRow>
      </ResultCard>
    </ResultBox>
  );
}
