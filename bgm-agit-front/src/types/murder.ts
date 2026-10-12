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

export interface ExperiencedMember {
  memberId: number;
  nickname: string;
  playCount: number;
  lastPlayDate: string | null;
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

// 머미로그에서 찾은 표지 후보 (GET /murder-games/cover-candidates)
export interface MurderCoverCandidate {
  title: string;
  thumbnailUrl: string;
  imageUrl: string;
  pageUrl: string;
  // 머미로그에 적힌 인원·시간(없으면 null). 정리 화면에서 비어 있는 칸만 채운다
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playMinutes?: number | null;
}

// 표지 자동 채우기 한 건의 결과 (POST /murder-games/{id}/auto-cover). filled=false 면 message 가 사유
export interface MurderCoverAutoFillResult {
  id: number;
  name: string;
  filled: boolean;
  message: string;
  imageUrl?: string | null;
}
