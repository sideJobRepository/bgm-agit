import styled, { css } from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { theme } from '../../styles/theme.ts';
import { badgeStyle, buttonStyle, focusRing, inputStyle } from '../../styles/mixins.ts';
import { StatusRow } from './RoomAvailabilityBadge.styles.ts';

const c = theme.colors;

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
  /* auto 로 두면 이 요소가 스크롤 컨테이너가 되어 상단 요약 바의 sticky 가 페이지 스크롤을 따라오지 못한다 */
  overflow: visible;
`;

export const SearchWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'bgColor',
})<{ bgColor: string } & WithTheme>`
  display: flex;
  width: 100%;
  background-color: ${({ bgColor }) => bgColor};
  padding: ${theme.space.xl};
  align-items: center;
  gap: ${theme.space.lg};
  border-radius: ${theme.radius.lg};

  @media ${theme.device.mobile} {
    flex-direction: column;
    padding: ${theme.space.lg};
    gap: ${theme.space.md};
  }
`;

export const TitleBox = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<{ textColor: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 60%;
  color: ${({ textColor }) => textColor};

  h2 {
    margin: 0;
    font-family: ${theme.fonts.display};
    font-weight: 800;
    letter-spacing: -0.02em;
    font-size: ${theme.sizes.xxlarge};
    line-height: 1.25;
  }
  p {
    margin: 0;
    font-weight: ${theme.weight.semiBold};
    font-size: ${theme.sizes.medium};
    opacity: 0.85;
  }

  @media ${theme.device.mobile} {
    width: 100%;
    text-align: center;

    h2 {
      font-size: 20px;
    }
    p {
      font-size: 13px;
    }
  }
`;

export const SearchBox = styled.div<WithTheme>`
  width: 40%;

  @media ${theme.device.mobile} {
    width: 100%;
  }
`;

export const GridContainer = styled.div.withConfig({
  shouldForwardProp: prop => prop !== '$columnCount',
})<WithTheme & { $columnCount: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columnCount}, minmax(0, 1fr));
  gap: ${theme.space.xl};
  padding: ${theme.space.xxl} 0;
  min-width: 100%;
  @media ${theme.device.mobile} {
    /* 방 카드에 가용 현황 배지가 붙은 만큼 여백을 줄여, 한 화면에 보이는 방 개수를 유지한다 */
    gap: ${theme.space.lg};
    padding: 20px 0;
  }
`;

export const GridItemBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
`;

/*
 * ratio(=예약 방 카드, labelGb 3)일 때는 사진 + 본문(이름·인원·코멘트·가용 배지)을 담는 카드가 된다.
 * 그 외(게임·음료 등)는 예전처럼 사진 타일 그대로.
 */
export const ImageWrapper = styled.div.withConfig({
  shouldForwardProp: prop =>
    prop !== 'radius' && prop !== 'ratio' && prop !== '$dimmed' && prop !== '$selected',
})<WithTheme & { radius: boolean; ratio: boolean; $dimmed?: boolean; $selected?: boolean }>`
  width: 100%;
  overflow: hidden;
  position: relative;
  /*
   * 마감된 방은 흐리게. 배지만 세로로 훑으면 되는 화면이 된다.
   * pointer-events 로 막지는 않는다 — 안에 관리자 이미지 수정 버튼이 들어 있어서 같이 죽는다.
   * 선택 차단은 reservationClickEvent 가 한다.
   * 가용 배지("예약 마감" 등)는 흐리지 않는다 — 흐리면 그 이유 문구가 안 읽힌다.
   */
  & > *:not(${StatusRow}) {
    opacity: ${({ $dimmed }) => ($dimmed ? 0.45 : 1)};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: pointer;
  }

  ${({ ratio, radius, $selected }) =>
    ratio
      ? css`
          display: flex;
          flex-direction: column;
          padding-bottom: 14px;
          background: ${$selected ? c.primarySoft : c.surface};
          border: 1px solid ${$selected ? c.primary : c.border};
          /* 테두리 2px 효과. border 굵기를 바꾸면 선택할 때 카드가 1px 씩 밀린다 */
          box-shadow: ${$selected ? `0 0 0 1px ${c.primary}` : theme.shadow.sm};
          border-radius: ${theme.radius.lg};
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;

          &:hover {
            border-color: ${$selected ? c.primary : c.borderStrong};
          }

          img {
            height: auto;
            aspect-ratio: 16 / 9;
            border-bottom: 1px solid ${c.border};
          }

          @media ${theme.device.mobile} {
            padding-bottom: 12px;

            /* 예약 카드는 모바일에서 조금 더 납작하게 — 한 화면에 보이는 방 개수를 벌기 위함 */
            img {
              aspect-ratio: 2 / 1;
            }
          }
        `
      : css`
          aspect-ratio: 1 / 1;
          border-radius: ${radius ? theme.radius.pill : theme.radius.lg};
        `}
`;

export const DeleteBox = styled.div<WithTheme>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  color: ${c.primary};
  background-color: ${c.surface};
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.pill};
  box-shadow: ${theme.shadow.md};
  transform: translate(-50%, -50%);

  &:hover {
    background-color: ${c.primarySoft};
  }

  svg {
    width: 20px;
    height: 20px;
    @media ${theme.device.mobile} {
      width: 18px;
      height: 18px;
    }
  }
