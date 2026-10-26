import type { GrimoireRole, GrimoireSeat, GrimoireState } from '../../../types/clocktower.ts';
import { isEvilSeat, roleMap } from './grimoireRules.ts';

/**
 * 밤 진행 대상 고르기의 판정(누가 죽는지·참고 답). 화면 없이 마도서 상태만 보고 계산한다.
 * 근거는 공식 규칙과 vnamu 시계탑 퀴즈(botc.vnamu.com/quiz) — 문항 번호를 주석에 남긴다.
 * 판정은 리마인더로 한다: 이야기꾼이 붙인 '중독·취함·안전함·사망 불가' 등이 곧 상태다.
 * 확정은 여전히 이야기꾼 버튼이다(자동은 제안까지).
 */

type Roles = Map<string, GrimoireRole>;

const IMPAIR = /중독|취함|취한/;
// 수도사·여관 주인 '안전함/보호받음', 찻집 여인 '사망 불가'
const PROTECT = /안전|보호|사망 불가/;

/** 리마인더를 준 캐릭터가 아직 능력을 쓰고 있나 — 그 캐릭터 자리가 전부 죽었으면 효과가 끝난다(#78, #129) */
function sourceActive(state: GrimoireState, roles: Roles, sourceName: string | null | undefined) {
  if (!sourceName) return true;
  const holders = state.seats.filter(s => !s.left && roles.get(s.roleKey ?? '')?.name === sourceName);
  // 마도서에 그 캐릭터가 없으면(손으로 붙인 리마인더) 그대로 믿는다
  if (holders.length === 0) return true;
  return holders.some(s => !s.dead && !isImpaired(state, roles, s, new Set([sourceName])));
}

/**
 * 능력이 없는 상태: 주정뱅이·꼭두각시·미치광이(믿는 캐릭터로 깨움), 중독·취함 리마인더.
 * 중독·취함을 준 캐릭터가 죽었거나 그 자신이 중독됐으면 풀린다(#82 궁정대신 중독 → 암살자 맑음).
 */
export function isImpaired(state: GrimoireState, roles: Roles, seat: GrimoireSeat, seen = new Set<string>()): boolean {
  if (seat.roleKey === 'drunk' || (seat.believedRoleKey && seat.believedRoleKey !== seat.roleKey)) return true;
  return seat.reminders.some(m => {
    if (!IMPAIR.test(m.text)) return false;
    if (m.source && seen.has(m.source)) return true;
    return sourceActive(state, roles, m.source);
  });
}

function protectedBy(state: GrimoireState, roles: Roles, seat: GrimoireSeat) {
  return seat.reminders.filter(m => PROTECT.test(m.text) && sourceActive(state, roles, m.source));
}

export type Verdict = 'DIES' | 'SAFE' | 'MAYBE' | 'NONE';

export interface AttackResult {
  verdict: Verdict;
  reasons: string[];
}

const KILLER_KEYS = new Set(['assassin', 'godfather', 'gambler']);

/** 이 캐릭터가 밤에 고른 사람을 죽이는 능력인가 */
export function isKiller(role: GrimoireRole) {
  return (role.team === 'DEMON' && role.key !== 'pukka') || KILLER_KEYS.has(role.key);
}

/**
 * 깨운 사람(actor)이 이 캐릭터 능력으로 target 을 공격했을 때.
 * actor 가 믿는 캐릭터로 깨운 자리(미치광이 등)면 아무도 죽지 않는다(#62).
 */
