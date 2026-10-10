import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const NoticeBox = styled.div`
  padding: 10px;
`;

export const LinkBadge = styled.span.withConfig({
  shouldForwardProp: prop => prop !== '$linked' && prop !== '$clickable',
})<{ $linked: boolean; $clickable?: boolean } & WithTheme>`
  display: inline-block;
  padding: 2px 10px;
  border: none;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ $linked }) => ($linked ? '#1a7d55' : '#999999')};
  background-color: ${({ $linked }) => ($linked ? 'rgba(26,125,85,0.12)' : '#f0f0f0')};
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`;

export const NicknameCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: none;
  background: transparent;
  color: ${theme.colors.primary};
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const ActionButton = styled.button<WithTheme>`
  padding: 4px 12px;
  border: 1px solid ${theme.colors.primary};
  border-radius: 4px;
  background: transparent;
  color: ${theme.colors.primary};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
  white-space: nowrap;
`;

export const DeleteButton = styled.button<WithTheme>`
  padding: 4px 12px;
  border: 1px solid #ff5e57;
  border-radius: 4px;
  background: transparent;
  color: #ff5e57;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
  white-space: nowrap;
`;

export const TabBar = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

export const TabButton = styled.button.withConfig({
  shouldForwardProp: prop => prop !== '$active',
})<{ $active: boolean } & WithTheme>`
  padding: 8px 20px;
  border: 1px solid ${theme.colors.primary};
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-size: ${({ theme }) => theme.sizes.small};
  background-color: ${({ $active }) => ($active ? theme.colors.primary : '#ffffff')};
  color: ${({ $active }) => ($active ? '#ffffff' : theme.colors.primary)};

  @media ${({ theme }) => theme.device.mobile} {
    flex: 1;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const TableBox = styled.div`
  padding: 40px 0;
  overflow-x: auto;
  width: 100%;
  white-space: nowrap;
`;

export const TableWrapper = styled.div<WithTheme>`
  display: inline-block;
  width: 100%;
  @media ${({ theme }) => theme.device.mobile} {
    width: unset;
    min-width: 100%;
  }
`;

export const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.sizes.medium};
  color: ${({ theme }) => theme.colors.subColor};

  /* 모바일: 컬럼이 많아 가로 스크롤(TableBox overflow-x) 되도록 최소 너비 보장 */
  @media ${({ theme }) => theme.device.mobile} {
    min-width: 760px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }

  th,
  td {
    padding: 14px;
    text-align: center;

    @media ${({ theme }) => theme.device.mobile} {
      padding: 10px 8px;
    }
  }

  tbody tr {
    cursor: pointer;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }
`;

export const Th = styled.th<WithTheme>`
  background-color: ${({ theme }) => theme.colors.basicColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

export const Td = styled.td<WithTheme>`
  input[type='checkbox'] {
    accent-color: ${({ theme }) => theme.colors.noticeColor};
    cursor: pointer;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;
    label {
      display: flex;
      gap: 4px;

      input {
        margin-right: 6px;
        accent-color: ${({ theme }) => theme.colors.noticeColor};
        cursor: pointer;
      }
    }
  }
`;

export const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  background-color: ${({ bgColor }) => bgColor};
  padding: 20px;
  align-items: center;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 10px;
  }
`;

export const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 60%;
  height: 60px;
  color: ${({ textColor }) => textColor};

  h2 {
    font-family: ${theme.fonts.display};
    font-weight: ${({ theme }) => theme.weight.bold};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: auto;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 40px;
    text-align: center;
    margin-bottom: 10px;

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
    p {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;

export const SearchBox = styled.div<WithTheme>`
  width: 40%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 20px;
`;

export const NoSearchBox = styled.div<WithTheme>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: ${theme.fonts.display};\
    margin-top: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  width: 100%;
  justify-content: right;
  margin-bottom: 10px;
`;

export const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
