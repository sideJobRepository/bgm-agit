import { atom } from 'recoil';
import type { Notice, PagedNotice } from '../../types/notice';

export const noticeState = atom<PagedNotice>({
  key: 'noticeState',
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

export const noticePopupState = atom<Notice[]>({
  key: 'noticePopupState',
  default: [],
});