export function attackResult(state: GrimoireState, role: GrimoireRole, actor: GrimoireSeat | null, target: GrimoireSeat): AttackResult {
  const roles = roleMap(state.data);
  const reasons: string[] = [];
  const name = (s: GrimoireSeat) => `${state.seats.indexOf(s) + 1}. ${s.name}`;
  const targetRole = roles.get(target.roleKey ?? '');

  if (actor) {
    if (actor.believedRoleKey === role.key && actor.roleKey !== role.key) {
      const real = roles.get(actor.roleKey ?? '')?.name ?? '?';
      const extra = actor.roleKey === 'lunatic' ? ' 진짜 악마에게 누구를 골랐는지 알려 주세요(#88).' : '';
      return { verdict: 'NONE', reasons: [`실제로는 ${real}이라 능력이 없습니다.${extra}`] };
    }
    if (isImpaired(state, roles, actor)) return { verdict: 'NONE', reasons: [`${role.name}이(가) 중독·취함이라 능력이 작동하지 않습니다(#81).`] };
    const exorcised = actor.reminders.find(m => /선택/.test(m.text) && roles.get(nameKey(roles, m.source))?.key === 'exorcist');
    if (role.team === 'DEMON' && exorcised && sourceActive(state, roles, exorcised.source)) {
      return { verdict: 'NONE', reasons: ['구마사제에게 선택돼 오늘 밤 공격하러 깨어나지 않습니다(#49, #74).'] };
    }
    if (role.team === 'DEMON' && actor.reminders.some(m => /죽이지 않음/.test(m.text))) {
      return { verdict: 'NONE', reasons: ['공주 능력으로 오늘 밤 악마는 죽이지 못합니다.'] };
    }
  }
  if (target.dead) return { verdict: 'NONE', reasons: [`${name(target)}은(는) 이미 죽었습니다 — 오늘 밤 이 공격으로는 아무도 안 죽습니다(#45).`] };

  // 도박사는 맞히면 아무 일 없고 틀리면 도박사가 죽는다 — 고른 사람은 죽지 않는다(#51)
  if (role.key === 'gambler') return { verdict: 'NONE', reasons: ['추측이 틀리면 도박사 자신이 죽습니다(도박사 자리에서 사망 처리).'] };

  // 암살자: 어떤 보호도 무시한다(#64, #72)
  if (role.key === 'assassin') {
    const r = ['보호를 무시하고 죽입니다(#64, #72).'];
    if (target.reminders.some(m => /손주/.test(m.text))) r.push('악마가 죽인 게 아니라 할머니는 같이 죽지 않습니다(#72).');
    return { verdict: 'DIES', reasons: r };
  }

  const targetSober = !isImpaired(state, roles, target);
  // 수도사 보호는 악마에게만 통한다
  const guards = protectedBy(state, roles, target).filter(g => role.team === 'DEMON' || nameKey(roles, g.source) !== 'monk');
  if (guards.length) {
    return { verdict: 'SAFE', reasons: [`${guards.map(g => `${g.source ?? ''} '${g.text}'`.trim()).join(', ')} — 오늘 밤 죽지 않습니다(#31, #50).`] };
  }
  if (targetRole?.key === 'sailor' && targetSober) return { verdict: 'SAFE', reasons: ['선원은 맑을 때 죽지 않습니다(#47).'] };

  if (role.team === 'DEMON') {
    if (targetRole?.key === 'soldier' && targetSober) return { verdict: 'SAFE', reasons: ['군인은 악마에게 죽지 않습니다(#12).'] };
    if (targetRole?.key === 'fool' && targetSober && !target.reminders.some(m => m.source === targetRole.name)) {
      return { verdict: 'SAFE', reasons: ['어릿광대는 처음 죽을 때 죽지 않습니다 — 어릿광대에게 "능력 없음"을 붙이세요(#58).'] };
    }
    if (targetRole?.key === 'goon' && targetSober) {
      reasons.push('오늘 밤 건달을 처음 고른 사람이면 그 사람이 취하고 건달은 그 편이 됩니다 — 악마가 처음이면 건달은 살고 악이 됩니다(#61, #86).');
      return { verdict: 'MAYBE', reasons };
    }
    if (role.key === 'fanggu' && targetRole?.team === 'OUTSIDER' && !state.seats.some(s => s.reminders.some(m => m.source === role.name && /첫/.test(m.text)))) {
      return { verdict: 'MAYBE', reasons: ['처음 공격한 외지인은 죽지 않고 악한 팡 구가 되며, 공격한 팡 구가 죽습니다(#117). 두 번째부터는 그냥 죽습니다(#141).'] };
    }
    if (targetRole?.key === 'mayor' && targetSober) {
      return { verdict: 'MAYBE', reasons: ['시장 — 이야기꾼이 다른 사람(악마 자신 포함)이 대신 죽게 할 수 있습니다. 대신 죽는 사람의 보호도 다시 따집니다(#35~37).'] };
    }
    if (actor && target.id === actor.id) reasons.push('악마가 자기를 죽이면 하수인이 악마가 됩니다(임프, #30) — 악마 넘기기 창이 열립니다.');
    if (target.reminders.some(m => /손주/.test(m.text))) reasons.push('할머니의 손주라 할머니도 같이 죽습니다(#71).');
  }
  if (targetRole?.key === 'tinker') reasons.push('땜장이는 언제든 죽을 수 있습니다(#59).');
  return { verdict: 'DIES', reasons };
}

/** 리마인더 출처(캐릭터 이름)로 사전 키를 찾는다 */
function nameKey(roles: Roles, name: string | null | undefined) {
  for (const r of roles.values()) if (r.name === name) return r.key;
  return '';
}

/** 은둔자·첩자처럼 다르게 등록될 수 있는 사람 — 정보 답이 '이야기꾼 선택'이 된다(#17, #26, #27) */
export function misregisters(state: GrimoireState, seat: GrimoireSeat) {
  const roles = roleMap(state.data);
  const k = roles.get(seat.roleKey ?? '')?.key;
  return (k === 'recluse' || k === 'spy') && !isImpaired(state, roles, seat);
}

