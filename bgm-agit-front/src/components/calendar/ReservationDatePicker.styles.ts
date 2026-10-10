import styled from 'styled-components';
import Calendar from 'react-calendar';
import type { WithTheme } from '../../styles/styled-props';

export const StyledCalendar = styled(Calendar)<WithTheme>`
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 10px;

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

  /* 비활성(수요일 등): 회색 배경 대신 글자만 흐리게 */
  .react-calendar__tile:disabled {
    background-color: transparent !important;
    cursor: not-allowed;

    abbr {
      color: ${({ theme }) => theme.colors.lineColor};
      text-decoration: line-through;
    }
  }

  .react-calendar__tile:disabled:hover abbr {
    background: transparent;
  }
`;
