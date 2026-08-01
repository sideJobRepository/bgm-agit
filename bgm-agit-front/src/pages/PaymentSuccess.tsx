import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance.ts';
import { PAYMENT_LIVE } from '../config/payment.ts';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const called = useRef(false);
  const [message, setMessage] = useState('결제 승인 중입니다.');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  // 결제 라이브 여부. false(심사 기간)면 실제 결제/예약 확정이 되지 않으므로 안내 문구를 다르게 표시
  const paymentLive = PAYMENT_LIVE;

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
        // 심사 기간(payment.live=false): 결제행은 처리되지만 실제 출금/예약 확정은 되지 않음
        if (!paymentLive) {
          setMessage(
            '테스트 결제가 완료되었습니다. 테스트 결제이므로 실제 결제와 예약 확정은 이루어지지 않았습니다. 예약금은 계좌이체로 입금해 주세요.',
          );
          return;
        }

        const url = (res?.data as { receiptUrl?: string | null })?.receiptUrl ?? null;
        setReceiptUrl(url);
        toast.success('예약 결제가 완료되었습니다.');
        if (url) {
          // 영수증을 확인할 수 있도록 자동 이동하지 않고 사용자가 직접 이동
          setMessage('예약이 확정되었습니다.');
        } else {
          setMessage('예약이 확정되었습니다. 예약내역으로 이동합니다.');
          window.setTimeout(() => navigate('/reservationList'), 1200);
        }
      })
      .catch(error => {
        console.error(error);
        toast.error('결제 승인 처리에 실패했습니다.');
        setMessage('결제 승인 처리에 실패했습니다. 관리자에게 문의해주세요.');
      });
  }, [navigate, searchParams, paymentLive]);

  return (
    <ResultBox>
      <h2>{paymentLive ? '결제 완료' : '테스트 결제 완료'}</h2>
      <p>{message}</p>
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

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;

  a {
    display: inline-flex;
    align-items: center;
    border-radius: 6px;
    background: #988271;
    color: #fff;
    cursor: pointer;
    padding: 10px 18px;
    text-decoration: none;
  }
`;
