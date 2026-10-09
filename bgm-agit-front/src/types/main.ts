import type { Room } from './reservation.ts';

export type ImageSliderItem = Record<number, GridItem[]> & { page: PageItem };

export interface GridItem {
  image: string;
  category: string;
  imageId: number;
  labelGb: number;
  label: string;
  group: null | string;
  link: null | string;
  // 방 페이지(labelGb 3) 카드면 원본 방 정보. 관리자 수정 폼·숨김 표시에 쓴다
  room?: Room;
}

export interface PageItem {
  last: boolean;
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DetailParams {
  page: number;
  name: string;
  category: string | null;
  gb: string;
}
