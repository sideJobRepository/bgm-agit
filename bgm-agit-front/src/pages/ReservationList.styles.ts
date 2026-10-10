import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export type StatusTone = 'waiting' | 'approved' | 'canceled';

// 상태는 진한 단색으로 칠해 헤더바 위 배지와 카드 테두리에 같이 쓴다
export const STATUS_COLORS: Record<StatusTone, string> = {
  waiting: '#E08700',
  approved: '#1A7D55',
  canceled: '#6B6B6B',
};

export const NoticeBox = styled.div`
  width: 100%;
  padding: 10px;
`;

export const ListBox = styled.div<WithTheme>`
  padding: 40px 0;
  width: 100%;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 20px 0;
  }
`;

// 전 구간 2열. 600px 밑의 좁은 폭은 Row 의 컴팩트 레이아웃이 받는다.
export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    gap: 10px;
  }

  @media (max-width: 600px) {
    gap: 8px;
  }
`;

export const Card = styled.div<WithTheme & { $tone: StatusTone }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  /* 카드 테두리 전체를 상태 색으로 둘러 목록을 훑을 때 상태가 먼저 보이게 한다 */
  border: 2px solid ${({ $tone }) => STATUS_COLORS[$tone]};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: 600px) {
    padding: 6px;
  }
`;

// 헤더와 행을 한 덩어리로 감싸 표가 닫힌 형태로 보이게 한다.
// overflow:hidden 이라 안쪽 헤더·행이 모서리에 맞춰 잘린다.
// flex:1 + 행의 flex-grow 로 카드 높이가 맞춰질 때 남는 공간을 행들이 나눠 가진다 (빈칸 방지)
export const CardTable = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
`;

export const Header = styled.div<WithTheme & { $canceled: boolean }>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  /* 취소된 예약은 헤더를 회색으로 내려 유효 예약과 구분한다 (삭제 표현은 쓰지 않음) */
  background-color: ${({ theme, $canceled }) =>
    $canceled ? theme.colors.grayColor : theme.colors.noticeColor};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.bold};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }

  /* 2열이라 장소·배지·일자가 한 줄에 안 들어가므로 위아래로 쌓는다 */
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 6px 8px;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const HeaderLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 100%;
`;

export const HeaderPlace = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const HeaderDate = styled.span`
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
`;

export const StatusBadge = styled.span<WithTheme & { $tone: StatusTone }>`
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  padding: 3px 12px;
  border: 1px solid ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.bold};
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ $tone }) => STATUS_COLORS[$tone]};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const Row = styled.div<WithTheme & { $highlight?: boolean }>`
  display: flex;
  /* 카드 높이가 맞춰질 때 남는 공간을 행들이 균등하게 나눠 흡수한다 */
  flex: 1 1 auto;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};

  &:last-child {
    border-bottom: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }

  /* 행이 늘어났을 때 글자가 위로 붙지 않게 세로 가운데 정렬 */
  span {
    display: flex;
    align-items: center;
    padding: 8px 10px;
  }

  span:nth-child(1) {
    flex: 1;
    white-space: nowrap;
    background-color: ${({ theme }) => theme.colors.softColor};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }

  span:nth-child(2) {
    flex: 2.4;
    white-space: pre-wrap;
    word-break: break-word;
    font-variant-numeric: tabular-nums;
  }

  /* 예약 시간은 핵심 정보라 값 칸만 따뜻한 톤으로 강조한다 */
  ${({ theme, $highlight }) =>
    $highlight &&
    `
    span:nth-child(2) {
      background-color: ${theme.colors.subTextBoxColor};
      color: ${theme.colors.bronzeColor};
      font-weight: ${theme.weight.bold};
    }
  `}

  /* 카드가 좁아 라벨 칸을 따로 둘 수 없으므로, 라벨을 값 앞의 작은 회색 글씨로 붙인다.
     칸 배경·수직선을 없애 회색/흰색 띠가 쌓이는 것도 같이 사라진다 */
  @media (max-width: 600px) {
    align-items: baseline;
    padding: 5px 6px;

    span {
      padding: 0;
    }

    span:nth-child(1) {
      flex: none;
      padding-right: 5px;
      background-color: transparent;
      border-right: none;
      color: ${({ theme }) => theme.colors.grayColor};
      font-size: ${({ theme }) => theme.sizes.xxsmall};
      font-weight: ${({ theme }) => theme.weight.semiBold};
    }

    span:nth-child(2) {
      flex: 1;
    }
  }
`;

export const ActionBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 8px;
`;

export const ActionButton = styled.button<WithTheme & { color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 120px;
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  @media (max-width: 900px) {
    min-width: 96px;
    padding: 8px 10px;
  }

  /* 카드가 좁아지므로 최소폭을 풀고 한 줄에 두 개까지 들어가게 한다 */
  @media (max-width: 600px) {
    min-width: 0;
    gap: 4px;
    padding: 8px 6px;
    font-size: ${({ theme }) => theme.sizes.xsmall};

    svg {
      width: 13px;
      height: 13px;
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
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

export const NoSearchBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: ${theme.fonts.display};
  margin-top: 20px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

export const InfoSummary = styled.div<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ theme }) => theme.colors.redColor};
  line-height: 1.4;
`;

export const InfoToggle = styled.button<WithTheme>`
  align-self: flex-start;
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 999px;
  background-color: ${({ theme }) => theme.colors.softColor};
  color: ${({ theme }) => theme.colors.subColor};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  cursor: pointer;
`;

export const TextBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  justify-content: right;
  margin-bottom: 10px;
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.4;
  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }

  p {
    color: ${({ theme }) => theme.colors.subColor};
  }

  span {
    color: ${({ theme }) => theme.colors.redColor};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;
