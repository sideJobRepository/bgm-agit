import { atom } from 'recoil';
import type { JwtPayload } from 'jwt-decode';

export const userState = atom<JwtPayload | null>({
  key: 'userState',
  default: null,
});
