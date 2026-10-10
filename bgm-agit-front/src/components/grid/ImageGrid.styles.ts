import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { theme } from '../../styles/theme.ts';

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

export const GridContainer = styled.div.withConfig({
  shouldForwardProp: prop => prop !== '$columnCount',
})<WithTheme & { $columnCount: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columnCount}, 1fr);
  gap: 40px;
  padding: 40px 0;
  min-width: 100%;
  @media ${({ theme }) => theme.device.mobile} {
    /* 방 카드에 가용 현황 배지가 붙은 만큼 여백을 줄여, 한 화면에 보이는 방 개수를 유지한다 */
    gap: 16px;
    padding: 20px 0;
  }
`;

export const GridItemBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ImageWrapper = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'radius' && prop !== 'ratio' && prop !== '$dimmed',
})<WithTheme & { radius: boolean; ratio: boolean; $dimmed?: boolean }>`
  width: 100%;
  aspect-ratio: ${({ ratio }) => (ratio ? '16 / 9' : '1 / 1')};
  overflow: hidden;
  border-radius: ${({ radius }) => (radius ? '999px' : '12px')};
  position: relative;
  /*
   * 마감된 방은 흐리게. 초록 배지만 세로로 훑으면 되는 화면이 된다.
   * pointer-events 로 막지는 않는다 — 안에 관리자 이미지 수정 버튼이 들어 있어서 같이 죽는다.
   * 선택 차단은 reservationClickEvent 가 한다.
   */
  opacity: ${({ $dimmed }) => ($dimmed ? 0.45 : 1)};

  @media ${({ theme }) => theme.device.mobile} {
    /* 예약 카드는 모바일에서 조금 더 납작하게 — 한 화면에 보이는 방 개수를 벌기 위함 */
    aspect-ratio: ${({ ratio }) => (ratio ? '2 / 1' : '1 / 1')};
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: pointer;
  }
`;

export const DeleteBox = styled.div<WithTheme>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 50%;
  left: 50%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.blueColor};
  padding: 10px;
  border-radius: 999px;
  transform: translate(-50%, -50%);

  svg {
    width: 20px;
    height: 20px;
    @media ${({ theme }) => theme.device.mobile} {
      width: 16px;
      height: 16px;
    }
  }
`;

export const TopLabel = styled.div<WithTheme>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(66, 69, 72, 0.6);
  border-radius: 8px;
  padding: 6px 12px;
  top: 6px;
  left: 6px;
  color: white;
  p {
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }

  svg {
    margin: 0 4px 0 8px;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }

  span {
    font-size: ${({ theme }) => theme.sizes.small};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
  }
`;

export const HiddenTag = styled.div<WithTheme>`
  position: absolute;
  top: 6px;
  right: 6px;
  background-color: ${({ theme }) => theme.colors.redColor};
  border-radius: 8px;
  padding: 4px 10px;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};
`;

export const CommentLabel = styled.div<WithTheme>`
  position: absolute;
  bottom: 6px;
  left: 6px;
  max-width: calc(100% - 12px);
  background-color: rgba(66, 69, 72, 0.6);
  border-radius: 8px;
  padding: 6px 12px;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
    padding: 4px 8px;
  }
`;

export const FoodLabel = styled.div.withConfig({
  shouldForwardProp: prop => prop !== 'textColor',
})<WithTheme & { textColor: string }>`
  margin-top: 18px;
  text-align: center;
  font-family: ${theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.bigLarge};
  color: ${({ theme }) => theme.colors.black};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const NoSearchBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: ${theme.fonts.display};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
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
  margin-top: 20px;
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

  @media ${({ theme }) => theme.device.mobile} {
    margin-top: 12px;
    /* 헤더 + 상단 요약 바 */
    scroll-margin-top: 150px;
  }
`;

export const DateSection = styled.section<WithTheme>`
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 16px;

  .custom-calender {
    width: 50%;

    @media ${({ theme }) => theme.device.mobile} {
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
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  @media ${({ theme }) => theme.device.mobile} {
    padding: 8px 10px;
  }
`;

export const SummaryText = styled.span<WithTheme>`
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  color: ${({ theme }) => theme.colors.menuColor};

  em {
    margin-left: 6px;
    font-style: normal;
    color: ${({ theme }) => theme.colors.blueColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const ChangeButton = styled.button<WithTheme>`
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  padding: 8px 12px;
  min-height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.softColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const ButtonBox = styled.div`
  display: flex;
  justify-content: right;
  margin: 10px 0;
`;

export const ButtonBox2 = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
`;

export const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const ImageModalWraaper = styled.div`
  padding: 24px;
`;

export const ImageUploadWrapper = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px dashed #ccc;
  border-radius: 12px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
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
  color: #ffffff;
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
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  resize: none;
  margin-bottom: 20px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.subColor}; // 원하시는 포커스 색상
    outline: none;
  }
`;

export const SelectBox = styled.select<WithTheme>`
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: ${({ theme }) => theme.sizes.medium};
  margin-bottom: 20px;
  cursor: pointer;

  /* 화살표 위치 조정 */
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="black" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;

  &:focus {
    border-color: ${({ theme }) => theme.colors.subColor};
    outline: none;
  }
`;

export const PaginationWrapper = styled.div`
  text-align: center;
  height: 30px;
  margin-top: 20px;
`;
