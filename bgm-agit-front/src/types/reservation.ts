// 예약 대상 방(BGM_AGIT_ROOM). GET /bgm-agit/rooms 응답
export type Room = {
  roomId: number;
  name: string;
  // '/detail/room' | '/detail/mahjongRental'
  link: string;
  minPeople: number | null;
  maxPeople: number | null;
  // 카드에 나오는 인원 안내 문구 (예: '2~4인')
  guide: string | null;
  imageUrl: string | null;
  // 'N' 은 숨김. 공개 조회에서는 빠지고 관리자 includeHidden=true 일 때만 온다
  useStatus: 'Y' | 'N' | null;
};

export const ROOM_LINKS = [
  { value: '/detail/room', label: '룸' },
  { value: '/detail/mahjongRental', label: '마작 대탁' },
] as const;

export type ReservationData = {
  date: string;
  labelGb: number;
  link: string;
  // roomId. 쿼리 파라미터 이름은 서버 계약상 id 그대로 둔다
  id: number;
  // 합쳐 예약할 방 id들 (콤마 구분). 서버가 교집합 시간대를 내려준다
  ids?: string;
};

// 특정 날짜에 항목별로 몇 개 시간대가 남았는지 (방을 고르기 전 카드 배지용).
// 실제 선택 가능한 시간대의 출처는 여전히 GET /bgm-agit/reservation 하나다.
export type AvailableRoom = {
  roomId: number;
  label: string;
  // 카드 인원 안내 문구 (BGM_AGIT_ROOM_GUIDE)
  group?: string | null;
  category?: string | null;
  minPeople?: number | null;
  maxPeople?: number | null;
  // 그 날짜의 후보 슬롯 총수 (일반 룸 13 / G Room 2 / 마작 대여 4)
  totalSlotCount: number;
  availableSlotCount: number;
  available: boolean;
  // 항목 단위 불가 사유(G룸 하루 1팀 등). 없으면 null
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
  // 카드 인원 안내 문구 (BGM_AGIT_ROOM_GUIDE)
  group?: string | null;
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
  reservationId: number;
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
  reservationId: number;
  // 이 예약이 잡은 장소 전부. 합쳐 예약이면 여러 개이고 각 장소 열에 같은 항목이 들어간다
  roomNames: string[];
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
  // 방 link 로 판정한 분류 (/detail/mahjongRental → MAHJONG, 그 외 ROOM). 탭 분류에 사용
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
