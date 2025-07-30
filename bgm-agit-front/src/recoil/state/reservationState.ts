import { atom } from 'recoil';
import type { PagedReservation, ReservationData } from '../../types/reservation.ts';

export const reservationState = atom<ReservationData>({
  key: 'reservationState',
  default: {
    date: '',
    labelGb: 0,
    id: 0,
    link: '',
  },
});

export const reservationDataState = atom<ReservationData | null>({
  key: 'reservationDataState',
  default: null,
});

export const reservationListDataState = atom<PagedReservation>({
  key: 'reservationListDataState',
  default: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: true,
  },
});
