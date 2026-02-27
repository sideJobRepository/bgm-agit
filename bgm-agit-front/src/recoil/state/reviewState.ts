import { atom } from 'recoil';
import type { DetailReview, ReviewPage } from '../../types/review.ts';

export const reviewState = atom<ReviewPage>({
  key: 'reviewState',
  default: {
    content: [],
    page: 0,
    size: 5,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  },
});

export const detailReviewState = atom<DetailReview | null>({
  key: 'detailReviewState',
  default: null,
});
