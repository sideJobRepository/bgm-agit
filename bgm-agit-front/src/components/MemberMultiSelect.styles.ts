import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ChipBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Chip = styled.span<{ $me: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: #fff;
  background: ${({ $me }) => ($me ? '#093A6E' : theme.colors.primary)};

  svg {
    cursor: pointer;
    font-size: 16px;
  }
`;

export const MeTag = styled.span`
  font-size: 11px;
  opacity: 0.85;
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
      border-color: #093a6e;
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

export const Option = styled.button<{ $active: boolean } & WithTheme>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 11px 12px;
  background: ${({ $active }) => ($active ? '#f1efe9' : '#fff')};
  border: none;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
`;

export const Mark = styled.mark`
  background: #fff1a8;
  color: inherit;
  padding: 0;
`;

export const EmptyOption = styled.div<WithTheme>`
  padding: 12px;
  text-align: center;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};
`;
