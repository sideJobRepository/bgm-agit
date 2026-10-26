import { useEffect, useMemo, useRef, useState } from 'react';
import type { GrimoirePhase, GrimoireRole, GrimoireState, NightTab } from '../../../types/clocktower.ts';
import { renderNightText } from '../../../utils/clocktowerText.tsx';
import { dayLogOf, isEvilSeat, nightItems, roleMap, shuffle, sleepsDead, type NightItem } from './grimoireRules.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';
import type { ShowContent } from './ShowPanels.tsx';
import type { InfoPreset } from './InfoCards.tsx';
import type { NightStepContext } from './nightLog.ts';
import {
  actingSeat,
  attackResult,
  fortuneTellerAnswer,
  ravenkeeperAnswer,
  seamstressAnswer,
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

// 밤에 사람을 죽이는 캐릭터(악마는 진영으로 따로 본다) — 대상 고르기에 [사망 처리]를 둔다
const KILLERS = new Set(['assassin', 'godfather', 'gambler']);
// 대상을 정확히 몇 명 고르면 참고 답을 내는 정보 캐릭터
const ANSWER_PICKS: Record<string, number> = { fortuneteller: 2, seamstress: 2, ravenkeeper: 1, dreamer: 1 };
// 대상을 고르는 리마인더가 아닌 것(셋업 때 한 번 정하는 것) — 대상 고르기 버튼에서 뺀다
const SETUP_REMINDER: Record<string, true> = { fortuneteller: true };
const VERDICT_LABEL: Record<Verdict, string> = { DIES: '죽습니다', SAFE: '죽지 않습니다', MAYBE: '이야기꾼 판단', NONE: '아무 일 없음' };
// 고르지 않아도 되는 캐릭터(한 번만 쓰는 능력·고를지 말지 정하는 능력) — [능력을 사용하시겠습니까?]부터 보여준다
const ASK_USE = new Set([
  'po', 'professor', 'seamstress', 'courtier', 'huntsman', 'nightwatchman', 'engineer', 'assassin', 'philosopher', 'harlot',
]);
// 캐릭터를 고르는 능력 — [캐릭터를 고르세요] 카드
const CHOOSE_CHARACTER = new Set(['courtier', 'pithag', 'philosopher', 'cerenovus', 'ojo', 'engineer', 'huntsman', 'wizard', 'xaan']);
// 플레이어를 고르지 않는 캐릭터 — [플레이어를 고르세요]를 빼고 대상 칩은 리마인더 붙일 자리용으로만
const NO_PLAYER_PICK = new Set(['philosopher', 'engineer', 'ojo', 'courtier']);
// 대상 고르기를 띄우지 않는 단계(위의 자동 참고값으로 충분한 정보 캐릭터)
const INFO_ONLY = new Set(['washerwoman', 'librarian', 'investigator', 'empath', 'chef', 'clockmaker', 'undertaker', 'grandmother']);
// 캐릭터별 짧은 진행 메모(밤 문구에 없는 처리 순서)
const ROLE_NOTES: Record<string, string> = {
  po: '아무도 고르지 않으면 다음 밤에 3명까지 죽입니다 — [사용 안 함] 뒤 포에게 충전 리마인더를 붙이세요.',
  shabaloth: '2명까지 죽입니다. 전날 밤 죽은 사람 중 1명을 되살릴 수 있습니다(되살리기는 좌석 메뉴).',
  zombuul: '오늘 낮에 아무도 죽지 않았을 때만 깨웁니다.',
  professor: '죽은 마을주민을 되살립니다 — 되살리기는 좌석 메뉴에서.',
  pithag: '고른 사람의 캐릭터 바꾸기는 좌석 메뉴의 [캐릭터 바꾸기]에서. 악마가 새로 생기면 오늘 밤 사망은 이야기꾼 마음입니다.',
  courtier: '고른 캐릭터가 게임에 있으면 그 사람에게 취함 리마인더를 3밤 동안 붙이세요.',
  philosopher: '고른 캐릭터를 얻습니다. 그 캐릭터가 게임에 있으면 그 사람은 취합니다.',
  gambler: '틀리면 도박꾼이 죽습니다.',
  godfather: '오늘 외지인이 죽었을 때만 깨웁니다.',
  assassin: '보호를 무시하고 죽입니다(게임당 한 번).',
  witch: '저주받은 사람이 내일 지명하면 죽습니다 — 리마인더를 붙이세요.',
  cerenovus: '고른 사람에게 "미친 척해야 하는 캐릭터"를 보여주세요(정보 카드).',
  pukka: '고른 사람은 중독되고, 전날 중독된 사람이 죽습니다.',
  nodashii: '이웃한 마을주민 2명은 중독됩니다.',
  vigormortis: '죽인 하수인은 능력을 유지하고, 그 이웃 마을주민 1명이 중독됩니다.',
  fanggu: '외지인을 죽이면 그 사람이 팡 구가 되고 악이 됩니다(한 번) — 좌석 메뉴로 캐릭터를 바꾸세요.',
};

/**
 * 대상 고르기(임프·독살자·수도승처럼 밤에 사람을 고르는 캐릭터).
 * 플레이어가 고른 사람을 누르면 → 그 캐릭터의 리마인더 붙이기, 악마·암살자 등은 [사망 처리],
 * 점쟁이·재봉사·까마귀지기·몽상가는 참고 답을 만든다. 실제 캐릭터·선악 기준이라 취함·중독·오등록은 이야기꾼 판단.
 */
function ChoiceHelper({
  state,
  item,
  onReminder,
  onKill,
  onShow,
  onOpenInfo,
  onNote,
  picked,
  onTogglePick,
}: {
  state: GrimoireState;
  item: NightItem;
  onReminder: (seatIds: string[], text: string, source: string, keepIds: string[]) => void;
  onKill: (seatId: string) => void;
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
  const kills = role.team === 'DEMON' || KILLERS.has(role.key);
  const reminders = SETUP_REMINDER[role.key] ? [] : [...new Set(role.reminders)];
  const need = ANSWER_PICKS[role.key];

  const toggle = onTogglePick;

  const actor = actingSeat(item.seats, role.key);
  // 공격 판정(보호·군인·선원·어릿광대·구마사제·중독된 공격자 등, nightChoice.ts)
  const attacks = kills ? targets.map(x => ({ ...x, result: attackResult(state, role, actor, x.s) })) : [];
  const warnings: string[] = targets.filter(x => x.s.dead && !kills).map(x => `${x.no}번은 이미 죽었습니다`);

  // 참고 답(정확히 그 수만큼 골랐을 때)
  let answer: { label: string; content: ShowContent; preset?: InfoPreset; reasons?: string[] } | null = null;
  if (need && targets.length === need) {
    const picks = targets.map(x => x.s);
    const yesNo = (a: InfoAnswer) => ({
      label: `참고 답: ${a.answer}${a.free ? ' (아무 답이나 가능)' : ''}`,
      content: { title: '', roles: [], big: a.answer },
      reasons: a.reasons,
    });
    if (role.key === 'fortuneteller') answer = yesNo(fortuneTellerAnswer(state, role, actor, picks));
    else if (role.key === 'seamstress') answer = yesNo(seamstressAnswer(state, actor, picks));
    else if (role.key === 'ravenkeeper') {
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
    } else if (role.key === 'dreamer') {
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

  // 리마인더 붙이기. 같은 문구가 여러 장인 캐릭터(여관 주인 안전함×2, 포 사망×3)는 한 버튼으로 고른 사람 모두에게,
  // 장 수보다 많이 골랐을 때는 사람마다 따로(여관 주인 '취함'은 둘 중 한 명) 붙인다
  const attach = (text: string, ids: string[]) => {
    onReminder(ids, text, role.name, picked);
    const who = targets.filter(x => ids.includes(x.s.id)).map(x => `${x.no}. ${x.s.name}`).join(', ');
    onNote(`${role.name} → ${who}: '${text}' 붙임`);
  };
  const copies = (text: string) => role.reminders.filter(t => t === text).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--ct-line)', paddingTop: 10 }}>
      {ROLE_NOTES[role.key] && <Hint style={{ margin: 0 }}>💡 {ROLE_NOTES[role.key]}</Hint>}
      {/* 깨운 사람에게 먼저 보여 줄 질문 카드 */}
      <Row>
        {ASK_USE.has(role.key) && (
          <>
            <Btn type="button" onClick={() => onShow({ title: '능력을 사용하시겠습니까?', roles: [] })}>
              보여주기: 능력을 사용하시겠습니까?
            </Btn>
            <Btn
              type="button"
              onClick={() => {
                onNote(`${role.name}: 능력 사용 안 함`);
                // 포는 다음 밤 3명을 공격한다(퀴즈 #70) — 포 자리에 '공격 3번'을 붙인다
                const charge = role.reminders.find(t => /3/.test(t) && /공격/.test(t));
                if (role.key === 'po' && charge && actor) onReminder([actor.id], charge, role.name, [actor.id]);
              }}
            >
              사용 안 함
            </Btn>
          </>
        )}
        {!NO_PLAYER_PICK.has(role.key) && (
          <Btn type="button" onClick={() => onShow({ title: '플레이어를 고르세요', roles: [] })}>
            보여주기: 플레이어를 고르세요
          </Btn>
        )}
        {CHOOSE_CHARACTER.has(role.key) && (
          <Btn type="button" onClick={() => onShow({ title: '캐릭터를 고르세요', roles: [] })}>
            보여주기: 캐릭터를 고르세요
          </Btn>
        )}
      </Row>
      <Hint style={{ margin: 0 }}>
        {NO_PLAYER_PICK.has(role.key) ? '리마인더를 붙일 자리' : `대상 고르기${need ? ` (${need}명)` : ''} — 마도서의 토큰이나 아래 이름을 누르세요`}
      </Hint>
      <Row>
        {ring.map(({ s, no }) => (
          <Chip key={s.id} type="button" $active={picked.includes(s.id)} onClick={() => toggle(s.id)} style={{ opacity: s.dead ? 0.55 : 1 }}>
            {no}. {s.name}
            {s.dead ? ' †' : ''}
          </Chip>
        ))}
      </Row>
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
                  }}
                >
                  {no}. {s.name} {result.verdict === 'DIES' ? '사망 처리' : '그래도 사망 처리'}
                </Btn>
              </Row>
            </div>
          ))}
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
            {!reminders.length && !kills && !answer && (
              <Btn type="button" onClick={() => onNote(`${role.name} → ${names} 선택`)}>
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
    </div>
  );
}

