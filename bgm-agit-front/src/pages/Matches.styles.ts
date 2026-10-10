import styled from 'styled-components';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import type { WithTheme } from '../styles/styled-props.ts';

export const Wrapper = styled.div<WithTheme>`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  gap: 36px;
  margin: 0 auto;
  flex-direction: column;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

export const Hero = styled.section<WithTheme>`
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 140px;
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
    transform: scale(1);
  }
`;

export const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 0;
`;

export const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
`;

export const HeroContent = styled.div<WithTheme>`
  position: relative;
  z-index: 2;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;

  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

export const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 12px 48px 12px;
  gap: 24px;
`;

export const StyledCalendar = styled(Calendar)<WithTheme>`
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 10px;
  width: 100%;
  max-width: 600px;

  .react-calendar__tile--now {
    //오늘날짜 표시 제거
    background: transparent !important;
    color: inherit !important;
  }

  .react-calendar__navigation {
    background-color: transparent;
  }

  .react-calendar__navigation button {
    color: ${({ theme }) => theme.colors.black} !important;
    background: transparent !important;
  }

  .react-calendar__month-view__weekdays__weekday {
    //요일
    abbr {
      text-decoration: unset;
    }

    &:first-child abbr {
      color: ${({ theme }) => theme.colors.redColor};
    }

    &:last-child abbr {
      color: ${({ theme }) => theme.colors.blueColor};
    }
  }

  .react-calendar__tile.sunday,
  .react-calendar__tile.sunday abbr {
    color: ${({ theme }) => theme.colors.redColor};
  }

  .react-calendar__tile.saturday,
  .react-calendar__tile.saturday abbr {
    color: ${({ theme }) => theme.colors.blueColor};
  }

  .react-calendar__tile {
    display: flex;
    flex-direction: column;
    align-items: center !important;
    color: ${({ theme }) => theme.colors.black};
    -webkit-tap-highlight-color: transparent;
    abbr {
      display: block;
      margin: 0 auto;
      text-align: center;
      width: 100%;
      padding: 10px 0;
      @media ${({ theme }) => theme.device.mobile} {
        padding: 10px 0;
      }
    }
  }

  .react-calendar__tile:hover {
    background-color: transparent;
    abbr {
      background: ${({ theme }) => theme.colors.softColor};
    }
  }

  .react-calendar__tile.selected {
    abbr {
      color: ${({ theme }) => theme.colors.white};
      background: ${({ theme }) => theme.colors.blueColor};
    }
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
    font-weight: ${({ theme }) => theme.weight.semiBold};
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.greenColor};
  }

  .date-available {
    font-weight: 700;
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.greenColor};
  }
`;

export const TopBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 600px;
  padding: 28px;
  border-radius: 16px;
  background: #f3f3f3;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
  @media ${({ theme }) => theme.device.mobile} {
  }
`;

export const InstructorImage = styled.div`
  width: 160px;
  height: 160px;
  border-radius: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const InstructorInfo = styled.div<WithTheme>`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;

  h3 {
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.inputColor};
    letter-spacing: 0.02em;
  }

  p {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    line-height: 1.7;
    opacity: 0.8;
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.device.mobile} {
    h3 {
      font-size: ${({ theme }) => theme.mobile.sizes.h3Size};
    }
    p {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

export const Button = styled.button<WithTheme>`
  padding: 12px 24px;
  border-radius: 4px;
  width: 100%;
  max-width: 600px;
  background-color: ${({ theme }) => theme.colors.blueColor};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &:hover {
    opacity: 0.8;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    font-size: ${({ theme }) => theme.mobile.sizes.xl};
  }
`;

export const TimeBox = styled.div<WithTheme>`
  width: 100%;
  max-width: 600px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const TimeSlotButton = styled.button<WithTheme & { selected: boolean }>`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #ccc;
  cursor: pointer;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};
  background: ${({ selected, theme }) =>
    selected ? theme.colors.blueColor : theme.colors.whiteColor};
  color: ${({ selected, theme }) => (selected ? theme.colors.whiteColor : theme.colors.inputColor)};
  transition:
    opacity 0.15s,
    transform 0.15s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.99);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
    background: ${({ theme }) => theme.colors.softColor};
    color: ${({ theme }) => theme.colors.grayColor};
  }
`;

export const EmptySlot = styled.div<WithTheme>`
  width: 100%;
  padding: 14px 12px;
  border-radius: 12px;
  text-align: center;
  color: ${({ theme }) => theme.colors.grayColor};
  background: ${({ theme }) => theme.colors.softColor};
`;
