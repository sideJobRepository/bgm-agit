export type ImageSliderItem = {
  [labelGb: number]: GridItem[];
};

export interface GridItem {
  image: string;
  category: string;
  imageId: number;
  labelGb: number;
  label: string;
  group: null | string;
  link: null | string;
}
