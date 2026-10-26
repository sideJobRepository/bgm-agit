import type {
  ClockTowerCharacterType,
  DayLog,
  DeathCause,
  Exile,
  Execution,
  GamePhase,
  GrimoireData,
  GrimoireDeath,
  GrimoireRole,
  GrimoireSeat,
  GrimoireState,
  NightTab,
} from '../../../types/clocktower.ts';
import { newSeatId } from './useGrimoire.ts';

/** 공식 인원별 진영 수(여행자 제외 인원 기준). [마을주민, 외지인, 하수인, 악마] */
const DISTRIBUTION: Record<number, [number, number, number, number]> = {
  5: [3, 0, 1, 1],
  6: [3, 1, 1, 1],
  7: [5, 0, 1, 1],
  8: [5, 1, 1, 1],
  9: [5, 2, 1, 1],
  10: [7, 0, 2, 1],
  11: [7, 1, 2, 1],
  12: [7, 2, 2, 1],
  13: [9, 0, 3, 1],
  14: [9, 1, 3, 1],
  15: [9, 2, 3, 1],
};

export const BASE_TEAMS = ['TOWNSFOLK', 'OUTSIDER', 'MINION', 'DEMON'] as const;
export type BaseTeam = (typeof BASE_TEAMS)[number];
export type TeamCounts = Record<BaseTeam, number>;

/** 하수인 정보·악마 정보는 7인 이상일 때만 진행한다(공식 규칙) */
export const MIN_PLAYERS_FOR_EVIL_INFO = 7;
const EVIL_INFO_KEYS = ['minioninfo', 'demoninfo'];
/** 공식 분배표 최대 인원. 넘는 사람은 여행자여야 한다(W/Setup "any excess players must volunteer to be Travellers") */
export const MAX_BASE_PLAYERS = 15;

export function roleMap(data: GrimoireData): Map<string, GrimoireRole> {
  const map = new Map<string, GrimoireRole>();
  for (const r of [...data.roles, ...data.nightSteps]) map.set(r.key, r);
  return map;
}

export function isTravellerSeat(seat: GrimoireSeat, roles: Map<string, GrimoireRole>) {
  return roles.get(seat.roleKey ?? '')?.team === 'TRAVELLER';
}

// ---------- 인원 셈 ----------
// 규칙마다 세는 사람이 다르다. 떠난 좌석(left)은 모든 셈에서 뺀다(전설·로릭은 좌석이 아니라 애초에 안 센다).

/** 추방 정족수 분모: 게임에 남은 전체 플레이어(사망·여행자 포함). RB p.19 */
export function totalPlayers(seats: GrimoireSeat[]) {
  return seats.filter(s => !s.left).length;
}

/** 처형 정족수·광신자·시장용 생존자. 여행자 포함(G Execution, W/Zealot "Travellers count as alive players") */
export function aliveAll(seats: GrimoireSeat[]) {
  return seats.filter(s => !s.left && !s.dead).length;
}

/** 악 승리(2명)·탕녀(5명) 판정용 생존자. 여행자 제외(G Win, W/Scarlet_Woman "Travellers don't count") */
export function aliveNonTraveller(seats: GrimoireSeat[], roles: Map<string, GrimoireRole>) {
  return seats.filter(s => !s.left && !s.dead && !isTravellerSeat(s, roles)).length;
}

/** 여행자가 아닌 좌석 수 = 진영 분배 기준 인원(W/Setup) */
export function baseSeatCount(seats: GrimoireSeat[], roles: Map<string, GrimoireRole>) {
  return seats.filter(s => !s.left && !isTravellerSeat(s, roles)).length;
}

/**
 * 첫날 밤 하수인·악마 정보(7인 이상)의 기준 인원. 여행자를 넣는지는 공식 문장이 없어 설정값으로 둔다(기본: 넣음).
 * 장난감 제작자·관문 같은 예외는 아직 반영하지 않는다(밤 순서 보완 단계에서 다룬다).
 */
export function evilInfoCount(state: GrimoireState, roles: Map<string, GrimoireRole>) {
  return state.settings.countTravellersForEvilInfo ? totalPlayers(state.seats) : baseSeatCount(state.seats, roles);
}

