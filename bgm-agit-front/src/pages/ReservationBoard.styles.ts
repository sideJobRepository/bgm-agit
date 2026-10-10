import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import {
  badgeStyle,
  buttonStyle,
  cardStyle,
  focusRing,
  sectionTitleStyle,
  type ButtonVariant,
} from '../styles/mixins.ts';

const c = theme.colors;

export const BoardBox = styled.div`
  width: 100%;
  padding: ${theme.space.xl} 0 40px;

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg} 0 ${theme.space.xxl};
  }
`;

// 제목 + 날짜 이동. 흰 바탕 위에 제목, 오른쪽에 세그먼트형 날짜 이동
export const HeaderWrapper = styled.div<WithTheme>`
  display: flex;
  width: 100%;
  align-items: flex-end;
  gap: ${theme.space.lg};
  padding-bottom: ${theme.space.lg};
  border-bottom: 1px solid ${c.lineColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.space.md};
  }
`;

export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  ${sectionTitleStyle}

  /* 예전 현황판 머리(갈색 띠)의 색을 제목에 쓴다. 띠 자체는 여백 구조가 달라 칠하지 않는다 */
  h2 {
    color: ${c.noticeColor};
    font-family: ${theme.fonts.displayEn};
  }

  p {
    color: ${c.subColor};
  }
`;

// 이전 · 날짜 · 다음 · 오늘 을 한 덩어리 pill 로 묶는다. 예전처럼 갈색 바탕 위 흰 버튼
export const DateNav = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border: 1px solid ${c.noticeColor};
  border-radius: ${theme.radius.pill};
  background: ${c.noticeColor};

  @media ${theme.device.mobile} {
    width: 100%;
  }
`;

export const NavButton = styled.button<WithTheme>`
  flex: 0 0 auto;
  min-width: 40px;
  height: 38px;
  padding: 0 12px;
  border: none;
  border-radius: ${theme.radius.pill};
  background: ${c.white};
  color: ${c.subColor};
  font-family: inherit;
  font-size: ${theme.sizes.small};
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  ${focusRing}

  &:hover {
    background: ${c.softColor};
  }

  @media ${theme.device.mobile} {
    min-width: 44px;
    height: 44px;
  }
`;

// 예전 '오늘' 버튼: 아주 진한 갈색 채움·흰 글씨
export const TodayButton = styled(NavButton)`
  background: ${c.activeMenuColor};
  color: ${c.white};

  &:hover {
    background: ${c.activeMenuColor};
    color: ${c.white};
    opacity: 0.9;
  }
`;

export const DateInput = styled.input<WithTheme>`
  height: 38px;
  padding: 0 12px;
  border: 1px solid ${c.white};
  border-radius: ${theme.radius.pill};
  background: ${c.white};
  color: ${c.subColor};
  font-family: inherit;
  font-size: ${theme.sizes.small};
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  ${focusRing}

  &:focus {
    outline: none;
    border-color: ${c.primarySoft};
    box-shadow: 0 0 0 3px ${c.primarySoft};
  }

  /* iOS Safari 자동 줌 방지 */
  @media ${({ theme }) => theme.device.mobile} {
    flex: 1;
    min-width: 0;
    height: 44px;
    font-size: 16px;
  }
`;

export const DateLabel = styled.div<WithTheme>`
  margin-top: ${theme.space.lg};
  color: ${c.subColor};
  font-size: ${theme.sizes.menu};
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.medium};
  }
`;

export const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
  margin-top: ${theme.space.md};
`;

// 요약 칩 톤(예전 색). 합계 = 베이지 회색, 확정 = 초록, 대기 = 황토, 취소 = 회색, 인원 = 남색.
// 대기 글자색(#9A6B12)은 맞는 토큰이 없어 예전 값을 그대로 쓴다
export const CHIP_TONES = {
  total: { bg: c.basicColor, color: c.subColor },
  confirmed: { bg: `${c.greenColor}1A`, color: c.greenColor },
  waiting: { bg: c.subBgColor, color: '#9A6B12' },
  canceled: { bg: c.softColor, color: c.grayColor },
  people: { bg: `${c.blueColor}14`, color: c.blueColor },
} as const;

export const SummaryChip = styled.span<WithTheme & { $tone: keyof typeof CHIP_TONES }>`
  ${badgeStyle('neutral')}
  gap: 6px;
  padding: 6px 14px;
  background: ${({ $tone }) => CHIP_TONES[$tone].bg};
  color: ${({ $tone }) => CHIP_TONES[$tone].color};
  font-size: ${theme.sizes.small};
  font-weight: 600;

  strong {
    font-size: ${theme.sizes.medium};
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: 5px 10px;
    font-size: ${theme.sizes.xsmall};

    strong {
      font-size: ${theme.sizes.small};
    }
  }
