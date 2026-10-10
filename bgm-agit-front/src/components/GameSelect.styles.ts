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

export const SelectedChip = styled.span<WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  min-height: 44px;
  padding: 0 6px 0 14px;
  border: 1px solid ${c.greenColor};
  border-radius: ${theme.radius.pill};
  background: ${c.greenColor};
  color: ${c.white};
  font-size: 15px;
  font-weight: 700;

  /* 선택 해제 아이콘. 터치 영역 32px 원형 */
  svg {
    width: 32px;
    height: 32px;
    padding: 7px;
    border-radius: ${theme.radius.pill};
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;

export const SearchBox = styled.div`
  position: relative;

  input {
    ${inputStyle}
    border-color: #c4c4c4; /* 예전 값 */
    box-sizing: border-box;

    &:focus {
      border-color: ${c.greenColor};
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

export const Option = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: none;
  border-radius: ${theme.radius.sm};
  background: ${c.white};
  font-family: inherit;
  text-align: left;
  cursor: pointer;

  strong {
    font-size: 14px;
    font-weight: 700;
    color: ${c.subColor};
  }

  span {
    font-size: 12px;
    color: ${c.navColor};
  }

  &:hover,
  &:focus-visible {
    background: #f7f4ef; /* 예전 값 */
    outline: none;
  }
`;

export const Empty = styled.div<WithTheme>`
  padding: ${theme.space.md};
  font-size: 14px;
  color: ${c.navColor};
  text-align: center;
`;
