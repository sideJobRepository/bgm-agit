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
};

// 예약 내역
export type Reservation = {
  reservationNo: number;
  reservationDate: string;
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