/** 이 단계에 대상 고르기를 띄울지(사람·캐릭터를 고르거나 리마인더를 붙이는 캐릭터) */
function wantsChoice(item: NightItem) {
  const k = item.role.key;
  if (item.seats.length === 0 || INFO_ONLY.has(k)) return false;
  return (
    item.role.team === 'DEMON' ||
    KILLERS.has(k) ||
    k in ANSWER_PICKS ||
    ASK_USE.has(k) ||
    CHOOSE_CHARACTER.has(k) ||
    item.role.reminders.length > 0 ||
    /고르|고릅|골라|선택/.test(item.text ?? '')
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
  onNote,
  picked,
  onTogglePick,
  onPickMode,
}: {
  state: GrimoireState;
  phase: GrimoirePhase;
  startKey?: string | null;
  // 대상 고르기: 리마인더 옮겨 붙이기 / 밤 사망 처리 / 정보 기록에 한 줄 남기기
  onReminder: (seatIds: string[], text: string, source: string, keepIds: string[]) => void;
  onKill: (seatId: string) => void;
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
  const choosing = !!item && !sleepsDead(item) && wantsChoice(item);
  const onPickModeRef = useRef(onPickMode);
  onPickModeRef.current = onPickMode;
  useEffect(() => {
    onPickModeRef.current(choosing);
  }, [choosing, item?.key]);
  useEffect(() => () => onPickModeRef.current(false), []);
  // 카드 안 탭: [정보](보여 줄 것·숫자) / [고르기](질문 카드·대상·처리). 고르는 단계는 [고르기]부터 연다
  const [tabFor, setTabFor] = useState<{ key: string; tab: 'info' | 'pick' } | null>(null);

  if (!item) return null;
  const tab = tabFor?.key === item.key ? tabFor.tab : choosing ? 'pick' : 'info';
  const last = index >= items.length - 1;
  const isCharacter = item.seats.length > 0;
  const evilCards = evilInfoCards(state, item.role.key);
  // 죽은 캐릭터(오늘 밤 악마에게 죽은 점쟁이 등)는 능력이 없다 — 도우미를 다 감춘다
  const asleep = sleepsDead(item);
  // 같은 단계를 보는 동안 무작위로 고른 추천값이 바뀌지 않게 단계가 바뀔 때만 다시 계산한다
  const tips = asleep ? [] : tipsFor(item.key, () => suggestions(state, item));
  const impaired = impairedNotes(state, item);

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

          {choosing && (
            <Row>
              <Tab type="button" $active={tab === 'pick'} onClick={() => setTabFor({ key: item.key, tab: 'pick' })}>
                고르기 · 처리
              </Tab>
              <Tab type="button" $active={tab === 'info'} onClick={() => setTabFor({ key: item.key, tab: 'info' })}>
                정보 · 숫자
              </Tab>
            </Row>
          )}
          {tab === 'info' && (
            <>
          {/* 능력 도우미: 하수인·악마 정보, 장의사·초공감자·요리사 참고값, 숫자·예/아니오, 정보 카드 */}
          {evilCards.length > 0 && (
            <Row>
              {evilCards.map(c => (
                <Btn key={c.title} type="button" onClick={() => onShow(c)}>
                  보여주기: {c.title}
                </Btn>
              ))}
            </Row>
          )}
          {impaired.length > 0 && (
            <Hint style={{ color: 'var(--ct-evil)', margin: 0 }}>
              ⚠ {impaired.join(' · ')} — 틀린 정보를 줘도 됩니다. [바꿔서 보여주기]나 아래 숫자로 고르세요.
            </Hint>
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
          {item.role.key === 'undertaker' && !asleep && tips.length === 0 && (
            <Hint>{state.day - 1}일째 낮에 처형으로 죽은 사람이 없습니다 — 장의사는 깨우지 않거나 아무것도 보여주지 않습니다.</Hint>
          )}
          {tips.length > 0 && (
            <Hint>
              참고값은 실제 캐릭터·선악으로만 계산했습니다. 취함·중독, 은둔자·스파이 오등록은 직접 판단하세요(숫자는 아래에서 다른 값을 고르면 됩니다).
            </Hint>
          )}
          {isCharacter && !asleep && (
            <Row>
              <Hint style={{ margin: 0 }}>숫자</Hint>
              {[0, 1, 2, 3, 4, 5].map(n => (
                <Chip key={n} type="button" onClick={() => onShow({ title: '', roles: [], big: String(n) })} style={{ minWidth: 44 }}>
                  {n}
                </Chip>
              ))}
              <Chip type="button" onClick={() => onShow({ title: '', roles: [], big: '예' })}>
                예
              </Chip>
              <Chip type="button" onClick={() => onShow({ title: '', roles: [], big: '아니오' })}>
                아니오
              </Chip>
              <Btn type="button" onClick={() => onOpenInfo({ text: INFO_PRESET[item.role.key] })}>
                정보 카드…
              </Btn>
            </Row>
          )}

            </>
          )}
          {tab === 'pick' && (
            <>
          {!asleep && wantsChoice(item) && (
            <ChoiceHelper
              key={item.key}
              state={state}
              item={item}
              onReminder={onReminder}
              onKill={onKill}
              onShow={onShow}
              onOpenInfo={onOpenInfo}
              onNote={onNote}
              picked={picked}
              onTogglePick={onTogglePick}
            />
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
