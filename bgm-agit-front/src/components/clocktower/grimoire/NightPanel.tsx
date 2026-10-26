import { useMemo, useRef, useState } from 'react';
import type { GrimoirePhase, GrimoireRole, GrimoireState, NightTab } from '../../../types/clocktower.ts';
import { renderNightText } from '../../../utils/clocktowerText.tsx';
import { dayLogOf, isEvilSeat, nightItems, roleMap, shuffle, type NightItem } from './grimoireRules.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';
import type { ShowContent } from './ShowPanels.tsx';
import type { InfoPreset } from './InfoCards.tsx';
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
  Overlay,
  Row,
  Sheet,
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
                    오늘 밤 사망
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
    // N번째 밤에 보는 것은 바로 전 낮(N-1일째)의 처형
    const exec = [...dayLogOf(state, state.day - 1).executions].reverse().find(e => e.died && e.characterAtExecution);
    const role = exec ? roles.get(exec.characterAtExecution ?? '') : null;
    if (role) {
      const title = '오늘 처형된 사람의 캐릭터';
      out.push({ label: `처형된 사람의 캐릭터: ${role.name}`, content: { title, roles: [role] }, preset: { text: title, roleKeys: [role.key] } });
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
}: {
  state: GrimoireState;
  phase: GrimoirePhase;
  startKey?: string | null;
  onCheck: (key: string) => void;
  onClose: () => void;
  onShow: (content: ShowContent) => void;
  onOpenInfo: (preset?: InfoPreset) => void;
  onEndNight: () => void;
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

  if (!item) return null;
  const last = index >= items.length - 1;
  const isCharacter = item.seats.length > 0;
  const evilCards = evilInfoCards(state, item.role.key);
  // 같은 단계를 보는 동안 무작위로 고른 추천값이 바뀌지 않게 단계가 바뀔 때만 다시 계산한다
  const tips = tipsFor(item.key, () => suggestions(state, item));
  const impaired = impairedNotes(state, item);

  const next = () => {
    if (!checked.has(item.key)) onCheck(item.key);
    if (last) onClose();
    else setIndex(index + 1);
  };

  return (
    <Overlay>
      <Sheet $wide>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <RoleArt urls={tokenImageCandidates(item.role, null)} alt="" size={110} dead={item.allDead} />
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
              {item.allDead && !item.diedTonight ? ' — 죽은 캐릭터는 보통 깨우지 않습니다' : ''}
            </NightWho>
          )}
          <NightText>{renderNightText(item.text)}</NightText>

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
          {item.role.key === 'undertaker' && tips.length === 0 && (
            <Hint>오늘 처형으로 죽은 사람이 없습니다(장의사는 아무것도 배우지 않습니다).</Hint>
          )}
          {tips.length > 0 && (
            <Hint>
              참고값은 실제 캐릭터·선악으로만 계산했습니다. 취함·중독, 은둔자·스파이 오등록은 직접 판단하세요(숫자는 아래에서 다른 값을 고르면 됩니다).
            </Hint>
          )}
          {isCharacter && (
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

          <NightNav>
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
      </Sheet>
    </Overlay>
  );
}
