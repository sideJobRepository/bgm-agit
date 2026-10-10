import styled from 'styled-components';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, cardStyle, focusRing } from '../styles/mixins.ts';

const c = theme.colors;

export const Wrapper = styled.div<WithTheme>`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  gap: ${theme.space.xxl};
  margin: 0 auto;
  flex-direction: column;
  background: ${c.bg};
  font-family: ${theme.fonts.body};

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }

  @media ${({ theme }) => theme.device.mobile} {
    gap: ${theme.space.xl};
  }
`;

export const Hero = styled.section<WithTheme>`
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: ${c.textStrong};

  @media ${({ theme }) => theme.device.mobile} {
    height: 160px;
  }
`;

export const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(2px);
    transform: scale(1.02);
  }
`;

// 사진 위 흰 글씨 대비를 위한 고정 어둡게 깔기
export const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(22, 24, 29, 0.35);
  z-index: 0;
`;

export const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(22, 24, 29, 0.25);
`;

export const HeroContent = styled.div<WithTheme>`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${theme.space.md};
  padding: 0 ${theme.space.lg};
  text-align: center;
  color: ${c.onPrimary};

  h1 {
    margin: 0;
    font-size: ${theme.desktop.sizes.h1Size};
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${theme.sizes.xxlarge};
    }
  }

  span {
    font-size: ${theme.sizes.medium};
    font-weight: 500;
    opacity: 0.9;
    word-break: keep-all;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${theme.sizes.small};
    }
  }
`;

export const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 ${theme.space.lg} 48px;
  gap: ${theme.space.xl};

  @media ${({ theme }) => theme.device.mobile} {
    gap: ${theme.space.lg};
  }
`;

export const StyledCalendar = styled(Calendar)<WithTheme>`
  ${cardStyle}
  /* 예전 색: 회색 테두리, 그림자 없음 */
  border-color: ${c.lineColor};
  box-shadow: none;
  width: 100%;
  max-width: 600px;
  padding: ${theme.space.lg};
  font-family: inherit;

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${theme.space.md} ${theme.space.sm};
  }

  .react-calendar__tile--now {
    /* 오늘날짜 표시 제거 */
    background: transparent !important;
    color: inherit !important;
  }

  .react-calendar__navigation {
    height: 44px;
    margin-bottom: ${theme.space.md};
    background-color: transparent;
  }

  .react-calendar__navigation button {
    min-width: 44px;
    border-radius: ${theme.radius.md};
    color: ${c.black} !important;
    background: transparent !important;
    font-family: inherit;
    font-size: ${theme.sizes.medium};
    font-weight: 800;
    letter-spacing: -0.02em;
    ${focusRing}

    &:hover:enabled {
      background: ${c.softColor} !important;
    }
  }

  .react-calendar__month-view__weekdays {
    padding-bottom: ${theme.space.xs};
    margin-bottom: ${theme.space.xs};
    border-bottom: 1px solid ${c.lineColor};
  }

  .react-calendar__month-view__weekdays__weekday {
    /* 요일 */
    color: ${c.black};
    font-size: ${theme.sizes.xsmall};
    font-weight: 700;

    abbr {
      text-decoration: unset;
    }

    &:first-child abbr {
      color: ${c.redColor};
    }

    &:last-child abbr {
      color: ${c.blueColor};
    }
  }

  .react-calendar__tile.sunday,
  .react-calendar__tile.sunday abbr {
    color: ${c.redColor};
  }

  .react-calendar__tile.saturday,
  .react-calendar__tile.saturday abbr {
    color: ${c.blueColor};
  }

  .react-calendar__tile {
    display: flex;
    flex-direction: column;
    align-items: center !important;
    gap: 2px;
    min-height: 56px;
    padding: ${theme.space.xs} 2px;
    background: transparent;
    color: ${c.black};
    font-family: inherit;
    font-size: ${theme.sizes.small};
    font-weight: 600;
    -webkit-tap-highlight-color: transparent;
    ${focusRing}

    abbr {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin: 0 auto;
      border-radius: ${theme.radius.pill};
      font-variant-numeric: tabular-nums;
      transition: background 0.15s ease;
    }
  }

  .react-calendar__tile:hover {
    background-color: transparent;

    abbr {
      background: ${c.softColor};
    }
  }

  /* 예전 색: 선택 날짜 = 남색 채움 */
  .react-calendar__tile.selected abbr {
    color: ${c.white};
    background: ${c.blueColor};
  }

  .react-calendar__tile--active {
    background-color: transparent;
  }

  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background-color: transparent;
  }

  .date-price {
    display: flex;
    width: 100%;
    justify-content: center;
    font-weight: ${theme.weight.semiBold};
    font-size: ${theme.sizes.xxsmall};
    color: ${c.greenColor};
  }

  /* 예전 색: 바탕 없이 초록 글씨 */
  .date-available {
    padding: 1px 6px;
    border-radius: ${theme.radius.pill};
    background: transparent;
    color: ${c.greenColor};
    font-size: ${theme.sizes.xxsmall};
    font-weight: 700;
    white-space: nowrap;
  }
`;

