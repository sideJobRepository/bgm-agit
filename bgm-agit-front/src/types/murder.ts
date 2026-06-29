// 머미 게임 카탈로그 + 플레이 기록 타입

export interface MurderGame {
  id: number;
  name: string;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playMinutes?: number | null;
  imageUrl?: string | null;
}

export interface PagedMurderGame {
  content: MurderGame[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PlayRecordListItem {
  id: number;
  gameId: number;
  gameName: string;
  gameImageUrl?: string | null;
  playDate: string; // yyyy-MM-dd
  writerId: number;
  writerNickname: string;
  memo?: string | null;
  participantCount: number;
  participantNicknames: string[];
}

export interface PagedPlayRecord {
  content: PlayRecordListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PlayRecordParticipant {
  memberId: number;
  nickname: string;
}

export interface PlayRecordDetail {
  id: number;
  gameId: number;
  gameName: string;
  gameImageUrl?: string | null;
  gameMinPlayers?: number | null;
  gameMaxPlayers?: number | null;
  playDate: string;
  writerId: number;
  writerNickname: string;
  memo?: string | null;
  participants: PlayRecordParticipant[];
  canManage: boolean;
}

export interface MemberOption {
  id: number;
  nickname: string;
  name?: string | null;
}

export interface MemberPlayHistoryItem {
  gameId: number;
  gameName: string;
  gameImageUrl?: string | null;
  playCount: number;
  lastPlayDate: string;
}

export interface MemberMonthlyBucket {
  ym: string; // "2026-06"
  playCount: number;
}

export interface MemberHistory {
  thisMonthCount: number;
  totalCount: number;
  games: MemberPlayHistoryItem[];
  monthly: MemberMonthlyBucket[];
}

export interface MemberMonthlyCount {
  memberId: number;
  nickname: string;
  playCount: number;
}

export interface MonthlyStats {
  year: number;
  month: number;
  totalCount: number;
  members: MemberMonthlyCount[];
}

export interface PlayRecordFormBody {
  gameId: number;
  playDate: string;
  memberIds: number[];
  memo?: string | null;
}
