import { atom } from 'recoil';
import type { MainMenu } from '../../types/menu.ts';
import type { DetailParams, detailParams, ImageSliderItem } from '../../types/main.ts';

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

//게임, 메뉴 페이지 데이터
export const searchState = atom<DetailParams>({
  key: 'searchState',
  default: {
    page: 0,
    name: '',
    category: null,
  },
});