/** 첫날 밤 하수인·악마 정보(악마의 속임수 포함)를 줄 인원인지 */
export function runsEvilInfo(state: GrimoireState, roles: Map<string, GrimoireRole>) {
  return evilInfoCount(state, roles) >= MIN_PLAYERS_FOR_EVIL_INFO;
}

export function expectedCounts(players: number): TeamCounts | null {
  if (players < 5 || players > MAX_BASE_PLAYERS) return null;
  const [TOWNSFOLK, OUTSIDER, MINION, DEMON] = DISTRIBUTION[players];
  return { TOWNSFOLK, OUTSIDER, MINION, DEMON };
}

export function actualCounts(seats: GrimoireSeat[], roles: Map<string, GrimoireRole>): TeamCounts {
  const counts: TeamCounts = { TOWNSFOLK: 0, OUTSIDER: 0, MINION: 0, DEMON: 0 };
  for (const s of seats) {
    if (s.left) continue;
    const team = roles.get(s.roleKey ?? '')?.team;
    if (team && team in counts) counts[team as BaseTeam]++;
  }
  return counts;
}

/** 좌석의 실제 선악. 직접 지정이 우선이고, 없으면 캐릭터 진영(하수인·악마=악) */
export function isEvilSeat(seat: GrimoireSeat, roles: Map<string, GrimoireRole>): boolean | null {
  if (seat.evil != null) return seat.evil;
  const team = roles.get(seat.roleKey ?? '')?.team;
  if (!team || team === 'TRAVELLER') return null;
  return team === 'MINION' || team === 'DEMON';
}

/** 처형에 필요한 표 수 = 살아 있는 사람(여행자 포함)의 절반 이상 */
export function votesNeeded(seats: GrimoireSeat[]) {
  return Math.ceil(aliveAll(seats) / 2);
}

/** 게임 도중(첫날 밤 이후)인지. 셋업 중 캐릭터 변경은 배정 정정이라 선악을 고정하지 않는다 */
export function isUnderway(state: GrimoireState) {
  return state.phase !== 'SETUP';
}

/**
 * 좌석 캐릭터를 바꾼다. 게임 중이면 공식 규칙대로 바뀌기 전 선악을 evil 에 명시값으로 고정한다
 * (G Alignment "If a player changes character, their alignment stays the same").
 * 선한 사람이 악마가 되거나(마귀할멈) 선한 탕녀가 승계해도 선으로 남는다. 이력과 '본인에게 알리기'도 남긴다.
 * 셋업 중(배정 정정)이거나 빈 자리에 처음 넣는 거면 선악을 캐릭터 진영대로(null) 둔다.
 */
export function changeSeatRole(
  state: GrimoireState,
  seatId: string,
  toKey: string | null,
  roles: Map<string, GrimoireRole>,
  cause: string
): GrimoireState {
  const seat = state.seats.find(s => s.id === seatId);
  if (!seat || seat.roleKey === toKey) return state;
  // 믿는 캐릭터는 그 캐릭터(주정뱅이 등)에 묶인 값이라 캐릭터가 바뀌면 비운다
  if (state.phase === 'SETUP' || seat.roleKey == null) {
    return {
      ...state,
      seats: state.seats.map(s => (s.id === seatId ? { ...s, roleKey: toKey, believedRoleKey: null, evil: null } : s)),
    };
  }
  const alignFrom = isEvilSeat(seat, roles);
  const next: GrimoireSeat = {
    ...seat,
    roleKey: toKey,
    believedRoleKey: null,
    evil: alignFrom,
    roleHistory: [
      ...seat.roleHistory,
      { day: state.day, phase: state.phase, from: seat.roleKey, to: toKey, alignFrom, alignTo: alignFrom, cause },
    ],
  };
  const notices = toKey
    ? [
        ...state.pendingNotices.filter(n => !(n.seatId === seatId && n.kind === 'CHARACTER')),
        { seatId, kind: 'CHARACTER' as const, createdDay: state.day },
      ]
    : state.pendingNotices;
  return { ...state, seats: state.seats.map(s => (s.id === seatId ? next : s)), pendingNotices: notices };
}

// ---------- 진행 단계 · 사망 · 처형 · 추방 ----------

/** 사망 기록 단계. 셋업 중 사망은 첫날 밤으로 본다 */
export function deathPhaseOf(state: GrimoireState): GamePhase {
  return state.phase === 'DAY' ? 'DAY' : 'NIGHT';
}

