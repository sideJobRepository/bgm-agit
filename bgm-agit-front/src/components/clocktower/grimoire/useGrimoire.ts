import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  GamePhase,
  GrimoireData,
  GrimoireDeath,
  GrimoirePhase,
  GrimoireSeat,
  GrimoireSettings,
  GrimoireState,
} from '../../../types/clocktower.ts';

// 진행 상태는 이 기기에만 둔다. 서버에 두면 누가 악마인지 다른 사람이 조회할 수 있게 된다
// 키는 v1 시절 그대로 두고 version 필드로 구분한다(키를 바꾸면 진행 중이던 판을 못 찾는다)
const STORAGE_KEY = 'clocktowerGrimoire_v1';
const BACKUP_PREFIX = 'clocktowerGrimoire_backup_';
const UNDO_LIMIT = 30;

const DEFAULT_SETTINGS: GrimoireSettings = {
  countTravellersForEvilInfo: true,
  suggestionsEnabled: true,
};

type Loaded = { state: GrimoireState | null; notice: string | null };

/** v1 판(좌석에 사망·선악·리마인더만 있던 시절)을 v2 로 옮긴다. 아무것도 버리지 않는다 */
export function migrateV1toV2(v1: Record<string, unknown>): GrimoireState {
  const day = typeof v1.day === 'number' ? v1.day : 1;
  const nightTab = v1.nightTab === 'other' ? 'other' : 'first';
  const nightChecked = Array.isArray(v1.nightChecked) ? (v1.nightChecked as string[]) : [];
  const rawSeats = Array.isArray(v1.seats) ? (v1.seats as Record<string, unknown>[]) : [];
  const anyDead = rawSeats.some(s => !!s.dead);
  // v1 엔 진행 단계가 없었다. 첫날 밤 탭이고 아무 진행 흔적이 없으면 아직 셋업 중으로 본다
  const phase: GrimoirePhase =
    day === 1 && nightTab === 'first'
      ? nightChecked.length === 0 && !anyDead
        ? 'SETUP'
        : 'NIGHT'
      : 'DAY';
  const deathPhase: GamePhase = phase === 'SETUP' ? 'NIGHT' : phase;

  const seats = rawSeats.map(raw => {
    const seat = raw as unknown as GrimoireSeat;
    const reminders = Array.isArray(seat.reminders) ? seat.reminders : [];
    let death: GrimoireDeath | null = null;
    if (seat.dead) {
      // 처형 버튼이 남긴 'N일째 처형' 리마인더로 처형 사망을 되살린다. 모르면 원인 '기타'
      const executed = reminders.map(m => /^(\d+)일째 처형$/.exec(m.text)).find(Boolean);
      death = executed
        ? { day: Number(executed[1]), phase: 'DAY', cause: 'EXECUTION' }
        : { day, phase: deathPhase, cause: 'OTHER' };
    }
    return {
      ...seat,
      memberId: seat.memberId ?? null,
      roleKey: seat.roleKey ?? null,
      believedRoleKey: null,
      dead: !!seat.dead,
      death,
      ghostVoteUsed: !!seat.ghostVoteUsed,
      evil: seat.evil ?? null,
      left: false,
      reminders,
      roleHistory: [],
    };
  });

  return {
    ...(v1 as unknown as GrimoireState),
    version: 2,
    ownerId: null, // 열 때 지금 로그인한 회원으로 채운다
    seats,
    fabled: Array.isArray(v1.fabled) ? (v1.fabled as string[]) : [],
    nightTab,
    nightChecked,
    day,
    phase,
    notes: typeof v1.notes === 'string' ? v1.notes : '',
    dayLogs: [],
    settings: DEFAULT_SETTINGS,
    pendingNotices: [],
  };
}

/** v2 저장본에 빠진 필드를 채운다(같은 v2 안에서 필드가 늘어난 경우 대비) */
function normalizeV2(raw: GrimoireState): GrimoireState {
  return {
    ...raw,
    ownerId: raw.ownerId ?? null,
    fabled: raw.fabled ?? [],
    nightChecked: raw.nightChecked ?? [],
    phase: raw.phase ?? 'SETUP',
    notes: raw.notes ?? '',
    dayLogs: raw.dayLogs ?? [],
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) },
    pendingNotices: raw.pendingNotices ?? [],
    seats: raw.seats.map(s => ({
      ...s,
      believedRoleKey: s.believedRoleKey ?? null,
      death: s.death ?? null,
      left: !!s.left,
      reminders: s.reminders ?? [],
      roleHistory: s.roleHistory ?? [],
    })),
  };
}

