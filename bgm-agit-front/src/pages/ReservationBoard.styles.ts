import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const BoardBox = styled.div`
  width: 100%;
  padding: 10px 10px 40px;
`;

export const HeaderWrapper = styled.div<WithTheme>`
  display: flex;
  width: 100%;
  background-color: ${theme.colors.primary};
  padding: 20px;
  align-items: center;
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 12px;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex: 1;
  color: #ffffff;

  h2 {
    font-family: ${theme.fonts.display};
    font-weight: ${({ theme }) => theme.weight.bold};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
  }
  p {
    margin-top: 8px;
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    text-align: center;

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
    p {
      margin-top: 4px;
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;

export const DateNav = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const NavButton = styled.button<WithTheme>`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.subColor};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
`;

export const TodayButton = styled(NavButton)`
  background: #3d2d1e;
  color: #ffffff;
`;

export const DateInput = styled.input<WithTheme>`
  padding: 7px 10px;
  border: none;
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.medium};

  /* iOS Safari 자동 줌 방지 */
  @media ${({ theme }) => theme.device.mobile} {
    font-size: 16px;
  }
`;

export const DateLabel = styled.div<WithTheme>`
  margin-top: 18px;
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

export const SummaryRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

export const CHIP_TONES = {
  total: { bg: '#F2EDEA', color: '#424548' },
  confirmed: { bg: '#E4F3EC', color: '#1A7D55' },
  waiting: { bg: '#FBF1DC', color: '#9A6B12' },
  canceled: { bg: '#F1F1F1', color: '#757575' },
  people: { bg: '#E8EEF6', color: '#093A6E' },
} as const;

export const SummaryChip = styled.span<WithTheme & { $tone: keyof typeof CHIP_TONES }>`
  padding: 8px 14px;
  border-radius: 999px;
  background: ${({ $tone }) => CHIP_TONES[$tone].bg};
  color: ${({ $tone }) => CHIP_TONES[$tone].color};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};

  strong {
    font-weight: ${({ theme }) => theme.weight.bold};
    font-size: ${({ theme }) => theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: 6px 10px;
    font-size: ${({ theme }) => theme.sizes.xsmall};

    strong {
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

export const TabRow = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.lineColor};
`;

export const TabButton = styled.button<WithTheme & { $active: boolean }>`
  padding: 9px 18px;
  margin-bottom: -2px;
  border: none;
  border-bottom: 2px solid ${({ $active }) => ($active ? theme.colors.primary : 'transparent')};
  background: transparent;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.navColor)};
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 8px 12px;
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
`;

export const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export const ViewToggle = styled.div<WithTheme>`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 999px;
  overflow: hidden;
`;

export const ViewButton = styled.button<WithTheme & { $active: boolean }>`
  padding: 7px 16px;
  border: none;
  background: ${({ $active }) => ($active ? '#3D2D1E' : '#ffffff')};
  color: ${({ $active, theme }) => ($active ? '#ffffff' : theme.colors.navColor)};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 6px 14px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const PastNotice = styled.div<WithTheme>`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.softColor};
  color: ${({ theme }) => theme.colors.navColor};
  font-size: ${({ theme }) => theme.sizes.small};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
`;

export const Card = styled.div<WithTheme>`
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};
`;

export const CardTop = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
`;

export const CardTime = styled.span<WithTheme & { $canceled: boolean }>`
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.subColor};
  text-decoration: ${({ $canceled }) => ($canceled ? 'line-through' : 'none')};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

export const CardName = styled.div<WithTheme & { $canceled: boolean }>`
  margin-top: 8px;
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ theme }) => theme.colors.subColor};
  text-decoration: ${({ $canceled }) => ($canceled ? 'line-through' : 'none')};
`;

export const CardMeta = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.navColor};

  a {
    color: ${({ theme }) => theme.colors.blueColor};
    text-decoration: underline;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const CardRequest = styled.div<WithTheme>`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  word-break: break-all;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const CardActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;

  &:empty {
    display: none;
  }
