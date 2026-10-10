import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { inputStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.sm};
`;

export const ChipBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

// 참가자 칩. 본인(나)은 채움, 나머지는 옅은 포인트 색
export const Chip = styled.span<{ $me: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 36px;
  padding: 0 4px 0 12px;
  border: 1px solid ${c.primary};
  border-radius: ${theme.radius.pill};
  font-size: 14px;
  font-weight: 600;
  color: ${({ $me }) => ($me ? c.onPrimary : c.primary)};
  background: ${({ $me }) => ($me ? c.primary : c.primarySoft)};

  /* 빠지기 아이콘 */
  svg {
    width: 28px;
    height: 28px;
    padding: 6px;
    border-radius: ${theme.radius.pill};
    cursor: pointer;

    &:hover {
      background: ${({ $me }) => ($me ? c.primaryHover : c.surface)};
    }
  }
`;

export const MeTag = styled.span`
  font-size: 12px;
  opacity: 0.9;
`;

export const SearchBox = styled.div`
  position: relative;

  input {
    ${inputStyle}
    box-sizing: border-box;
  }
`;

export const Dropdown = styled.div<WithTheme>`
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  padding: ${theme.space.xs};
  background: ${c.surface};
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.md};
  box-shadow: ${theme.shadow.md};
`;

export const Option = styled.button<{ $active: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: none;
  border-radius: ${theme.radius.sm};
  background: ${({ $active }) => ($active ? c.primarySoft : c.surface)};
  font-family: inherit;
  font-size: 14px;
  color: ${c.textStrong};
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    background: ${c.primarySoft};
    outline: none;
  }
`;

// 검색어 일치 부분. 골드 옅은 배경(accentSoft) 위 본문색이라 대비 충분
export const Mark = styled.mark`
  padding: 0;
  border-radius: 2px;
  background: ${c.accentSoft};
  color: inherit;
  font-weight: 700;
`;

export const EmptyOption = styled.div<WithTheme>`
  padding: ${theme.space.md};
  text-align: center;
  font-size: 14px;
  color: ${c.textMuted};
`;
