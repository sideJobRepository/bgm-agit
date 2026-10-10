import styled from 'styled-components';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, inputStyle } from '../styles/mixins.ts';

const c = theme.colors;

// react-confirm-alert customUI 의 흰 창. 바깥 오버레이는 라이브러리 CSS(.react-confirm-alert-overlay)가 그린다
export const AlertWrapper = styled.div<{ $wide?: boolean }>`
  width: calc(100vw - 32px);
  max-width: ${({ $wide }) => ($wide ? '440px' : '380px')};
  /* 내용이 긴 예약 확인창이 작은 화면에서 잘리지 않게 창 안에서 스크롤 */
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: ${theme.space.xl};
  border-radius: ${theme.radius.lg};
  background: ${c.surface};
  box-shadow: ${theme.shadow.lg};
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
  color: ${c.textStrong};
  white-space: pre-line;
`;

export const FieldLabel = styled.div`
  margin-top: ${theme.space.lg};
  font-size: 13px;
  font-weight: 700;
  color: ${c.textBody};
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
  }

  strong {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.3;
    letter-spacing: -0.02em;
    color: ${c.textStrong};
  }
`;

export const FieldGroup = styled.div`
  padding: ${theme.space.lg} 0;
  border-top: 1px solid ${c.border};
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
    color: ${c.textStrong};
  }

  small {
    font-size: 12px;
    color: ${c.textMuted};
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
  background: ${c.surfaceAlt};
  color: ${c.textStrong};

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
  background: ${c.surfaceSunken};
  text-align: left;
  list-style: none;

  li {
    font-size: 14px;
    font-weight: 600;
    color: ${c.textBody};
  }
`;

export const ReasonTextarea = styled.textarea`
  ${inputStyle}
  min-height: 92px;
  line-height: 1.5;
  resize: vertical;
  box-sizing: border-box;
`;

export const HelperText = styled.div`
  margin-top: 6px;
  text-align: right;
  font-size: 12px;
  color: ${c.textMuted};
`;

export const NoticeMessage = styled.div`
  padding: ${theme.space.md} 14px;
  border-radius: ${theme.radius.md};
  background: ${c.primarySoft};
  color: ${c.primary};
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
  text-align: left;
`;

export const BaseButton = styled.button`
  ${buttonStyle('primary', 'md')}
  flex: 1;
`;

// 취소(닫기) — 보조 버튼
export const CancelButton = styled.button`
  ${buttonStyle('secondary', 'md')}
  flex: 1;
`;

export const ConfirmButton = styled.button`
  ${buttonStyle('primary', 'md')}
  flex: 1;
`;

export const ReasonInput = styled.input`
  ${inputStyle}
  margin-top: 10px;
  box-sizing: border-box;
`;
