import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Nav = styled.nav<WithTheme>`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.colors.subColor};
    cursor: pointer;

    &.active {
      color: ${({ theme }) => theme.colors.white};
    }
  }
`;

export const PageNumberBox = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 0;
`;

export const PageButton = styled.button<WithTheme>`
  background-color: ${({ theme }) => theme.colors.white};
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.subColor};
  padding: 4px 8px;

  &.active {
    background-color: ${({ theme }) => theme.colors.noticeColor};
    color: ${({ theme }) => theme.colors.white};
  }

  &:hover:not(.active) {
    opacity: 0.8;
  }
`;

export const Ellipsis = styled.span<WithTheme>`
  color: ${({ theme }) => theme.colors.subColor};
  user-select: none;
`;
