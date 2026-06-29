// 시계탑 게임 카탈로그 + 플레이 기록 타입
// 통계/이력 형태는 머미와 동일하므로 재사용
export type { MemberOption, MemberHistory, MonthlyStats, MemberMonthlyCount } from './murder.ts';

export type ClockTowerCharacterType = 'TOWNSFOLK' | 'OUTSIDER' | 'MINION' | 'DEMON';
export type ClockTowerResultType = 'GOOD_WIN' | 'EVIL_WIN';

export interface ClockTowerCharacter {
  id: number;
  name: string;
  type: ClockTowerCharacterType;
  typeName: string;
  description?: string | null;
  orders?: number | null;
}

export interface ClockTowerGame {
  id: number;
  name: string;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playMinutes?: number | null;
  imageUrl?: string | null;
  characters?: ClockTowerCharacter[] | null; // 상세 조회 시에만
}

export interface PagedClockTowerGame {
  content: ClockTowerGame[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ClockTowerRecordListItem {
  id: number;
  gameId: number;
  gameName: string;
  gameImageUrl?: string | null;
  playDate: string; // yyyy-MM-dd
  result: ClockTowerResultType | null;
  resultName: string | null; // 선인승 / 악마승
  draft?: boolean; // true=임시저장
  writerId: number;
  writerNickname: string;
  memo?: string | null;
  participantCount: number;
  participantNicknames: string[];
}

export interface PagedClockTowerRecord {
  content: ClockTowerRecordListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ClockTowerRecordParticipant {
  memberId: number;
  nickname: string;
  characterName?: string | null;
  type?: ClockTowerCharacterType | null;
  typeName?: string | null;
  win?: boolean | null;
}

export interface ClockTowerRecordDetail {
  id: number;
  gameId: number;
  gameName: string;
  gameImageUrl?: string | null;
  gameMinPlayers?: number | null;
  gameMaxPlayers?: number | null;
  playDate: string;
  result: ClockTowerResultType | null;
  resultName: string | null;
  draft?: boolean; // true=임시저장
  writerId: number;
  writerNickname: string;
  memo?: string | null;
  participants: ClockTowerRecordParticipant[];
  canManage: boolean;
}
