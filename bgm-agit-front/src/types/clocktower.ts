// 시계탑 게임 카탈로그 + 플레이 기록 타입
// 통계/이력 형태는 머미와 동일하므로 재사용
export type { MemberOption, MemberHistory, MonthlyStats, MemberMonthlyCount } from './murder.ts';

export type ClockTowerCharacterType =
  | 'TOWNSFOLK'
  | 'OUTSIDER'
  | 'MINION'
  | 'DEMON'
  | 'TRAVELLER'
  | 'FABLED'
  | 'LORIC';
export type ClockTowerResultType = 'GOOD_WIN' | 'EVIL_WIN';

export interface ClockTowerCharacter {
  id: number;
  name: string;
  type: ClockTowerCharacterType;
  typeName: string;
  description?: string | null;
  orders?: number | null;
  roleKey?: string | null; // 캐릭터 사전 키. 직접 입력한 캐릭터는 null
  image?: string | null; // 캐릭터 그림(게임 상세 조회 때만). 없으면 글자만
}

export interface ClockTowerGame {
  id: number;
  name: string;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playMinutes?: number | null;
  imageUrl?: string | null;
  source?: 'MANUAL' | 'OFFICIAL' | 'CUSTOM' | null;
  author?: string | null;
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
  evil?: boolean | null; // 직접 지정한 최종 선악(진영이 바뀐 경우·여행자). null 이면 캐릭터 진영대로
  image?: string | null; // 캐릭터 그림(실제 선악에 맞는 쪽). 사전에 없으면 null
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
  // 마도서에서 기록해 마지막 마도서가 함께 저장돼 있다([마도서 보기])
  hasGrimoire?: boolean;
}

// 캐릭터 사전(관리자). 밤 특수 단계는 team 이 null
export interface ClockTowerRole {
  id: number;
  roleKey: string;
  name: string;
  nameEn?: string | null;
  team: ClockTowerCharacterType | null;
  teamName?: string | null;
  edition?: string | null;
  ability?: string | null;
  firstNightOrder?: number | null;
  otherNightOrder?: number | null;
  firstNightText?: string | null;
  otherNightText?: string | null;
  reminders: string[];
  remindersGlobal: string[];
  setup: boolean;
  customEdited: boolean;
  image?: string | null;
  imageGood?: string | null;
  imageEvil?: string | null;
}

export interface ClockTowerImportResult {
  total: number;
  added: number;
  updated: number;
  keptEdited: number;
  jinxes: number;
  scripts: string[];
}

/** 캐릭터 이미지 S3 복사 현황. missing 은 'tb/imp_e.webp' 같은 경로 */
export interface ClockTowerImageStatus {
  total: number;
  done: number;
  missing: string[];
  paths: string[]; // 전체 경로([전체 다시 받기]용)
}

export interface ClockTowerImageSyncResult {
  path: string;
  status: 'COPIED' | 'SKIPPED' | 'FAILED' | 'NOT_RUN';
  message: string | null;
}

// ---------- 이야기꾼 마도서 ----------

/** 공식 데이터 special 항목(예: {type:'selection', name:'bag-disabled'}, {type:'vote', name:'multiplier', value:3}) */
export interface GrimoireSpecial {
  type: string;
  name: string;
  value?: string | number | null;
  time?: string | null;
  global?: string | null;
}

export interface GrimoireRole {
  key: string; // 사전 키. 직접 입력한 캐릭터는 "c{캐릭터ID}"
  characterId: number | null; // 기록 저장용 시나리오 캐릭터 id(밤 특수 단계는 null)
  name: string;
  team: ClockTowerCharacterType | null;
  ability?: string | null;
  firstNightOrder?: number | null;
  otherNightOrder?: number | null;
  firstNightText?: string | null;
  otherNightText?: string | null;
  reminders: string[];
  remindersGlobal: string[];
  setup: boolean;
  special?: GrimoireSpecial[];
  // 토큰 이미지(우리 S3 복사본). 없으면 진영 기본 이미지 → 글자 토큰 순으로 대체
  image?: string | null;
  imageGood?: string | null;
  imageEvil?: string | null;
}

export interface GrimoireJinx {
  roleA: string;
  roleB: string;
  reason: string;
}

export interface GrimoireData {
  gameId: number;
  gameName: string;
  roles: GrimoireRole[];
  nightSteps: GrimoireRole[];
  jinxes: GrimoireJinx[];
  // 스크립트 _meta 의 밤 순서 배열(있으면 공식 순서보다 우선)
  firstNightOrder?: string[] | null;
  otherNightOrder?: string[] | null;
  // 스크립트에 없어도 진행 중 꺼낼 수 있는 전설·로릭(장난감 제작자·뱃사공 등)
  extraFabled?: GrimoireRole[];
  genericImages?: Record<string, string>;
}

