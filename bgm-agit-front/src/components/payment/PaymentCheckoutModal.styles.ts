import styled from 'styled-components';
import { theme } from '../../styles/theme.ts';
import { buttonStyle } from '../../styles/mixins.ts';

const c = theme.colors;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.space.lg};
  background: rgba(22, 24, 29, 0.5);
`;

export const Modal = styled.div`
  width: min(520px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  padding: ${theme.space.xl};
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.lg};
  background: ${c.surface};
  box-shadow: ${theme.shadow.lg};

  @media ${theme.device.mobile} {
    padding: 20px ${theme.space.lg};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.md};
  margin-bottom: 20px;
`;

export const Title = styled.h2`
  margin: 0;
  color: ${c.textStrong};
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const CloseButton = styled.button`
  ${buttonStyle('ghost', 'sm')}
  color: ${c.textMuted};

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;

// 결제 항목 · 금액 한 줄
export const Summary = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${theme.space.md};
  margin-bottom: ${theme.space.lg};
  padding: ${theme.space.lg} 0;
  border-top: 1px solid ${c.border};
  border-bottom: 1px solid ${c.border};
  color: ${c.textBody};
  font-size: 15px;

  strong {
    min-width: 0;
    color: ${c.textStrong};
    font-weight: 700;
    word-break: keep-all;
  }

  span {
    flex: 0 0 auto;
    color: ${c.text};
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
`;

export const NoticeBox = styled.div`
  margin-bottom: ${theme.space.lg};
  padding: ${theme.space.md} ${theme.space.lg};
  border-radius: ${theme.radius.md};
  /* 예전 안내 상자: 아주 옅은 초록 바탕(#f2f7f5 근사) + 초록 글씨 */
  background: ${c.greenColor}0F;
  color: ${c.greenColor};
  font-size: 13px;
  font-weight: 600;
  line-height: 1.6;
`;

// 예전 결제 버튼: 초록 채움·흰 글씨
export const PayButton = styled.button`
  ${buttonStyle('primary', 'lg')}
  width: 100%;
  margin-top: ${theme.space.sm};
  background: ${c.greenColor};
  border-color: ${c.greenColor};
  color: ${c.white};

  &:hover:not(:disabled) {
    background: ${c.greenColor};
    border-color: ${c.greenColor};
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
