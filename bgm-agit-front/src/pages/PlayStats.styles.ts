import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { cardStyle, inputStyle, sectionTitleStyle, tableStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  padding: ${theme.space.xl} ${theme.space.lg} ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} ${theme.space.lg} ${theme.space.xl};
  }
`;

// 개편 전처럼 bgColor 색 띠 + 흰 글씨. 색 띠라 안쪽 여백(예전 값 20px/14px)을 같이 준다
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.xl};
  padding: 20px;
  background-color: ${({ bgColor }) => bgColor};
  color: ${c.white};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding: 14px;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  ${sectionTitleStyle};
  min-width: 0;

  h2 {
    font-family: ${({ theme }) => theme.fonts.displayEn};
    color: ${c.white};
    font-size: 30px;
  }

  p {
    color: ${c.white};
  }

  @media ${({ theme }) => theme.device.mobile} {
    h2 {
      font-size: 24px;
    }
  }
`;

export const PickerRow = styled.div<WithTheme>`
  display: flex;
  gap: ${theme.space.sm};
  margin: ${theme.space.xl} 0 ${theme.space.lg};

  select {
    ${inputStyle};
    width: auto;
    min-width: 120px;
    cursor: pointer;
  }

  @media ${({ theme }) => theme.device.mobile} {
    margin: ${theme.space.lg} 0 ${theme.space.md};

    select {
      flex: 1;
      min-width: 0;
    }
  }
`;

// 표는 페이지가 아니라 이 카드 안에서 가로 스크롤
export const TableScroll = styled.div`
  ${cardStyle};
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const Table = styled.table<WithTheme>`
  ${tableStyle};
  min-width: 360px;
  font-size: 15px;

  tbody tr {
    cursor: pointer;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  /* 개편 전 줄 hover 색(theme 에 없는 값이라 그대로 둔다) */
  tbody tr:hover td {
    background: #f7f4ef;
  }

  td strong {
    color: ${c.subColor};
    font-weight: 800;
  }
`;

export const Th = styled.th<WithTheme>`
  background: ${c.basicColor};
  color: ${c.subColor};
  font-size: 13px;
  white-space: nowrap;
`;

export const Td = styled.td<WithTheme>`
  color: ${c.subColor};
`;

// 1~3위는 개편 전처럼 남색으로 채운다
export const Rank = styled.span<{ $top: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${theme.radius.pill};
  font-size: 14px;
  font-weight: 800;
  color: ${({ $top }) => ($top ? c.white : c.subColor)};
  background: ${({ $top }) => ($top ? c.info : 'transparent')};
`;

export const Empty = styled.div<WithTheme>`
  padding: 56px 0;
  text-align: center;
  color: ${c.navColor};
  font-size: 15px;
  font-weight: 600;
`;