`;

// 방 이름 + 인원. 카드 본문 첫 줄(이름) / 둘째 줄(인원)
export const TopLabel = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 6px;
  margin: 14px 16px 0;
  color: ${c.textMuted};

  p {
    flex-basis: 100%;
    margin: 0;
    color: ${c.textStrong};
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.35;
  }

  svg {
    flex-shrink: 0;
    width: 13px;
    height: 13px;
    color: ${c.textSubtle};
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }

  @media ${theme.device.mobile} {
    margin: 12px 14px 0;

    p {
      font-size: 16px;
    }

    span {
      font-size: 13px;
    }
  }
`;

export const HiddenTag = styled.div<WithTheme>`
  position: absolute;
  top: 10px;
  right: 10px;
  ${badgeStyle('neutral')}
  background: ${c.surface};
  color: ${c.textStrong};
  box-shadow: ${theme.shadow.md};
`;

export const CommentLabel = styled.div<WithTheme>`
  margin: 4px 16px 0;
  color: ${c.textMuted};
  font-size: 12px;
  line-height: 1.5;

  @media ${theme.device.mobile} {
    margin: 4px 14px 0;
  }
`;

export const FoodLabel = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<WithTheme & { textColor: string }>`
  margin-top: 14px;
  text-align: center;
  font-family: ${theme.fonts.display};
  font-size: ${theme.sizes.large};
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${c.textStrong};

  @media ${theme.device.mobile} {
    margin-top: 10px;
    font-size: ${theme.sizes.small};
  }
`;

export const NoSearchBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 48px 0;
  color: ${c.textMuted};
  font-size: ${theme.sizes.large};
  font-weight: 700;
  font-family: ${theme.fonts.display};

  @media ${theme.device.mobile} {
    padding: 32px 0;
    font-size: 15px;
  }
`;

/*
 * 시간 선택 영역.
 * 예전에는 max-height 로 아코디언을 만들었는데, 값이 하드코딩(1300px)이라 안내 문구가 한 줄만 늘어도
 * 예약 버튼이 말없이 잘렸다. 조건부 렌더로 바꾸면서 높이 제한과 overflow: hidden 을 둘 다 없앴다.
 * 열릴 때의 느낌은 transform 페이드로 대신한다(레이아웃을 밀지 않아 높이 계산과 무관).
 */
export const TimeSection = styled.section<WithTheme>`
  width: 100%;
  margin-top: 16px;
  /* 고정 헤더(약 100px)에 가리지 않도록. scrollIntoView 가 이 값을 존중한다 */
  scroll-margin-top: 110px;
  animation: timePanelIn 0.25s ease;

  @keyframes timePanelIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media ${theme.device.mobile} {
    margin-top: 12px;
    /* 헤더 + 상단 요약 바 */
    scroll-margin-top: 150px;
  }
`;

export const DateSection = styled.section<WithTheme>`
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: ${theme.space.lg};

  .custom-calender {
    width: 50%;

    @media ${theme.device.mobile} {
      width: 100%;
    }
  }
`;

/*
 * 선택한 날짜·방을 스크롤 중에도 계속 보이게 하는 요약 바.
 * 오예약의 원인이 "날짜를 잘못 인지한 것"이라 날짜를 화면에서 놓치지 않게 하는 게 목적이다.
 * sticky 는 가장 가까운 스크롤 조상 기준이라 Wrapper 의 overflow 를 visible 로 풀어야 붙는다.
 */
export const StickySummary = styled.div<WithTheme>`
  position: sticky;
  top: 0;
  /* TopArea 가 3 이라 그보다 낮게 둔다. 높이면 고정 헤더를 덮는다 */
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.space.sm};
  width: 100%;
  min-height: 56px;
  margin-top: ${theme.space.lg};
  padding: 10px 16px;
  background: ${c.surface};
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.lg};
  box-shadow: ${theme.shadow.sm};

  @media ${theme.device.mobile} {
    min-height: 52px;
    margin-top: ${theme.space.md};
    padding: 6px 6px 6px 14px;
  }
`;

export const SummaryText = styled.span<WithTheme>`
  min-width: 0;
  font-size: ${theme.sizes.medium};
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${c.textStrong};

  em {
    margin-left: 6px;
    font-style: normal;
    color: ${c.primary};
  }

  @media ${theme.device.mobile} {
    font-size: 15px;
  }
`;

export const ChangeButton = styled.button<WithTheme>`
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  ${buttonStyle('secondary', 'sm')}

  @media ${theme.device.mobile} {
    height: 44px;
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  justify-content: right;
  margin: ${theme.space.md} 0;
`;

export const ButtonBox2 = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.space.sm};
  justify-content: center;
`;

export const Button = styled.button<WithTheme & { color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 20px;
  background-color: ${({ color }) => color};
  color: ${c.onPrimary};
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: ${theme.radius.md};
  cursor: pointer;
  transition: opacity 0.15s ease;
  ${focusRing}

  &:hover {
    opacity: 0.9;
  }

  @media ${theme.device.mobile} {
    font-size: ${theme.sizes.small};
  }
`;

export const ImageModalWraaper = styled.div`
  padding: ${theme.space.xl};
`;

export const ImageUploadWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px dashed ${c.borderStrong};
  border-radius: ${theme.radius.lg};
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  background: ${c.surfaceSunken};
`;

export const UploadLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${c.onPrimary};
  background-color: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
  font-size: 14px;

  svg {
    width: 30px;
    height: 30px;
  }

  &:hover {
    opacity: 1;
  }
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const TextArea = styled.input<WithTheme>`
  ${inputStyle}
  resize: none;
  margin-bottom: 20px;
`;

export const SelectBox = styled.select<WithTheme>`
  ${inputStyle}
  margin-bottom: 20px;
  padding-right: 40px;
  cursor: pointer;

  /* 화살표 위치 조정 */
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="black" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  height: 30px;
  margin-top: 20px;
`;
