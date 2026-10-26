import { useEffect, useMemo, useRef, useState } from 'react';
import type { GrimoirePhase, GrimoireRole, GrimoireState, NightTab } from '../../../types/clocktower.ts';
import { renderNightText } from '../../../utils/clocktowerText.tsx';
import { dayLogOf, isEvilSeat, nightItems, roleMap, shuffle, sleepsDead, type NightItem } from './grimoireRules.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';
import type { ShowContent } from './ShowPanels.tsx';
import type { InfoPreset } from './InfoCards.tsx';
import type { NightStepContext } from './nightLog.ts';
import { stepUi, type StepCard, type StepUi } from './nightRoleUi.ts';
import {
  actingSeat,
  attackResult,
  fortuneTellerAnswer,
  ravenkeeperAnswer,
  seamstressAnswer,
  isImpaired,
  type InfoAnswer,
  type Verdict,
} from './nightChoice.ts';
import {
  Btn,
  Chip,
  Hint,
  Mark,
  Muted,
  NightBody,
  NightCard,
  NightNav,
  NightRow,
  NightStepNo,
  NightText,
  NightTitle,
  NightWho,
  NightDock,
  Row,
  SheetHead,
  Tab,
} from './grimoire.styles.ts';

/** 깨울 사람. 믿는 캐릭터로 깨우는 자리는 진짜 캐릭터를 붙인다(이야기꾼만 보는 화면) */
function whoLabel(item: NightItem, roles?: Map<string, GrimoireRole>) {
  if (item.seats.length === 0) return '';
  return item.seats
    .map(s => {
      const real = s.believedRoleKey === item.role.key && s.roleKey !== item.role.key ? roles?.get(s.roleKey ?? '')?.name : null;
      return `${s.name}${real ? `(실제 ${real})` : ''}${s.dead ? '(사망)' : ''}`;
    })
    .join(', ');
}

/** 이 밤에 실제로 깨울 단계(그 외 밤에 이전에 죽은 캐릭터·건너뛰는 단계 제외) */
function playableItems(state: GrimoireState) {
  return nightItems(state, state.nightTab).filter(i => !i.hiddenDead && !i.skippedReason);
}

/**
 * 밤 순서 체크리스트: 지금 게임에 있는 캐릭터만.
 * 그 외 밤에는 이전에 죽은 캐릭터를 숨긴다(오늘 밤에 죽은 캐릭터는 남기고 사망 표시). [죽은 캐릭터도 보기]로 펼친다.
 * 줄을 누르면 그 단계부터 밤 진행 카드가 열린다. 목록을 보며 진행하므로 [밤 끝내기]를 목록 맨 아래에도 둔다.
 */
export function NightList({
  state,
  phase,
  onTab,
  onToggle,
  onOpenMode,
  onStartNight,
  onEndNight,
}: {
  state: GrimoireState;
  phase: GrimoirePhase;
  onTab: (tab: NightTab) => void;
  onToggle: (key: string) => void;
  onOpenMode: (startKey?: string) => void;
  onStartNight: () => void;
  onEndNight: () => void;
}) {
  const all = useMemo(() => nightItems(state, state.nightTab), [state]);
  const [showDead, setShowDead] = useState(false);
  const hiddenCount = all.filter(i => i.hiddenDead).length;
  const items = showDead ? all : all.filter(i => !i.hiddenDead);
  const checked = new Set(state.nightChecked);
  const playable = items.filter(i => !i.skippedReason && !i.hiddenDead);
  const doneCount = playable.filter(i => checked.has(i.key)).length;

  return (
    <>
      <Row style={{ marginBottom: 8 }}>
        <Tab type="button" $active={state.nightTab === 'first'} onClick={() => onTab('first')}>
          첫날 밤
        </Tab>
        <Tab type="button" $active={state.nightTab === 'other'} onClick={() => onTab('other')}>
          그 외 밤
        </Tab>
        <Btn type="button" $tone="primary" onClick={() => onOpenMode()} disabled={!playable.length} style={{ marginLeft: 'auto' }}>
          밤 진행
        </Btn>
      </Row>
      {playable.length > 0 && (
        <Hint style={{ marginBottom: 4 }}>
          {doneCount}/{playable.length} 완료 · 줄을 누르면 그 단계부터 크게 봅니다
        </Hint>
      )}
      {items.length === 0 ? (
        <Muted>캐릭터를 배정하면 깨울 순서가 나옵니다.</Muted>
      ) : (
        items.map(item => {
          const art = tokenImageCandidates(item.role, null);
          if (item.skippedReason) {
            return (
              <NightRow key={item.key} $done={false} $muted>
                <span style={{ flex: 'none', width: 22 }} />
                <NightBody>
                  <b>{item.role.name}</b>
                  <small>{item.skippedReason}</small>
                </NightBody>
              </NightRow>
            );
          }
          return (
            <NightRow key={item.key} $done={checked.has(item.key)} $muted={item.hiddenDead}>
              <input type="checkbox" checked={checked.has(item.key)} onChange={() => onToggle(item.key)} />
              {/* 해 질 녘·하수인 정보 같은 단계는 그림이 없다 — 자리를 맞추려고 빈 칸을 둔다 */}
              <span style={{ flex: 'none', width: 40 }}>
                <RoleArt urls={art} alt="" size={40} dead={item.allDead} />
              </span>
              <NightBody
                role="button"
                tabIndex={0}
                style={{ cursor: item.hiddenDead ? 'default' : 'pointer' }}
                onClick={() => !item.hiddenDead && onOpenMode(item.key)}
              >
                <b>{item.role.name}</b>{' '}
                {item.diedTonight && (
                  <Mark $tone="evil" style={{ marginLeft: 4 }}>
                    {sleepsDead(item) ? '오늘 밤 사망 — 깨우지 않음' : '오늘 밤 사망'}
                  </Mark>
                )}
                {item.hiddenDead && <Mark style={{ marginLeft: 4 }}>사망 — 보통 깨우지 않음</Mark>}
                {item.seats.length > 0 && <small>{whoLabel(item, roleMap(state.data))}</small>}
                {item.text && <div>{renderNightText(item.text)}</div>}
              </NightBody>
            </NightRow>
          );
        })
      )}
      {hiddenCount > 0 && (
        <Row style={{ marginTop: 8 }}>
          <Chip type="button" $active={showDead} onClick={() => setShowDead(v => !v)}>
            {showDead ? '죽은 캐릭터 숨기기' : `죽은 캐릭터도 보기 (${hiddenCount})`}
          </Chip>
        </Row>
      )}
      {/* 목록을 내려 보며 진행하므로 다음 단계 버튼을 아래에도 둔다 */}
      <Row style={{ marginTop: 12 }}>
        {phase === 'NIGHT' ? (
          <Btn type="button" $tone="primary" onClick={onEndNight} style={{ flex: 1, minHeight: 48 }}>
            밤 끝내기 (아침으로)
          </Btn>
        ) : (
          <Btn type="button" $tone="primary" onClick={onStartNight} style={{ flex: 1, minHeight: 48 }}>
            {phase === 'SETUP' ? '첫날 밤 시작' : '밤 시작'}
          </Btn>
        )}
      </Row>
    </>
  );
}

