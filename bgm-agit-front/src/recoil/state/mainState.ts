import { atom } from 'recoil';
import type { MainMenu } from '../../types/menu.ts';
import type { ImageSliderItem } from '../../types/main.ts';

export const mainMenuState = atom<MainMenu[]>({
  key: 'mainMenuState',
  default: [],
});

export const mainDataState = atom<ImageSliderItem>({
  key: 'mainRoomState',
  default: [],
});

export const loadingState = atom<boolean>({
  key: 'isLoadingState',
  default: false,
});

export const errorState = atom<boolean>({
  key: 'hasErrorState',
  default: false,
});

export const imageUploadState = atom<number>({
  key: 'imageUploadState',
  default: 0,
});
