import { atom } from 'recoil';
import type { CustomUser } from '../../types/user.ts';

export const userState = atom<CustomUser | null>({
  key: 'userState',
  default: null,
});
