import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { buttonStyle, cardStyle, focusRing } from '../../styles/mixins.ts';

export const Banner = styled.div<WithTheme>`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 6px 12px 12px;
  ${cardStyle}
  box-shadow: ${({ theme }) => theme.shadow.lg};
  /* 헤더·모달(3 이상)보다 아래 — 모달이 열리면 배너가 가리지 않게 */
  z-index: 2;
`;

export const Icon = styled.img<WithTheme>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.md};
  flex-shrink: 0;
`;

export const Text = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 2px;
  color: ${({ theme }) => theme.colors.textStrong};

  strong {
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.textMuted};
    line-height: 1.4;
  }
`;

export const InstallButton = styled.button`
  flex-shrink: 0;
  ${buttonStyle('primary', 'md')}
  padding: 0 16px;
`;

export const CloseButton = styled.button<WithTheme>`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.md};
  background: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => theme.sizes.medium};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceAlt};
  }

  ${focusRing}
`;
