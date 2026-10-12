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

  /* 모바일은 화살표·번호를 한 줄에 고정한다(번호 수는 Pagination 이 줄인다) */
  @media ${theme.device.mobile} {
    flex-wrap: nowrap;
    gap: 2px;
  }

  /* 이전·다음 아이콘. .active = 첫/끝 페이지라 더 갈 곳이 없는 상태 */
  svg {
    width: 36px;
    height: 36px;
    padding: 6px;
    border-radius: ${theme.radius.md};
    color: ${c.subColor};
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s ease;

    @media (hover: hover) {
      &:hover:not(.active) {
        background: ${c.primarySoft};
        color: ${c.primary};
      }
    }

    &.active {
      color: ${c.white};
      cursor: default;
    }
  }

  @media ${theme.device.mobile} {
    svg {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      padding: 9px;
    }
  }
`;

export const PageNumberBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${theme.space.xs};
  padding: ${theme.space.sm} 0;

  @media ${theme.device.mobile} {
    flex-wrap: nowrap;
    gap: 2px;
  }
`;

export const PageButton = styled.button<WithTheme>`
  ${buttonStyle('ghost', 'sm')}
  min-width: 36px;
  padding: 0 10px;
  color: ${c.subColor};
  font-weight: 600;

  &.active,
  &.active:hover:not(:disabled) {
    background-color: ${c.noticeColor};
    border-color: ${c.noticeColor};
    color: ${c.white};
    font-weight: 700;
  }

  @media ${theme.device.mobile} {
    min-width: 34px;
    height: 40px;
    padding: 0 6px;
  }
`;

export const Ellipsis = styled.span<WithTheme>`
  display: inline-flex;
  align-items: center;
  color: ${c.subColor};
  user-select: none;

  @media ${theme.device.mobile} {
    padding: 0 2px;
  }
`;
