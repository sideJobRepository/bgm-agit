import type { GrimoireBagEntry, GrimoireData, GrimoireRole, GrimoireSeat, GrimoireState } from '../../../types/clocktower.ts';
import {
  BASE_TEAMS,
  PERCEPTION,
  believedCandidates,
  expectedCounts,
  isBagDisabled,
  isBaseTeam,
  isTravellerSeat,
  shuffle,
  type TeamCounts,
} from './grimoireRules.ts';

/**
 * 셋업 = 캐릭터 주머니 → 악마의 속임수 → 섞어서 나눠 앉히기.
 * 실제 보드게임에서 이야기꾼이 주머니를 만들고 플레이어가 토큰을 뽑는 순서를 그대로 옮겼다.
 * 주머니를 먼저 정해야 악마의 속임수(게임에 없는 캐릭터)를 고를 수 있고, 누가 무엇인지는 나눌 때 정해진다.
 */

/** 주머니에서 캐릭터를 받는 자리. 여행자는 이야기꾼이 따로 정하고 떠난 자리는 뺀다 */
export function bagTargets(seats: GrimoireSeat[], roles: Map<string, GrimoireRole>) {
  return seats.filter(s => !s.left && !isTravellerSeat(s, roles));
}

/** 이미 나눠 앉혔는지(직접 배정·[무작위 배정]으로 정한 경우 포함). 그러면 셋업 단계 안내를 닫는다 */
export function isDealt(state: GrimoireState, roles: Map<string, GrimoireRole>) {
  return bagTargets(state.seats, roles).some(s => !!s.roleKey);
}

// 주정뱅이·꼭두각시는 주머니에 다른 토큰이 들어가는 캐릭터라 isBagDisabled 지만,
// 여기서는 믿는 캐릭터를 같이 정해 두므로 고를 수 있게 한다. 릴 몬스타는 좌석 캐릭터가 아니라 뺀다
const BELIEVED_IN_BAG = new Set(['drunk', 'marionette']);

/** 주머니에 넣을 수 있는 캐릭터(마을주민·외부인·하수인·악마) */
export function bagChoices(data: GrimoireData): GrimoireRole[] {
  return data.roles.filter(r => isBaseTeam(r.team) && (!isBagDisabled(r) || BELIEVED_IN_BAG.has(r.key)));
}

export function bagCounts(bag: GrimoireBagEntry[], roles: Map<string, GrimoireRole>): TeamCounts {
  const counts: TeamCounts = { TOWNSFOLK: 0, OUTSIDER: 0, MINION: 0, DEMON: 0 };
  for (const e of bag) {
    const team = roles.get(e.key)?.team;
    if (isBaseTeam(team)) counts[team]++;
  }
  return counts;
}

/** 주머니에 있거나 누군가 믿는 캐릭터 — 악마의 속임수·믿는 캐릭터 후보에서 뺀다 */
export function usedKeys(bag: GrimoireBagEntry[]) {
  const used = new Set<string>();
  bag.forEach(e => {
    used.add(e.key);
    if (e.believedKey) used.add(e.believedKey);
  });
  return used;
}

/**
 * 믿는 캐릭터 후보. 다른 사람이 실제로 받거나 믿는 캐릭터는 빼야 겹치지 않는다
 * (주정뱅이가 믿는 점쟁이와 진짜 점쟁이가 둘 다 있으면 정체가 드러난다).
 */
export function believedOptions(entry: GrimoireBagEntry, bag: GrimoireBagEntry[], data: GrimoireData) {
  const others = usedKeys(bag.filter(e => e !== entry));
  others.add(entry.key);
  return believedCandidates(entry.key, data).filter(r => !others.has(r.key));
}

/** 믿는 캐릭터가 비어 있는 칸을 무작위로 채운다(이미 정한 것은 그대로) */
export function fillBelieved(bag: GrimoireBagEntry[], data: GrimoireData): GrimoireBagEntry[] {
  const next = bag.map(e => ({ ...e }));
  for (const e of next) {
    if (!PERCEPTION[e.key] || e.believedKey) continue;
    const pick = shuffle(believedOptions(e, next, data))[0];
    if (pick) e.believedKey = pick.key;
  }
  return next;
}

/** 공식 분배표에서 모자란 진영만 무작위로 채운다. 이야기꾼이 이미 고른 캐릭터는 그대로 둔다 */
export function fillBagRandom(
  bag: GrimoireBagEntry[],
  data: GrimoireData,
  roles: Map<string, GrimoireRole>,
  players: number
): { ok: true; bag: GrimoireBagEntry[] } | { ok: false; message: string } {
  const counts = expectedCounts(players);
  if (!counts) return { ok: false, message: '주머니를 받을 인원이 5~15명이어야 무작위로 채울 수 있습니다.' };
  const have = bagCounts(bag, roles);
  const used = usedKeys(bag);
  const next = [...bag];
  for (const team of BASE_TEAMS) {
    const need = counts[team] - have[team];
    if (need <= 0) continue;
    // 무작위로는 주정뱅이·꼭두각시를 넣지 않는다(기존 [무작위 배정]과 같은 규칙). 넣고 싶으면 직접 고른다
    const pool = shuffle(data.roles.filter(r => r.team === team && !isBagDisabled(r) && !used.has(r.key)));
    if (pool.length < need) return { ok: false, message: '스크립트에 진영별 캐릭터가 모자랍니다.' };
    pool.slice(0, need).forEach(r => next.push({ key: r.key, believedKey: null }));
  }
  return { ok: true, bag: fillBelieved(next, data) };
}