export interface InfoAnswer {
  answer: string; // 보여 줄 값(예/아니오/숫자/캐릭터 이름)
  free: boolean; // 이야기꾼이 아무 답이나 줘도 되는가(취함·중독·보르톡스·오등록)
  reasons: string[];
}

/** 정보를 받는 사람이 거짓 정보를 받아도 되는 상태 */
export function freeInfo(state: GrimoireState, roles: Roles, actor: GrimoireSeat | null) {
  const reasons: string[] = [];
  if (actor && isImpaired(state, roles, actor)) reasons.push('중독·취함(주정뱅이 포함)이라 아무 답이나 줘도 됩니다(#15, #19).');
  const vortox = state.seats.some(s => !s.dead && roles.get(s.roleKey ?? '')?.key === 'vortox');
  if (vortox && actor && roles.get(actor.roleKey ?? '')?.team === 'TOWNSFOLK') reasons.push('보르톡스가 있어 마을주민 정보는 반드시 거짓이어야 합니다(#120~122).');
  return reasons;
}

/** 점쟁이: 둘 중 악마(또는 허상)가 있으면 예(#6, #29) */
export function fortuneTellerAnswer(state: GrimoireState, role: GrimoireRole, actor: GrimoireSeat | null, picks: GrimoireSeat[]): InfoAnswer {
  const roles = roleMap(state.data);
  const yes = picks.some(s => roles.get(s.roleKey ?? '')?.team === 'DEMON' || s.reminders.some(m => m.source === role.name));
  const reasons = freeInfo(state, roles, actor);
  const rec = picks.filter(s => roles.get(s.roleKey ?? '')?.key === 'recluse' && !isImpaired(state, roles, s));
  if (!yes && rec.length) reasons.push('은둔자는 악마로 등록될 수 있어 "예"도 됩니다(#34).');
  return { answer: yes ? '예' : '아니오', free: reasons.length > 0, reasons };
}

/** 재봉사: 둘이 같은 편이면 예(#104) */
export function seamstressAnswer(state: GrimoireState, actor: GrimoireSeat | null, picks: GrimoireSeat[]): InfoAnswer {
  const roles = roleMap(state.data);
  const same = isEvilSeat(picks[0], roles) === isEvilSeat(picks[1], roles);
  const reasons = freeInfo(state, roles, actor);
  if (picks.some(s => misregisters(state, s))) reasons.push('은둔자·첩자는 다른 편으로 등록될 수 있습니다.');
  return { answer: same ? '예' : '아니오', free: reasons.length > 0, reasons };
}

/** 까마귀지기: 고른 사람의 실제 캐릭터(주정뱅이는 주정뱅이, #40) */
export function ravenkeeperAnswer(state: GrimoireState, actor: GrimoireSeat | null, pick: GrimoireSeat): InfoAnswer {
  const roles = roleMap(state.data);
  const r = roles.get(pick.roleKey ?? '');
  const reasons = freeInfo(state, roles, actor);
  if (misregisters(state, pick)) reasons.push(`${r?.name}은(는) 다른 캐릭터로 등록될 수 있습니다(#17, #32).`);
  return { answer: r?.name ?? '?', free: reasons.length > 0, reasons };
}

/** 이 단계의 깨우는 사람 중 실제로 이 캐릭터인 자리(믿는 사람 말고). 없으면 믿는 사람 */
export function actingSeat(seats: GrimoireSeat[], roleKey: string) {
  return seats.find(s => s.roleKey === roleKey && !s.dead) ?? seats.find(s => !s.dead) ?? seats[0] ?? null;
}

/**
 * 처단자(낮, 게임당 한 번): 고른 사람이 악마면 죽는다(#11).
 * 주정뱅이(믿는 처단자)·중독·취함·이미 사용했으면 아무 일 없음(#16), 은둔자는 악마로 등록될 수 있다(#34).
 */
