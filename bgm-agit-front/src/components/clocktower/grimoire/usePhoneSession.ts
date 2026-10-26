import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../../../utils/axiosInstance.ts';
import { toast } from '../../../utils/toast';
import type {
  GrimoirePhoneSession,
  GrimoireRole,
  GrimoireSeatInfo,
  GrimoireState,
  PhoneSeatPayload,
  PhoneSessionStatus,
} from '../../../types/clocktower.ts';
import {
  isEvilSeat,
  roleMap,
  runsEvilInfo,
  evilInfoCount,
  MIN_PLAYERS_FOR_EVIL_INFO,
  PERCEPTION,
  shownRole,
} from './grimoireRules.ts';

const BASE = '/bgm-agit/clocktower-sessions';
// 좌석이 바뀐 뒤 이만큼 조용하면 바뀐 좌석만 다시 보낸다(캐릭터를 연달아 고칠 때 요청이 몰리지 않게)
const SYNC_DEBOUNCE_MS = 1500;
const STATUS_POLL_MS = 10_000;
const RETRY_MS = 10_000;

export interface SeatViewStatus {
  version: number;
  viewedVersion: number;
}

type Update = (fn: (prev: GrimoireState) => GrimoireState) => void;

function errorMessage(e: unknown, fallback: string) {
  return (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

/**
 * 회원 좌석마다 그 플레이어에게 보여줄 것만 만든다.
 * - 캐릭터는 shownRole(주정뱅이·꼭두각시·미치광이는 믿는 캐릭터, 믿는 캐릭터가 없으면 null) — 진짜 정체는 올리지 않는다
 * - 선악은 여행자이거나 이야기꾼이 직접 정한 경우만(나머지는 캐릭터 진영으로 알 수 있다)
 * - 자리 번호는 마도서 순서 1부터. 회원이 아닌 자리(테스트 손님)는 뺀다
 */
export function phoneSeats(state: GrimoireState, roles: Map<string, GrimoireRole>): PhoneSeatPayload[] {
  const infos = state.clocktowerSession?.infos ?? {};
  const result: PhoneSeatPayload[] = [];
  state.seats.forEach((seat, i) => {
    if (seat.memberId == null) return;
    const shown = shownRole(seat, roles);
    const team = roles.get(seat.roleKey ?? '')?.team;
    // 믿는 캐릭터를 보여주는 자리(주정뱅이·꼭두각시·미치광이)에 진짜 기준 선악을 붙이면 "주민 + 악 배지"처럼 정체가 드러난다.
    // 이 자리는 선악을 보내지 않아 믿는 캐릭터의 기본 진영으로 보이게 한다
    const believes = !!seat.roleKey && seat.roleKey in PERCEPTION;
    const evil = !believes && (seat.evil != null || team === 'TRAVELLER') ? isEvilSeat(seat, roles) : null;
    // 악 팀 정보는 지금 실제로 악마·하수인인 자리에만. 배정을 고쳐 선한 쪽이 되면 빠지고, 이 변화가 다시 보내져 휴대폰에서도 사라진다
    const evilTeam = (team === 'DEMON' || team === 'MINION') && seat.roleKey !== 'marionette';
    // 키 순서를 고정해 JSON 비교가 흔들리지 않게 한다
    result.push({
      memberId: seat.memberId,
      seatNo: i + 1,
      roleKey: shown?.key ?? null,
      evil,
      info: evilTeam ? (infos[String(seat.memberId)] ?? null) : null,
    });
  });
  return result;
}

const sig = (p: PhoneSeatPayload) => JSON.stringify(p);

export type EvilInfoResult =
  | { ok: true; infos: Record<string, GrimoireSeatInfo>; warnings: string[] }
  | { ok: false; message: string };

/**
 * 첫날 밤 악 팀 정보. 악마는 하수인 + 악마의 속임수, 하수인은 악마 + 다른 하수인을 받는다.
 * 꼭두각시는 자기가 하수인인 줄 모르므로 받지 않고 다른 하수인 목록에도 넣지 않는다(악마는 꼭두각시를 안다).
 */
export function buildEvilInfo(state: GrimoireState): EvilInfoResult {
  const roles = roleMap(state.data);
  if (!runsEvilInfo(state, roles)) {
    return {
      ok: false,
      message: `${evilInfoCount(state, roles)}명이라 첫날 밤 하수인·악마 정보 단계가 없습니다(${MIN_PLAYERS_FOR_EVIL_INFO}명 미만).`,
    };
  }
  const present = state.seats.map((s, i) => ({ seat: s, no: i + 1 })).filter(x => !x.seat.left);
  const teamOf = (key: string | null) => roles.get(key ?? '')?.team;
  const demons = present.filter(x => teamOf(x.seat.roleKey) === 'DEMON');
  const minions = present.filter(x => teamOf(x.seat.roleKey) === 'MINION');
  if (demons.length === 0) return { ok: false, message: '악마 자리가 없습니다. 캐릭터를 먼저 정해 주세요.' };
  const bluffs = (state.bluffs ?? []).map(k => roles.get(k)?.name).filter((n): n is string => !!n);
  if (bluffs.length === 0) return { ok: false, message: '악마의 속임수를 먼저 뽑아 주세요.' };

  const label = (x: { seat: { name: string }; no: number }) => `${x.seat.name}(${x.no})`;
  const infos: Record<string, GrimoireSeatInfo> = {};
  const warnings: string[] = [];
  const noPhone: string[] = [];

  for (const d of demons) {
    const lines = [
      `하수인: ${
        minions.length
          ? minions.map(m => (m.seat.roleKey === 'marionette' ? `${label(m)} — 꼭두각시` : label(m))).join(', ')
          : '없음'
      }`,
      `악마의 속임수: ${bluffs.join(', ')}`,
    ];
    if (d.seat.memberId == null) noPhone.push(d.seat.name);
    else infos[String(d.seat.memberId)] = { title: '악 팀 정보', lines };
  }
  for (const m of minions) {
    if (m.seat.roleKey === 'marionette') continue;
    const others = minions.filter(o => o !== m && o.seat.roleKey !== 'marionette');
    const lines = [`악마: ${demons.map(label).join(', ')}`];
    if (others.length) lines.push(`다른 하수인: ${others.map(label).join(', ')}`);
    if (m.seat.memberId == null) noPhone.push(m.seat.name);
    else infos[String(m.seat.memberId)] = { title: '악 팀 정보', lines };
  }
  if (noPhone.length) warnings.push(`${noPhone.join(', ')}님은 회원 자리가 아니라 휴대폰으로 받을 수 없습니다. 직접 알려 주세요.`);
  if (present.some(x => x.seat.roleKey === 'lunatic'))
    warnings.push('미치광이에게는 가짜 하수인·악마의 속임수를 직접 알려 주세요(휴대폰으로 보내지 않았습니다).');
  return { ok: true, infos, warnings };
}

/**
 * 마도서 ↔ 플레이어 휴대폰.
 * 보낸 뒤에는 좌석의 보여줄 캐릭터·선악·정보가 바뀌면 바뀐 좌석만 자동으로 다시 보내고, 10초마다 확인 여부를 받는다.
 * 세션 id·마지막으로 보낸 내용은 마도서 상태(이 기기)에 둔다.
 */
export function usePhoneSession(state: GrimoireState | null, updateSilently: Update) {
  const session = state?.clocktowerSession ?? null;
  const sessionId = session?.sessionId ?? null;
  const roles = useMemo(() => (state ? roleMap(state.data) : new Map<string, GrimoireRole>()), [state]);
  const desired = useMemo(() => (state && session ? phoneSeats(state, roles) : []), [state, session, roles]);
  const desiredSig = desired.map(sig).join('\n');

  const [statuses, setStatuses] = useState<Record<string, SeatViewStatus>>({});
  const [sending, setSending] = useState(false);

  // 비동기 콜백이 최신 값을 보게 ref 로 들고 있는다
  const latest = useRef({ session, desired });
  latest.current = { session, desired };
  const inFlight = useRef(false);
  const again = useRef(false);
  const retryTimer = useRef<number | null>(null);

  const rememberSent = useCallback(
    (sid: number, payloads: PhoneSeatPayload[]) =>
      updateSilently(prev => {
        const cur = prev.clocktowerSession;
        if (!cur || cur.sessionId !== sid) return prev;
        const sent = { ...cur.sent };
        payloads.forEach(p => (sent[String(p.memberId)] = sig(p)));
        return { ...prev, clocktowerSession: { ...cur, sent } };
      }),
    [updateSilently]
  );

  const pollStatus = useCallback(async () => {
    const sid = latest.current.session?.sessionId;
    if (sid == null) return;
    try {
      const { data } = await api.get<PhoneSessionStatus>(`${BASE}/${sid}/status`);
      if (latest.current.session?.sessionId !== sid) return;
      if (data.status === 'CLOSED') {
        updateSilently(prev =>
          prev.clocktowerSession?.sessionId === sid ? { ...prev, clocktowerSession: null } : prev
        );
        setStatuses({});
        toast.error('휴대폰 배정이 끝났습니다(오래되었거나 닫힘). 필요하면 다시 보내 주세요.');
        return;
      }
      const next: Record<string, SeatViewStatus> = {};
      data.seats.forEach(s => (next[String(s.memberId)] = { version: s.version, viewedVersion: s.viewedVersion }));
      setStatuses(next);
    } catch {
      // 잠깐 끊긴 것일 수 있다. 다음 주기에 다시 받는다
    }
  }, [updateSilently]);

  /** 마지막으로 보낸 것과 다른 좌석만 PUT. 보내는 중이면 끝난 뒤 한 번 더 */
  const flush = useCallback(async () => {
    if (inFlight.current) {
      again.current = true;
      return;
    }
    const { session: s, desired: d } = latest.current;
    if (!s) return;
    // 세션에 없는 회원(보낸 뒤 들어온 자리)은 PUT 으로 못 넣는다 — [다시 보내기]로 새로 만든다
    const changed = d.filter(p => s.sent[String(p.memberId)] !== undefined && s.sent[String(p.memberId)] !== sig(p));
    if (changed.length === 0) return;
    inFlight.current = true;
    try {
      await api.put(`${BASE}/${s.sessionId}/seats`, { seats: changed });
      rememberSent(s.sessionId, changed);
      pollStatus();
    } catch (e) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      // 400·403(닫힌 세션·없는 캐릭터 등)은 다시 보내도 같다. 세션이 닫혔는지 확인만 하고 멈춘다
      if (status != null && status < 500) {
        toast.error(errorMessage(e, '바뀐 캐릭터를 휴대폰으로 보내지 못했습니다.'));
        pollStatus();
        return;
      }
      toast.error(errorMessage(e, '바뀐 캐릭터를 휴대폰으로 보내지 못했습니다. 잠시 뒤 다시 시도합니다.'));
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
      retryTimer.current = window.setTimeout(() => {
        retryTimer.current = null;
        flush();
      }, RETRY_MS);
    } finally {
      inFlight.current = false;
      if (again.current) {
        again.current = false;
        // 상태 갱신(보낸 기록)이 반영된 뒤 다시 비교한다
        window.setTimeout(() => flush(), 0);
      }
    }
  }, [rememberSent, pollStatus]);

  // 보여줄 내용이 바뀌면 잠시 기다렸다가 바뀐 좌석만 보낸다
  useEffect(() => {
    if (sessionId == null || !desiredSig) return;
    const t = window.setTimeout(() => flush(), SYNC_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [sessionId, desiredSig, flush]);

  // 마도서에 있는 동안 확인 여부를 받는다
  useEffect(() => {
    setStatuses({});
    if (sessionId == null) return;
    pollStatus();
    const t = window.setInterval(pollStatus, STATUS_POLL_MS);
    return () => window.clearInterval(t);
  }, [sessionId, pollStatus]);

  useEffect(
    () => () => {
      if (retryTimer.current) window.clearTimeout(retryTimer.current);
    },
    []
  );

  /**
   * 회원 좌석 전부를 새 세션으로 보낸다(같은 이야기꾼의 이전 세션은 서버가 닫는다).
   * 셋업 3단계는 방금 나눠 앉힌 상태를 넘긴다 — 화면이 다시 그려지기 전이라 훅이 든 state 는 나누기 전 것이다.
   * infos 를 넘기면 이전 정보 대신 그것으로 보낸다(새 배정에 지난 판 악 팀 정보가 붙지 않게).
   */
  const send = useCallback(async (opts?: { state?: GrimoireState; infos?: Record<string, GrimoireSeatInfo> }) => {
    const base = opts?.state ?? state;
    if (!base) return false;
    const infos = opts?.infos ?? base.clocktowerSession?.infos ?? {};
    const seats = phoneSeats({ ...base, clocktowerSession: { sessionId: 0, sentAt: '', sent: {}, infos } }, roleMap(base.data));
    if (seats.length === 0) {
      toast.error('회원 자리가 없어 보낼 곳이 없습니다.');
      return false;
    }
    setSending(true);
    try {
      const { data } = await api.post<{ sessionId: number }>(BASE, { gameId: base.data.gameId, seats });
      const session: GrimoirePhoneSession = {
        sessionId: data.sessionId,
        sentAt: new Date().toISOString(),
        sent: Object.fromEntries(seats.map(p => [String(p.memberId), sig(p)])),
        infos,
      };
      updateSilently(prev => ({ ...prev, clocktowerSession: session }));
      return true;
    } catch (e) {
      toast.error(errorMessage(e, '휴대폰으로 배정을 보내지 못했습니다.'));
      return false;
    } finally {
      setSending(false);
    }
  }, [state, updateSilently]);

  /** 악 팀 정보 등 좌석별 정보를 넣는다. 자동 동기화가 바뀐 좌석만 보낸다 */
  const setInfos = useCallback(
    (infos: Record<string, GrimoireSeatInfo>) => {
      updateSilently(prev =>
        prev.clocktowerSession
          ? { ...prev, clocktowerSession: { ...prev.clocktowerSession, infos: { ...prev.clocktowerSession.infos, ...infos } } }
          : prev
      );
    },
    [updateSilently]
  );

  /** 게임을 끝낼 때 세션을 닫는다. 실패해도 마도서 쪽은 비운다(서버가 18시간 뒤 닫힌 것으로 본다) */
  const close = useCallback(async () => {
    const sid = latest.current.session?.sessionId;
    if (sid == null) return;
    try {
      await api.post(`${BASE}/${sid}/close`);
    } catch {
      // 무시
    }
    updateSilently(prev =>
      prev.clocktowerSession?.sessionId === sid ? { ...prev, clocktowerSession: null } : prev
    );
  }, [updateSilently]);

  /** 세션에 있는 회원 좌석의 확인 여부. 세션이 없거나 그 회원이 세션에 없으면 null */
  const viewStatusOf = useCallback(
    (memberId: number | null): 'viewed' | 'unviewed' | null => {
      if (memberId == null || !session || session.sent[String(memberId)] === undefined) return null;
      const st = statuses[String(memberId)];
      if (!st) return null;
      return st.version > st.viewedVersion ? 'unviewed' : 'viewed';
    },
    [session, statuses]
  );

  return { session, sending, send, setInfos, close, viewStatusOf };
}
