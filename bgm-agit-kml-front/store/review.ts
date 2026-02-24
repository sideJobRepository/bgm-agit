import { create } from 'zustand/index';

export interface ReviewItem {
  id: number;
  memberName: string;
  nickname: string;
  commentCount: number;
  title: string;
  cont: string;
  registDate: string;
}

export interface ReviewPage {
  content: ReviewItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

interface ReviewStore {
  review: ReviewPage | null;
  setReview: (review: ReviewPage) => void;
}

export const useReviewListStore = create<ReviewStore>((set) => ({
  review: null,
  setReview: (review) => set({ review }),
}));
