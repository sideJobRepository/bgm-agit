export type ReservationData = {
  date: string;
  labelGb: number;
  link: string;
  id: number;
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

export type ReservationDatas = {
  date: string;
  labelGb: number;
  id: number;
  link: string;
  label?: string;
  group?: number;
  timeSlots?: ReservedTimeDto[];
  prices?: ReservationPriceDto[];
};

// 예약 내역
export type Reservation = {
  reservationNo: number;
  reservationDate: string;
  reservationMemberName: string;
  reservationAddr: string;
  approvalStatus: 'Y' | 'N';
  cancelStatus: 'Y' | 'N';
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
