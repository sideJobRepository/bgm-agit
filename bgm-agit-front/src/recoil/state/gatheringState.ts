import { atom } from 'recoil';
import type { GatheringDetail, PagedGathering } from '../../types/gathering.ts';

export const gatheringListState = atom<PagedGathering>({
  key: 'gatheringListState',
  default: {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true,
  },
});

export const gatheringDetailState = atom<GatheringDetail | null>({
  key: 'gatheringDetailState',
  default: null,
});
