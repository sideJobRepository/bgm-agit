import { atom } from 'recoil';
import type { ReservationData } from '../../types/reservation.ts';

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
