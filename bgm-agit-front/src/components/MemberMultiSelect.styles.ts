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

// 참가자 칩. 예전처럼 본인(나)은 남색, 나머지는 갈색 채움
export const Chip = styled.span<{ $me: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  min-height: 36px;
  padding: 0 4px 0 12px;
  border: 1px solid ${({ $me }) => ($me ? c.blueColor : c.noticeColor)};
  border-radius: ${theme.radius.pill};
  font-size: 14px;
  font-weight: 600;
  color: ${c.white};
  background: ${({ $me }) => ($me ? c.blueColor : c.noticeColor)};

  /* 빠지기 아이콘 */
  svg {
    width: 28px;
    height: 28px;
    padding: 6px;
    border-radius: ${theme.radius.pill};
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
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
    border-color: #c4c4c4; /* 예전 값 */
    box-sizing: border-box;

    &:focus {
      border-color: ${c.blueColor};
      box-shadow: none;
    }
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
  background: ${c.white};
  border: 1px solid ${c.lineColor};
  border-radius: ${theme.radius.md};
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
`;

export const Option = styled.button<{ $active: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: none;
  border-radius: ${theme.radius.sm};
  background: ${({ $active }) => ($active ? '#f1efe9' : c.white)}; /* 예전 값 */
  font-family: inherit;
  font-size: 14px;
  color: ${c.subColor};
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    background: #f1efe9;
    outline: none;
  }
`;

// 검색어 일치 부분. 예전처럼 옅은 노랑 형광
export const Mark = styled.mark`
  padding: 0;
  border-radius: 2px;
  background: #fff1a8;
  color: inherit;
  font-weight: 700;
`;

export const EmptyOption = styled.div<WithTheme>`
  padding: ${theme.space.md};
  text-align: center;
  font-size: 14px;
  color: ${c.navColor};
`;
