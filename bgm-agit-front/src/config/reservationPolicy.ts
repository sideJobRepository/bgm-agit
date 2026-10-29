/**
 * 11월 예약 정책 개편 시행일('YYYY-MM-DD', 이용일 기준). 서버 SlotSchedule.NEW_POLICY_FROM 과 같은 값을 유지할 것.
 *
 * 이 날짜 전 이용분은 종전 규정(룸 예약금 1만원·잔액 현장결제·예약일 전날까지 취소 시 전액 환불)이다.
 * 금액·환불 비율은 서버가 계산하므로 여기서는 안내 문구와 취소 버튼 노출에만 쓴다.
 * 10월 이용분이 모두 끝나면 이 분기는 지워도 된다.
 */
export const NEW_POLICY_FROM = '2026-11-01';

/**
 * 회원 1명당 하루 1룸 시행일('YYYY-MM-DD', 이용일 기준). 서버 SlotSchedule.ONE_ROOM_PER_DAY_FROM 과 같은 값을 유지할 것.
 * 판정은 서버가 하고(같은 날 두 번째 룸 예약 거절) 여기서는 안내 문구 노출에만 쓴다.
 */
export const ONE_ROOM_PER_DAY_FROM = '2026-11-02';
