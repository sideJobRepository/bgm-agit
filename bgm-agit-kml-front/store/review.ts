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

export interface ReviewComment {
  commentId: number;
  cont: string;
  delStatus: string;
  depth: number;
  isAuthor: boolean;
  nickname: string;
  registDate: string;
}

export interface ReviewFiles {
  id: number;
  fileName: string;
  fileUrl: string;
  status: string;
  fileFolder: string;
}

interface DetailReviewStore {
  cont: string;
  files: ReviewFiles[];
  id: number;
  title: string;
  registDate: string;
  isAuthor: boolean;
  memberId: number;
  nickName: string;
  comments: ReviewComment[];
}

interface ReviewDetailStore {
  reviewDetail: DetailReviewStore | null;
  setDetailReview: (reviewDetail: DetailReviewStore) => void;
  clearDetail: () => void;
}

export const useReviewDetailStore = create<ReviewDetailStore>((set) => ({
  reviewDetail: null,
  setDetailReview: (reviewDetail) => set({ reviewDetail }),
  clearDetail: () => set({ reviewDetail: null }),
}));