/**
 * 하수인·악마 정보 단계에서 바로 띄울 정보 카드(포켓 그리모어처럼 밤 순서에서 바로 보여준다).
 * 하수인 정보: 하수인에게 "이 사람이 악마입니다". 악마 정보: 악마에게 하수인들 + 게임에 없는 캐릭터(악마의 속임수).
 * 꼭두각시는 자기가 하수인인 줄 모르므로 하수인 목록에서 빼지 않는다 — 악마는 꼭두각시를 안다(W/Marionette).
 */
function evilInfoCards(state: GrimoireState, stepKey: string): ShowContent[] {
  const roles = roleMap(state.data);
  const present = state.seats.map((s, i) => ({ s, no: i + 1 })).filter(x => !x.s.left);
  const teamOf = (k: string | null) => roles.get(k ?? '')?.team;
  const label = (x: { s: { name: string }; no: number }) => `${x.no}. ${x.s.name}`;
  const demons = present.filter(x => teamOf(x.s.roleKey) === 'DEMON');
  const minions = present.filter(x => teamOf(x.s.roleKey) === 'MINION');
  if (stepKey === 'minioninfo') {
    return [{ title: '이 사람이 악마입니다', roles: [], message: demons.map(label).join(', ') || '(악마 자리가 없습니다)' }];
  }
  if (stepKey === 'demoninfo') {
    const bluffs = (state.bluffs ?? []).map(k => roles.get(k)).filter((r): r is GrimoireRole => !!r);
    return [
      { title: '당신의 하수인들입니다', roles: [], message: minions.map(label).join(', ') || '(하수인이 없습니다)' },
      { title: '이 캐릭터들은 게임에 없습니다', roles: bluffs, message: bluffs.length ? undefined : '(악마의 속임수를 아직 정하지 않았습니다)' },
    ];
  }
  return [];
}

/** 살아 있는 이웃(죽은 자리·떠난 자리는 건너뛴다) — 초공감자 기준 */
function aliveNeighbours(state: GrimoireState, seatId: string) {
  const ring = state.seats.filter(s => !s.left);
  const i = ring.findIndex(s => s.id === seatId);
  if (i < 0 || ring.length < 3) return [];
  const pick = (dir: 1 | -1) => {
    for (let k = 1; k < ring.length; k++) {
      const s = ring[(i + dir * k + ring.length) % ring.length];
      if (s.id === seatId) return null;
      if (!s.dead) return s;
    }
    return null;
  };
  return [pick(-1), pick(1)].filter((s, j, a): s is NonNullable<typeof s> => !!s && a.indexOf(s) === j);
}

type Tip = { label: string; content: ShowContent; preset?: InfoPreset };

/**
 * 능력 도우미가 계산한 참고값. 실제 좌석의 캐릭터·선악만 보고 만든다 —
 * 취함·중독이면 틀린 정보를 줘야 하고, 은둔자·스파이는 다르게 등록될 수 있어 이야기꾼이 판단한다.
 * 그래서 값마다 [바꿔서 보여주기](정보 카드에 미리 채워 열기)를 같이 둔다.
 */
