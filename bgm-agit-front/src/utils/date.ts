/**
 * Date → 'YYYY-MM-DD' (로컬 시간대 기준).
 *
 * toISOString()은 UTC로 변환하므로 KST 자정 기준 Date가 전날로 밀린다.
 * 서버로 보내는 날짜 파라미터는 반드시 이 함수를 쓸 것.
 */
export function toLocalYmd(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toLocaleDateString('sv-SE');
}

/** 오늘 날짜를 'YYYY-MM-DD'로 반환 */
export function todayYmd(): string {
  return new Date().toLocaleDateString('sv-SE');
}

/** 'YYYY-MM-DD'에 일수를 더한 'YYYY-MM-DD' 반환 */
export function addDaysYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('sv-SE');
}

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

/** 'YYYY-MM-DD' → '2026년 8월 8일 (금)' */
export function formatYmdWithWeekday(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `${year}년 ${month}월 ${day}일 (${WEEKDAY_LABELS[date.getDay()]})`;
}
