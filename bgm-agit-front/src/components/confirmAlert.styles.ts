import styled from 'styled-components';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, inputStyle } from '../styles/mixins.ts';

const c = theme.colors;

// 예전(갈색 테마 시절) 확인창 회색 단계. theme 에 같은 값이 없어 여기서만 쓴다
const OLD_TEXT = '#333';
const OLD_LABEL = '#9e9e9e';
const OLD_HINT = '#999';
const OLD_PLACEHOLDER = '#aaa';
const OLD_LINE = '#eeeeee';
const OLD_BORDER = '#d7d7d7';
const OLD_FILL = '#f7f8f8';
const OLD_NOTICE_BG = '#f2f7f5';

// react-confirm-alert customUI 의 흰 창. 바깥 오버레이는 라이브러리 CSS(.react-confirm-alert-overlay)가 그린다
export const AlertWrapper = styled.div<{ $wide?: boolean }>`
  width: calc(100vw - 32px);
  max-width: ${({ $wide }) => ($wide ? '440px' : '380px')};
  /* 내용이 긴 예약 확인창이 작은 화면에서 잘리지 않게 창 안에서 스크롤 */
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: ${theme.space.xl};
  border-radius: ${theme.radius.lg};
  background: ${c.white};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
  text-align: center;
  animation: fadeIn 0.25s ease;
  box-sizing: border-box;

  @media ${theme.device.mobile} {
    padding: 20px;
  }
`;

export const Message = styled.div`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.55;
  color: ${c.grayColor};
  white-space: pre-line;
`;

export const FieldLabel = styled.div`
  margin-top: ${theme.space.lg};
  font-size: 13px;
  font-weight: 700;
  color: ${OLD_LABEL};
  text-align: left;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: ${theme.space.xl};
`;

export const ReservationHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.space.sm};
  margin-bottom: ${theme.space.lg};
  text-align: left;

  span {
    ${badgeStyle('accent')}
    background: transparent;
    color: ${c.greenColor};
  }

  strong {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: -0.02em;
    color: ${OLD_TEXT};
  }
`;

export const FieldGroup = styled.div`
  padding: ${theme.space.lg} 0;
  border-top: 1px solid ${OLD_LINE};
`;

export const FieldTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
  margin-bottom: 10px;
  text-align: left;

  span {
    font-size: 14px;
    font-weight: 700;
    color: ${OLD_TEXT};
  }

  small {
    font-size: 12px;
    color: ${OLD_HINT};
  }
`;

export const Stepper = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  gap: 10px;
`;

export const IconButton = styled.button`
  ${buttonStyle('secondary', 'md')}
  background: ${c.white};
  border-color: ${OLD_BORDER};
  color: ${OLD_TEXT};
  width: 44px;
  padding: 0;

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
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: ${theme.radius.md};
  background: ${OLD_FILL};
  color: ${OLD_TEXT};

  strong {
    font-size: 22px;
    font-weight: 800;
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
  padding: ${theme.space.md} 14px;
  border-radius: ${theme.radius.md};
  background: ${OLD_FILL};
  text-align: left;
  list-style: none;

  li {
    font-size: 14px;
    font-weight: 600;
    color: ${OLD_TEXT};
  }
`;

export const ReasonTextarea = styled.textarea`
  ${inputStyle}
  border-color: ${OLD_BORDER};
  color: ${OLD_TEXT};
  min-height: 92px;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;

  &:focus {
    border-color: ${c.greenColor};
    box-shadow: 0 0 0 3px rgba(26, 125, 85, 0.1);
  }

  &::placeholder {
    color: ${OLD_PLACEHOLDER};
  }
`;

export const HelperText = styled.div`
  margin-top: 6px;
  text-align: right;
  font-size: 12px;
  color: ${OLD_PLACEHOLDER};
`;

export const NoticeMessage = styled.div`
  padding: ${theme.space.md} 14px;
  border-radius: ${theme.radius.md};
  background: ${OLD_NOTICE_BG};
  color: ${c.greenColor};
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
  text-align: left;
`;

export const BaseButton = styled.button`
  ${buttonStyle('primary', 'md')}
  flex: 1;
`;

// 취소(닫기) — 예전처럼 빨강 채움
export const CancelButton = styled.button`
  ${buttonStyle('primary', 'md')}
  background: ${c.redColor};
  border-color: ${c.redColor};
  color: ${c.white};

  &:hover:not(:disabled) {
    background: ${c.redColor};
    border-color: ${c.redColor};
    opacity: 0.8;
  }
  flex: 1;
`;

// 확인 — 예전처럼 초록 채움
export const ConfirmButton = styled.button`
  ${buttonStyle('primary', 'md')}
  background: ${c.greenColor};
  border-color: ${c.greenColor};
  color: ${c.white};

  &:hover:not(:disabled) {
    background: ${c.greenColor};
    border-color: ${c.greenColor};
    opacity: 0.8;
  }
  flex: 1;
`;

export const ReasonInput = styled.input`
  ${inputStyle}
  border-color: #ddd; /* 예전 값 */
  color: ${c.grayColor};

  &:focus {
    border-color: ${c.greenColor};
    box-shadow: none;
  }
  margin-top: 10px;
  box-sizing: border-box;
`;