/** 모르는 버전은 버리지 않고 따로 복사해 둔다(더 새 앱에서 저장한 판일 수 있다) */
function backupUnknown(raw: string): string | null {
  try {
    const key = `${BACKUP_PREFIX}${Date.now()}`;
    localStorage.setItem(key, raw);
    return key;
  } catch {
    return null;
  }
}

function parse(raw: string | null): Loaded {
  if (!raw) return { state: null, notice: null };
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    const key = backupUnknown(raw);
    return {
      state: null,
      notice: `저장된 진행판을 읽지 못했습니다.${key ? ` 원본은 ${key} 에 보관했습니다.` : ''}`,
    };
  }
  const valid = !!parsed && !!parsed.data && Array.isArray(parsed.seats);
  if (valid && parsed.version === 1) return { state: migrateV1toV2(parsed), notice: null };
  if (valid && parsed.version === 2)
    return { state: normalizeV2(parsed as unknown as GrimoireState), notice: null };
  const key = backupUnknown(raw);
  return {
    state: null,
    notice: `알 수 없는 형식(version ${String(parsed?.version)})의 진행판이 있었습니다.${
      key ? ` 지우지 않고 ${key} 에 보관했습니다.` : ''
    }`,
  };
}

function load(): Loaded {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    return parse(raw);
  } catch {
    // 변환 중 예외(옛 판의 좌석 데이터가 이상한 경우 등). 그냥 null 을 돌려주면 새 게임이 원본을 덮어쓰므로 먼저 보관한다
    const key = raw ? backupUnknown(raw) : null;
    return {
      state: null,
      notice: key ? `저장된 진행판을 열지 못했습니다. 원본은 ${key} 에 보관했습니다.` : null,
    };
  }
}