/** 도구막대·밤 진행 제목에 쓰는 지금 단계 이름 */
export function phaseLabel(state: GrimoireState) {
  if (state.phase === 'SETUP') return '셋업 중';
  if (state.phase === 'NIGHT') return state.day === 1 ? '첫날 밤' : `${state.day}번째 밤`;
  return `${state.day}일째 낮`;
}

export const DEATH_CAUSE_LABEL: Record<DeathCause, string> = {
  EXECUTION: '처형',
  NIGHT: '밤에 사망',
  EXILE: '추방',
  ABILITY: '능력으로 사망',
  OTHER: '사망',
};

export function deathLabel(death: GrimoireDeath) {
  const when = death.phase === 'DAY' ? `${death.day}일째 낮` : death.day === 1 ? '첫날 밤' : `${death.day}번째 밤`;
  return `${when} ${DEATH_CAUSE_LABEL[death.cause]}`;
}

/**
 * 좌석을 죽인다(이미 죽었으면 그대로). 처형이 아닌 사망은 이걸 쓴다.
 * '밤에 사망'은 새벽에 [밤 끝내기]를 누른 뒤 기록해도 같은 번호의 밤 사망이다(N번째 밤 → N일째 낮).
 */
export function killSeat(state: GrimoireState, seatId: string, cause: DeathCause): GrimoireState {
  const phase: GamePhase = cause === 'NIGHT' ? 'NIGHT' : deathPhaseOf(state);
  return {
    ...state,
    seats: state.seats.map(s =>
      s.id === seatId && !s.dead ? { ...s, dead: true, death: { day: state.day, phase, cause } } : s
    ),
  };
}

function emptyDayLog(day: number): DayLog {
  return { day, nominations: [], executions: [], exiles: [], aboutToDieSeatId: null, highWater: 0 };
}

export function dayLogOf(state: GrimoireState, day = state.day): DayLog {
  return state.dayLogs.find(l => l.day === day) ?? emptyDayLog(day);
}

function withDayLog(state: GrimoireState, fn: (log: DayLog) => DayLog): GrimoireState {
  const log = fn(dayLogOf(state));
  const exists = state.dayLogs.some(l => l.day === state.day);
  return {
    ...state,
    dayLogs: exists ? state.dayLogs.map(l => (l.day === state.day ? log : l)) : [...state.dayLogs, log],
  };
}

const BUTCHER_KEY = 'butcher';
const WIKI = 'https://wiki.bloodontheclocktower.com/';

/**
 * 오늘 처형을 더 해도 되는지. 처형은 하루 최대 1회(G Execution)이고 푸주한은 첫 처형 뒤 한 번 더 지명할 수 있다(W/Butcher).
 * 막지는 않는다 — 능력으로 생기는 예외가 있어 경고만 띄운다.
 */
export function executionLimitWarning(state: GrimoireState, roles: Map<string, GrimoireRole>): string | null {
  const done = dayLogOf(state).executions.length;
  if (done === 0) return null;
  const butcher = state.seats.some(s => s.roleKey === BUTCHER_KEY && !s.dead && !s.left);
  if (butcher && done === 1) {
    return `오늘 이미 처형이 1번 있었습니다. 살아 있는 ${roles.get(BUTCHER_KEY)?.name ?? '푸주한'}이 있어 한 번 더 처형할 수 있습니다.`;
  }
  return `오늘 이미 처형이 ${done}번 있었습니다. 처형은 하루 한 번입니다(능력으로 생긴 예외가 아니면 다시 확인하세요).`;
}

export interface SurvivalHint {
  text: string;
  sourceUrl: string;
}

/**
 * 처형돼도 살아남을 수 있는 경우(제안만). 맞는지는 이야기꾼이 정한다 — 취함·중독·등록은 화면이 알 수 없다.
 * 리마인더는 그 리마인더를 준 캐릭터 이름(source)으로 찾는다.
 */
