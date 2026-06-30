import { confirmAlert } from 'react-confirm-alert';
import styled from 'styled-components';
import { useState } from 'react';
import { MdAdd, MdRemove } from 'react-icons/md';
import { toast } from 'react-toastify';

interface Props {
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ReservationConfirmProps {
  label: string;
  initialCount: number;
  minPeople: number;
  maxPeople: number;
  onConfirm: (values: { count: number; reason: string }) => void;
  onCancel?: () => void;
}

export function showConfirmModal({ message, onConfirm, onCancel }: Props) {
  confirmAlert({
    customUI: ({ onClose }) => (
      <AlertWrapper>
        <Message>{message}</Message>
        <ButtonGroup>
          <CancelButton
             onClick={() => {
              onCancel?.();
              onClose();
            }}
          >
            취소
          </CancelButton>
          <ConfirmButton
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            확인
          </ConfirmButton>
        </ButtonGroup>
      </AlertWrapper>
    ),
  });
}

// 예약 확정 모달 (인원수·요청사항 입력 포함)
function ReservationConfirmContent({
  label,
  initialCount,
  minPeople,
  maxPeople,
  onClose,
  onConfirm,
  onCancel,
}: ReservationConfirmProps & { onClose: () => void }) {
  const [count, setCount] = useState(initialCount);
  const [reason, setReason] = useState('');

  return (
    <AlertWrapper>
      <Message>
        {label} {count}명
      </Message>
      <CountBox>
        <MdRemove
          style={{
            cursor: count > minPeople ? 'pointer' : 'not-allowed',
            opacity: count > minPeople ? 1 : 0.3,
          }}
          onClick={() => setCount(c => Math.max(minPeople, c - 1))}
        />
        <span>{count}명</span>
        <MdAdd
          style={{
            cursor: count < maxPeople ? 'pointer' : 'not-allowed',
            opacity: count < maxPeople ? 1 : 0.3,
          }}
          onClick={() => setCount(c => Math.min(maxPeople, c + 1))}
        />
      </CountBox>
      <ReasonInput
        type="text"
        placeholder="요청사항을 적어주세요."
        value={reason}
        onChange={e => setReason(e.target.value)}
      />
      <Message>
        해당 일자를 예약하시겠습니까?
        <br />
        예약금 입금 후 예약 확정이 완료됩니다.
      </Message>
      <ButtonGroup>
        <CancelButton
          onClick={() => {
            onCancel?.();
            onClose();
          }}
        >
          취소
        </CancelButton>
        <ConfirmButton
          onClick={() => {
            onConfirm({ count, reason });
            onClose();
          }}
        >
          확인
        </ConfirmButton>
      </ButtonGroup>
    </AlertWrapper>
  );
}

export function showReservationConfirmModal(props: ReservationConfirmProps) {
  confirmAlert({
    customUI: ({ onClose }) => <ReservationConfirmContent {...props} onClose={onClose} />,
  });
}

// 텍스트/비밀번호 입력 모달 (닉네임·비밀번호 변경 등)
interface InputModalProps {
  message: React.ReactNode;
  label?: string;
  initialValue?: string;
  inputType?: 'text' | 'password';
  placeholder?: string;
  minLength?: number;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
}

function InputModalContent({
  message,
  label,
  initialValue,
  inputType = 'text',
  placeholder,
  minLength,
  onClose,
  onConfirm,
  onCancel,
}: InputModalProps & { onClose: () => void }) {
  const [value, setValue] = useState(initialValue ?? '');

  const handleConfirm = () => {
    const v = value.trim();
    if (!v) {
      toast.error('값을 입력해 주세요.');
      return;
    }
    if (minLength && v.length < minLength) {
      toast.error(`${minLength}자 이상 입력해 주세요.`);
      return;
    }
    onConfirm(v);
    onClose();
  };

  return (
    <AlertWrapper>
      <Message>{message}</Message>
      {label && <FieldLabel>{label}</FieldLabel>}
      <ReasonInput
        type={inputType}
        placeholder={placeholder}
        value={value}
        autoFocus
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleConfirm();
        }}
      />
      <ButtonGroup>
        <CancelButton
          onClick={() => {
            onCancel?.();
            onClose();
          }}
        >
          취소
        </CancelButton>
        <ConfirmButton onClick={handleConfirm}>확인</ConfirmButton>
      </ButtonGroup>
    </AlertWrapper>
  );
}

export function showInputModal(props: InputModalProps) {
  confirmAlert({
    customUI: ({ onClose }) => <InputModalContent {...props} onClose={onClose} />,
  });
}

// 스타일 컴포넌트 정의
const AlertWrapper = styled.div`
  background: #fff;
  padding: 18px 50px;
  border-radius: 12px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  text-align: center;
  animation: fadeIn 0.25s ease;
`;

const Message = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: #757575;
  white-space: pre-line;
`;

const FieldLabel = styled.div`
  margin-top: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #9e9e9e;
  text-align: left;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 12px;
  font-weight: 600;
`;

const BaseButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s ease;
`;

const CancelButton = styled(BaseButton)`
  background-color: #ff5e57;
  color: #ffffff;

  &:hover {
    opacity: 0.8;
  }
`;

const ConfirmButton = styled(BaseButton)`
  background-color: #1a7d55;
  color: #ffffff;

  &:hover {
    opacity: 0.8;
  }
`;

const CountBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
  color: #757575;

  svg {
    font-size: 22px;
  }

  span {
    font-size: 16px;
    font-weight: 600;
    min-width: 48px;
    text-align: center;
  }
`;

const ReasonInput = styled.input`
  width: 100%;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  outline: none;
  color: #757575;
  box-sizing: border-box;

  &:focus {
    border-color: #1a7d55;
  }
`;
