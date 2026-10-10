import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Nav = styled.nav<WithTheme>`
  display: flex;
  gap: ${theme.space.xs};
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  /* 이전·다음 아이콘. .active = 첫/끝 페이지라 더 갈 곳이 없는 상태 */
  svg {
    width: 36px;
    height: 36px;
    padding: 6px;
    border-radius: ${theme.radius.md};
    color: ${c.textBody};
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover:not(.active) {
      background: ${c.primarySoft};
      color: ${c.primary};
    }

    &.active {
      color: ${c.borderStrong};
      cursor: default;
    }
  }

  @media ${theme.device.mobile} {
    svg {
      width: 44px;
      height: 44px;
      padding: 10px;
    }
  }
`;

export const PageNumberBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${theme.space.xs};
  padding: ${theme.space.sm} 0;
`;

export const PageButton = styled.button<WithTheme>`
  ${buttonStyle('ghost', 'sm')}
  min-width: 36px;
  padding: 0 10px;
  color: ${c.textBody};
  font-weight: 600;

  &.active,
  &.active:hover:not(:disabled) {
    background-color: ${c.primary};
    border-color: ${c.primary};
    color: ${c.onPrimary};
    font-weight: 700;
  }

  @media ${theme.device.mobile} {
    min-width: 44px;
    height: 44px;
  }
`;

export const Ellipsis = styled.span<WithTheme>`
  display: inline-flex;
  align-items: center;
  color: ${c.textMuted};
  user-select: none;
`;
