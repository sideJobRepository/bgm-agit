import styled, { css } from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import {
  badgeStyle,
  buttonStyle,
  cardStyle,
  focusRing,
  type ButtonVariant,
} from '../styles/mixins.ts';

const c = theme.colors;

export type StatusTone = 'waiting' | 'approved' | 'canceled';

// 상태 대표색(예전 값). 카드 테두리와 배지가 이 색으로 칠해진다.
// 대기 주황·취소 회색은 맞는 토큰이 없어 예전 hex 를 그대로 쓴다
export const STATUS_COLORS: Record<StatusTone, string> = {
  waiting: '#E08700',
  approved: c.greenColor,
  canceled: '#6B6B6B',
};

// 예전 배지: 상태색 채움 + 흰 글씨 + 흰 테두리. 취소는 취소선을 더해 색 말고도 구분되게 한다
const STATUS_BADGE: Record<StatusTone, ReturnType<typeof css>> = {
  waiting: css`
    ${badgeStyle('accent')}
  `,
  approved: css`
    ${badgeStyle('primary')}
  `,
  canceled: css`
    ${badgeStyle('neutral')}
    text-decoration: line-through;
  `,
};

// 예전 예약 카드 액션 버튼 색. 결제·확정 = 초록, 취소 = 빨강, 영수증 = 갈색, 공유 = 진갈색. 전부 채움·흰 글씨
export type ActionTone = 'pay' | 'approve' | 'cancel' | 'receipt' | 'share';

export const ACTION_COLORS: Record<ActionTone, string> = {
  pay: c.greenColor,
  approve: c.greenColor,
  cancel: c.redColor,
  receipt: c.noticeColor,
  share: c.bronzeColor,
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${theme.space.lg};

  @media (max-width: 900px) {
    gap: ${theme.space.md};
  }

  @media (max-width: 600px) {
    gap: ${theme.space.sm};
  }
`;

export const Card = styled.div<WithTheme & { $tone: StatusTone }>`
  ${cardStyle}
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  padding: ${theme.space.md};
  background-color: ${c.white};
  /* 카드 테두리 전체를 상태 색으로 둘러 목록을 훑을 때 상태가 먼저 보이게 한다(예전 2px 테두리).
     굵기를 바꾸면 카드가 밀리므로 1px 테두리 + 1px 그림자로 2px 효과를 낸다 */
  border-color: ${({ $tone }) => STATUS_COLORS[$tone]};
  box-shadow:
    0 0 0 1px ${({ $tone }) => STATUS_COLORS[$tone]},
    0 2px 8px rgba(0, 0, 0, 0.06);

  @media (max-width: 600px) {
    padding: ${theme.space.sm};
  }
`;

// 헤더와 행을 한 덩어리로 감싸 표가 닫힌 형태로 보이게 한다.
// overflow:hidden 이라 안쪽 헤더·행이 모서리에 맞춰 잘린다.
// flex:1 + 행의 flex-grow 로 카드 높이가 맞춰질 때 남는 공간을 행들이 나눠 가진다 (빈칸 방지)
export const CardTable = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.md};
  background: ${c.surface};
  overflow: hidden;
`;

export const Header = styled.div<WithTheme & { $canceled: boolean }>`
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.sm};
  padding: 10px ${theme.space.md};
  /* 예전 헤더: 갈색 채움·흰 글씨. 취소된 예약은 회색으로 내려 유효 예약과 구분한다 */
  border-bottom: 1px solid ${({ $canceled }) => ($canceled ? c.grayColor : c.noticeColor)};
  background-color: ${({ $canceled }) => ($canceled ? c.grayColor : c.noticeColor)};
  color: ${c.white};
  font-size: ${theme.sizes.medium};
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.small};
  }

  /* 2열이라 장소·배지·일자가 한 줄에 안 들어가므로 위아래로 쌓는다 */
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 6px ${theme.space.sm};
    font-size: ${theme.sizes.xsmall};
  }
`;

export const HeaderLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.space.sm};
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
  color: ${c.white};
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

export const StatusBadge = styled.span<WithTheme & { $tone: StatusTone }>`
  flex: 0 0 auto;
  ${({ $tone }) => STATUS_BADGE[$tone]}
  background: ${({ $tone }) => STATUS_COLORS[$tone]};
  color: ${c.white};
  /* 예전 흰 테두리 + 그림자. 테두리 굵기만큼 크기가 바뀌지 않게 inset 그림자로 그린다 */
  box-shadow:
    inset 0 0 0 1px ${c.white},
    0 1px 3px rgba(0, 0, 0, 0.25);
  letter-spacing: 0.02em;

  @media (max-width: 600px) {
    padding: 2px 6px;
    font-size: 11px;
  }
`;

