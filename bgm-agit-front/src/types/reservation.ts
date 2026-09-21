export type ReservationData = {
  date: string;
  labelGb: number;
  link: string;
  id: number;
  // 합쳐 예약할 항목 id들 (콤마 구분). 서버가 교집합 시간대를 내려준다
  ids?: string;
};

// 특정 날짜에 항목별로 몇 개 시간대가 남았는지 (방을 고르기 전 카드 배지용).
// 실제 선택 가능한 시간대의 출처는 여전히 GET /bgm-agit/reservation 하나다.
export type AvailableRoom = {
  imageId: number;
  label: string;
  group?: string | null;
  category?: string | null;
  minPeople?: number | null;
  maxPeople?: number | null;
  // 그 날짜의 후보 슬롯 총수 (룸 24 / 마작 대여 4)
  totalSlotCount: number;
  availableSlotCount: number;
  available: boolean;
  // 항목 단위 불가 사유. 없으면 null
  message?: string | null;
};

export type AvailableRooms = {
  // 요청한 날짜 에코. 날짜를 빠르게 바꿀 때 늦게 도착한 응답을 버리는 데 쓴다
  date: string;
  // 그 날짜 전체가 불가(당일·예약가능기간 밖·휴무일)인지
  closed: boolean;
  message?: string | null;
  // 휴무 요일. 자바스크립트 Date.getDay() 규약(0=일 … 3=수 … 6=토)이라 그대로 비교하면 된다
  closedWeekday: number;
  rooms: AvailableRoom[];
};

export type ReservedTimeDto = {
  date: string; // '2025-07-24'
  timeSlots: string[]; // ['13:00', '14:00']
};

export type ReservationPriceDto = {
  date: string;
  price: number;
  colorGb: boolean;
};

// 서버가 내려주는 예약 후보 시간대 (예약 가능 여부와 무관)
export type SlotRange = {
  start: string; // '13:00'
  end: string; // '14:00'
};

export type ReservationDatas = {
  date: string;
  labelGb: number;
  id: number;
  link: string;
  label?: string;
  group?: number;
  maxPeople?: number;
  minPeople?: number;
  timeSlots?: ReservedTimeDto[];
  prices?: ReservationPriceDto[];
  slotRanges?: SlotRange[];
  maxSelectableSlots?: number | null;
  reservationType?: string;
  /**
   * 요금 방식. 'PER_PERSON'(룸 일무제한) 이면 prices 의 그날 값이 1인 단가이고,
   * 'FLAT'(마작 대탁) 이면 depositAmount 가 확정 금액이다. 프론트에서 라벨로 분기하지 말 것.
   */
  pricingMode?: 'PER_PERSON' | 'FLAT';
  // FLAT 일 때의 결제 금액. PER_PERSON 이면 인원이 정해지기 전이라 null
  depositAmount?: number | null;
};

// 예약 내역
export type Reservation = {
  reservationNo: number;
  reservationDate: string;
  // GroupedReservationResponse 의 @JsonFormat 으로 분까지 포맷되어 온다 ('2026-08-04 14:20')
  registDate: string;
  reservationMemberName: string;
  reservationAddr: string;
  reservationPeople: number;
  reservationRequest: string;
  phoneNo: string;
  approvalStatus: 'Y' | 'N';
  cancelStatus: 'Y' | 'N';
  receiptUrl?: string | null;
  // 아직 환불되지 않고 남아 있는 결제 금액. 미결제건은 0
  paidAmount?: number | null;
  // 지금 취소하면 적용될 환불 비율(%)과 금액. 최종 금액은 취소 응답 메시지가 알려준다
  refundRate?: number | null;
  refundAmount?: number | null;
  timeSlots: {
    startTime: string;
    endTime: string;
  }[];
};

// 관리자 예약 현황판
export type ReservationBoardItem = {
  reservationNo: number;
  memberName: string | null;
  phoneNo: string | null;
  people: number | null;
  request: string | null;
  approvalStatus: 'Y' | 'N';
  cancelStatus: 'Y' | 'N';
  receiptUrl: string | null;
  registDate: string;
  startTime: string;
  endTime: string;
  // 자정 기준 분값. 하루 경계(오전 10시) 이전 슬롯은 +1440 되어 있음 (24시간 영업 대응)
  startMinutes: number;
  endMinutes: number;
};

export type ReservationBoardRoom = {
  roomName: string;
  // BgmAgitImageCategory 이름 (ROOM / MAHJONG ...). 탭 분류에 사용
  category: string | null;
  reservations: ReservationBoardItem[];
};

export type ReservationBoardSummary = {
  total: number;
  confirmed: number;
  waiting: number;
  canceled: number;
  people: number;
};

export type ReservationBoard = {
  date: string;
  summary: ReservationBoardSummary;
  rooms: ReservationBoardRoom[];
};

export type PagedReservation = {
  content: Reservation[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