function suggestions(state: GrimoireState, item: NightItem): Tip[] {
  const roles = roleMap(state.data);
  const key = item.role.key;
  const out: Tip[] = [];
  const ring = state.seats.filter(s => !s.left);
  const selfIds = new Set(item.seats.map(s => s.id));
  const teamOf = (s: { roleKey: string | null }) => roles.get(s.roleKey ?? '')?.team;
  const no = (id: string) => state.seats.findIndex(s => s.id === id) + 1;

  // 세탁부·사서·조사관: 그 진영 캐릭터인 사람 1명 + 다른 사람 1명, 그리고 그 캐릭터
  const pairOf = (team: 'TOWNSFOLK' | 'OUTSIDER' | 'MINION') => {
    const target = shuffle(ring.filter(s => !selfIds.has(s.id) && teamOf(s) === team))[0];
    if (!target) return null;
    const decoy = shuffle(ring.filter(s => s.id !== target.id && !selfIds.has(s.id)))[0];
    const role = roles.get(target.roleKey ?? '');
    if (!role) return null;
    const people = shuffle([target, ...(decoy ? [decoy] : [])]);
    const title = '이 중 한 명이 이 캐릭터입니다';
    return {
      label: `${people.map(p => `${no(p.id)}.${p.name}`).join('·')} 중 ${role.name}`,
      content: { title, roles: [role], message: people.map(p => `${no(p.id)}. ${p.name}`).join(', ') },
      preset: { text: title, roleKeys: [role.key], seatIds: people.map(p => p.id) },
    };
  };
  if (key === 'washerwoman' || key === 'librarian' || key === 'investigator') {
    const team = key === 'washerwoman' ? 'TOWNSFOLK' : key === 'librarian' ? 'OUTSIDER' : 'MINION';
    const tip = pairOf(team);
    if (tip) out.push(tip);
    else if (key === 'librarian') out.push({ label: '외지인 없음 → 0', content: { title: '외지인이 없습니다', roles: [], big: '0' } });
  }
  if (key === 'grandmother') {
    const g = shuffle(ring.filter(s => !selfIds.has(s.id) && (teamOf(s) === 'TOWNSFOLK' || teamOf(s) === 'OUTSIDER')))[0];
    const role = g ? roles.get(g.roleKey ?? '') : null;
    if (g && role) {
      const title = '이 사람이 당신의 손주입니다';
      out.push({
        label: `손주 ${no(g.id)}.${g.name} (${role.name})`,
        content: { title, roles: [role], message: `${no(g.id)}. ${g.name}` },
        preset: { text: title, roleKeys: [role.key], seatIds: [g.id] },
      });
    }
  }
  if (key === 'undertaker') {
    // N번째 밤에 보는 것은 바로 전 낮(N-1일째)에 처형으로 죽은 사람. 그 사람의 사망 기록이 그날 '낮'의 처형이어야 한다 —
    // 처형 기록은 날짜만 있어 밤 중에 누른 처형(실수·테스트)이나 처형됐지만 산 사람까지 잡혔다
    const prevDay = state.day - 1;
    const exec = [...dayLogOf(state, prevDay).executions].reverse().find(e => {
      if (!e.died || !e.characterAtExecution) return false;
      const d = state.seats.find(s => s.id === e.seatId)?.death;
      return !!d && d.cause === 'EXECUTION' && d.day === prevDay && d.phase === 'DAY';
    });
    const role = exec ? roles.get(exec.characterAtExecution ?? '') : null;
    if (role) {
      const title = '오늘 처형된 사람의 캐릭터';
      const who = state.seats.find(s => s.id === exec?.seatId);
      out.push({
        label: `${prevDay}일째 낮 처형 ${who ? `${no(who.id)}.${who.name}` : ''}: ${role.name}`,
        content: { title, roles: [role] },
        preset: { text: title, roleKeys: [role.key] },
      });
    }
  }
  // 대부(첫날 밤): 게임에 있는 외지인 캐릭터 전부
  if (key === 'godfather' && state.nightTab === 'first') {
    const outs = [...new Map(ring.filter(s => teamOf(s) === 'OUTSIDER').map(s => [s.roleKey, roles.get(s.roleKey ?? '')])).values()].filter(
      (r): r is GrimoireRole => !!r
    );
    out.push({
      label: outs.length ? `게임의 외지인: ${outs.map(r => r.name).join(', ')}` : '외지인 없음',
      content: { title: '게임에 있는 외지인', roles: outs, message: outs.length ? undefined : '(외지인이 없습니다)' },
    });
  }
  // 시종: 선한 사람 1명 / 기사: 악마가 아닌 2명 / 귀족: 3명 중 정확히 1명이 악 — 셋업 '알아냄' 자리가 있으면 그 자리, 없으면 무작위 추천
  const marked = () => ring.filter(s => s.reminders.some(m => m.source === item.role.name && /알아냄/.test(m.text)));
  const pointTip = (people: typeof ring, label: string) => {
    if (!people.length) return;
    const names = people.map(p => `${no(p.id)}. ${p.name}`).join(', ');
    out.push({ label: `${label}: ${names}`, content: { title: '', roles: [], message: names } });
  };
  if (key === 'steward') {
    const m = marked();
    pointTip(m.length ? m : shuffle(ring.filter(s => !selfIds.has(s.id) && isEvilSeat(s, roles) === false)).slice(0, 1), '선한 사람');
  }
  if (key === 'knight') {
    const m = marked();
    pointTip(m.length ? m : shuffle(ring.filter(s => !selfIds.has(s.id) && teamOf(s) !== 'DEMON')).slice(0, 2), '악마가 아닌 2명');
  }
  if (key === 'noble') {
    const m = marked();
    const evil = shuffle(ring.filter(s => !selfIds.has(s.id) && isEvilSeat(s, roles) === true))[0];
    const goods = shuffle(ring.filter(s => !selfIds.has(s.id) && isEvilSeat(s, roles) === false)).slice(0, 2);
    pointTip(m.length ? m : evil ? shuffle([evil, ...goods]) : [], '3명 중 1명이 악');
  }
  // 현자(악마에게 죽은 밤): 악마 + 다른 1명
  if (key === 'sage') {
    const demon = ring.find(s => teamOf(s) === 'DEMON' && !s.dead);
    const other = shuffle(ring.filter(s => s.id !== demon?.id && !selfIds.has(s.id)))[0];
    if (demon) pointTip(shuffle([demon, ...(other ? [other] : [])]), '둘 중 1명이 악마');
  }
  // 예언자: 죽은 사람 중 악한 사람 수(#102)
  if (key === 'oracle') {
    const n = ring.filter(s => s.dead && isEvilSeat(s, roles) === true).length;
    out.push({ label: `참고값 ${n}`, content: { title: '', roles: [], big: String(n) } });
  }
  if (key === 'empath') {
    for (const seat of item.seats.filter(s => !s.dead)) {
      const n = aliveNeighbours(state, seat.id).filter(s => isEvilSeat(s, roles) === true).length;
      out.push({ label: `${seat.name} 참고값 ${n}`, content: { title: '', roles: [], big: String(n) } });
    }
  }
  if (key === 'chef') {
    let pairs = 0;
    ring.forEach((s, i) => {
      const next = ring[(i + 1) % ring.length];
      if (ring.length > 1 && isEvilSeat(s, roles) === true && isEvilSeat(next, roles) === true) pairs++;
    });
    out.push({ label: `참고값 ${pairs}쌍`, content: { title: '', roles: [], big: String(pairs) } });
  }
  if (key === 'clockmaker') {
    // 악마에서 가장 가까운 하수인까지 몇 칸인지(시계 방향·반대 방향 중 짧은 쪽)
    const di = ring.findIndex(s => teamOf(s) === 'DEMON');
    const dists = ring
      .map((s, i) => (teamOf(s) === 'MINION' ? Math.min(Math.abs(i - di), ring.length - Math.abs(i - di)) : null))
      .filter((d): d is number => d != null);
    if (di >= 0 && dists.length) {
      const n = Math.min(...dists);
      out.push({ label: `참고값 ${n}칸`, content: { title: '', roles: [], big: String(n) } });
    }
  }
  return out;
}

/** 깨우는 사람이 틀린 정보를 받을 수 있는 상태(주정뱅이로 깨움·중독·취함 리마인더) */
function impairedNotes(state: GrimoireState, item: NightItem): string[] {
  const roles = roleMap(state.data);
  const notes: string[] = [];
  for (const s of item.seats) {
    if (s.believedRoleKey === item.role.key && s.roleKey !== item.role.key) {
      notes.push(`${s.name}님은 실제 ${roles.get(s.roleKey ?? '')?.name ?? '?'}입니다`);
    }
    const hits = s.reminders.filter(r => /중독|취함|취한|취해/.test(r.text)).map(r => r.text);
    if (hits.length) notes.push(`${s.name}님에게 '${hits.join("', '")}' 리마인더가 있습니다`);
  }
  return notes;
}


