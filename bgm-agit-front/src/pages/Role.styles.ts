import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import {
  badgeStyle,
  buttonStyle,
  focusRing,
  sectionTitleStyle,
  tableStyle,
} from '../styles/mixins.ts';

const c = theme.colors;

export const NoticeBox = styled.div`
  padding: ${theme.space.xl} 10px ${theme.space.xxl};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0 ${theme.space.xl};
  }
`;

// 연동 = success, 미연동 = neutral. 관리자에게는 버튼으로 렌더된다
export const LinkBadge = styled.span.withConfig({
  shouldForwardProp: prop => prop !== '$linked' && prop !== '$clickable',
})<{ $linked: boolean; $clickable?: boolean } & WithTheme>`
  ${({ $linked }) => badgeStyle($linked ? 'success' : 'neutral')};
  border: none;
  font-family: inherit;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  ${focusRing};

  &:hover {
    ${({ $clickable }) => ($clickable ? `box-shadow: inset 0 0 0 1px currentColor;` : '')}
  }

  @media ${theme.device.mobile} {
    ${({ $clickable }) => ($clickable ? `min-height: 36px; padding: 0 12px;` : '')}
  }
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
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: ${theme.radius.sm};
  background: transparent;
  color: ${c.primary};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${c.primarySoft};
  }

  ${focusRing};

  svg {
    width: 16px;
    height: 16px;
  }

  @media ${theme.device.mobile} {
    width: 44px;
    height: 44px;
  }
`;

export const ActionButton = styled.button<WithTheme>`
  ${buttonStyle('secondary', 'sm')};
  /* 예전 색: 갈색 테두리·갈색 글씨 외곽선 버튼 */
  background: transparent;
  color: ${c.primary};
  border-color: ${c.primary};

  &:hover:not(:disabled) {
    background: ${c.primarySoft};
  }

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;

export const DeleteButton = styled.button<WithTheme>`
  ${buttonStyle('danger', 'sm')};

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;

// 알약형 탭. 활성 = 갈색 채움, 비활성 = 흰 바탕 갈색 글씨(예전 색)
export const TabBar = styled.div`
  display: inline-flex;
  gap: 4px;
  margin-top: ${theme.space.xl};
  padding: 4px;
  border: 1px solid ${c.primary};
  border-radius: ${theme.radius.pill};
  background: ${c.white};

  @media ${theme.device.mobile} {
    display: flex;
    width: 100%;
    margin-top: ${theme.space.lg};
  }
`;

export const TabButton = styled.button.withConfig({
  shouldForwardProp: prop => prop !== '$active',
})<{ $active: boolean } & WithTheme>`
  min-height: 36px;
  padding: 0 20px;
  border: none;
  border-radius: ${theme.radius.pill};
  background-color: ${({ $active }) => ($active ? c.primary : 'transparent')};
  color: ${({ $active }) => ($active ? c.onPrimary : c.primary)};
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? c.primary : c.primarySoft)};
  }

  ${focusRing};

  @media ${theme.device.mobile} {
    flex: 1;
    min-height: 44px;
    padding: 0 12px;
  }
`;

export const TableBox = styled.div`
  padding: ${theme.space.xl} 0;
  width: 100%;
`;

// 넓은 표는 페이지가 아니라 이 상자 안에서 가로 스크롤
export const TableWrapper = styled.div<WithTheme>`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
`;

export const Table = styled.table<WithTheme>`
  ${tableStyle};
  border-top: 1px solid ${c.lineColor};
  color: ${c.subColor};

  /* 예전 색: 머리줄 basicColor 바탕 + 본문색, 줄 구분선 lineColor */
  th {
    background: ${c.basicColor};
    color: ${c.subColor};
    border-bottom-color: ${c.lineColor};
  }

  td {
    border-bottom-color: ${c.lineColor};
  }

  /* 모바일: 컬럼이 많아 가로 스크롤(TableWrapper overflow-x) 되도록 최소 너비 보장 */
  @media ${theme.device.mobile} {
    min-width: 760px;
    font-size: 13px;

    th,
    td {
      padding: 10px 8px;
    }
  }

  tbody tr {
    cursor: pointer;
  }
`;

export const Th = styled.th<WithTheme>`
  && {
    font-size: 13px;
    white-space: nowrap;
  }
`;

export const Td = styled.td<WithTheme>`
  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: ${c.primary};
    cursor: pointer;
  }

  div {
    display: flex;
    align-items: center;
    justify-content: center;

    label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-height: 32px;
      color: ${c.textBody};
      cursor: pointer;

      input {
        margin-right: 4px;
        accent-color: ${c.primary};
        cursor: pointer;
      }

      &:has(input:checked) {
        color: ${c.primary};
        font-weight: 700;
      }

      @media ${theme.device.mobile} {
        min-height: 44px;
      }
    }
  }
`;

// 예전 색: bgColor 로 채운 색 띠 + 흰 글씨. 채운 띠라 안쪽 여백을 둔다
export const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  gap: ${theme.space.xl};
  padding: ${theme.space.xl};
  align-items: flex-end;
  background-color: ${({ bgColor }) => bgColor};

  @media ${theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.lg};
    padding: ${theme.space.lg};
  }
`;

// textColor = 색 띠 위 글씨색(예전 색)
export const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  ${sectionTitleStyle};
  display: flex;
  flex-direction: column;
  width: 60%;
  min-width: 0;
  color: ${({ textColor }) => textColor};

  h2 {
    font-family: ${({ theme }) => theme.fonts.displayEn};
    font-size: 30px;
    color: ${({ textColor }) => textColor};
  }

  p {
    color: ${({ textColor }) => textColor};
  }

  @media ${theme.device.mobile} {
    width: 100%;

    h2 {
      font-size: 24px;
    }
  }
`;

export const SearchBox = styled.div<WithTheme>`
  width: 40%;
  min-width: 0;

  @media ${theme.device.mobile} {
    width: 100%;
  }
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: ${theme.space.xl};
  white-space: normal;
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

  @media ${theme.device.mobile} {
    font-size: 14px;
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin-bottom: ${theme.space.lg};
`;

export const Button = styled.button<WithTheme & { color: string }>`
  ${buttonStyle('primary', 'md')};
`;