export function executionSurvivalHints(
  state: GrimoireState,
  seatId: string,
  roles: Map<string, GrimoireRole>
): SurvivalHint[] {
  const seat = state.seats.find(s => s.id === seatId);
  if (!seat) return [];
  const hints: SurvivalHint[] = [];
  const nameOf = (key: string, fallback: string) => roles.get(key)?.name ?? fallback;
  const aliveRole = (key: string) => state.seats.some(s => s.roleKey === key && !s.dead && !s.left);
  const hasReminderFrom = (key: string) => {
    const name = roles.get(key)?.name;
    return !!name && seat.reminders.some(m => m.source === name);
  };
  const own = seat.roleKey;

  if (aliveRole('pacifist') && isEvilSeat(seat, roles) === false) {
    hints.push({ text: `${nameOf('pacifist', '평화주의자')}: 처형된 선한 플레이어가 죽지 않을 수 있습니다`, sourceUrl: `${WIKI}Pacifist` });
  }
  if (hasReminderFrom('devilsadvocate')) {
    hints.push({ text: `${nameOf('devilsadvocate', '악마의 변호사')}가 고른 사람이면 처형으로 죽지 않습니다`, sourceUrl: `${WIKI}Devil%27s_Advocate` });
  }
  if (hasReminderFrom('tealady')) {
    hints.push({ text: `${nameOf('tealady', '찻집 여인')}의 이웃: 두 이웃이 모두 선하면 죽지 않습니다`, sourceUrl: `${WIKI}Tea_Lady` });
  }
  if (own === 'sailor') hints.push({ text: `${nameOf('sailor', '선원')}: 맑으면 죽지 않습니다`, sourceUrl: `${WIKI}Sailor` });
  if (own === 'fool') hints.push({ text: `${nameOf('fool', '어릿광대')}: 처음 죽을 때는 죽지 않습니다`, sourceUrl: `${WIKI}Fool` });
  if (own === 'vizier') hints.push({ text: `${nameOf('vizier', '재상')}: 낮에는 죽지 않습니다`, sourceUrl: `${WIKI}Vizier` });
  if (own === 'lleech') hints.push({ text: `${nameOf('lleech', '거무리')}: 숙주가 살아 있으면 죽지 않습니다`, sourceUrl: `${WIKI}Lleech` });
  if (own === 'zombuul') {
    hints.push({ text: `${nameOf('zombuul', '좀버얼')}: 처음 죽을 때는 살아 있지만 죽은 것처럼 보입니다`, sourceUrl: `${WIKI}Zombuul` });
  }
  if (own === 'psychopath') {
    hints.push({ text: `${nameOf('psychopath', '사이코패스')}: 가위바위보에서 이기면 죽지 않습니다`, sourceUrl: `${WIKI}Psychopath` });
  }
  if (state.fabled.includes('ventriloquist')) {
    hints.push({ text: `${nameOf('ventriloquist', '복화술사')}: 다른 캐릭터라고 우기면 죽지 않을 수 있습니다`, sourceUrl: `${WIKI}Ventriloquist` });
  }
  return hints;
}

/**
 * 처형을 기록한다. 사망 여부는 이야기꾼이 고른 값을 따르고, 살아남거나 이미 죽은 사람이어도 그날의 처형 1회로 센다.
 * 'N일째 처형' 리마인더는 토큰에 남긴다(복기용, v1 판 이관도 이 문구로 처형 사망을 되살린다).
 */
export function applyExecution(
  state: GrimoireState,
  seatId: string,
  opts: { died: boolean; survivedReason: string | null; route: Execution['route'] }
): GrimoireState {
  const seat = state.seats.find(s => s.id === seatId);
  if (!seat) return state;
  const wasAlreadyDead = seat.dead;
  const execution: Execution = {
    seatId,
    died: !wasAlreadyDead && opts.died,
    survivedReason: !wasAlreadyDead && !opts.died ? opts.survivedReason : null,
    wasAlreadyDead,
    route: opts.route,
    characterAtExecution: seat.roleKey,
  };
  const reminderText = execution.died || wasAlreadyDead ? `${state.day}일째 처형` : `${state.day}일째 처형(생존)`;
  const logged = withDayLog(state, log => ({ ...log, executions: [...log.executions, execution] }));
  return {
    ...logged,
    seats: logged.seats.map(s =>
      s.id === seatId
        ? {
            ...s,
            ...(execution.died
              ? { dead: true, death: { day: state.day, phase: deathPhaseOf(state), cause: 'EXECUTION' as const } }
              : {}),
            reminders: [...s.reminders, { id: newSeatId(), text: reminderText, source: null }],
          }
        : s
    ),
  };
}

