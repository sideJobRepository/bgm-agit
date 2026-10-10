import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { badgeStyle, buttonStyle, sectionTitleStyle } from '../styles/mixins.ts';

const c = theme.colors;

export const NoticeBox = styled.div`
  padding: ${theme.space.xl} 0;

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0;
  }
`;

export const TableBox = styled.div`
  padding: ${theme.space.xl} 0 ${theme.space.xxl};
`;

// 넓은 표는 페이지가 아니라 이 상자 안에서 가로 스크롤
export const TableScrollBox = styled.div<WithTheme>`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 15px;
  color: ${c.textBody};

  th,
  td {
    padding: 14px 12px;
    text-align: center;
    border-bottom: 1px solid ${c.border};
  }

  /* 번호 칸 */
  td:nth-child(1) {
    color: ${c.textSubtle};
  }

  /* 제목 칸: 왼쪽 정렬, 넘치면 잘라낸다 (tsx 가 display:flex 를 준다) */
  td:nth-child(2) {
    align-items: center;
    text-align: left;
    color: ${c.textStrong};
    font-weight: 600;
    overflow: hidden;
    white-space: nowrap;
  }

  /* 데스크탑에서는 3번째가 날짜 */
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
  }
`;

export const Th = styled.th<WithTheme>`
  background-color: ${c.surfaceAlt};
  color: ${c.textMuted};
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;

  &:nth-child(2) {
    text-align: left;
  }
`;

export const Td = styled.td<WithTheme>``;

// 처리완료 = success, 처리대기 = neutral
export const StatusLabel = styled.label<WithTheme & { $gb: string }>`
  ${({ $gb }) => badgeStyle($gb === 'Y' ? 'success' : 'neutral')};
  flex-shrink: 0;
  margin-right: ${theme.space.sm};
  cursor: inherit;
`;

// 예전엔 bgColor 색 띠였다. 지금은 흰 바탕 제목 영역이라 bgColor 는 아래 구분선에만 쓴다
export const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  gap: ${theme.space.xl};
  padding: 0 0 ${theme.space.xl};
  align-items: flex-end;
  border-bottom: 2px solid ${({ bgColor }) => bgColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding-bottom: ${theme.space.lg};
  }
`;

// textColor 는 색 띠 위 흰 글씨용이었다. 흰 바탕이 됐으므로 글자색은 토큰으로 고정한다
export const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  ${sectionTitleStyle};
  display: flex;
  flex-direction: column;
  width: 60%;
  min-width: 0;

  h2 {
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
  font-size: 16px;
  font-weight: 600;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 14px;
  }
`;

// 비관리자 안내
export const NoAccessBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: ${theme.space.xxl} ${theme.space.lg};
  color: ${c.textMuted};
  font-size: 16px;
  font-weight: 600;
  text-align: center;

  @media ${theme.device.mobile} {
    font-size: 15px;
  }
`;
