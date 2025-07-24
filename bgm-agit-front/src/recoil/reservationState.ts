import { atom } from 'recoil';
import type { reservationData } from '../types/Reservation.ts';

export const reservationState = atom<reservationData>({
  key: 'reservationState',
  default: {
    date: '',
    labelGb: 0,
    link: '',
  },
});