export interface GrimoireReminder {
  id: string;
  text: string;
  source?: string | null; // 이 리마인더를 준 캐릭터 이름
  // 끌어서 옮긴 위치. 토큰 중심에서의 거리를 토큰 지름 단위로(토큰을 옮기거나 크기가 바뀌어도 같이 따라간다). 없으면 자동 배치
  pos?: { dx: number; dy: number } | null;
}

export type DeathCause = 'EXECUTION' | 'NIGHT' | 'EXILE' | 'ABILITY' | 'OTHER';
export type GamePhase = 'NIGHT' | 'DAY';
// SETUP = 첫날 밤 전(캐릭터를 나누는 중). 이때 캐릭터를 바꾸는 건 배정 정정이라 선악을 고정하지 않는다
export type GrimoirePhase = 'SETUP' | GamePhase;

export interface GrimoireDeath {
  day: number;
  phase: GamePhase;
  cause: DeathCause;
}

export interface RoleChange {
  day: number;
  phase: GamePhase;
  from: string | null;
  to: string | null;
  alignFrom: boolean | null;
  alignTo: boolean | null;
  cause: string;
}

export interface GrimoireSeat {
  id: string;
  memberId: number | null; // 비회원이면 null
  name: string;
  roleKey: string | null; // 실제 캐릭터
  // 본인이 믿는 캐릭터(주정뱅이·꼭두각시·미치광이). [본인에게 보여주기]·밤 순서는 이것을 쓴다
  believedRoleKey: string | null;
  dead: boolean;
  death: GrimoireDeath | null;
  ghostVoteUsed: boolean;
  // null 이면 캐릭터 진영대로. 게임 중 캐릭터가 바뀌면 바뀌기 전 선악을 명시값으로 고정한다(공식: 캐릭터가 바뀌어도 선악은 그대로)
  evil: boolean | null;
  left: boolean; // 떠난 여행자. 모든 인원 셈에서 빠진다
  reminders: GrimoireReminder[];
  roleHistory: RoleChange[];
}

export type NightTab = 'first' | 'other';

export interface Nomination {
  id: string;
  nominatorSeatId: string | 'ST';
  nomineeSeatId: string;
  voterSeatIds: string[]; // 손 든 좌석(가중치는 집계 때 적용)
  total: number;
  needed: number;
  // IMMEDIATE = 투표 결과와 상관없이 능력(성결자·재상·판사)으로 바로 처형 결과 창으로 넘긴 지명
  outcome: 'ABOUT_TO_DIE' | 'TIE' | 'FAIL' | 'IMMEDIATE';
  // 거리의 악사 비밀 투표. 표 수를 낮 화면에 안 보이고, 유령 투표는 하루가 끝날 때 차감한다(W/Organ_Grinder)
  secret?: boolean;
  // 부두술사 규칙(필요 표 1, 죽은 사람은 토큰 없이 투표)으로 센 지명(W/Voudon)
  voudon?: boolean;
  // 이 지명에서 유령 투표를 쓴 죽은 좌석
  ghostSeatIds?: string[];
}

// 처형은 사망과 다르다(RB p.16). 살아남아도, 이미 죽은 사람이어도 그날의 처형 1회로 센다
export interface Execution {
  seatId: string;
  died: boolean;
  survivedReason?: string | null;
  wasAlreadyDead: boolean;
  route: 'VOTE' | 'STORYTELLER'; // STORYTELLER = 투표 없이(성결자·변종 등 능력)
  characterAtExecution: string | null; // 처형 당시 캐릭터 키(장의사·식인종 정보, 나중에 캐릭터가 바뀌어도 남게)
  byNominationId?: string | null; // 이 처형을 만든 지명(지명 마감·즉시 처형에서 넘어온 경우)
}

// 여행자 추방. 지명이 아니라 처형 한도·지명 횟수·유령 투표를 쓰지 않는다(G Exile)
export interface Exile {
  seatId: string;
  supporters: number;
  needed: number;
  passed: boolean;
  survived?: boolean; // 추방됐지만 살아남음(이단아)
}

export interface DayLog {
  day: number;
  nominations: Nomination[];
  executions: Execution[];
  exiles: Exile[];
  aboutToDieSeatId: string | null;
  highWater: number;
}

