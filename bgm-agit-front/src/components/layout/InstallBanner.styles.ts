import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';

export const Banner = styled.div<WithTheme>`
  position: fixed;
  left: 12px;
  right: 12px;
  bottom: calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px 12px 12px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  /* 헤더·모달(3 이상)보다 아래 — 모달이 열리면 배너가 가리지 않게 */
  z-index: 2;
`;

export const Icon = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  flex-shrink: 0;
`;

export const Text = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 2px;
  color: ${({ theme }) => theme.colors.text};

  strong {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

export const InstallButton = styled.button<WithTheme>`
  flex-shrink: 0;
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.purpleColor};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 600;
  cursor: pointer;
`;

export const CloseButton = styled.button<WithTheme>`
  flex-shrink: 0;
  padding: 8px;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.medium};
  cursor: pointer;
`;