`;

// 그룹 탭: 활성 = 갈색 글씨 + 2px 갈색 밑줄
export const TabRow = styled.div<WithTheme>`
  display: flex;
  gap: 4px;
  margin-top: ${theme.space.lg};
  border-bottom: 1px solid ${c.lineColor};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const TabButton = styled.button<WithTheme & { $active: boolean }>`
  flex: 0 0 auto;
  min-height: 44px;
  padding: 0 18px;
  margin-bottom: -1px;
  border: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? c.noticeColor : 'transparent')};
  background: transparent;
  color: ${({ $active }) => ($active ? c.noticeColor : c.navColor)};
  font-family: inherit;
  font-size: ${theme.sizes.medium};
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  cursor: pointer;
  transition: color 0.15s ease;
  ${focusRing}

  &:hover {
    color: ${c.noticeColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: 0 12px;
    font-size: ${theme.sizes.small};
  }
`;

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${theme.space.md};
  margin-top: ${theme.space.lg};
`;

// 상태 필터 · 보기 전환 = 세그먼트형 pill. 예전 색: 필터 활성 = 갈색 채움, 보기 활성 = 진갈색 채움
export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 3px;
  border: 1px solid ${c.lineColor};
  border-radius: ${theme.radius.pill};
  background: ${c.white};
`;

export const ViewToggle = styled.div<WithTheme>`
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid ${c.lineColor};
  border-radius: ${theme.radius.pill};
  background: ${c.white};
`;

export const ViewButton = styled.button<WithTheme & { $active: boolean }>`
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: ${theme.radius.pill};
  background: ${({ $active }) => ($active ? c.activeMenuColor : 'transparent')};
  color: ${({ $active }) => ($active ? c.white : c.navColor)};
  box-shadow: none;
  font-family: inherit;
  font-size: ${theme.sizes.small};
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  ${focusRing}

  &:hover {
    color: ${({ $active }) => ($active ? c.white : c.activeMenuColor)};
  }

  @media ${({ theme }) => theme.device.mobile} {
    height: 44px;
    padding: 0 14px;
  }
`;

export const PastNotice = styled.div<WithTheme>`
  margin-top: ${theme.space.md};
  padding: 10px ${theme.space.md};
  border: 1px solid ${c.softColor};
  border-radius: ${theme.radius.md};
  background: ${c.softColor};
  color: ${c.navColor};
  font-size: ${theme.sizes.small};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.xsmall};
  }
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.md};
  margin-top: ${theme.space.lg};
`;

/* 왼쪽 굵은 테두리 색은 tsx 가 룸 색(데이터 색)으로 inline 주입한다 */
export const Card = styled.div<WithTheme>`
  ${cardStyle}
  border-color: ${c.lineColor};
  background: ${c.white};
  padding: ${theme.space.lg};

  @media ${theme.device.mobile} {
    padding: 14px;
  }
`;

export const CardTop = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
`;

export const CardTime = styled.span<WithTheme & { $canceled: boolean }>`
  color: ${({ $canceled }) => ($canceled ? c.navColor : c.subColor)};
  font-size: ${theme.sizes.large};
  font-weight: 800;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  text-decoration: ${({ $canceled }) => ($canceled ? 'line-through' : 'none')};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.medium};
  }
`;

export const CardName = styled.div<WithTheme & { $canceled: boolean }>`
  margin-top: 10px;
  color: ${({ $canceled }) => ($canceled ? c.navColor : c.subColor)};
  font-size: ${theme.sizes.medium};
  font-weight: 700;
  text-decoration: ${({ $canceled }) => ($canceled ? 'line-through' : 'none')};
`;

export const CardMeta = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
  color: ${c.navColor};
  font-size: ${theme.sizes.small};
  font-variant-numeric: tabular-nums;

  a {
    color: ${c.blueColor};
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
    ${focusRing}
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.small};

    a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
    }
  }
`;