const VERDICT_LABEL: Record<Verdict, string> = { DIES: '죽습니다', SAFE: '죽지 않습니다', MAYBE: '이야기꾼 판단', NONE: '아무 일 없음' };

/** 이 단계의 캐릭터 차례에 띄울 버튼(캐릭터별 표 `nightRoleUi.ts`). 깨울 자리가 없는 단계(해 질 녘·전설 등)는 빈 구성 */
function uiOf(item: NightItem, tab: NightTab): StepUi {
  return item.seats.length > 0 ? stepUi(item.role, tab) : {};
}

/** [고르기 · 처리] 탭에 그릴 것이 있는지 */
function hasPickPart(ui: StepUi) {
  return !!(ui.ask || ui.toggle || ui.pick || ui.charCard || ui.kill || ui.revive || ui.selfMark || ui.selfCounter?.length || ui.reminders?.length);
}

/**
 * 정보 카드 단축 버튼의 미리 채울 값. 표의 'self'·'demon'·'picked' 같은 이름을 실제 캐릭터 키·좌석 id 로 바꾼다.
 */
function cardPreset(state: GrimoireState, item: NightItem, card: StepCard, actorId: string | null, picked: string[]) {
  const roles = roleMap(state.data);
  const present = state.seats.filter(s => !s.left);
  const teamOf = (k: string | null) => roles.get(k ?? '')?.team;
  const keysOf = (team: string) => present.filter(s => teamOf(s.roleKey) === team).map(s => s.roleKey ?? '');
  const roleKeys = [
    ...new Set(
      (card.roleKeys ?? []).flatMap(k => (k === 'self' ? [item.role.key] : k === 'demon' ? keysOf('DEMON') : k === 'outsiders' ? keysOf('OUTSIDER') : [k]))
    ),
  ].filter(k => roles.has(k));
  const seatIds =
    card.seat === 'actor'
      ? actorId
        ? [actorId]
        : []
      : card.seat === 'demon'
        ? present.filter(s => teamOf(s.roleKey) === 'DEMON').map(s => s.id)
        : card.seat === 'marionette' || card.seat === 'lunatic'
          ? present.filter(s => s.roleKey === card.seat).map(s => s.id)
          : card.seat === 'picked'
            ? picked
            : [];
  const seatNames = seatIds
    .map(id => {
      const i = state.seats.findIndex(s => s.id === id);
      return i < 0 ? null : `${i + 1}. ${state.seats[i].name}`;
    })
    .filter(Boolean);
  const label = [card.text, roleKeys.map(k => roles.get(k)?.name).join(', '), seatNames.join(', ')].filter(Boolean).join(' · ');
  const preset: InfoPreset = { text: card.text, roleKeys, seatIds };
  return { label, preset };
}

/** 숫자·예/아니오·직접 선택지 */
function numberOptions(numbers: NonNullable<StepUi['numbers']>) {
  if (numbers === 'number') return { label: '숫자', values: ['0', '1', '2', '3', '4', '5'] };
  if (numbers === 'yesno') return { label: '답', values: ['예', '아니오'] };
  return { label: '신호', values: numbers };
}

/**
 * 대상 고르기·처리. 무엇을 띄울지는 캐릭터별 표(`StepUi`)가 정한다 —
 * 질문 카드([능력을 사용하시겠습니까?]·[플레이어를 고르세요]·[캐릭터를 고르세요]), 좌석 칩, 리마인더 옮겨 붙이기,
 * [사망 처리](고른 사람·표시된 사람·본인), 되살리기, 점쟁이·재봉사 등 참고 답, 본인 기록 리마인더.
 * 실제 캐릭터·선악 기준이라 취함·중독·오등록은 이야기꾼 판단.
 */
