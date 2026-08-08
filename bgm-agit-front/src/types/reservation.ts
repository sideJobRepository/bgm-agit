export type ReservationData = {
  date: string;
  labelGb: number;
  link: string;
  id: number;
  // 합쳐 예약할 항목 id들 (콤마 구분). 서버가 교집합 시간대를 내려준다
  ids?: string;
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
  // 선택한 항목들의 예약금 합계 (서버 계산)
  depositAmount?: number;
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
  // 자정 기준 분값. 06시 이전 슬롯은 +1440 되어 있음 (익일 새벽 마감 대응)
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