export interface GrimoireSettings {
  // 첫날 하수인·악마 정보 7인 판정에 여행자를 넣을지(공식 문장 없음)
  countTravellersForEvilInfo: boolean;
  // 승패·승계 제안 배너. 끄면 산술(표 수·분배표)만 남는다
  suggestionsEnabled: boolean;
}

// EVIL_TRAVELLER_DEMON = 악으로 정한 여행자에게 악마가 누구인지 알려 주기(하수인은 안 알림, RB p.18)
export type GrimoireNoticeKind = 'CHARACTER' | 'ALIGNMENT' | 'EVIL_TRAVELLER_DEMON';

export interface GrimoireState {
  version: 2;
  ownerId: number | null; // 저장한 회원. 다른 회원이 같은 기기로 로그인하면 열지 않는다
  data: GrimoireData;
  seats: GrimoireSeat[];
  fabled: string[]; // 이야기꾼이 쓰는 전설·로릭 캐릭터 키
  nightTab: NightTab;
  nightChecked: string[];
  // N번째 밤 → N일째 낮 순서로 간다. [밤 시작]이 day 를 올리고 [밤 끝내기]가 같은 day 의 낮으로 넘긴다
  day: number;
  phase: GrimoirePhase;
  notes: string;
  startedAt: string;
  bluffs?: string[]; // 악마에게 보여줄 악마의 속임수(게임에 없는 선한 캐릭터) 키
  // 셋업 1단계에서 정한 캐릭터 주머니. 휴대폰으로 보낼 때 섞어서 좌석에 나눈다. 같은 v2 안에서 늘어난 필드
  bag?: GrimoireBagEntry[];
  // 셋업 1단계에서 정한 인원(여행자 제외). 진영별 추천 수(공식 분배표)의 기준이다
  setupPlayers?: number;
  dayLogs: DayLog[];
  settings: GrimoireSettings;
  // 게임 도중 캐릭터·선악이 바뀌어 본인에게 알려야 할 좌석(다음 밤 맨 앞에 뜬다)
  pendingNotices: { seatId: string; kind: GrimoireNoticeKind; createdDay: number }[];
  // 플레이어 휴대폰으로 보낸 배정(서버 세션). 같은 v2 안에서 늘어난 필드라 옛 저장본엔 없다
  clocktowerSession?: GrimoirePhoneSession | null;
  // 서버 임시저장 id. 다시 [임시저장]하면 이 저장을 덮어쓴다
  serverSaveId?: number | null;
}

/** 주머니 한 칸. 주정뱅이·꼭두각시·미치광이는 믿는 캐릭터를 같이 정해 둔다 */
export interface GrimoireBagEntry {
  key: string;
  believedKey: string | null;
  // 셋업을 바꾸는 캐릭터 중 이야기꾼이 고르는 것(대부 ±1 등)의 선택 번호. 없으면 첫 번째 선택
  setupChoice?: number;
}

/** 플레이어 휴대폰에 함께 보여줄 정보(첫날 밤 악 팀 정보 등) */
export interface GrimoireSeatInfo {
  title: string;
  lines: string[];
}

/** 서버로 보내는 좌석 한 줄 — 그 플레이어에게 보여줄 것만 담는다(주정뱅이 등은 믿는 캐릭터) */
export interface PhoneSeatPayload {
  memberId: number;
  seatNo: number;
  roleKey: string | null;
  evil: boolean | null;
  info: GrimoireSeatInfo | null;
}

export interface GrimoirePhoneSession {
  sessionId: number;
  sentAt: string;
  // 회원 id → 마지막으로 보낸 좌석 내용(JSON). 바뀐 좌석만 다시 보내려고 비교한다
  sent: Record<string, string>;
  // 회원 id → 함께 보여줄 정보(악 팀 정보). 다시 보낼 때도 유지한다
  infos: Record<string, GrimoireSeatInfo>;
}

export interface PhoneSessionStatus {
  sessionId: number;
  status: 'ACTIVE' | 'CLOSED';
  seats: { memberId: number; seatNo: number; version: number; viewedVersion: number; viewedAt: string | null }[];
}

/** 플레이어 화면(/clocktower-my) — 내 줄만 내려온다 */
export type MyClocktowerSeat =
  | { active: false }
  | {
      active: true;
      sessionId: number;
      gameId: number;
      gameName: string | null; // 게임이 지워졌으면 null
      seatNo: number;
      version: number;
      viewedVersion: number;
      role: {
        key: string;
        name: string;
        team: ClockTowerCharacterType | null;
        teamName: string | null;
        ability: string | null;
        image: string | null;
      } | null;
      evil: boolean | null;
      info: GrimoireSeatInfo | null;
    };
