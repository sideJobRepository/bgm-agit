import { confirmAlert } from 'react-confirm-alert';
import styled from 'styled-components';

interface Props {
  message: React.ReactNode;
  onConfirm: () => void;
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

// 스타일 컴포넌트 정의
const AlertWrapper = styled.div`
  background: #fff;
  padding: 18px 50px;

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
