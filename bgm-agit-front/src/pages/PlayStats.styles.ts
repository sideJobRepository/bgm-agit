import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const Box = styled.div`
  padding: 10px;
`;

export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ bgColor }) => bgColor};
  color: #fff;
  padding: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 14px;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  h2 {
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: 6px;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const PickerRow = styled.div<WithTheme>`
  display: flex;
  gap: 8px;
  margin: 18px 0;

  select {
    height: 42px;
    padding: 0 12px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 6px;
    font-size: 16px;
  }
`;

export const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const Table = styled.table<WithTheme>`
  width: 100%;
  min-width: 360px;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};

  th,
  td {
    padding: 12px;
    text-align: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }
  tbody tr {
    cursor: pointer;
    &:hover {
      background: #f7f4ef;
    }
  }
`;

export const Th = styled.th<WithTheme>`
  background: #f1efe9;
  color: ${({ theme }) => theme.colors.subColor};
  font-weight: ${({ theme }) => theme.weight.bold};
`;

export const Td = styled.td<WithTheme>`
  color: ${({ theme }) => theme.colors.subColor};
`;

export const Rank = styled.span<{ $top: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ $top }) => ($top ? '#fff' : '#424548')};
  background: ${({ $top }) => ($top ? '#093A6E' : 'transparent')};
`;

export const Empty = styled.div<WithTheme>`
  text-align: center;
  padding: 40px 0;
  color: ${({ theme }) => theme.colors.navColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;