/** 추방 필요 표 = 게임에 남은 전체 플레이어의 절반 이상(RB p.19, 사망자 포함) */
export function exileNeeded(seats: GrimoireSeat[]) {
  return Math.ceil(totalPlayers(seats) / 2);
}

/** 이 여행자를 오늘 이미 추방 요청했는지(같은 여행자는 하루 1회, RB p.19) */
export function exiledToday(state: GrimoireState, seatId: string) {
  return dayLogOf(state).exiles.some(e => e.seatId === seatId);
}

/**
 * 추방을 기록한다. 지지 표는 능력과 무관하게 1인 1표이고 유령 투표를 쓰지 않는다(G Exile).
 * 처형이 아니라 처형 한도·'N일째 처형'과 상관없다.
 */
export function applyExile(
  state: GrimoireState,
  seatId: string,
  opts: { supporters: number; survived: boolean }
): GrimoireState {
  const seat = state.seats.find(s => s.id === seatId);
  if (!seat) return state;
  const needed = exileNeeded(state.seats);
  const passed = opts.supporters >= needed;
  const exile: Exile = { seatId, supporters: opts.supporters, needed, passed, ...(passed ? { survived: opts.survived } : {}) };
  const logged = withDayLog(state, log => ({ ...log, exiles: [...log.exiles, exile] }));
  return passed && !opts.survived ? killSeat(logged, seatId, 'EXILE') : logged;
}

/**
 * 여행자 선악 지정. 악으로 정하면 그 자리에서 악마가 누구인지 알려 줘야 한다(하수인은 안 알림, 악마의 속임수 없음 — RB p.18).
 */
export function setTravellerAlignment(state: GrimoireState, seatId: string, evil: boolean): GrimoireState {
  const seat = state.seats.find(s => s.id === seatId);
  if (!seat) return state;
  if (seat.evil === evil) return state;
  const others = state.pendingNotices.filter(n => !(n.seatId === seatId && n.kind === 'EVIL_TRAVELLER_DEMON'));
  return {
    ...state,
    seats: state.seats.map(s => (s.id === seatId ? { ...s, evil } : s)),
    // 선으로 되돌리면 아직 안 알린 악마 알림도 지운다
    pendingNotices: evil ? [...others, { seatId, kind: 'EVIL_TRAVELLER_DEMON', createdDay: state.day }] : others,
  };
}

/** 선악을 아직 정하지 않은 여행자(여행자는 선악을 이야기꾼이 정한다 — 캐릭터만으로는 알 수 없다) */
export function travellerNeedsAlignment(seat: GrimoireSeat, roles: Map<string, GrimoireRole>) {
  return !seat.left && isTravellerSeat(seat, roles) && seat.evil == null;
}

/** 살아 있는(떠나지 않은) 악마 좌석. 악마 판정은 선악이 아니라 실제 캐릭터로 한다 */
export function demonSeats(state: GrimoireState, roles: Map<string, GrimoireRole>) {
  return state.seats.filter(s => !s.left && !s.dead && roles.get(s.roleKey ?? '')?.team === 'DEMON');
}

export interface NightItem {
  key: string; // 체크 키(밤 단계 + 캐릭터 키)
  role: GrimoireRole;
  order: number;
  text?: string | null;
  seats: GrimoireSeat[]; // 이 캐릭터를 가진 좌석(밤 특수 단계·전설이면 빈 배열)
  allDead: boolean;
  // 오늘 밤에 죽은 좌석이 있다(까마귀지기처럼 죽은 밤에 깨우는 캐릭터가 있어 숨기지 않는다)
  diedTonight: boolean;
  // 그 외 밤에 전부 이전에 죽은 캐릭터 — 보통 깨우지 않아 기본으로 숨긴다
  hiddenDead: boolean;
  // 이번 판에 하지 않는 단계(7명 미만의 하수인·악마 정보). 숨기면 빠진 것처럼 보여 흐리게 남긴다
  skippedReason?: string;
}

