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
    <AlertWrapper $wide>
      <ReservationHeader>
        <span>예약 정보 확인</span>
        <strong>{label}</strong>
      </ReservationHeader>

      <FieldGroup>
        <FieldTitle>
          <span>예약 인원</span>
          <small>
            {minPeople}명 - {maxPeople}명
          </small>
        </FieldTitle>
        <Stepper>
          <IconButton
            type="button"
            disabled={count <= minPeople}
            onClick={() => setCount(c => Math.max(minPeople, c - 1))}
            aria-label="인원 줄이기"
          >
            <MdRemove />
          </IconButton>
          <CountValue>
            <strong>{count}</strong>
            <span>명</span>
          </CountValue>
          <IconButton
            type="button"
            disabled={count >= maxPeople}
            onClick={() => setCount(c => Math.min(maxPeople, c + 1))}
            aria-label="인원 늘리기"
          >
            <MdAdd />
          </IconButton>
        </Stepper>
      </FieldGroup>

      <FieldGroup>
        <FieldTitle>
          <span>요청사항</span>
          <small>선택 입력</small>
        </FieldTitle>
        <ReasonTextarea
          placeholder="필요한 내용이 있으면 적어주세요."
          value={reason}
          maxLength={200}
          onChange={e => setReason(e.target.value)}
        />
        <HelperText>{reason.length}/200</HelperText>
      </FieldGroup>

      <NoticeMessage>
        예약을 등록한 뒤 예약내역에서 예약금을 결제하면 예약이 확정됩니다.
      </NoticeMessage>
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
            onConfirm({ count, reason: reason.trim() });
            onClose();
          }}
        >
          예약 등록
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
const AlertWrapper = styled.div<{ $wide?: boolean }>`
  background: #fff;
  padding: ${({ $wide }) => ($wide ? '24px' : '18px 50px')};
  border-radius: 8px;
  width: 100%;
  max-width: ${({ $wide }) => ($wide ? '420px' : '360px')};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
  text-align: center;
  animation: fadeIn 0.25s ease;
  box-sizing: border-box;
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

const ReservationHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  margin-bottom: 18px;

  span {
    font-size: 13px;
    font-weight: 700;
    color: #1a7d55;
  }

  strong {
    font-size: 20px;
    line-height: 1.3;
    color: #333;
  }
`;

const FieldGroup = styled.div`
  padding: 14px 0;
  border-top: 1px solid #eeeeee;
`;

const FieldTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  text-align: left;

  span {
    font-size: 14px;
    font-weight: 700;
    color: #333;
  }

  small {
    font-size: 12px;
    color: #999;
  }
`;

const Stepper = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 10px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid #d7d7d7;
  border-radius: 8px;
  background: #fff;
  color: #333;
  cursor: pointer;

  svg {
    font-size: 22px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }
`;

const CountValue = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  min-height: 44px;
  border-radius: 8px;
  background: #f7f8f8;
  color: #333;

  strong {
    font-size: 24px;
    line-height: 1;
  }

  span {
    margin-left: 3px;
    font-size: 14px;
    font-weight: 700;
  }
`;

const ReasonTextarea = styled.textarea`
  width: 100%;
  min-height: 92px;
  padding: 12px;
  border: 1px solid #d7d7d7;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
  color: #333;
  box-sizing: border-box;

  &:focus {
    border-color: #1a7d55;
    box-shadow: 0 0 0 3px rgba(26, 125, 85, 0.1);
  }

  &::placeholder {
    color: #aaa;
  }
`;

const HelperText = styled.div`
  margin-top: 6px;
  text-align: right;
  font-size: 12px;
  color: #aaa;
`;

const NoticeMessage = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: #f2f7f5;
  color: #1a7d55;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  text-align: left;
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
