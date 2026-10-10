import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const NoticeBox = styled.div`
  padding: ${theme.space.xl} 0;

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0;
  }
`;

export const TableBox = styled.div`
  padding: ${theme.space.xl} 0 ${theme.space.xxl};
  /* 넓은 표는 페이지가 아니라 이 상자 안에서 가로 스크롤 */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

// /notice 페이지와 메인 공지 위젯이 같이 쓴다. 행 사이 1px 선, 날짜는 흐리게
export const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
  color: ${c.textBody};

  th,
  td {
    padding: 14px 12px;
    text-align: center;
    border-bottom: 1px solid ${c.lineColor};
  }

  /* 제목 칸은 왼쪽 정렬 + 한 줄 말줄임 */
  td:nth-child(2) {
    text-align: left;
    color: ${c.textStrong};
    font-weight: 600;
    max-width: 0;
    width: 60%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  /* 번호 칸 */
  td:nth-child(1) {
    width: 56px;
    color: ${c.textSubtle};
  }

  /* 데스크탑에서는 3번째가 날짜. 845px = theme.device.mobile(844px) 바로 위 */
  @media (min-width: 845px) {
    td:nth-child(3) {
      color: ${c.textMuted};
      font-size: 14px;
      white-space: nowrap;
    }
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover td {
      background: ${c.surfaceSunken};
    }
  }

  @media ${theme.device.mobile} {
    font-size: 14px;

    th,
    td {
      padding: 14px 8px;
    }

    td:nth-child(1) {
      width: 40px;
    }
  }
`;

export const Th = styled.th<WithTheme>`
  background-color: ${c.basicColor};
  color: ${c.subColor};
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;

  &:nth-child(2) {
    text-align: left;
  }
`;

export const Td = styled.td``;

// bgColor 색 띠(갈색 제목 띠). 띠 안쪽 여백이 있어야 글씨가 가장자리에 붙지 않는다
export const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  gap: ${theme.space.xl};
  padding: ${theme.space.xl};
  align-items: flex-end;
  background-color: ${({ bgColor }) => bgColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding: ${theme.space.lg};
  }
`;

// textColor 는 색 띠 위 흰 글씨
export const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  ${sectionTitleStyle};
  display: flex;
  flex-direction: column;
  width: 60%;
  min-width: 0;

  h2,
  p {
    color: ${({ textColor }) => textColor};
  }

  h2 {
    font-family: ${({ theme }) => theme.fonts.displayEn};
    font-size: 30px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;

    h2 {
      font-size: 24px;
    }
  }
`;

export const SearchBox = styled.div<WithTheme>`
  width: 40%;
  min-width: 0;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
`;

export const Button = styled.button<WithTheme & { color: string }>`
  ${buttonStyle('primary', 'md')};
`;

export const ButtonBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${theme.space.lg};
`;

export const NoSearchBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 120px;
  margin-top: ${theme.space.lg};
  color: ${c.textMuted};
  font-family: ${theme.fonts.display};
  font-size: 16px;
  font-weight: 600;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 14px;
  }
`;
