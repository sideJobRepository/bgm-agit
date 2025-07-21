import { atom } from 'recoil';
import type { MainMenu } from '../types/menu.ts';

export const mainMenuState = atom<MainMenu[]>({
  key: 'mainMenuState',
  default: [],
});
