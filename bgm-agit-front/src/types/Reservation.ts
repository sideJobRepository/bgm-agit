export type reservationData = {
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

export type reservationDatas = {
  label?: string;
  group?: number;
  timeSlots?: ReservedTimeDto[];
  prices?: ReservationPriceDto[];
};
