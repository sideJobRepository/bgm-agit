import { atom } from 'recoil';
import type { DetaileSupport, PagedSupprot } from '../../types/support.ts';

export const supportState = atom<PagedSupprot>({
  key: 'supportState',
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

export const detailSupportState = atom<DetaileSupport>({
  key: 'detailSupportState',
  default: {
    reply: {
      answerStatus: '',
      cont: '',
      files: [],
      id: '',
      memberId: '',
      memberName: '',
      registDate: '',
      title: '',
    },
    cont: '',
    files: [],
    id: 0,
    memberId: '',
    title: '',
    registDate: '',
    memberName: '',
    answerStatus: '',
  },
});
