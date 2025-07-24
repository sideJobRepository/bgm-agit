import { atom } from 'recoil';
import type { ImageSliderItem } from '../types/main.ts';

export const reservationState = atom<ImageSliderItem>({
  key: 'reservationState',
  default: [],
});
