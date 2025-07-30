import { atom } from 'recoil';
import type { PageRole } from '../../types/role.ts';

export const roleState = atom<PageRole>({
  key: 'roleState',
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