function ChoiceHelper({
  state,
  item,
  ui,
  onReminder,
  onKill,
  onRevive,
  onShow,
  onOpenInfo,
  onNote,
  picked,
  onTogglePick,
}: {
  state: GrimoireState;
  item: NightItem;
  ui: StepUi;
  onReminder: (seatIds: string[], text: string, source: string, keepIds: string[]) => void;
  onKill: (seatId: string) => void;
  onRevive: (seatId: string) => void;
  onShow: (content: ShowContent) => void;
  onOpenInfo: (preset?: InfoPreset) => void;
  onNote: (text: string) => void;
  // 고른 사람은 페이지가 들고 있다 — 원형 마도서의 토큰을 눌러도 고를 수 있게
  picked: string[];
  onTogglePick: (seatId: string) => void;
}) {
  const roles = roleMap(state.data);
  const role = item.role;
  const ring = state.seats.map((s, i) => ({ s, no: i + 1 })).filter(x => !x.s.left);
  const bySeat = new Map(ring.map(x => [x.s.id, x]));
  const targets = picked.map(id => bySeat.get(id)).filter((x): x is NonNullable<typeof x> => !!x);
  const names = targets.map(x => `${x.no}. ${x.s.name}`).join(', ');
  const reminders = [...new Set(ui.reminders ?? [])];
  const need = ui.count ?? (ui.answer ? 1 : undefined);

  const actor = actingSeat(item.seats, role.key);
  const actorNo = actor ? state.seats.indexOf(actor) + 1 : 0;
  // 본인 자리에 이 캐릭터가 붙인 리마인더가 있나
  const hasOwn = (text: string) => !!actor?.reminders.some(m => m.source === role.name && m.text === text);
  // 능력을 썼을 때(리마인더 붙이기·사망 처리·되살리기·대상 기록) 본인에게 붙이는 표시 — 게임당 한 번 능력의 '능력 없음' 등
  const markUsed = () => {
    if (!ui.selfMark || !actor || hasOwn(ui.selfMark)) return;
    onReminder([actor.id], ui.selfMark, role.name, [actor.id]);
  };

  // 공격 판정(보호·군인·선원·어릿광대·구마사제·중독된 공격자 등, nightChoice.ts)
  // 할머니: 손주('손주' 리마인더 자리)가 오늘 밤 죽었나(악마에게 죽었는지는 이야기꾼 판단 — 암살자면 할머니는 안 죽음 #72)
  const grandchildDiedTonight = state.seats.some(
    s => s.dead && s.reminders.some(m => /손주/.test(m.text)) && s.death?.day === state.day && s.death?.phase === 'NIGHT'
  );
  const attacks = ui.kill === 'target' ? targets.map(x => ({ ...x, result: attackResult(state, role, actor, x.s) })) : [];
  const warnings: string[] =
    ui.kill === 'target' || ui.revive ? [] : targets.filter(x => x.s.dead).map(x => `${x.no}번은 이미 죽었습니다`);
  // 이 캐릭터가 붙인 표시가 있는 사람이 죽는다 — 푸카 '중독'(어젯밤 중독된 사람, #68·#76), 달의 자손 '사망'(낮에 지목한 사람)
  const markText = ui.markText;
  const marked =
    ui.kill === 'marked' && markText
      ? ring.filter(x => !x.s.dead && x.s.reminders.some(m => m.source === role.name && m.text.includes(markText)))
      : [];

  // 참고 답(정확히 그 수만큼 골랐을 때)
  let answer: { label: string; content: ShowContent; preset?: InfoPreset; reasons?: string[] } | null = null;
  if (ui.answer && need && targets.length === need) {
    const picks = targets.map(x => x.s);
    const yesNo = (a: InfoAnswer) => ({
      label: `참고 답: ${a.answer}${a.free ? ' (아무 답이나 가능)' : ''}`,
      content: { title: '', roles: [], big: a.answer },
      reasons: a.reasons,
    });
    if (ui.answer === 'fortuneteller') answer = yesNo(fortuneTellerAnswer(state, role, actor, picks));
    else if (ui.answer === 'seamstress') answer = yesNo(seamstressAnswer(state, actor, picks));
    else if (ui.answer === 'ravenkeeper') {
      const r = roles.get(picks[0].roleKey ?? '');
      const a = ravenkeeperAnswer(state, actor, picks[0]);
      const title = '이 플레이어의 캐릭터는';
      if (r)
        answer = {
          label: `참고 답: ${a.answer}${a.free ? ' (다른 캐릭터도 가능)' : ''}`,
          content: { title, roles: [r], message: names },
          preset: { text: title, roleKeys: [r.key], seatIds: picked },
          reasons: a.reasons,
        };
    } else if (ui.answer === 'villageidiot') {
      const evil = isEvilSeat(picks[0], roles) === true;
      const reasons = isImpaired(state, roles, actor ?? picks[0]) && actor ? ['취함·중독이면 아무 답이나 줘도 됩니다.'] : [];
      answer = {
        label: `참고 답: ${evil ? '악' : '선'}${reasons.length ? ' (아무 답이나 가능)' : ''}`,
        content: { title: '', roles: [], big: evil ? '악한 팀' : '선한 팀' },
        reasons,
      };
    } else if (ui.answer === 'dreamer') {
      const r = roles.get(picks[0].roleKey ?? '');
      const evil = isEvilSeat(picks[0], roles) === true;
      const other = shuffle(
        state.data.roles.filter(x => x.key !== r?.key && (evil ? x.team === 'TOWNSFOLK' || x.team === 'OUTSIDER' : x.team === 'MINION' || x.team === 'DEMON'))
      )[0];
      const title = '이 플레이어의 캐릭터는';
      if (r && other) {
        const two = shuffle([r, other]);
        answer = {
          label: `참고 답: ${two.map(x => x.name).join(' / ')} (진짜 ${r.name})`,
          content: { title, roles: two, message: names },
          preset: { text: title, roleKeys: two.map(x => x.key), seatIds: picked },
        };
      }
    }
  }

  // 리마인더 붙이기. 같은 문구가 여러 장인 캐릭터(포 사망×3)는 한 버튼으로 고른 사람 모두에게,
  // 장 수보다 많이 골랐을 때는 사람마다 따로(여관 주인 '취함'은 둘 중 한 명) 붙인다
  const attach = (text: string, ids: string[]) => {
    onReminder(ids, text, role.name, picked);
    const who = targets.filter(x => ids.includes(x.s.id)).map(x => `${x.no}. ${x.s.name}`).join(', ');
    onNote(`${role.name} → ${who}: '${text}' 붙임`);
    markUsed();
  };
  const copies = (text: string) => role.reminders.filter(t => t === text).length;

  // 본인 기록(레비아탄 '첫 번째 낮'…): 그중 하나만 남긴다. 붙어 있는 것을 다시 누르면 뗀다
  const setCounter = (text: string) => {
    if (!actor) return;
    for (const other of ui.selfCounter ?? []) if (other !== text && hasOwn(other)) onReminder([], other, role.name, []);
    if (hasOwn(text)) onReminder([], text, role.name, []);
    else onReminder([actor.id], text, role.name, [actor.id]);
  };

  const wrap = { display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--ct-line)', paddingTop: 10 } as const;

  // 사람을 고르지 않고 본인이 예/아니오로 정하는 능력(거리의 악사) — 질문 카드 + 예/아니오
  if (ui.toggle) {
    const { question, reminder: text } = ui.toggle;
    const on = hasOwn(text);
    return (
      <div style={wrap}>
        <Row>
          <Btn type="button" onClick={() => onShow({ title: question, roles: [] })}>
            보여주기: {question}
          </Btn>
        </Row>
        <Hint style={{ margin: 0 }}>본인이 고개를 끄덕이면 예, 저으면 아니오. 지금: {on ? `'${text}' 붙어 있음` : `'${text}' 없음`}</Hint>
        <Row>
          <Btn
            type="button"
            $active={on}
            disabled={!actor}
            onClick={() => {
              if (!actor) return;
              onReminder([actor.id], text, role.name, [actor.id]);
              onNote(`${role.name}: 예 → '${text}'`);
            }}
          >
            예 → '{text}' 붙이기
          </Btn>
          <Btn
            type="button"
            $active={!on}
            disabled={!actor}
            onClick={() => {
              // 고른 자리 없이 옮기기 = 이 캐릭터가 붙인 같은 리마인더를 모두 뗀다
              onReminder([], text, role.name, []);
              onNote(`${role.name}: 아니오 → '${text}' 뗌`);
            }}
          >
            아니오 → 떼기
          </Btn>
        </Row>
      </div>
    );
  }

  return (
    <div style={wrap}>
      {/* 깨운 사람에게 먼저 보여 줄 질문 카드 */}
      {(ui.ask || ui.pick === 'player' || ui.charCard) && (
        <Row>
          {ui.ask && (
            <>
              <Btn type="button" onClick={() => onShow({ title: '능력을 사용하시겠습니까?', roles: [] })}>
                보여주기: 능력을 사용하시겠습니까?
              </Btn>
              <Btn
                type="button"
                onClick={() => {
                  onNote(`${role.name}: 능력 사용 안 함`);
                  // 포는 다음 밤 3명을 공격한다(퀴즈 #70) — 포 자리에 '공격 3번'을 붙인다
                  const charge = ui.selfCounter?.[0];
                  if (role.key === 'po' && charge && actor && !hasOwn(charge)) onReminder([actor.id], charge, role.name, [actor.id]);
                }}
              >
                사용 안 함
              </Btn>
            </>
          )}
          {ui.pick === 'player' && (
            <Btn type="button" onClick={() => onShow({ title: '플레이어를 고르세요', roles: [] })}>
              보여주기: 플레이어를 고르세요
            </Btn>
          )}
          {ui.charCard && (
            <Btn type="button" onClick={() => onShow({ title: '캐릭터를 고르세요', roles: [] })}>
              보여주기: 캐릭터를 고르세요
            </Btn>
          )}
        </Row>
      )}

      {/* 표시된 사람이 죽는 처리는 새 대상에게 같은 리마인더를 옮기기 전에(옮기면 어젯밤 표시가 떨어진다) */}
      {marked.map(({ s, no }) => {
        const r = attackResult(state, role, null, s);
        return (
          <div key={`marked-${s.id}`} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Hint style={{ margin: 0, color: r.verdict === 'DIES' ? 'var(--ct-evil)' : undefined }}>
              '{markText}' 표시된 {no}. {s.name}: <b>{VERDICT_LABEL[r.verdict]}</b>
              {r.reasons.length > 0 && ` — ${r.reasons.join(' ')}`}
            </Hint>
            <Row>
              <Btn
                type="button"
                $tone={r.verdict === 'DIES' ? 'danger' : undefined}
                onClick={() => {
                  onNote(`${role.name}: '${markText}' 표시된 ${no}. ${s.name} 사망`);
                  onKill(s.id);
                  markUsed();
                }}
              >
                {no}. {s.name} {r.verdict === 'DIES' ? '사망 처리' : '그래도 사망 처리'}
              </Btn>
            </Row>
          </div>
        );
      })}
      {ui.kill === 'marked' && marked.length === 0 && <Hint style={{ margin: 0 }}>'{markText}' 표시된 생존자가 없습니다 — 아무도 죽지 않습니다.</Hint>}
      {marked.length > 0 && reminders.includes(markText ?? '') && (
        <Hint style={{ margin: 0 }}>새 대상에게 '{markText}'를 붙이기 전에 위 사람부터 처리하세요.</Hint>
      )}

      {ui.pick && (
        <>
          <Hint style={{ margin: 0 }}>
            {ui.pick === 'storyteller'
              ? `이야기꾼이 대상을 정합니다${need ? ` (${need}명)` : ''} — 마도서의 토큰이나 아래 이름을 누르세요`
              : `대상 고르기${need ? ` (${need}명)` : ''} — 마도서의 토큰이나 아래 이름을 누르세요`}
          </Hint>
          <Row>
            {ring.map(({ s, no }) => (
              <Chip
                key={s.id}
                type="button"
                $active={picked.includes(s.id)}
                onClick={() => onTogglePick(s.id)}
                style={{ opacity: s.dead ? 0.55 : 1 }}
              >
                {no}. {s.name}
                {s.dead ? ' †' : ''}
              </Chip>
            ))}
          </Row>
        </>
      )}

      {/* 본인 사망(도박사 추측 틀림·기예꾼·할머니 손주 피살·땜장이). 할머니는 손주가 오늘 밤 죽었을 때만 */}
      {ui.kill === 'self' && actor && !actor.dead && (role.key !== 'grandmother' || grandchildDiedTonight) && (
        <Row>
          <Btn
            type="button"
            $tone="danger"
            onClick={() => {
              onNote(`${role.name}: ${actorNo}. ${actor.name} 사망`);
              onKill(actor.id);
              markUsed();
            }}
          >
            {actorNo}. {actor.name}({role.name}) 사망 처리
          </Btn>
        </Row>
      )}

      {targets.length > 0 && (
        <>
          {warnings.length > 0 && <Hint style={{ color: 'var(--ct-evil)', margin: 0 }}>⚠ {warnings.join(' · ')}</Hint>}
          {attacks.map(({ s, no, result }) => (
            <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Hint style={{ margin: 0, color: result.verdict === 'DIES' ? 'var(--ct-evil)' : undefined }}>
                {no}. {s.name}: <b>{VERDICT_LABEL[result.verdict]}</b>
                {result.reasons.length > 0 && ` — ${result.reasons.join(' ')}`}
              </Hint>
              <Row>
                <Btn
                  type="button"
                  $tone={result.verdict === 'DIES' ? 'danger' : undefined}
                  disabled={s.dead}
                  onClick={() => {
                    onNote(`${role.name} → ${no}. ${s.name} 사망`);
                    onKill(s.id);
                    markUsed();
                  }}
                >
                  {no}. {s.name} {result.verdict === 'DIES' ? '사망 처리' : '그래도 사망 처리'}
                </Btn>
              </Row>
            </div>
          ))}
          {ui.revive && (
            <Row>
              {targets
                .filter(x => x.s.dead)
                .map(({ s, no }) => (
                  <Btn
                    key={`revive-${s.id}`}
                    type="button"
                    onClick={() => {
                      onRevive(s.id);
                      onNote(`${role.name} → ${no}. ${s.name} 되살림`);
                      markUsed();
                    }}
                  >
                    {no}. {s.name} 되살리기
                  </Btn>
                ))}
            </Row>
          )}
          <Row>
            {reminders.map(text =>
              targets.length > 1 && copies(text) < targets.length ? (
                targets.map(x => (
                  <Btn key={`${text}-${x.s.id}`} type="button" onClick={() => attach(text, [x.s.id])}>
                    '{text}' → {x.no}. {x.s.name}
                  </Btn>
                ))
              ) : (
                <Btn key={text} type="button" onClick={() => attach(text, picked)}>
                  '{text}' 붙이기{targets.length > 1 ? ' (모두)' : ''}
                </Btn>
              )
            )}
            {!reminders.length && ui.kill !== 'target' && !ui.revive && !answer && (
              <Btn
                type="button"
                onClick={() => {
                  onNote(`${role.name} → ${names} 선택`);
                  markUsed();
                }}
              >
                고른 대상 기록
              </Btn>
            )}
          </Row>
          {answer && (
            <Row>
              <Btn type="button" onClick={() => onShow(answer.content)}>
                보여주기: {answer.label}
              </Btn>
              {answer.preset && (
                <Btn type="button" onClick={() => onOpenInfo(answer.preset)}>
                  바꿔서 보여주기
                </Btn>
              )}
            </Row>
          )}
          {answer?.reasons && answer.reasons.length > 0 && <Hint style={{ margin: 0 }}>{answer.reasons.join(' ')}</Hint>}
          {reminders.length > 0 && <Hint style={{ margin: 0 }}>리마인더는 옮겨 붙입니다(지금 고르지 않은 자리에 있던 같은 리마인더는 뗍니다).</Hint>}
        </>
      )}

      {/* 본인 기록 리마인더(하루가 지날 때 넘긴다) */}
      {!!ui.selfCounter?.length && actor && (
        <Row>
          <Hint style={{ margin: 0 }}>본인 기록</Hint>
          {ui.selfCounter.map(text => (
            <Chip key={text} type="button" $active={hasOwn(text)} onClick={() => setCounter(text)}>
              {text}
            </Chip>
          ))}
        </Row>
      )}
      {ui.selfMark && actor && (
        <Row>
          <Btn
            type="button"
            $active={hasOwn(ui.selfMark)}
            onClick={() => {
              const text = ui.selfMark as string;
              if (hasOwn(text)) onReminder([], text, role.name, []);
              else onReminder([actor.id], text, role.name, [actor.id]);
            }}
          >
            본인에게 '{ui.selfMark}' {hasOwn(ui.selfMark) ? '붙어 있음 (누르면 뗌)' : '붙이기'}
          </Btn>
          {!!(ui.reminders?.length || ui.kill || ui.revive || ui.pick) && <Hint style={{ margin: 0 }}>능력을 쓰면(붙이기·사망·되살리기) 자동으로 붙습니다.</Hint>}
        </Row>
      )}
    </div>
  );
}