/** 죽은 그 밤에도 깨우는 캐릭터(죽음으로 능력이 발동한다). 나머지는 죽으면 능력이 없어 깨우지 않는다 */
export const ACTS_WHEN_DEAD = new Set(['ravenkeeper', 'sage', 'farmer', 'moonchild', 'banshee']);

/** 이 단계를 깨우지 않아야 하는지 — 그 캐릭터 자리가 전부 죽었고 죽음으로 발동하는 캐릭터가 아니다 */
export function sleepsDead(item: NightItem) {
  return item.allDead && !ACTS_WHEN_DEAD.has(item.role.key);
}

/** 지금 게임에 있는 캐릭터만 골라 밤 순서대로 */
export function nightItems(state: GrimoireState, tab: NightTab): NightItem[] {
  const roles = roleMap(state.data);
  const items: NightItem[] = [];
  const orderOf = (r: GrimoireRole) => (tab === 'first' ? r.firstNightOrder : r.otherNightOrder);
  const textOf = (r: GrimoireRole) => (tab === 'first' ? r.firstNightText : r.otherNightText);

  for (const step of state.data.nightSteps) {
    const order = orderOf(step);
    if (order == null) continue;
    const skipped = EVIL_INFO_KEYS.includes(step.key) && !runsEvilInfo(state, roles);
    items.push({
      key: `${tab}:${step.key}`,
      role: step,
      order,
      text: textOf(step),
      seats: [],
      allDead: false,
      diedTonight: false,
      hiddenDead: false,
      ...(skipped
        ? { skippedReason: `${evilInfoCount(state, roles)}명이라 이번 판은 하지 않습니다(${MIN_PLAYERS_FOR_EVIL_INFO}명 미만은 공식 규칙상 생략)` }
        : {}),
    });
  }

  // 떠난 여행자는 더 깨우지 않는다
  const present = state.seats.filter(s => !s.left);
  // 주정뱅이·꼭두각시·미치광이는 믿는 캐릭터 차례에 깨운다(본인은 그 캐릭터인 줄 안다)
  const inPlay = new Set<string>([
    ...present.map(s => s.roleKey ?? ''),
    ...present.map(s => s.believedRoleKey ?? ''),
    ...state.fabled,
  ]);
  inPlay.delete('');
  for (const key of inPlay) {
    const role = roles.get(key);
    if (!role) continue;
    const order = orderOf(role);
    if (order == null) continue;
    const seats = present.filter(s => s.roleKey === key || s.believedRoleKey === key);
    const allDead = seats.length > 0 && seats.every(s => s.dead);
    const diedTonight = seats.some(
      s => s.dead && s.death?.day === state.day && s.death?.phase === 'NIGHT' && state.phase === 'NIGHT'
    );
    items.push({
      key: `${tab}:${key}`,
      role,
      order,
      text: textOf(role),
      seats,
      allDead,
      diedTonight,
      hiddenDead: tab === 'other' && allDead && !diedTonight,
    });
  }
  return items.sort((a, b) => a.order - b.order);
}

/** 이 게임(좌석·전설)에 실제로 걸린 징크스 */
export function activeJinxes(state: GrimoireState) {
  const inPlay = new Set<string>([...state.seats.map(s => s.roleKey ?? ''), ...state.fabled]);
  return state.data.jinxes.filter(j => inPlay.has(j.roleA) && inPlay.has(j.roleB));
}

/** 리마인더 후보: 게임에 있는 캐릭터의 리마인더 + 스크립트 전체의 전역 리마인더 */
export function reminderOptions(state: GrimoireState) {
  const roles = roleMap(state.data);
  const options: { text: string; source: string }[] = [];
  const seen = new Set<string>();
  const push = (text: string, source: string) => {
    const k = `${source}|${text}`;
    if (seen.has(k)) return;
    seen.add(k);
    options.push({ text, source });
  };
  const inPlay = new Set<string>([...state.seats.map(s => s.roleKey ?? ''), ...state.fabled]);
  for (const key of inPlay) {
    const role = roles.get(key);
    role?.reminders.forEach(t => push(t, role.name));
  }
  for (const role of state.data.roles) {
    role.remindersGlobal.forEach(t => push(t, role.name));
  }
  return options;
}

