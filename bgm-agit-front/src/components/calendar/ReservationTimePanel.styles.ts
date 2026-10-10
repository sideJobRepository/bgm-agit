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
  color: ${({ theme }) => theme.colors.textBody};
  width: 50%;

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
      color: ${({ theme }) => theme.colors.textStrong};
      font-size: ${({ theme }) => theme.sizes.bigLarge};
      font-weight: 800;
      letter-spacing: -0.02em;
      white-space: nowrap;
    }

    svg {
      color: ${({ theme }) => theme.colors.primary};
      font-size: ${({ theme }) => theme.sizes.medium};
    }

    span {
      color: ${({ theme }) => theme.colors.textMuted};
      font-size: ${({ theme }) => theme.sizes.medium};
      font-weight: ${({ theme }) => theme.weight.semiBold};
    }
  }
`;

export const TimeTitle = styled.div<WithTheme>`
  width: 50%;
  padding: ${({ theme }) => `${theme.space.md} ${theme.space.lg}`};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    font-size: ${({ theme }) => theme.sizes.medium};
  }
`;

export const TimeBox = styled.div<WithTheme>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); // 너비 반응형
  gap: ${({ theme }) => theme.space.sm};
  width: 50%;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: repeat(2, 1fr); // 모바일에서는 2열 고정
    width: 100%;
  }
`;

export const TimeSlotButton = styled.button<WithTheme & { selected: boolean }>`
  -webkit-tap-highlight-color: transparent;
  /* 일반 룸은 13슬롯이 모바일 2열 = 7행으로 붙는다. 터치 타겟이 작으면 인접 시간대 오탭이 곧 오예약이 된다. */
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.space.md};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid
    ${({ selected, theme }) => (selected ? theme.colors.primary : theme.colors.border)};
  background-color: ${({ selected, theme }) =>
    selected ? theme.colors.primary : theme.colors.surface};
  color: ${({ selected, theme }) => (selected ? theme.colors.onPrimary : theme.colors.textStrong)};
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
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ selected, theme }) =>
      selected ? theme.colors.primaryHover : theme.colors.primarySoft};
  }

  &:disabled {
    cursor: not-allowed;
    /* "없는 시간"과 "찬 시간"을 구분하도록 회색 바탕 + 취소선으로 표시한다 */
    border-color: ${({ theme }) => theme.colors.surfaceAlt};
    background-color: ${({ theme }) => theme.colors.surfaceAlt};
    color: ${({ theme }) => theme.colors.textMuted};
    text-decoration: line-through;
  }
`;

export const OptionBox = styled.div<WithTheme>`
  width: 50%;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const OptionTitle = styled.div<WithTheme>`
  margin-bottom: ${({ theme }) => theme.space.sm};
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.textStrong};
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
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primarySoft : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
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
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const Button = styled.button<WithTheme>`
  ${buttonStyle('primary', 'lg')}
  width: 50%;
  margin-top: ${({ theme }) => theme.space.sm};

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
  background: ${({ theme }) => theme.colors.primarySoft};
  text-align: left;

  p {
    color: ${({ theme }) => theme.colors.textBody};
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
