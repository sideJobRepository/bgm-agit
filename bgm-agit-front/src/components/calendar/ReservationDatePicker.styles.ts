import styled from 'styled-components';
import Calendar from 'react-calendar';
import type { WithTheme } from '../../styles/styled-props';
import { theme } from '../../styles/theme.ts';
import { cardStyle } from '../../styles/mixins.ts';

const c = theme.colors;

/*
 * react-calendar 기본 CSS(Calendar.css)를 덮어쓴다.
 * 기본 규칙이 .react-calendar__tile--active 처럼 클래스 1~2개라, && 로 우선순위를 올려 !important 없이 이긴다.
 */
export const StyledCalendar = styled(Calendar)<WithTheme>`
  && {
    ${cardStyle}
    /* 예전 달력 테두리(옅은 회색) */
    border-color: ${c.lineColor};
    max-width: 100%;
    padding: ${theme.space.lg};
    font-family: ${theme.fonts.body};
    line-height: 1.4;

    @media ${theme.device.mobile} {
      padding: ${theme.space.md} ${theme.space.sm};
    }

    button {
      font-family: inherit;
    }

    /* 상단 ‹ 2026년 10월 › */
    .react-calendar__navigation {
      height: 44px;
      margin-bottom: ${theme.space.sm};
      background-color: transparent;
    }

    .react-calendar__navigation button {
      min-width: 44px;
      min-height: 44px;
      border-radius: ${theme.radius.md};
      background: transparent;
      color: ${c.black};
      font-size: 16px;
      font-weight: 700;

      &:enabled:hover,
      &:enabled:focus {
        background: ${c.softColor};
      }

      &:focus-visible {
        outline: 2px solid ${c.primary};
        outline-offset: 2px;
      }

      &:disabled {
        background: transparent;
        color: ${c.textSubtle};
        opacity: 0.6;
      }
    }

    .react-calendar__navigation__label {
      font-size: 17px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    /* 요일 머리 */
    .react-calendar__month-view__weekdays {
      margin-bottom: ${theme.space.xs};
      text-transform: none;
    }

    .react-calendar__month-view__weekdays__weekday {
      padding: ${theme.space.sm} 0;
      color: ${c.textMuted};
      font-size: 13px;
      font-weight: 700;

      abbr {
        text-decoration: none;
      }

      &:first-child abbr {
        color: ${c.redColor};
      }

      &:last-child abbr {
        color: ${c.blueColor};
      }
    }

    /* 날짜 칸. 버튼 전체가 터치 영역(44px 이상)이고 안쪽 abbr 이 둥근 날짜 표시다 */
    .react-calendar__tile {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 2px 0;
      background: transparent;
      color: ${c.black};
      font-size: 15px;
      font-weight: 500;
      -webkit-tap-highlight-color: transparent;

      abbr {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        margin: 0 auto;
        border-radius: ${theme.radius.pill};
        transition:
          background 0.15s ease,
          color 0.15s ease;
      }

      @media ${theme.device.mobile} {
        min-height: 46px;
        font-size: 16px;

        abbr {
          width: 42px;
          height: 42px;
        }
      }
    }

    /* 기본 CSS 의 주말 빨강·오늘 노랑·활성 파랑 제거 */
    .react-calendar__month-view__days__day--weekend {
      color: ${c.black};
    }

    .react-calendar__tile--now,
    .react-calendar__tile--active,
    .react-calendar__tile--hasActive,
    .react-calendar__tile:enabled:hover,
    .react-calendar__tile:enabled:focus,
    .react-calendar__tile--active:enabled:hover,
    .react-calendar__tile--active:enabled:focus {
      background: transparent;
    }

    .react-calendar__tile--now,
    .react-calendar__tile--active {
      color: inherit;
    }

    .react-calendar__tile.sunday {
      color: ${c.redColor};
    }

    .react-calendar__tile.saturday {
      color: ${c.blueColor};
    }

    .react-calendar__tile:enabled:hover abbr {
      background: ${c.softColor};
    }

    .react-calendar__tile:focus-visible {
      outline: none;

      abbr {
        outline: 2px solid ${c.primary};
        outline-offset: 2px;
      }
    }

    /* 선택한 날짜 — 요일 색보다 뒤에 둬야 일·토요일도 흰 글자가 된다. 예전처럼 남색 */
    .react-calendar__tile.selected,
    .react-calendar__tile.selected:enabled:hover {
      color: ${c.white};

      abbr {
        background: ${c.blueColor};
        color: ${c.white};
        font-weight: 800;
      }
    }

    /* 예약 불가(기간 밖·수요일 휴무): 배경 없이 흐리게 */
    .react-calendar__tile:disabled {
      background: transparent;
      cursor: not-allowed;
      opacity: 0.4;

      abbr {
        background: transparent;
      }
    }

    .react-calendar__tile.closed abbr {
      text-decoration: line-through;
    }
  }
`;
