import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { toPaymentFailMessage } from '../config/paymentErrors.ts';
import { reportPaymentFailure } from '../utils/paymentReport.ts';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reported = useRef(false);

  const code = searchParams.get('code');
  const rawMessage = searchParams.get('message');
  const orderId = searchParams.get('orderId');
  // code 가 있으면 우리 문구로, 없으면 토스가 준 message 를 그대로 보여준다
  const message = toPaymentFailMessage(code, rawMessage);

  useEffect(() => {
    if (reported.current) {
      return;
    }
    reported.current = true;

    // 실패 이력만 남기는 호출이라 결과를 기다리지 않는다(헬퍼가 예외를 삼킨다)
    reportPaymentFailure(orderId, code, rawMessage);
  }, [code, orderId, rawMessage]);

  return (
    <ResultBox>
      <h2>결제 실패</h2>
      <p>{message}</p>
      <p>예약은 대기 상태로 남아 있습니다. 예약내역에서 다시 결제해 주세요.</p>
      <button type="button" onClick={() => navigate('/reservationList')}>
        예약내역으로 이동
      </button>
    </ResultBox>
  );
}

const ResultBox = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  min-height: 360px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;

  button {
    border: 0;
    border-radius: 6px;
    background: #093a6e;
    color: #fff;
    cursor: pointer;
    padding: 10px 18px;
  }
`;
