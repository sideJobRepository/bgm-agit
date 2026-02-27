import { atom } from 'recoil';
import type { LectureResponse } from '../../types/match.ts';

export const matchDataState = atom<LectureResponse | null>({
  key: 'matchDataState',
  default: null,
});