export const CardRequest = styled.div<WithTheme>`
  margin-top: ${theme.space.sm};
  padding: ${theme.space.sm} ${theme.space.md};
  border-radius: ${theme.radius.md};
  background: ${c.softColor};
  color: ${c.subColor};
  font-size: ${theme.sizes.small};
  line-height: 1.6;
  word-break: break-all;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.xsmall};
  }
`;

export const CardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
  margin-top: ${theme.space.md};

  &:empty {
    display: none;
  }
`;

export const FilterButton = styled.button<WithTheme & { $active: boolean }>`
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: ${theme.radius.pill};
  background: ${({ $active }) => ($active ? c.noticeColor : 'transparent')};
  color: ${({ $active }) => ($active ? c.white : c.subColor)};
  box-shadow: none;
  font-family: inherit;
  font-size: ${theme.sizes.small};
  font-weight: ${({ $active }) => ($active ? 800 : 600)};
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
  ${focusRing}

  &:hover {
    color: ${({ $active }) => ($active ? c.white : c.noticeColor)};
  }

  @media ${({ theme }) => theme.device.mobile} {
    height: 44px;
    padding: 0 14px;
  }
`;

export const Legend = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: ${theme.space.md};
  color: ${c.navColor};
  font-size: ${theme.sizes.xsmall};
`;

export const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
`;

export const LegendSwatch = styled.span`
  display: inline-block;
  width: 22px;
  height: 14px;
  border-radius: 4px;
  border-width: 2px;
`;

export const LegendNote = styled.span<WithTheme>`
  color: ${c.navColor};
`;

// 넓은 그리드는 페이지가 아니라 이 상자 안에서 가로 스크롤
export const BoardScroll = styled.div<WithTheme>`
  display: flex;
  margin-top: ${theme.space.lg};
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  ${cardStyle}
  border-color: ${c.lineColor};
`;

/* 열이 적으면 화면을 채우고, 많으면 가로 스크롤로 넘어간다 */
export const BoardGrid = styled.div`
  display: flex;
  min-width: 100%;
  flex: 1;
`;

export const TIME_COLUMN_WIDTH = 58;
export const HEAD_HEIGHT = 40;

export const TimeColumn = styled.div<WithTheme>`
  position: sticky;
  left: 0;
  z-index: 2;
  flex: 0 0 ${TIME_COLUMN_WIDTH}px;
  width: ${TIME_COLUMN_WIDTH}px;
  background: ${c.white};
  border-right: 1px solid ${c.lineColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex: 0 0 46px;
    width: 46px;
  }
`;

export const TimeHeadCell = styled.div<WithTheme>`
  height: ${HEAD_HEIGHT}px;
  background: ${c.basicColor};
  border-bottom: 1px solid ${c.lineColor};
`;

export const TimeCell = styled.div<WithTheme>`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 2px 6px 0 0;
  /* 눈금선과 라벨을 맞추기 위해 위쪽 정렬 */
  color: ${c.navColor};
  font-size: ${theme.sizes.xsmall};
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border-top: 1px solid ${c.lineColor};

  &:first-of-type {
    border-top: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 11px;
  }
`;

export const RoomColumn = styled.div<WithTheme>`
  flex: 1 1 0;
  min-width: 96px;
  border-right: 1px solid ${c.lineColor};

  &:last-child {
    border-right: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    min-width: 84px;
  }
`;

export const RoomHeadCell = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: ${HEAD_HEIGHT}px;
  padding: 0 6px;
  background: ${c.basicColor};
  border-bottom: 1px solid ${c.lineColor};
  color: ${c.subColor};
  font-size: ${theme.sizes.small};
  font-weight: 700;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 11px;
  }
`;

export const RoomHeadName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RoomDot = styled.span`
  display: inline-block;
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

export const ColumnTrack = styled.div`
  position: relative;
`;

export const GridLine = styled.div<WithTheme>`
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: ${c.lineColor};
`;

/* 색상(배경·테두리·글자)은 룸/상태에 따라 inline style 로 주입한다. blockStyle() 참고 */
export const Block = styled.button<WithTheme & { $canceled: boolean }>`
  position: absolute;
  padding: 3px 6px;
  overflow: hidden;
  text-align: left;
  font-family: inherit;
  border-radius: ${theme.radius.sm};
  border-width: 2px;
  cursor: pointer;
  text-decoration: ${({ $canceled }) => ($canceled ? 'line-through' : 'none')};
  transition: filter 0.15s ease;
  ${focusRing}

  &:focus-visible {
    z-index: 1;
  }

  &:hover {
    filter: brightness(1.05);
  }