// 예전 색: 연회색 바탕 + 진한 그림자(토큰 없는 값)
export const TopBox = styled.div<WithTheme>`
  ${cardStyle}
  border-color: transparent;
  background: #f3f3f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.space.xl};
  max-width: 600px;
  padding: 28px;

  @media ${({ theme }) => theme.device.mobile} {
    gap: ${theme.space.lg};
    padding: ${theme.space.xl} ${theme.space.lg};
  }
`;

export const InstructorImage = styled.div`
  width: 160px;
  height: 160px;
  border-radius: ${theme.radius.lg};
  border: 1px solid ${c.border};
  background: ${c.surfaceAlt};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media ${theme.device.mobile} {
    width: 128px;
    height: 128px;
  }
`;

export const InstructorInfo = styled.div<WithTheme>`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.space.md};

  h3 {
    margin: 0;
    font-size: ${theme.desktop.sizes.h3Size};
    font-weight: 800;
    color: ${c.inputColor};
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: ${c.subColor};
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.device.mobile} {
    h3 {
      font-size: ${theme.sizes.menu};
    }
    p {
      font-size: ${theme.sizes.small};
    }
  }
`;

export const Button = styled.button<WithTheme>`
  ${buttonStyle('primary', 'lg')}
  /* 예전 색: 남색 채움 + 흰 글씨 */
  background: ${c.blueColor};
  border-color: ${c.blueColor};
  color: ${c.white};
  width: 100%;
  max-width: 600px;

  &:hover:not(:disabled) {
    background: ${c.blueColor};
    border-color: ${c.blueColor};
    opacity: 0.8;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

export const TimeBox = styled.div<WithTheme>`
  width: 100%;
  max-width: 600px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.space.sm};

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const TimeSlotButton = styled.button<WithTheme & { selected: boolean }>`
  min-height: 44px;
  padding: 10px 14px;
  border-radius: ${theme.radius.md};
  border: 1px solid ${({ selected }) => (selected ? c.blueColor : c.lineColor)};
  cursor: pointer;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  /* 예전 색: 선택 = 남색 채움, 나머지 흰 바탕 */
  background: ${({ selected }) => (selected ? c.blueColor : c.whiteColor)};
  color: ${({ selected }) => (selected ? c.whiteColor : c.inputColor)};
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
  ${focusRing}

  &:hover:not(:disabled) {
    border-color: ${c.blueColor};
    background: ${({ selected }) => (selected ? c.blueColor : c.softColor)};
  }

  &:disabled {
    cursor: not-allowed;
    border-color: ${c.lineColor};
    background: ${c.softColor};
    color: ${c.grayColor};
    text-decoration: line-through;
  }
`;

export const EmptySlot = styled.div<WithTheme>`
  grid-column: 1 / -1;
  width: 100%;
  padding: ${theme.space.lg} ${theme.space.md};
  border: 1px dashed ${c.lineColor};
  border-radius: ${theme.radius.md};
  text-align: center;
  font-size: ${theme.sizes.small};
  color: ${c.grayColor};
  background: ${c.softColor};
`;