/** 2단계로 넘어가기 전에 막을 것. 분배표와 다른 것은 남작 같은 셋업 캐릭터가 있어 막지 않고 경고만 한다 */
export function bagProblems(bag: GrimoireBagEntry[], targets: number, roles: Map<string, GrimoireRole>): string[] {
  const problems: string[] = [];
  if (bag.length !== targets) problems.push(`주머니 ${bag.length}개 / 받을 자리 ${targets}개 — 수를 맞춰 주세요.`);
  const missing = bag.filter(e => PERCEPTION[e.key] && !e.believedKey).map(e => roles.get(e.key)?.name ?? e.key);
  if (missing.length) problems.push(`${missing.join(', ')}: 믿는 캐릭터를 정해 주세요.`);
  return problems;
}

/**
 * 악마의 속임수: 게임에 없는 선한 캐릭터 3개. 마을주민 2 + 외부인 1(RB p.25 권장), 외부인이 모자라면 마을주민.
 * pickBluffs 와 같은 규칙인데 좌석이 아니라 주머니를 본다(아직 아무도 앉지 않았다).
 */
export function pickBluffsFromBag(bag: GrimoireBagEntry[], data: GrimoireData): string[] {
  const used = usedKeys(bag);
  const pool = (team: 'TOWNSFOLK' | 'OUTSIDER') =>
    shuffle(data.roles.filter(r => r.team === team && !used.has(r.key) && !isBagDisabled(r)));
  const outsiders = pool('OUTSIDER').slice(0, 1);
  return shuffle([...pool('TOWNSFOLK').slice(0, 3 - outsiders.length), ...outsiders]).map(r => r.key);
}

/** 악마의 속임수로 고를 수 있는 캐릭터(주머니에 없는 마을주민·외부인) */
export function bluffChoices(bag: GrimoireBagEntry[], data: GrimoireData): GrimoireRole[] {
  const used = usedKeys(bag);
  return data.roles.filter(
    r => (r.team === 'TOWNSFOLK' || r.team === 'OUTSIDER') && !used.has(r.key) && !isBagDisabled(r)
  );
}

export const BLUFF_COUNT = 3;

/**
 * 주머니를 섞어 받을 자리에 나눈다. 선악은 캐릭터 진영대로(null) 둔다.
 * 꼭두각시는 악마 옆자리여야 해서(W/Marionette "neighbours the Demon") 섞은 뒤 악마 옆 자리와 맞바꾼다.
 */
export function dealBag(
  state: GrimoireState,
  roles: Map<string, GrimoireRole>
): { ok: true; state: GrimoireState; warnings: string[] } | { ok: false; message: string } {
  const bag = state.bag ?? [];
  const targets = bagTargets(state.seats, roles);
  const problems = bagProblems(bag, targets.length, roles);
  if (problems.length) return { ok: false, message: problems.join(' ') };

  const assigned = new Map<string, GrimoireBagEntry>();
  const shuffled = shuffle(bag);
  targets.forEach((s, i) => assigned.set(s.id, shuffled[i]));

  const warnings: string[] = [];
  const marionetteSeat = targets.find(s => assigned.get(s.id)?.key === 'marionette');
  const demonSeat = targets.find(s => roles.get(assigned.get(s.id)?.key ?? '')?.team === 'DEMON');
  if (marionetteSeat && demonSeat) {
    // 원형 좌석에서 악마 양옆(떠난 자리는 건너뛴다). 여행자 자리는 주머니 캐릭터가 아니라 맞바꿀 수 없다
    const ring = state.seats.filter(s => !s.left);
    const at = ring.findIndex(s => s.id === demonSeat.id);
    const sides = [ring[(at - 1 + ring.length) % ring.length], ring[(at + 1) % ring.length]];
    if (!sides.some(s => s.id === marionetteSeat.id)) {
      const swapWith = shuffle(sides.filter(s => assigned.has(s.id) && s.id !== demonSeat.id))[0];
      if (swapWith) {
        const a = assigned.get(swapWith.id) as GrimoireBagEntry;
        assigned.set(swapWith.id, assigned.get(marionetteSeat.id) as GrimoireBagEntry);
        assigned.set(marionetteSeat.id, a);
      } else {
        warnings.push('꼭두각시를 악마 옆자리에 앉힐 수 없었습니다(양옆이 여행자). 좌석을 직접 조정해 주세요.');
      }
    }
  }

  return {
    ok: true,
    warnings,
    state: {
      ...state,
      seats: state.seats.map(s => {
        const e = assigned.get(s.id);
        return e ? { ...s, roleKey: e.key, believedRoleKey: e.believedKey, evil: null } : s;
      }),
    },
  };
}
