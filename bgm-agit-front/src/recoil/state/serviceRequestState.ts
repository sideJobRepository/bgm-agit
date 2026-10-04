import { atom } from 'recoil';
import type { DetaileSupport, PagedSupprot } from '../../types/support.ts';

export const serviceRequestState = atom<PagedSupprot>({
  key: 'serviceRequestState',
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

export const detailServiceRequestState = atom<DetaileSupport>({
  key: 'detailServiceRequestState',
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
    id: '',
    memberId: '',
    title: '',
    registDate: '',
    memberName: '',
    answerStatus: '',
  },
});
