import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get('message') ?? '결제가 완료되지 않았습니다.';

  return (
    <ResultBox>
      <h2>결제 실패</h2>
      <p>{message}</p>
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
