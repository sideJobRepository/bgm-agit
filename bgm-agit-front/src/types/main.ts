export type ImageSliderItem = Record<number, GridItem[]> & { page: PageItem };

export interface GridItem {
  image: string;
  category: string;
  imageId: number;
  labelGb: number;
  label: string;
  group: null | string;
  link: null | string;
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