export function slayerResult(state: GrimoireState, shooter: GrimoireSeat, target: GrimoireSeat): AttackResult {
  const roles = roleMap(state.data);
  const slayer = roles.get('slayer');
  if (shooter.roleKey !== 'slayer') {
    const real = roles.get(shooter.roleKey ?? '')?.name ?? '?';
    return { verdict: 'NONE', reasons: [`실제로는 ${real}이라 능력이 없습니다 — 아무 일도 일어나지 않습니다(#16).`] };
  }
  if (shooter.reminders.some(m => m.source === slayer?.name && /능력 없음|사용/.test(m.text))) {
    return { verdict: 'NONE', reasons: ['이미 능력을 썼습니다(게임당 한 번).'] };
  }
  if (isImpaired(state, roles, shooter)) return { verdict: 'NONE', reasons: ['처단자가 중독·취함이라 능력이 작동하지 않습니다. 능력은 쓴 것으로 칩니다.'] };
  if (target.dead) return { verdict: 'NONE', reasons: ['이미 죽은 사람입니다.'] };
  const t = roles.get(target.roleKey ?? '');
  const guards = protectedBy(state, roles, target).filter(g => nameKey(roles, g.source) !== 'monk' && nameKey(roles, g.source) !== 'innkeeper');
  if (t?.team === 'DEMON') {
    if (guards.length) return { verdict: 'SAFE', reasons: [`${guards.map(g => `${g.source ?? ''} '${g.text}'`.trim()).join(', ')} — 죽지 않습니다.`] };
    return { verdict: 'DIES', reasons: ['악마라 죽습니다. 처형이 아니라 낮은 계속됩니다(#11, #34).'] };
  }
  if (t?.key === 'recluse' && !isImpaired(state, roles, target)) return { verdict: 'MAYBE', reasons: ['은둔자는 악마로 등록될 수 있어 죽일 수도 있습니다(#34).'] };
  return { verdict: 'NONE', reasons: ['악마가 아니라 아무 일도 일어나지 않습니다.'] };
}

/** 낮에 고른 사람을 죽이는 능력(사이코패스·총잡이·갱단원 등). 보호(찻집 여인 등)·맑은 선원은 막는다. 수도사·여관 주인은 밤 보호라 낮엔 안 통한다 */
export function dayKillResult(state: GrimoireState, roleKey: string, actor: GrimoireSeat, target: GrimoireSeat): AttackResult {
  const roles = roleMap(state.data);
  const role = roles.get(roleKey);
  if (actor.roleKey !== roleKey) return { verdict: 'NONE', reasons: [`실제로는 ${roles.get(actor.roleKey ?? '')?.name ?? '?'}이라 능력이 없습니다.`] };
  if (isImpaired(state, roles, actor)) return { verdict: 'NONE', reasons: [`${role?.name}이(가) 중독·취함이라 능력이 작동하지 않습니다.`] };
  if (target.dead) return { verdict: 'NONE', reasons: ['이미 죽은 사람입니다.'] };
  const guards = protectedBy(state, roles, target).filter(g => !['monk', 'innkeeper'].includes(nameKey(roles, g.source)));
  if (guards.length) return { verdict: 'SAFE', reasons: [`${guards.map(g => `${g.source ?? ''} '${g.text}'`.trim()).join(', ')} — 죽지 않습니다.`] };
  const t = roles.get(target.roleKey ?? '');
  if (t?.key === 'sailor' && !isImpaired(state, roles, target)) return { verdict: 'SAFE', reasons: ['선원은 맑을 때 죽지 않습니다.'] };
  if (t?.key === 'fool' && !isImpaired(state, roles, target) && !target.reminders.some(m => m.source === t.name)) {
    return { verdict: 'SAFE', reasons: ['어릿광대는 처음 죽을 때 죽지 않습니다.'] };
  }
  if (t?.key === 'vizier') return { verdict: 'SAFE', reasons: ['재상은 낮에 죽지 않습니다.'] };
  return { verdict: 'DIES', reasons: ['죽습니다. 처형이 아니라 낮은 계속됩니다.'] };
}

/** 달의 자손: 고른 사람이 선하면 오늘 밤 죽는다(#60). 얼뜨기: 고른 사람이 악하면 얼뜨기 팀이 진다(#112) */
export function deathChoiceResult(state: GrimoireState, roleKey: string, actor: GrimoireSeat, target: GrimoireSeat): AttackResult {
  const roles = roleMap(state.data);
  const impaired = actor.roleKey !== roleKey || isImpaired(state, roles, actor);
  const evil = isEvilSeat(target, roles) === true;
  const mis = misregisters(state, target) ? ' 은둔자·첩자는 반대로 등록될 수 있습니다.' : '';
  if (roleKey === 'moonchild') {
    if (impaired) return { verdict: 'NONE', reasons: ['능력이 없는 상태(취함·중독 등)라 아무 일도 없습니다.'] };
    return evil
      ? { verdict: 'NONE', reasons: [`악한 사람이라 아무 일도 없습니다.${mis}`] }
      : { verdict: 'DIES', reasons: [`선한 사람이라 오늘 밤 죽습니다 — '사망' 리마인더를 붙여 두고 밤에 처리하세요(#60).${mis}`] };
  }
  if (impaired) return { verdict: 'NONE', reasons: ['능력이 없는 상태(취함·중독 등)라 아무 일도 없습니다(#145).'] };
  return evil
    ? { verdict: 'DIES', reasons: [`악한 사람을 골랐습니다 — 얼뜨기 팀(선)이 즉시 패배합니다(#112).${mis}`] }
    : { verdict: 'NONE', reasons: [`선한 사람이라 아무 일도 없습니다.${mis}`] };
}