export function shuffle<T>(list: T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 주머니에 넣지 않는 캐릭터(special selection bag-disabled). 서버가 special 을 내려주지 않을 때를 위해 공식 목록을 같이 둔다.
 * 주정뱅이·꼭두각시는 다른 캐릭터 토큰을 받고, 릴 몬스타는 좌석 캐릭터가 아니다(README bag-disabled, W/Lil%27_Monsta).
 */
const BAG_DISABLED_KEYS = new Set(['drunk', 'marionette', 'lilmonsta']);

export function isBagDisabled(role: GrimoireRole) {
  if (role.special?.some(sp => sp.type === 'selection' && sp.name === 'bag-disabled')) return true;
  return BAG_DISABLED_KEYS.has(role.key);
}

export type RandomAssignment =
  | { ok: true; assigned: Record<string, string>; setupRoles: GrimoireRole[] }
  | { ok: false; message: string };

/**
 * 공식 인원 분배대로 캐릭터를 무작위로 뽑아 여행자가 아닌 좌석에 나눠 준다.
 * 주머니에 넣지 않는 캐릭터(주정뱅이 등)는 후보에서 뺀다.
 * 남작처럼 셋업을 바꾸는 캐릭터는 반영하지 않는다 — 뽑힌 것을 setupRoles 로 돌려줘 화면이 알린다.
 */
export function randomAssignment(seats: GrimoireSeat[], data: GrimoireData): RandomAssignment {
  const roles = roleMap(data);
  const targets = seats.filter(s => !s.left && !isTravellerSeat(s, roles));
  if (targets.length > MAX_BASE_PLAYERS) {
    return {
      ok: false,
      message: `여행자가 아닌 자리가 ${targets.length}명입니다. ${MAX_BASE_PLAYERS}명을 넘는 인원은 여행자여야 합니다.`,
    };
  }
  const counts = expectedCounts(targets.length);
  if (!counts) return { ok: false, message: '여행자를 뺀 인원이 5명 이상이어야 무작위 배정을 할 수 있습니다.' };
  const picked: GrimoireRole[] = [];
  for (const team of BASE_TEAMS) {
    const pool = shuffle(data.roles.filter(r => r.team === team && !isBagDisabled(r)));
    if (pool.length < counts[team]) {
      return { ok: false, message: '스크립트에 진영별 캐릭터가 모자랍니다(주정뱅이처럼 주머니에 넣지 않는 캐릭터는 뺍니다).' };
    }
    picked.push(...pool.slice(0, counts[team]));
  }
  const shuffled = shuffle(picked);
  const assigned: Record<string, string> = {};
  targets.forEach((s, i) => (assigned[s.id] = shuffled[i].key));
  return { ok: true, assigned, setupRoles: picked.filter(r => r.setup) };
}

const SCARLET_WOMAN_KEY = 'scarletwoman';
/** 탕녀 능력 기준 인원(공식: 악마가 죽기 직전 5명 이상, 여행자 제외) */
const SCARLET_WOMAN_MIN_ALIVE = 5;

export interface DemonDeath {
  demonSeat: GrimoireSeat;
  demon: GrimoireRole;
  aliveBefore: number; // 악마가 죽기 직전 생존 인원(여행자 제외)
  scarletWoman: GrimoireSeat | null; // 능력 조건을 채운 살아 있는 탕녀
  otherDemonsAlive: number; // 다른 살아 있는 악마 수
}

/**
 * 악마가 방금 죽은 상황 판정. state 는 죽음이 반영된 뒤의 상태다.
 * 인원은 공식 위키대로 "죽기 직전" 기준이라 죽은 악마 본인을 더해 센다.
 */
export function demonDeathCheck(state: GrimoireState, demonSeatId: string): DemonDeath | null {
  const roles = roleMap(state.data);
  const demonSeat = state.seats.find(s => s.id === demonSeatId);
  const demon = demonSeat ? roles.get(demonSeat.roleKey ?? '') : undefined;
  if (!demonSeat || !demon || demon.team !== 'DEMON') return null;
  const aliveAfter = aliveNonTraveller(state.seats, roles);
  const aliveBefore = aliveAfter + (demonSeat.dead && !demonSeat.left ? 1 : 0);
  const sw = state.seats.find(s => s.roleKey === SCARLET_WOMAN_KEY && !s.dead && !s.left) ?? null;
  return {
    demonSeat,
    demon,
    aliveBefore,
    scarletWoman: sw && aliveBefore >= SCARLET_WOMAN_MIN_ALIVE ? sw : null,
    otherDemonsAlive: state.seats.filter(
      s => s.id !== demonSeat.id && !s.dead && !s.left && roles.get(s.roleKey ?? '')?.team === 'DEMON'
    ).length,
  };
}

/**
 * 악마의 속임수: 게임에 없는 선한 캐릭터. 기본은 주민 2 + 외지인 1(RB p.25 권장), 외지인이 모자라면 주민으로 채운다.
 * 주정뱅이·꼭두각시가 믿는 캐릭터도 "게임에 있다"고 본다 — 악마의 속임수로 주면 그 사람과 겹친다.
 * 주머니에 넣지 않는 캐릭터(주정뱅이)는 자기라고 주장할 수 없는 캐릭터라 뺀다.
 */
export function pickBluffs(state: GrimoireState): string[] {
  const used = new Set<string>();
  for (const s of state.seats) {
    if (s.roleKey) used.add(s.roleKey);
    if (s.believedRoleKey) used.add(s.believedRoleKey);
  }
  const pool = (team: ClockTowerCharacterType) =>
    shuffle(state.data.roles.filter(r => r.team === team && !used.has(r.key) && !isBagDisabled(r)));
  const outsiders = pool('OUTSIDER').slice(0, 1);
  const picked = [...pool('TOWNSFOLK').slice(0, 3 - outsiders.length), ...outsiders];
  return shuffle(picked).map(r => r.key);
}

/**
 * 자기 캐릭터를 다르게 아는 캐릭터. roleKey 는 실제 캐릭터, believedRoleKey 는 본인이 믿는 캐릭터다.
 * [본인에게 보여주기]가 실제 캐릭터를 보여주면 정체가 드러나므로 믿는 캐릭터를 꼭 정해야 한다.
 * 근거: W/Drunk "You think you are a Townsfolk", W/Marionette "You think you are a good character", W/Lunatic "You think you are a Demon"
 */
export const PERCEPTION: Record<string, { believed: 'TOWNSFOLK' | 'GOOD' | 'DEMON'; label: string }> = {
  drunk: { believed: 'TOWNSFOLK', label: '스스로 주민이라고 믿습니다' },
  marionette: { believed: 'GOOD', label: '스스로 선한 캐릭터라고 믿습니다' },
  lunatic: { believed: 'DEMON', label: '스스로 악마라고 믿습니다' },
};

/** 믿는 캐릭터 후보(스크립트 안). 주정뱅이=주민, 꼭두각시=주민·외지인, 미치광이=악마 */
export function believedCandidates(roleKey: string | null, data: GrimoireData): GrimoireRole[] {
  const rule = roleKey ? PERCEPTION[roleKey] : undefined;
  if (!rule) return [];
  return data.roles.filter(r => {
    if (r.key === roleKey || isBagDisabled(r)) return false;
    if (rule.believed === 'TOWNSFOLK') return r.team === 'TOWNSFOLK';
    if (rule.believed === 'GOOD') return r.team === 'TOWNSFOLK' || r.team === 'OUTSIDER';
    return r.team === 'DEMON';
  });
}

/**
 * 본인에게 보여줄 캐릭터. 믿는 캐릭터가 있으면 그것, 다르게 믿는 캐릭터인데 아직 안 정했으면 null(보여주면 안 된다).
 */
export function shownRole(seat: GrimoireSeat, roles: Map<string, GrimoireRole>): GrimoireRole | null {
  if (seat.believedRoleKey) return roles.get(seat.believedRoleKey) ?? null;
  if (seat.roleKey && PERCEPTION[seat.roleKey]) return null;
  return roles.get(seat.roleKey ?? '') ?? null;
}

export function isBaseTeam(team: ClockTowerCharacterType | null | undefined): team is BaseTeam {
  return !!team && (BASE_TEAMS as readonly string[]).includes(team);
}

/** 리마인더의 source 는 캐릭터 이름으로 저장돼 있다(예전 판 호환). 이름으로 스크립트 캐릭터를 찾는다 */
export function reminderSourceRole(source: string | null | undefined, data: GrimoireData): GrimoireRole | null {
  if (!source) return null;
  return data.roles.find(r => r.name === source) ?? null;
}