export const Row = styled.div<WithTheme & { $highlight?: boolean }>`
  display: flex;
  /* 카드 높이가 맞춰질 때 남는 공간을 행들이 균등하게 나눠 흡수한다 */
  flex: 1 1 auto;
  border-bottom: 1px solid ${c.border};
  font-size: ${theme.sizes.small};
  color: ${c.subColor};

  &:last-child {
    border-bottom: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.xsmall};
  }

  /* 행이 늘어났을 때 글자가 위로 붙지 않게 세로 가운데 정렬 */
  span {
    display: flex;
    align-items: center;
    padding: 9px ${theme.space.md};
  }

  span:nth-child(1) {
    flex: 1;
    white-space: nowrap;
    background-color: ${c.softColor};
    border-right: 1px solid ${c.border};
    color: ${c.subColor};
    font-weight: ${theme.weight.semiBold};
  }

  span:nth-child(2) {
    flex: 2.4;
    min-width: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-variant-numeric: tabular-nums;
  }

  /* 예약 시간은 핵심 정보라 값 칸만 따뜻한 톤(베이지 바탕·진갈색 글씨)으로 강조한다 */
  ${({ $highlight }) =>
    $highlight &&
    css`
      span:nth-child(2) {
        background-color: ${c.subTextBoxColor};
        color: ${c.bronzeColor};
        font-weight: ${theme.weight.bold};
      }
    `}

  /* 카드가 좁아 라벨 칸을 따로 둘 수 없으므로, 라벨을 값 앞의 작은 회색 글씨로 붙인다.
     칸 배경·수직선을 없애 회색/흰색 띠가 쌓이는 것도 같이 사라진다 */
  @media (max-width: 600px) {
    align-items: baseline;
    padding: 6px;

    span {
      padding: 0;
    }

    span:nth-child(1) {
      flex: none;
      padding-right: 5px;
      background-color: transparent;
      border-right: none;
      color: ${c.grayColor};
      font-size: 11px;
      font-weight: ${theme.weight.semiBold};
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
  padding-top: 10px;
`;

export const ActionButton = styled.button<
  WithTheme & { $variant: ButtonVariant; $tone: ActionTone }
>`
  ${({ $variant }) => buttonStyle($variant, 'sm')}
  /* 예전처럼 버튼마다 고유 색 채움 + 흰 글씨 */
  background: ${({ $tone }) => ACTION_COLORS[$tone]};
  border-color: ${({ $tone }) => ACTION_COLORS[$tone]};
  color: ${c.white};
  flex: 1 1 auto;
  min-width: 110px;

  &:hover:not(:disabled) {
    background: ${({ $tone }) => ACTION_COLORS[$tone]};
    border-color: ${({ $tone }) => ACTION_COLORS[$tone]};
    color: ${c.white};
    opacity: 0.85;
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  @media (max-width: 900px) {
    min-width: 90px;
    padding: 0 10px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    height: 44px;
  }

  /* 카드가 좁아지므로 최소폭을 풀고 한 줄에 두 개까지 들어가게 한다 */
  @media (max-width: 600px) {
    min-width: 0;
    flex-basis: calc(50% - 3px);
    gap: 4px;
    padding: 0 6px;
    font-size: ${theme.sizes.xsmall};

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
  border-radius: ${theme.radius.lg};
  padding: ${theme.space.xl};
  align-items: center;
  gap: ${theme.space.lg};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    gap: ${theme.space.sm};
    padding: ${theme.space.lg};
  }
`;

export const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 60%;
  min-height: 60px;
  color: ${({ textColor }) => textColor};

  h2 {
    font-family: ${theme.fonts.displayEn};
    font-weight: 800;
    letter-spacing: -0.02em;
    font-size: ${theme.sizes.xxlarge};
  }
  p {
    margin-top: auto;
    font-weight: ${theme.weight.semiBold};
    font-size: ${theme.sizes.medium};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    min-height: 40px;
    text-align: center;
    margin-bottom: ${theme.space.sm};

    h2 {
      font-size: ${theme.sizes.large};
    }
    p {
      margin-top: 2px;
      font-size: ${theme.sizes.xsmall};
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
  margin-top: 20px;
  padding: 40px ${theme.space.lg};
  border: 1px dashed ${c.borderStrong};
  border-radius: ${theme.radius.lg};
  color: ${c.textMuted};
  font-size: ${theme.sizes.medium};
  font-weight: ${theme.weight.semiBold};
  font-family: ${theme.fonts.display};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.small};
  }
`;

export const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.sm};
  margin-bottom: ${theme.space.md};
`;

// 예전 요약 한 줄: 바탕 없이 빨간 글씨
export const InfoSummary = styled.div<WithTheme>`
  ${badgeStyle('primary')}
  background: transparent;
  color: ${c.redColor};
  white-space: normal;
  padding: ${theme.space.sm} ${theme.space.md};
  border-radius: ${theme.radius.md};
  font-size: ${theme.sizes.xsmall};
  line-height: 1.5;
`;

export const InfoToggle = styled.button<WithTheme>`
  align-self: flex-start;
  min-height: 44px;
  padding: 0 ${theme.space.lg};
  border: 1px solid ${c.lineColor};
  border-radius: ${theme.radius.pill};
  background-color: ${c.softColor};
  color: ${c.subColor};
  font-family: inherit;
  font-size: ${theme.sizes.xsmall};
  font-weight: ${theme.weight.semiBold};
  cursor: pointer;
  ${focusRing}
`;

export const TextBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  justify-content: right;
  margin-bottom: ${theme.space.lg};
  width: 100%;
  padding: ${theme.space.md} ${theme.space.lg};
  border-radius: ${theme.radius.md};
  background: ${c.subTextBoxColor};
  font-size: ${theme.sizes.small};
  line-height: 1.7;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${theme.sizes.xsmall};
  }

  p {
    color: ${c.subColor};
  }

  /* 예전 이용 안내의 빨간 글씨 */
  span {
    color: ${c.redColor};
    font-weight: ${theme.weight.semiBold};
  }
`;
