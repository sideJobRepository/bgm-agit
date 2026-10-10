import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props';
import { buttonStyle, focusRing } from '../../styles/mixins.ts';

export const Wrapper = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.space.lg};
  flex-direction: column;
  align-items: center;
`;

export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};
  color: ${({ theme }) => theme.colors.subColor};
  width: 100%;
  max-width: 760px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }

  /* 방 이름 · 인원 줄 (MessageBox 는 따로 스타일한다) */
  > div:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.space.xs};

    h2 {
      margin-right: ${({ theme }) => theme.space.sm};
      color: ${({ theme }) => theme.colors.menuColor};
      font-size: ${({ theme }) => theme.sizes.bigLarge};
      font-weight: 800;
      letter-spacing: -0.02em;
      white-space: nowrap;
    }

    svg {
      color: ${({ theme }) => theme.colors.subColor};
      font-size: ${({ theme }) => theme.sizes.medium};
    }

    span {
      color: ${({ theme }) => theme.colors.subColor};
      font-size: ${({ theme }) => theme.sizes.medium};
      font-weight: ${({ theme }) => theme.weight.semiBold};
    }
  }
`;

export const TimeTitle = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space.sm};
  width: 100%;
  max-width: 760px;
  padding: ${({ theme }) => `${theme.space.md} ${theme.space.lg}`};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.basicColor};
  color: ${({ theme }) => theme.colors.menuColor};
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

// 시간 제목 줄 오른쪽의 '선택 초기화'. 고른 시간이 있을 때만 보인다
export const ResetButton = styled.button<WithTheme>`
  flex-shrink: 0;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.subColor};
  font-family: inherit;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: 700;
  letter-spacing: normal;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.softColor};
  }
`;

export const TimeBox = styled.div<WithTheme>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); // 너비 반응형
  gap: ${({ theme }) => theme.space.sm};
  width: 100%;
  max-width: 760px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: repeat(2, 1fr); // 모바일에서는 2열 고정
    width: 100%;
  }
`;

/* 고른 구간 되짚기. 버튼이 24개라 무엇을 골랐는지 버튼만 봐서는 안 들어온다 */
export const SelectedRange = styled.div<WithTheme>`
  width: 100%;
  max-width: 760px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.softColor};
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.subColor};

  strong {
    font-weight: ${({ theme }) => theme.weight.bold};
  }
`;

/* 00~09시 버튼은 다음 날이다. 표시가 없으면 하루 앞선 날로 착각한다 */
export const NextDayTag = styled.span<WithTheme>`
  display: inline-block;
  margin-right: 4px;
  padding: 1px 5px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.menuColor};
  color: ${({ theme }) => theme.colors.white};
  font-size: 10px;
  vertical-align: middle;
`;

export const TimeSlotButton = styled.button<WithTheme & { selected: boolean }>`
  -webkit-tap-highlight-color: transparent;
  /* 일반 룸은 13슬롯이 모바일 2열 = 7행으로 붙는다. 터치 타겟이 작으면 인접 시간대 오탭이 곧 오예약이 된다. */
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radius.md};
  /* 예전 색: 선택 = 남색 채움·흰 글씨, 나머지 = 흰 바탕·회색 글씨 */
  border: 1px solid
    ${({ selected, theme }) => (selected ? theme.colors.blueColor : theme.colors.lineColor)};
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.blueColor : theme.colors.white};
  color: ${({ selected, theme }) => (selected ? theme.colors.white : theme.colors.subColor)};
  font-family: inherit;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ selected }) => (selected ? 700 : 500)};
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  ${focusRing}

  &:hover:not(:disabled) {
    background-color: ${({ selected, theme }) =>
      selected ? theme.colors.blueColor : theme.colors.softColor};
  }

  &:disabled {
    cursor: not-allowed;
    /* "없는 시간"과 "찬 시간"을 구분하도록 흐리게 + 취소선으로 표시한다(예전 방식) */
    opacity: 0.45;
    text-decoration: line-through;
  }
`;

export const OptionBox = styled.div<WithTheme>`
  width: 100%;
  max-width: 760px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const OptionTitle = styled.div<WithTheme>`
  margin-bottom: ${({ theme }) => theme.space.sm};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.subColor};
`;

// 세그먼트 형태의 알약 묶음
export const ToggleGroup = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.xs};
  padding: ${({ theme }) => theme.space.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.surfaceSunken};
`;

export const ToggleButton = styled.button<WithTheme & { $active: boolean }>`
  -webkit-tap-highlight-color: transparent;
  flex: 1 1 auto;
  min-width: 110px;
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.space.lg};
  border-radius: ${({ theme }) => theme.radius.pill};
  /* 예전 색: 선택 = 남색 채움·흰 글씨 */
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.blueColor : 'transparent')};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.blueColor : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.subColor)};
  font-family: inherit;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
  ${focusRing}

  &:hover {
    opacity: 0.85;
  }
`;

// 예약하기 버튼. 예전처럼 남색 채움·흰 글씨
export const Button = styled.button<WithTheme>`
  ${buttonStyle('primary', 'lg')}
  width: 100%;
  max-width: 760px;
  margin-top: ${({ theme }) => theme.space.sm};
  background: ${({ theme }) => theme.colors.blueColor};
  border-color: ${({ theme }) => theme.colors.blueColor};
  color: ${({ theme }) => theme.colors.white};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.blueColor};
    border-color: ${({ theme }) => theme.colors.blueColor};
    opacity: 0.8;
  }

  &:disabled {
    cursor: not-allowed;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const MessageBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  padding: ${({ theme }) => `${theme.space.md} ${theme.space.lg}`};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.softColor};
  text-align: left;

  /* 예전 안내 문구의 빨간 글씨 */
  p {
    color: ${({ theme }) => theme.colors.redColor};
    font-size: ${({ theme }) => theme.sizes.small};
    line-height: 1.5;
  }

  strong {
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }

  @media ${({ theme }) => theme.device.mobile} {
    p {
      font-size: 13px;
    }
  }
`;
