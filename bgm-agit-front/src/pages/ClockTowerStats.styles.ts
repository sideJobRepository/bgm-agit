import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { cardStyle, inputStyle, sectionTitleStyle, tableStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const Box = styled.div`
  padding: ${theme.space.xl} 0 ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0 ${theme.space.xl};
  }
`;

// 예전엔 bgColor 색 띠였다. 흰 바탕 제목 영역이 되면서 bgColor 는 받기만 하고 쓰지 않는다
export const Header = styled.div.withConfig({ shouldForwardProp: p => p !== 'bgColor' })<{ bgColor: string } & WithTheme>`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: ${theme.space.xl};
  padding-bottom: ${theme.space.xl};
  border-bottom: 1px solid ${c.border};

  @media ${theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding-bottom: ${theme.space.lg};
  }
`;

export const TitleBox = styled.div<WithTheme>`
  ${sectionTitleStyle};
  min-width: 0;

  h2 {
    font-size: 30px;
  }

  @media ${theme.device.mobile} {
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

  @media ${theme.device.mobile} {
    margin: ${theme.space.lg} 0 ${theme.space.md};

    select {
      flex: 1;
      min-width: 0;
    }
  }
`;

// 표는 카드 안에서 가로 스크롤
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

  th,
  td {
    padding: 14px 12px;
  }

  td:nth-child(2) {
    color: ${c.textStrong};
    font-weight: 600;
  }

  strong {
    color: ${c.textStrong};
    font-weight: 800;
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.15s ease;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  @media ${theme.device.mobile} {
    font-size: 14px;

    th,
    td {
      padding: 14px 8px;
    }
  }
`;

export const Th = styled.th<WithTheme>`
  font-size: 13px;
  white-space: nowrap;
`;

export const Td = styled.td<WithTheme>``;

// 상위 3위는 포인트 색 원, 나머지는 숫자만
export const Rank = styled.span<{ $top: boolean } & WithTheme>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: ${theme.radius.pill};
  font-weight: 800;
  color: ${({ $top }) => ($top ? c.onPrimary : c.textMuted)};
  background: ${({ $top }) => ($top ? c.primary : 'transparent')};
`;

export const Empty = styled.div<WithTheme>`
  padding: 48px 0;
  color: ${c.textMuted};
  font-size: 15px;
  font-weight: 600;
  text-align: center;
`;