// 캐릭터별로 바로 여는 정보 카드 문장(포켓 그리모어의 캐릭터별 info token)
const INFO_PRESET: Record<string, string> = {
  undertaker: '오늘 처형된 사람의 캐릭터',
  grandmother: '이 사람이 당신의 손주입니다',
  washerwoman: '이 중 한 명이 이 캐릭터입니다',
  librarian: '이 중 한 명이 이 캐릭터입니다',
  investigator: '이 중 한 명이 이 캐릭터입니다',
  ravenkeeper: '이 플레이어의 캐릭터는',
  dreamer: '이 플레이어의 캐릭터는',
};

/** 밤 진행 모드: 한 장씩 크게 보여주고 넘길 때마다 체크한다 */
export function NightMode({
  state,
  phase,
  startKey,
  onCheck,
  onClose,
  onShow,
  onOpenInfo,
  onEndNight,
  onStep,
  onReminder,
  onKill,
  onRevive,
  onNote,
  picked,
  onTogglePick,
  onPickMode,
}: {
  state: GrimoireState;
  phase: GrimoirePhase;
  startKey?: string | null;
  // 대상 고르기: 리마인더 옮겨 붙이기 / 밤 사망 처리 / 되살리기 / 정보 기록에 한 줄 남기기
  onReminder: (seatIds: string[], text: string, source: string, keepIds: string[]) => void;
  onKill: (seatId: string) => void;
  onRevive: (seatId: string) => void;
  onNote: (text: string) => void;
  onCheck: (key: string) => void;
  onClose: () => void;
  onShow: (content: ShowContent) => void;
  onOpenInfo: (preset?: InfoPreset) => void;
  onEndNight: () => void;
  // 보고 있는 단계를 알린다(보여 준 정보를 그 단계로 기록). 닫히면 null
  onStep?: (step: NightStepContext | null) => void;
  // 고른 사람(페이지가 들고 있다 — 원형 마도서 토큰을 눌러도 고른다)
  picked: string[];
  onTogglePick: (seatId: string) => void;
  // 이 단계가 대상 고르기 단계인지 알린다. 켜져 있으면 토큰 누름 = 고르기
  onPickMode: (active: boolean) => void;
}) {
  const items = useMemo(() => playableItems(state), [state]);
  const checked = new Set(state.nightChecked);
  const firstOpen = Math.max(
    0,
    startKey ? items.findIndex(i => i.key === startKey) : items.findIndex(i => !checked.has(i.key))
  );
  const [index, setIndex] = useState(firstOpen);
  const tipCache = useRef(new Map<string, Tip[]>());
  const tipsFor = (k: string, make: () => Tip[]) => {
    const hit = tipCache.current.get(k);
    if (hit) return hit;
    const made = make();
    tipCache.current.set(k, made);
    return made;
  };
  const item = items[Math.min(index, items.length - 1)];
  const stepName = item?.role.name ?? null;
  const stepWho = item ? whoLabel(item) || null : null;
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;
  useEffect(() => {
    onStepRef.current?.(stepName ? { step: stepName, who: stepWho } : null);
  }, [stepName, stepWho]);
  useEffect(() => () => onStepRef.current?.(null), []);
  // 죽은 캐릭터(오늘 밤 악마에게 죽은 점쟁이 등)는 능력이 없다 — 도우미를 다 감춘다
  const asleep = !!item && sleepsDead(item);
  const ui: StepUi = item && !asleep ? uiOf(item, state.nightTab) : {};
  const hasPick = hasPickPart(ui);
  // 토큰 누름 = 고르기는 대상을 고르는 단계만(거리의 악사처럼 본인 예/아니오·본인 기록만이면 평소대로 좌석 메뉴)
  const pickable = !!ui.pick;
  const onPickModeRef = useRef(onPickMode);
  onPickModeRef.current = onPickMode;
  useEffect(() => {
    onPickModeRef.current(pickable);
  }, [pickable, item?.key]);
  useEffect(() => () => onPickModeRef.current(false), []);
  // 카드 안 탭: [정보](보여 줄 것·숫자) / [고르기](질문 카드·대상·처리). 둘 다 내용이 있을 때만 탭, 고르는 단계는 [고르기]부터 연다
  const [tabFor, setTabFor] = useState<{ key: string; tab: 'info' | 'pick' } | null>(null);

  if (!item) return null;
  const last = index >= items.length - 1;
  const isCharacter = item.seats.length > 0;
  const evilCards = evilInfoCards(state, item.role.key);
  // 같은 단계를 보는 동안 무작위로 고른 추천값이 바뀌지 않게 단계가 바뀔 때만 다시 계산한다
  const tips = asleep ? [] : tipsFor(item.key, () => suggestions(state, item));
  const impaired = impairedNotes(state, item);
  const actor = actingSeat(item.seats, item.role.key);
  const undertakerEmpty = item.role.key === 'undertaker' && !asleep && tips.length === 0;
  const cards = (ui.cards ?? []).map(c => cardPreset(state, item, c, actor?.id ?? null, picked));
  const numbers = ui.numbers ? numberOptions(ui.numbers) : null;
  const hasInfo = evilCards.length > 0 || tips.length > 0 || undertakerEmpty || cards.length > 0 || !!numbers;
  const tabbed = hasPick && hasInfo;
  const tab = tabFor?.key === item.key ? tabFor.tab : hasPick ? 'pick' : 'info';
  const showPick = hasPick && (!tabbed || tab === 'pick');
  const showInfo = !tabbed || tab === 'info';

  const next = () => {
    if (!checked.has(item.key)) onCheck(item.key);
    if (last) onClose();
    else setIndex(index + 1);
  };

  return (
    // 마도서를 가리지 않는 옆(세로 화면은 아래) 패널 — 원형 마도서의 토큰을 눌러 대상을 고를 수 있다
    <NightDock>
        <SheetHead>
          <h3>{state.nightTab === 'first' ? '첫날 밤' : `${state.day}번째 밤`}</h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>
        <NightCard>
          <NightStepNo>
            {index + 1} / {items.length}
            {checked.has(item.key) ? ' · 완료' : ''}
          </NightStepNo>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RoleArt urls={tokenImageCandidates(item.role, null)} alt="" size={64} dead={item.allDead} />
            <NightTitle>
              {item.role.name}
              {item.diedTonight && (
                <Mark $tone="evil" style={{ marginLeft: 8, fontSize: 14, verticalAlign: 'middle' }}>
                  오늘 밤 사망
                </Mark>
              )}
            </NightTitle>
          </div>
          {item.seats.length > 0 && (
            <NightWho>
              {whoLabel(item, roleMap(state.data))}
              {asleep ? ' — 죽어서 능력이 없습니다. 깨우지 말고 넘기세요' : ''}
            </NightWho>
          )}
          <NightText style={{ fontSize: 15 }}>{renderNightText(item.text)}</NightText>
          {ui.note && <Hint style={{ margin: 0 }}>💡 {ui.note}</Hint>}
          {impaired.length > 0 && (
            <Hint style={{ color: 'var(--ct-evil)', margin: 0 }}>
              ⚠ {impaired.join(' · ')} — 틀린 정보를 줘도 됩니다{tips.length > 0 ? '. [바꿔서 보여주기]로 고쳐 보여 주세요' : ''}.
            </Hint>
          )}

          {tabbed && (
            <Row>
              <Tab type="button" $active={tab === 'pick'} onClick={() => setTabFor({ key: item.key, tab: 'pick' })}>
                고르기 · 처리
              </Tab>
              <Tab type="button" $active={tab === 'info'} onClick={() => setTabFor({ key: item.key, tab: 'info' })}>
                정보 · 숫자
              </Tab>
            </Row>
          )}
          {showPick && (
            <ChoiceHelper
              key={item.key}
              state={state}
              item={item}
              ui={ui}
              onReminder={onReminder}
              onKill={onKill}
              onRevive={onRevive}
              onShow={onShow}
              onOpenInfo={onOpenInfo}
              onNote={onNote}
              picked={picked}
              onTogglePick={onTogglePick}
            />
          )}
          {showInfo && (
            <>
          {/* 능력 도우미: 하수인·악마 정보, 장의사·초공감자·요리사 참고값, 정보 카드 단축, 숫자·예/아니오 */}
          {evilCards.length > 0 && (
            <Row>
              {evilCards.map(c => (
                <Btn key={c.title} type="button" onClick={() => onShow(c)}>
                  보여주기: {c.title}
                </Btn>
              ))}
            </Row>
          )}
          {tips.map(t => (
            <Row key={t.label}>
              <Btn type="button" onClick={() => onShow(t.content)}>
                보여주기: {t.label}
              </Btn>
              {t.preset && (
                <Btn type="button" onClick={() => onOpenInfo(t.preset)}>
                  바꿔서 보여주기
                </Btn>
              )}
            </Row>
          ))}
          {undertakerEmpty && (
            <Hint>{state.day - 1}일째 낮에 처형으로 죽은 사람이 없습니다 — 장의사는 깨우지 않거나 아무것도 보여주지 않습니다.</Hint>
          )}
          {tips.length > 0 && (
            <Hint>
              참고값은 실제 캐릭터·선악으로만 계산했습니다. 취함·중독, 은둔자·스파이 오등록은 직접 판단하세요
              {numbers ? '(숫자는 아래에서 다른 값을 고르면 됩니다)' : ''}.
            </Hint>
          )}
          {cards.length > 0 && (
            <Row>
              {cards.map((c, i) => (
                <Btn key={`${i}-${c.label}`} type="button" onClick={() => onOpenInfo(c.preset)}>
                  보여주기: {c.label}
                </Btn>
              ))}
            </Row>
          )}
          {numbers && (
            <Row>
              <Hint style={{ margin: 0 }}>{numbers.label}</Hint>
              {numbers.values.map(v => (
                <Chip key={v} type="button" onClick={() => onShow({ title: '', roles: [], big: v })} style={{ minWidth: 44 }}>
                  {v}
                </Chip>
              ))}
            </Row>
          )}
          {isCharacter && !asleep && (
            <Row>
              <Btn type="button" onClick={() => onOpenInfo({ text: INFO_PRESET[item.role.key] })}>
                정보 카드…
              </Btn>
            </Row>
          )}
            </>
          )}

          <NightNav style={{ position: 'sticky', bottom: -16, margin: '0 -16px -16px', padding: '12px 16px', background: 'var(--ct-surface)', borderTop: '1px solid var(--ct-line)' }}>
            <Btn type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
              ◀ 이전
            </Btn>
            {last && phase === 'NIGHT' ? (
              <Btn
                type="button"
                $tone="primary"
                onClick={() => {
                  if (!checked.has(item.key)) onCheck(item.key);
                  onClose();
                  onEndNight();
                }}
              >
                완료 · 밤 끝내기
              </Btn>
            ) : (
              <Btn type="button" $tone="primary" onClick={next}>
                {last ? '완료 · 닫기' : '완료 · 다음 ▶'}
              </Btn>
            )}
          </NightNav>
        </NightCard>
    </NightDock>
  );
}
