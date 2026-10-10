import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SelectedChip = styled.span<WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: #fff;
  background: #1a7d55;

  svg {
    cursor: pointer;
    font-size: 18px;
  }
`;

export const SearchBox = styled.div`
  position: relative;

  input {
    width: 100%;
    height: 42px;
    padding: 0 10px;
    border: 1px solid #c4c4c4;
    border-radius: 6px;
    font-size: 16px; /* iOS 자동 줌 방지 */
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #1a7d55;
    }
  }
`;

export const Dropdown = styled.div<WithTheme>`
  position: absolute;
  z-index: 20;
  top: 46px;
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
`;

export const Option = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: #fff;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  cursor: pointer;

  strong {
    font-size: ${({ theme }) => theme.sizes.small};
    color: ${({ theme }) => theme.colors.subColor};
  }
  span {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.navColor};
  }
  &:hover {
    background: #f7f4ef;
  }
`;

export const Empty = styled.div<WithTheme>`
  padding: 12px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
  text-align: center;
`;
