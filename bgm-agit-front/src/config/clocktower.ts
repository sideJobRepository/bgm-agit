import type { ClockTowerCharacterType } from '../types/clocktower.ts';

// 시계탑 진영 표시 규칙(이름·색·순서). 게임 상세·사전 관리·마도서가 같이 쓴다
export const CT_TYPE_OPTIONS: { value: ClockTowerCharacterType; label: string }[] = [
  { value: 'TOWNSFOLK', label: '마을주민' },
  { value: 'OUTSIDER', label: '외지인' },
  { value: 'MINION', label: '하수인' },
  { value: 'DEMON', label: '악마' },
  { value: 'TRAVELLER', label: '여행자' },
  { value: 'FABLED', label: '전설' },
  { value: 'LORIC', label: '로릭' },
];

export const CT_TYPE_LABEL = Object.fromEntries(CT_TYPE_OPTIONS.map(o => [o.value, o.label])) as Record<
  ClockTowerCharacterType,
  string
>;

export const CT_TYPE_COLOR: Record<ClockTowerCharacterType, string> = {
  TOWNSFOLK: '#1565C0',
  OUTSIDER: '#0097A7',
  MINION: '#C62828',
  DEMON: '#6A1B9A',
  TRAVELLER: '#8D6E63',
  FABLED: '#C9A227',
  LORIC: '#2E7D32',
};

/**
 * 마도서(어두운 바탕) 전용 진영 색. 위 CT_TYPE_COLOR 를 #14101C 에 그대로 쓰면 악마 2.0:1 로 읽히지 않는다.
 * 마도서 배경 세 단계(#14101C·#1E1828·#2A2236) 모두에서 4.5:1 이상(최저 #2A2236 위 하수인 5.48:1, WCAG 1.4.3).
 * 색을 채운 칩의 글자는 어두운 색(#14101C)을 쓴다
 */
export const CT_TYPE_COLOR_DARK: Record<ClockTowerCharacterType, string> = {
  TOWNSFOLK: '#6EA8FF',
  OUTSIDER: '#4DD0E1',
  MINION: '#FF6B6B',
  DEMON: '#D08BFF',
  TRAVELLER: '#C8A27C',
  FABLED: '#F2C94C',
  LORIC: '#6FCF7F',
};

/**
 * 마도서 캐릭터 이미지 스위치. 권리자 요청 등으로 끌 때 false — 글자 토큰으로 돌아간다.
 * 서버도 clocktower.images-enabled=false 면 이미지 주소를 내려주지 않는다(프론트 재배포 없이 끄려면 그쪽 + 앱 재시작)
 */
export const CT_IMAGES_ENABLED = true;

/** 플레이어가 맡는 캐릭터인지 (전설·로릭은 이야기꾼 규칙이라 좌석·기록 대상이 아니다) */
export function isSeatableType(type?: ClockTowerCharacterType | null) {
  return !!type && type !== 'FABLED' && type !== 'LORIC';
}