`;

export const FilterButton = styled.button<WithTheme & { $active: boolean }>`
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? theme.colors.primary : '#D9D9D9')};
  background: ${({ $active }) => ($active ? theme.colors.primary : '#ffffff')};
  color: ${({ $active, theme }) => ($active ? '#ffffff' : theme.colors.subColor)};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 6px 12px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const Legend = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 14px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.navColor};
`;

export const LegendItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const LegendSwatch = styled.span`
  display: inline-block;
  width: 22px;
  height: 14px;
  border-radius: 4px;
  border-width: 2px;
`;

export const LegendNote = styled.span<WithTheme>`
  color: ${({ theme }) => theme.colors.navColor};
`;

export const BoardScroll = styled.div<WithTheme>`
  display: flex;
  margin-top: 16px;
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
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
  background: ${({ theme }) => theme.colors.white};
  border-right: 1px solid ${({ theme }) => theme.colors.lineColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex: 0 0 46px;
    width: 46px;
  }
`;

export const TimeHeadCell = styled.div<WithTheme>`
  height: ${HEAD_HEIGHT}px;
  background: ${({ theme }) => theme.colors.basicColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
`;

export const TimeCell = styled.div<WithTheme>`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 2px 6px 0 0;
  /* 눈금선과 라벨을 맞추기 위해 위쪽 정렬 */
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.navColor};
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};

  &:first-of-type {
    border-top: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }
`;

export const RoomColumn = styled.div<WithTheme>`
  flex: 1 1 0;
  min-width: 96px;
  border-right: 1px solid ${({ theme }) => theme.colors.lineColor};

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
  gap: 4px;
  height: ${HEAD_HEIGHT}px;
  padding: 0 6px;
  background: ${({ theme }) => theme.colors.basicColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ theme }) => theme.colors.subColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
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
  background: ${({ theme }) => theme.colors.lineColor};
  opacity: 0.6;
`;

/* 색상(배경·테두리·글자)은 룸/상태에 따라 inline style 로 주입한다. blockStyle() 참고 */
export const Block = styled.button<WithTheme & { $canceled: boolean }>`
  position: absolute;
  padding: 3px 5px;
  overflow: hidden;
  text-align: left;
  border-radius: 6px;
  border-width: 2px;
  cursor: pointer;
  text-decoration: ${({ $canceled }) => ($canceled ? 'line-through' : 'none')};

  &:hover {
    filter: brightness(1.05);
  }
`;

export const BlockName = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }
`;

export const BlockTime = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }
`;

export const DetailPanel = styled.div<WithTheme>`
  width: min(560px, calc(100vw - 40px));
  padding: 20px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.softColor};
`;

export const DetailHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

export const DetailTitle = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: ${({ theme }) => theme.sizes.large};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

export const StatusTag = styled.span<WithTheme>`
  padding: 3px 10px;
  border-radius: 999px;
  border: 2px solid transparent;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

export const RoomTag = styled.span<WithTheme>`
  padding: 3px 10px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.basicColor};
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
`;

export const CloseButton = styled.button<WithTheme>`
  padding: 6px 14px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.small};
  cursor: pointer;
`;

export const DetailGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 844px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const DetailField = styled.div<WithTheme & { $wide?: boolean }>`
  grid-column: ${({ $wide }) => ($wide ? '1 / -1' : 'auto')};

  dt {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ theme }) => theme.colors.navColor};
    margin-bottom: 4px;
  }

  dd {
    font-size: ${({ theme }) => theme.sizes.medium};
    color: ${({ theme }) => theme.colors.subColor};
    word-break: break-all;

    a {
      color: ${({ theme }) => theme.colors.blueColor};
      text-decoration: underline;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    dd {
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

export const DetailActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
`;

export const ActionButton = styled.button<WithTheme & { color: string }>`
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  background: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const EmptyBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  margin-top: 30px;
  padding: 40px 0;
  font-family: ${theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ theme }) => theme.colors.subColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const RetryButton = styled.button<WithTheme>`
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background: ${theme.colors.primary};
  color: #ffffff;
  font-family: inherit;
  font-size: ${({ theme }) => theme.sizes.small};
  cursor: pointer;
`;