function save(state: GrimoireState | null) {
  try {
    if (state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 사파리 개인 정보 보호 모드 등 저장 불가 — 진행은 계속된다(새로고침하면 사라짐)
  }
}

export function newSeatId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** 빈 좌석(진행판 시작·여행자 추가) */
export function createSeat(memberId: number | null, name: string): GrimoireSeat {
  return {
    id: newSeatId(),
    memberId,
    name,
    roleKey: null,
    believedRoleKey: null,
    dead: false,
    death: null,
    ghostVoteUsed: false,
    evil: null,
    left: false,
    reminders: [],
    roleHistory: [],
  };
}

export function createState(
  data: GrimoireData,
  seats: GrimoireSeat[],
  ownerId: number | null
): GrimoireState {
  return {
    version: 2,
    ownerId,
    data,
    seats,
    fabled: [],
    nightTab: 'first',
    nightChecked: [],
    day: 1,
    phase: 'SETUP',
    notes: '',
    startedAt: new Date().toISOString(),
    dayLogs: [],
    settings: DEFAULT_SETTINGS,
    pendingNotices: [],
  };
}

/**
 * 되돌리기로 옛 상태를 꺼내되, 기록 없이 조용히 바꾼 값(메모·이름·밤 체크)은 지금 값을 유지한다.
 * 안 그러면 메모를 쓰고 되돌리기를 누를 때 그 사이 쓴 메모가 사라진다.
 */
function mergeSilent(past: GrimoireState, now: GrimoireState): GrimoireState {
  const names = new Map(now.seats.map(s => [s.id, s.name]));
  return {
    ...past,
    notes: now.notes,
    nightChecked: now.nightChecked,
    seats: past.seats.map(s => (names.has(s.id) ? { ...s, name: names.get(s.id) as string } : s)),
  };
}

/**
 * 진행판 상태 + 자동 저장 + 되돌리기.
 * update 로 바꾼 것만 되돌리기 대상이다(메모 입력·밤 체크처럼 자주 바뀌는 건 updateSilently).
 * userId 가 저장한 회원(ownerId)과 다르면 판을 열지 않는다 — 같은 태블릿에 다른 이야기꾼이 로그인한 경우.
 */
export function useGrimoire(userId: number | null) {
  const [loaded] = useState<Loaded>(() => load());
  const [stored, setStateRaw] = useState<GrimoireState | null>(loaded.state);
  // 갱신 함수 안에서 기록을 쌓으면 StrictMode 가 두 번 불러 두 번 쌓인다. 최신 상태를 ref 로 들고 바깥에서 계산한다
  const current = useRef<GrimoireState | null>(stored);
  const history = useRef<GrimoireState[]>([]);
  const [undoCount, setUndoCount] = useState(0);
  // 다른 탭(창)이 같은 판을 저장했다. 이 화면에서 계속 저장하면 그쪽 내용을 덮어쓴다
  const [externalChange, setExternalChange] = useState(false);

  const blocked = !!stored && stored.ownerId != null && userId != null && stored.ownerId !== userId;
  // 로그인 정보가 오기 전에는 누구 판인지 판정할 수 없어 열지 않는다
  const state = blocked || userId == null ? null : stored;

  // 저장은 바꿀 때만 한다. 마운트·차단 상태에서 null 을 저장하면 남의 판을 지워 버린다
  const setState = useCallback((next: GrimoireState | null) => {
    current.current = next;
    setStateRaw(next);
    save(next);
  }, []);

  // 옛 판(마이그레이션)·로그인 전에 만든 판은 주인이 없다. 지금 로그인한 회원으로 채운다
  useEffect(() => {
    if (stored && stored.ownerId == null && userId != null)
      setState({ ...stored, ownerId: userId });
  }, [stored, userId, setState]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setExternalChange(true);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 바뀐 상태를 돌려준다(승패 제안처럼 바뀐 결과로 판정할 때 쓴다)
  const update = useCallback(
    (fn: (prev: GrimoireState) => GrimoireState): GrimoireState | null => {
      const prev = current.current;
      if (!prev) return null;
      history.current = [...history.current, prev].slice(-UNDO_LIMIT);
      setUndoCount(history.current.length);
      const next = fn(prev);
      setState(next);
      return next;
    },
    [setState]
  );

  const updateSilently = useCallback(
    (fn: (prev: GrimoireState) => GrimoireState) => {
      const prev = current.current;
      if (prev) setState(fn(prev));
    },
    [setState]
  );

  const undo = useCallback(() => {
    const last = history.current[history.current.length - 1];
    const now = current.current;
    if (!last || !now) return;
    history.current = history.current.slice(0, -1);
    setUndoCount(history.current.length);
    setState(mergeSilent(last, now));
  }, [setState]);

  const start = useCallback(
    (next: GrimoireState) => {
      history.current = [];
      setUndoCount(0);
      setExternalChange(false);
      setState(next);
    },
    [setState]
  );

  const reset = useCallback(() => {
    history.current = [];
    setUndoCount(0);
    setExternalChange(false);
    setState(null);
  }, [setState]);

  /** 다른 탭이 저장한 내용으로 이 화면을 다시 맞춘다 */
  const reload = useCallback(() => {
    const next = load().state;
    history.current = [];
    setUndoCount(0);
    setExternalChange(false);
    current.current = next;
    setStateRaw(next);
  }, []);

  const updateSeat = useCallback(
    (seatId: string, patch: Partial<GrimoireSeat>) =>
      update(prev => ({
        ...prev,
        seats: prev.seats.map(s => (s.id === seatId ? { ...s, ...patch } : s)),
      })),
    [update]
  );

  return {
    state,
    update,
    updateSilently,
    updateSeat,
    undo,
    canUndo: undoCount > 0,
    start,
    reset,
    reload,
    // 다른 회원이 저장한 판이 이 기기에 있다(열지 않음)
    blockedByOtherOwner: blocked,
    loadNotice: loaded.notice,
    externalChange,
  };
}

/** 밤 진행 중 화면이 꺼지지 않게. 지원하지 않는 브라우저는 그냥 넘어간다 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    type WakeLockSentinel = { release: () => Promise<void> };
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinel> };
    };
    if (!nav.wakeLock) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = () => {
      nav.wakeLock
        ?.request('screen')
        .then(s => {
          if (cancelled) s.release().catch(() => {});
          else sentinel = s;
        })
        .catch(() => {});
    };
    // 탭을 다녀오면 브라우저가 잠금을 풀어서 다시 건다
    const onVisible = () => document.visibilityState === 'visible' && acquire();
    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}
