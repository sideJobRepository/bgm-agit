import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useMemo } from 'react';
import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props';
import { toLocalYmd } from '../../utils/date.ts';

/**
 * 예약 가능 기간 상한(개월). 서버 SlotSchedule.RESERVATION_WINDOW_MONTHS 와 같은 값을 유지할 것.
 * 서버가 슬롯을 안 내려주는 것만으로도 예약은 막히지만, 캘린더를 몇 년 뒤로 넘길 수 있으면
 * 예약 가능 기간이 무제한인 것처럼 보인다(토스 카드사 심사 지적 사항).
 */
export const RESERVATION_WINDOW_MONTHS = 3;

/**
 * 예약 플로우 1단계 — 날짜 선택.
 *
 * value 가 null 이면 아무 날짜도 선택되지 않은 상태다. 기본값을 넣지 않는 것이 핵심으로,
 * 예전에는 "내일"이 미리 선택돼 있어서 손님이 날짜를 안 고르고 시간만 눌러 엉뚱한 날짜로 예약되는 사고가 있었다.
 */
/**
 * 휴무 요일 기본값(수요일). JS Date.getDay() 규약(0=일 … 6=토).
 *
 * 서버가 available-rooms 응답의 closedWeekday 로 정답을 내려주지만, 날짜를 고르기 전에는
 * 그 응답이 아직 없어서 첫 렌더에 쓸 값이 필요하다. 서버 SlotSchedule.CLOSED_DAY_OF_WEEK 와
 * 같은 값을 유지할 것 — 휴무 요일을 바꾸면 여기도 같이 고쳐야 한다.
 */
export const DEFAULT_CLOSED_WEEKDAY = 3;

export default function ReservationDatePicker({
  value,
  onChange,
  closedWeekday = DEFAULT_CLOSED_WEEKDAY,
}: {
  value: string | null;
  onChange: (ymd: string) => void;
  /** 서버가 내려준 휴무 요일. 한 번이라도 조회했으면 그 값이 들어온다 */
  closedWeekday?: number;
}) {
  const today = new Date();

  // 예약 가능 기간: 내일 ~ 오늘 +3개월 (당일 예약 불가라 하한이 내일)
  const { minDate, maxDate } = useMemo(() => {
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const to = new Date(
      today.getFullYear(),
      today.getMonth() + RESERVATION_WINDOW_MONTHS,
      today.getDate()
    );
    return { minDate: from, maxDate: to };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.toDateString()]);

  const selected = useMemo(() => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [value]);

  return (
    <StyledCalendar
      value={selected}
      // 모바일에서는 날짜를 고르면 캘린더를 접었다가 다시 펴는데,
      // 명시하지 않으면 리마운트될 때 이번 달로 돌아가 고른 날짜가 화면에서 사라진다.
      activeStartDate={selected ?? minDate}
      minDate={minDate}
      maxDate={maxDate}
      locale="ko-KR"
      calendarType="gregory"
      formatShortWeekday={(_, date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
      showNeighboringMonth={false}
      showFixedNumberOfWeeks={false}
      className="custom-calender"
      onChange={val => {
        // toISOString()은 UTC 변환이라 KST 자정이 전날로 밀린다. 반드시 toLocalYmd 를 쓸 것.
        const ymd = toLocalYmd(val as Date);
        if (ymd) onChange(ymd);
      }}
      tileDisabled={({ date, view }) => view === 'month' && date.getDay() === closedWeekday}
      tileClassName={({ date, view }) => {
        if (view !== 'month') return '';

        const classes = [];
        if (value && toLocalYmd(date) === value) classes.push('selected');
        if (date.getDay() === 0) classes.push('sunday');
        if (date.getDay() === 6) classes.push('saturday');
        return classes.join(' ');
      }}
    />
  );
}

const StyledCalendar = styled(Calendar)<WithTheme>`
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
