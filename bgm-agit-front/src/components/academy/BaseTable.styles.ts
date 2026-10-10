import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';

export const TableBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 8px;
`;

export const Table = styled.table<WithTheme & { $fixedLayout?: boolean }>`
  width: 100%;
  min-width: ${({ $fixedLayout }) => ($fixedLayout ? '760px' : '100%')};
  table-layout: ${({ $fixedLayout }) => ($fixedLayout ? 'fixed' : 'auto')};
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.lineColor};
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
  }

  thead {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }

  th,
  td {
    padding: 14px;
  }

  tbody tr:hover {
    opacity: 0.6;
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: ${({ $fixedLayout }) => ($fixedLayout ? '760px' : '100%')};
    min-width: ${({ $fixedLayout }) => ($fixedLayout ? '760px' : '100%')};
    max-width: none;
    table-layout: ${({ $fixedLayout }) => ($fixedLayout ? 'fixed' : 'auto')};
  }
`;

export const Th = styled.th<{
  $width?: string;
  $align?: 'left' | 'center' | 'right';
}>`
  white-space: nowrap;
  font-weight: 600;
  text-align: center;
  width: ${({ $width }) => $width ?? 'auto'};
`;

export const Td = styled.td<{
  $align?: 'left' | 'center' | 'right';
  $nowrap?: boolean;
}>`
  text-align: ${({ $align }) => $align ?? 'left'};
  white-space: ${({ $nowrap }) => ($nowrap ? 'nowrap' : 'normal')};
  word-break: break-word;
  overflow-wrap: anywhere;

  > div {
    display: flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    gap: 8px;
  }
`;

export const Tr = styled.tr<{ $clickable: boolean }>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:nth-child(even) {
    background-color: rgb(253, 253, 255);
  }
`;

export const EmptyTd = styled.td`
  padding: 40px 0;
  font-weight: 600;
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 4px;
`;

export const TopBox = styled.section`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 0;
  justify-content: space-between;
`;

export const Button = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const SearchGroup = styled.form<WithTheme>`
  display: flex;
  background-color: ${({ theme }) => theme.colors.white};
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 2px 20px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  flex-wrap: nowrap;
  max-width: 260px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const FieldsWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  flex-wrap: nowrap;
  overflow-y: hidden;
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.blackColor};
    font-weight: 600;
    text-align: left;
  }

  input {
    border: none;
    width: 100%;
    padding: 4px 0;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: transparent;
  }
`;

export const SearchButton = styled.button<WithTheme>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6dae81;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
  font-weight: 500;
  padding: 0 16px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    opacity: 0.8;
  }
`;

export const TableScroll = styled.div<WithTheme>`
  width: 100%;
  overflow-x: auto;
`;

export const StatusButton = styled.button<WithTheme & { color: string }>`
  padding: 4px 8px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

export const TextBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  justify-content: right;
  width: 100%;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};
  line-height: 1.4;
  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.xl};
  }

  p {
    color: ${({ theme }) => theme.colors.subColor};
  }

  span {
    color: ${({ theme }) => theme.colors.redColor};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;