`;

export const BlockName = styled.div<WithTheme>`
  font-size: ${theme.sizes.small};
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 11px;
  }
`;

export const BlockTime = styled.div<WithTheme>`
  font-size: ${theme.sizes.xsmall};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.xxsmall};
  }
`;

// 상세 모달: 흰 카드
export const DetailPanel = styled.div<WithTheme>`
  width: min(560px, calc(100vw - 32px));
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: ${theme.space.xl};
  border: 1px solid ${c.softColor};
  border-radius: ${theme.radius.lg};
  background: ${c.softColor};
  box-shadow: ${theme.shadow.lg};

  @media ${theme.device.mobile} {
    padding: ${theme.space.lg};
  }
`;

export const DetailHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.space.md};
  padding-bottom: ${theme.space.lg};
  border-bottom: 1px solid ${c.lineColor};
`;

export const DetailTitle = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
  color: ${c.subColor};
  font-size: ${theme.sizes.large};
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.medium};
  }
`;

/* 상태 칩. 색은 룸·상태에 따라 blockStyle() 로 inline 주입한다 */
export const StatusTag = styled.span<WithTheme>`
  ${badgeStyle('neutral')}
  padding: 2px 10px;
  border: 2px solid transparent;
  letter-spacing: 0;
`;

export const RoomTag = styled.span<WithTheme>`
  ${badgeStyle('neutral')}
  padding: 4px 10px;
  background: ${c.basicColor};
  color: ${c.subColor};
  letter-spacing: 0;
`;

export const CloseButton = styled.button<WithTheme>`
  ${buttonStyle('secondary', 'sm')}
  background: ${c.white};
  border-color: ${c.lineColor};
  color: ${c.subColor};
  flex-shrink: 0;

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;

export const DetailGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${theme.space.lg} ${theme.space.md};
  margin-top: ${theme.space.lg};

  @media ${theme.device.mobile} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const DetailField = styled.div<WithTheme & { $wide?: boolean }>`
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};

  dt {
    margin-bottom: 4px;
    color: ${c.navColor};
    font-size: ${theme.sizes.xsmall};
    font-weight: 600;
  }

  dd {
    color: ${c.subColor};
    font-size: ${theme.sizes.medium};
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    word-break: break-all;

    a {
      color: ${c.blueColor};
      text-decoration: underline;
      text-underline-offset: 2px;
      ${focusRing}
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    dd {
      font-size: ${theme.sizes.small};
    }
  }
`;

export const DetailActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
  margin-top: ${theme.space.xl};

  &:empty {
    display: none;
  }
`;

// 확정 = primary, 취소 = danger, 영수증 = secondary. 예전 색(초록·빨강·갈색 채움, 흰 글씨)으로 칠한다
const LEGACY_ACTION_COLORS: Partial<Record<ButtonVariant, string>> = {
  primary: c.greenColor,
  danger: c.redColor,
  secondary: c.noticeColor,
};

export const ActionButton = styled.button<WithTheme & { $variant: ButtonVariant }>`
  ${({ $variant }) => buttonStyle($variant, 'sm')}
  background: ${({ $variant }) => LEGACY_ACTION_COLORS[$variant] ?? c.noticeColor};
  border-color: ${({ $variant }) => LEGACY_ACTION_COLORS[$variant] ?? c.noticeColor};
  color: ${c.white};
  min-width: 88px;

  &:hover:not(:disabled) {
    background: ${({ $variant }) => LEGACY_ACTION_COLORS[$variant] ?? c.noticeColor};
    border-color: ${({ $variant }) => LEGACY_ACTION_COLORS[$variant] ?? c.noticeColor};
    color: ${c.white};
    opacity: 0.85;
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex: 1 1 0;
    min-width: 0;
    height: 44px;
  }
`;

export const EmptyBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${theme.space.md};
  width: 100%;
  margin-top: ${theme.space.xl};
  padding: 40px ${theme.space.lg};
  border: 1px dashed ${c.borderStrong};
  border-radius: ${theme.radius.lg};
  color: ${c.subColor};
  font-family: ${theme.fonts.display};
  font-size: ${theme.sizes.medium};
  font-weight: 600;
  text-align: center;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.small};
  }
`;

export const RetryButton = styled.button<WithTheme>`
  ${buttonStyle('primary', 'sm')}

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;
