import { atom } from 'recoil';
import type { DetaileCommunity, PagedCommunity } from '../../types/community.ts';

export const communityState = atom<PagedCommunity>({
  key: 'communityState',
  default: {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: true,
  },
});

export const detailCommunityState = atom<DetaileCommunity>({
  key: 'detailCommunityState',
  default: {
    comments: [],
    content: '',
    files: [],
    id: 0,
    isAuthor: false,
    memberId: '',
    title: '',
    registDate: '',
    memberName: '',
  },
});
