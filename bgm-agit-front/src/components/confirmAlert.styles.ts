import styled from 'styled-components';

// 스타일 컴포넌트 정의
export const AlertWrapper = styled.div<{ $wide?: boolean }>`
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

export const Message = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: #757575;
  white-space: pre-line;
`;

export const FieldLabel = styled.div`
  margin-top: 14px;
  font-size: 13px;
  font-weight: 600;
  color: #9e9e9e;
  text-align: left;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
  gap: 12px;
  font-weight: 600;
`;

export const ReservationHeader = styled.div`
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

export const FieldGroup = styled.div`
  padding: 14px 0;
  border-top: 1px solid #eeeeee;
`;

export const FieldTitle = styled.div`
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

export const Stepper = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 10px;
`;

export const IconButton = styled.button`
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

export const CountValue = styled.div`
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

export const SummaryList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 8px;
  background: #f7f8f8;
  text-align: left;
  list-style: none;

  li {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
`;

export const ReasonTextarea = styled.textarea`
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

export const HelperText = styled.div`
  margin-top: 6px;
  text-align: right;
  font-size: 12px;
  color: #aaa;
`;

export const NoticeMessage = styled.div`
  padding: 12px;
  border-radius: 8px;
  background: #f2f7f5;
  color: #1a7d55;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.5;
  text-align: left;
`;

export const BaseButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s ease;
`;

export const CancelButton = styled(BaseButton)`
  background-color: #ff5e57;
  color: #ffffff;

  &:hover {
    opacity: 0.8;
  }
`;

export const ConfirmButton = styled(BaseButton)`
  background-color: #1a7d55;
  color: #ffffff;

  &:hover {
    opacity: 0.8;
  }
`;

export const ReasonInput = styled.input`
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
