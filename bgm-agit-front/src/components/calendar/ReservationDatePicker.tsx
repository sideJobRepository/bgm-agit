import 'react-calendar/dist/Calendar.css';
import { useEffect, useMemo, useState } from 'react';
import { StyledCalendar } from './ReservationDatePicker.styles.ts';
import { toLocalYmd } from '../../utils/date.ts';
import api from '../../utils/axiosInstance.ts';

/**
 * 예약 가능 기간 상한(개월). 서버 SlotSchedule.RESERVATION_WINDOW_MONTHS 와 같은 값을 유지할 것.
 * 서버가 슬롯을 안 내려주는 것만으로도 예약은 막히지만, 캘린더를 몇 년 뒤로 넘길 수 있으면
 * 예약 가능 기간이 무제한인 것처럼 보인다(토스 카드사 심사 지적 사항).
 */
export const RESERVATION_WINDOW_MONTHS = 3;

/**
 * 이 날짜부터는 달력에서 고를 수 없다. 서버 SlotSchedule.RESERVATION_BLOCKED_FROM 과 같은 값을 유지할 것.
 *
 * 예약 정책 개편이 아직 오픈 전이라 10월까지만 현행 정책으로 받는다. 지금 화면으로 11월 이후 예약을 받으면
 * 안내한 예약금·환불 규정이 오픈 후 실제와 갈린다.
 * 서버가 이미 그 기간의 슬롯을 안 내려주지만, 달력만 열려 있으면 날짜를 골라도
 * 방이 하나도 안 뜨는 화면이 되므로 여기서도 같이 잘라낸다. 오픈하면 양쪽 다 null 로.
 */
export const RESERVATION_BLOCKED_FROM: string | null = '2026-11-01';

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
    let to = new Date(
      today.getFullYear(),
      today.getMonth() + RESERVATION_WINDOW_MONTHS,
      today.getDate()
    );
    if (RESERVATION_BLOCKED_FROM) {
      const [y, m, d] = RESERVATION_BLOCKED_FROM.split('-').map(Number);
      const beforeBlocked = new Date(y, m - 1, d - 1);
      if (beforeBlocked < to) to = beforeBlocked;
    }
    return { minDate: from, maxDate: to };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today.toDateString()]);

  /**
   * 예약 가능 기간 안의 공휴일. 달력에 빨간색으로 표시하는 용도다.
   *
   * useRequest 를 쓰지 않는다 — 실패했을 때 /error 로 보내거나 토스트를 띄울 일이 아니다.
   * 색이 안 칠해질 뿐 예약은 그대로 되고, 실제 요금은 서버가 계산한다(RoomAvailabilityBadge 와 같은 판단).
   */
  const [holidays, setHolidays] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    api
      .get<{ date: string; holiday: boolean }[]>('/bgm-agit/holidays', {
        params: { from: toLocalYmd(minDate), to: toLocalYmd(maxDate) },
      })
      .then(({ data }) => {
        if (!alive) return;
        setHolidays(new Set(data.filter(h => h.holiday).map(h => h.date)));
      })
      .catch(() => {
        // 색 표시용이라 조용히 넘어간다
      });
    return () => {
      alive = false;
    };
  }, [minDate, maxDate]);

  const selected = useMemo(() => {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }, [value]);

  // 모바일에서는 날짜를 고르면 캘린더를 접었다가 다시 펴는데,
  // 명시하지 않으면 리마운트될 때 이번 달로 돌아가 고른 날짜가 화면에서 사라진다.
  // 초기값만 잡고 이후는 state 로 따라가야 한다 — 값을 고정해서 넘기면 ‹ › 로 달을 못 넘긴다.
  const [activeStartDate, setActiveStartDate] = useState<Date>(() => selected ?? minDate);

  return (
    <StyledCalendar
      value={selected}
      activeStartDate={activeStartDate}
      onActiveStartDateChange={({ activeStartDate: next }) => {
        if (next) setActiveStartDate(next);
      }}
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
        const ymd = toLocalYmd(date);
        if (value && ymd === value) classes.push('selected');
        if (date.getDay() === 0) classes.push('sunday');
        if (date.getDay() === 6) classes.push('saturday');
        // 토·일이 아닌데 공휴일인 날(한글날·선거일 등). 주말과 같은 단가라 같은 색으로 보여준다
        if (ymd && holidays.has(ymd)) classes.push('holiday');
        // 휴무 요일만 취소선. 기간 밖 날짜는 흐리게만 한다 — 스타일 전용 클래스
        if (date.getDay() === closedWeekday) classes.push('closed');
        return classes.join(' ');
      }}
    />
  );
}
