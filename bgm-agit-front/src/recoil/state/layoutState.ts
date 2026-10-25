import { atom } from 'recoil';

/**
 * 사이트 틀(헤더·메뉴·푸터·설치 배너) 표시 방식.
 * 'immersive' 는 시계탑 진행판의 몰입 모드 — 진행판이 언마운트될 때 반드시 'normal' 로 되돌린다
 */
export type LayoutMode = 'normal' | 'immersive';

export const layoutModeState = atom<LayoutMode>({
  key: 'layoutModeState',
  default: 'normal',
});
