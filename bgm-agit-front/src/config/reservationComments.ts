/**
 * 예약 항목별 안내 코멘트.
 * imageId가 아니라 라벨을 키로 쓴다(DB 행이 추가·교체돼도 안 깨지게).
 * 슬롯 간격·선택 제한·예약 타입 같은 정책은 서버(SlotSchedule + 예약 조회 응답)가 내려주므로 여기에 두지 말 것.
 */
export const RESERVATION_COMMENTS: Record<string, string> = {
  'F Room': '대탁룸(JP-COLOR)으로 변경 가능',
  'M-1': '룸이 아닌 오픈된 공간입니다.',
  'M-2': '룸이 아닌 오픈된 공간입니다.',
  'M-3': '룸이 아닌 오픈된 공간입니다.',
};

export function getReservationComment(label?: string | null): string | undefined {
  return label ? RESERVATION_COMMENTS[label] : undefined;
}

/**
 * 항목별 이용 방식 토글. 첫 번째가 기본값이고, 선택한 값은 요청사항에 함께 기록된다(현장 세팅용).
 */
export const RESERVATION_USE_MODES: Record<string, string[]> = {
  'F Room': ['일반룸', '대탁룸(JP-COLOR)'],
};

export function getReservationUseModes(label?: string | null): string[] {
  return (label && RESERVATION_USE_MODES[label]) || [];
}

/**
 * 테이블을 합쳐 예약할 수 있는 항목 묶음.
 * 같은 묶음 안의 항목만 한 예약으로 합칠 수 있다(서버도 같은 카테고리·같은 페이지인지 재검증).
 */
export const RESERVATION_COMBINABLE_GROUPS: string[][] = [['M-1', 'M-2', 'M-3']];

export function getCombinableLabels(label?: string | null): string[] {
  if (!label) return [];
  const group = RESERVATION_COMBINABLE_GROUPS.find(labels => labels.includes(label));
  return group ? group.filter(item => item !== label) : [];
}
