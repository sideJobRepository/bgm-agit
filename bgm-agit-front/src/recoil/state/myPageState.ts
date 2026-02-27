import { atom } from 'recoil';
import type { MyPagePaged } from '../../types/myPage.ts';

export const myPageListState = atom<MyPagePaged>({
  key: 'myPageListState',
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
