import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Wrapper = styled.section`
  display: flex;
  width: 100%;
`;

// 입력칸처럼 보이는 검색 상자. color prop 은 포커스 테두리·라벨·검색 버튼 색으로 쓴다
export const SearchGroup = styled.form<{ color: string } & WithTheme>`
  display: flex;
  width: 100%;
  min-height: 56px;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.sm};
  padding: 6px 6px 6px 14px;
  border: 1px solid ${c.borderStrong};
  border-radius: ${theme.radius.md};
  background-color: ${c.surface};
  box-shadow: ${theme.shadow.sm};
  flex-wrap: nowrap;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus-within {
    border-color: ${({ color }) => color};
    box-shadow: 0 0 0 3px ${c.primarySoft};
  }

  @media ${theme.device.mobile} {
    width: 100%;
    padding: 6px 6px 6px 12px;
  }
`;

export const FieldsWrapper = styled.div`
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  gap: ${theme.space.md};
  flex: 1;
  overflow-x: auto;
  flex-wrap: nowrap;
  overflow-y: hidden;
`;

const fieldInner = (color: string) => `
  label {
    margin-left: 2px;
    font-size: 12px;
    font-weight: 700;
    color: ${color};
    text-align: left;
  }

  input {
    width: 100%;
    padding: 2px;
    border: none;
    outline: none;
    background: transparent;
    color: ${c.textStrong};
    font-family: inherit;
    font-size: 15px;

    &::placeholder {
      color: ${c.textSubtle};
    }
  }

  @media ${theme.device.mobile} {
    label {
      font-size: 11px;
    }

    /* iOS Safari 자동 줌 방지 */
    input {
      font-size: 16px;
    }
  }
`;

export const Field = styled.div<{ color: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
  ${({ color }) => fieldInner(color)}
`;

export const GameField = styled.div<{ color: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  ${({ color }) => fieldInner(color)}
`;

export const SearchButton = styled.button<{ color: string }>`
  ${buttonStyle('primary', 'md')}
  flex-shrink: 0;
  background: ${({ color }) => color};
  border-color: ${({ color }) => color};

  &:hover:not(:disabled) {
    background: ${({ color }) => color};
    border-color: ${({ color }) => color};
    opacity: 0.9;
  }

  @media ${theme.device.mobile} {
    padding: 0 14px;
  }
`;

export const SearchIcon = styled(FiSearch)`
  flex-shrink: 0;
`;

export const DateRange = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  gap: 6px;

  input {
    width: 96px !important;

    @media ${theme.device.mobile} {
      width: 92px !important;
    }
  }

  span {
    font-size: 14px;
    font-weight: 700;
    color: ${c.textBody};
  }
`;

export const DateCenter = styled.div`
  display: flex;
  color: ${c.textMuted};
`;

export const SortSelect = styled.div`
  display: flex;
  min-width: 96px;
`;
