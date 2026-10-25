import type {
  DeathCause,
  GrimoireRole,
  GrimoireSeat,
  GrimoireState,
} from '../../../types/clocktower.ts';
import {
  aliveAll,
  aliveNonTraveller,
  dayLogOf,
  isEvilSeat,
  isTravellerSeat,
  roleMap,
} from './grimoireRules.ts';

/**
 * 승패 제안 엔진. 결과를 확정하지 않는다 — "종료 후보 + 근거 원문 + 막는 사유"를 돌려주고 이야기꾼이 버튼으로 정한다.
 * 취함·중독·등록(은둔자 등)은 화면이 알 수 없어 리마인더 문구로 '가능성'만 표시한다.
 *
 * 순서(설계서 2-2): 사건 규칙(성자·쌍둥이·레비아탄 등) → 악마 집합 → 승계(탕녀·임프 자결) → 선 후보 → 악 후보
 * → 동시 충족이면 선 → 해 질 녘 규칙(시장·보르톡스·레비아탄 5일째) → 막기·변형(쌍둥이·주모자) → 배교자 반전.
 *
 * 프론트에 테스트 도구가 없어 위키 예시를 사례로 남긴다(state 는 사건이 반영된 뒤의 상태).
 * - W/Mastermind "just two players are left alive but the Demon is dead, so good wins"
 *   → 악마 처형 사망 + 생존 2명: 선 후보와 악 후보가 겹쳐 GOOD(주모자가 살아 있으면 MASTERMIND_DAY 결정으로 바뀐다)
 * - W/Scarlet_Woman: 생존 5명(여행자 제외)에서 악마 처형 → 탕녀 생존이면 SCARLET_WOMAN 결정, 선 후보 없음.
 *   여행자 3명 포함 생존 7명(비여행자 4명)이면 탕녀 미발동 → 선 후보
 * - W/Saint: 맑은 성자 처형 사망 → EVIL(악한 성자면 GOOD)
 * - W/Mayor: 해 질 녘 생존 3명(여행자 포함) + 오늘 처형 0건 → 시장 팀 승리
 * - W/Vortox: 해 질 녘 오늘 처형 0건 → EVIL. 추방은 처형이 아니다
 * - W/Evil_Twin "Good cannot win while both twins are alive" → 두 쌍둥이 생존이면 선 후보를 막는다
 * - W/Heretic: 맑은 배교자가 있으면(죽었어도) 결과를 뒤집는다
 */

export type GameEvent =
  | { kind: 'EXECUTION'; seatId: string }
  | { kind: 'EXILE'; seatId: string }
  | { kind: 'DEATH'; seatId: string; cause: DeathCause }
  | { kind: 'DUSK' } // [밤 시작]을 누르는 순간. state 는 아직 낮(밤으로 넘기기 전)
  | { kind: 'DAWN' } // [밤 끝내기]를 누른 뒤
  | { kind: 'CHARACTER_CHANGE'; seatIds: string[] };

export type Team = 'GOOD' | 'EVIL';
export type WinDecision = 'SCARLET_WOMAN' | 'IMP_STARPASS' | 'MASTERMIND_DAY' | 'IMPAIRED_UNKNOWN';

export interface WinReason {
  ruleKey: string;
  text: string;
  quote: string; // 공식 위키·용어집 원문(짧게)
  sourceUrl: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface WinVerdict {
  status: 'CONTINUE' | 'END_CANDIDATE' | 'NEEDS_DECISION';
  winner?: Team; // 배교자 반전 적용 후
  winnerBeforeHeretic?: Team;
  reasons: WinReason[];
  blockedBy: { ruleKey: string; text: string }[];
  decisions: WinDecision[];
}

const WIKI = 'https://wiki.bloodontheclocktower.com/';
const GLOSSARY = `${WIKI}Glossary`;

const IMPAIRED_TEXT = /취함|중독|drunk|poison/i;
/** 탕녀 능력 기준 인원(악마가 죽기 직전, 여행자 제외) */
const SCARLET_WOMAN_MIN_ALIVE = 5;
/** 레비아탄: 선한 플레이어 처형 2번째에 악 승리, 5일째 낮이 끝날 때 살아 있으면 악 승리 */
const LEVIATHAN_GOOD_EXECUTIONS = 2;
const LEVIATHAN_LAST_DAY = 5;

const present = (s: GrimoireSeat) => !s.left;
const alive = (s: GrimoireSeat) => !s.left && !s.dead;
const opposite = (t: Team): Team => (t === 'GOOD' ? 'EVIL' : 'GOOD');

export function checkGameEnd(state: GrimoireState, ev: GameEvent): WinVerdict {
  // 셋업 중(첫날 밤 전)은 배정을 고치는 중이라 판정하지 않는다
  if (state.phase === 'SETUP')
    return { status: 'CONTINUE', reasons: [], blockedBy: [], decisions: [] };
  const roles = roleMap(state.data);
  const reasons: WinReason[] = [];
  const blockedBy: WinVerdict['blockedBy'] = [];
  const decisions = new Set<WinDecision>();
  const goodBy: string[] = [];
  const evilBy: string[] = [];

  const nameOf = (key: string, fallback: string) => roles.get(key)?.name ?? fallback;
  const seatsWith = (key: string) => state.seats.filter(s => present(s) && s.roleKey === key);
  const aliveWith = (key: string) => seatsWith(key).filter(alive);
  // 리마인더는 준 캐릭터 이름(source)으로 찾는다
  const markedBy = (key: string, text?: string) => {
    const source = roles.get(key)?.name;
    if (!source) return [];
    return state.seats.filter(
      s =>
        present(s) &&
        s.reminders.some(m => m.source === source && (text == null || m.text === text))
    );
  };
  const teamOf = (s: GrimoireSeat): Team | null => {
    const evil = isEvilSeat(s, roles);
    return evil == null ? null : evil ? 'EVIL' : 'GOOD';
  };
  // 판정 근거가 된 좌석이 취함·중독일 수 있으면 표시만 한다(맞는지는 이야기꾼이 안다)
  const flagged = new Set<string>();
  const flagImpaired = (seats: GrimoireSeat[]) => {
    const hit = seats.filter(
      s => !flagged.has(s.id) && s.reminders.some(m => IMPAIRED_TEXT.test(m.text))
    );
    if (hit.length === 0) return;
    hit.forEach(s => flagged.add(s.id));
    decisions.add('IMPAIRED_UNKNOWN');
    reasons.push({
      ruleKey: 'impaired',
      text: `${hit.map(s => s.name).join(', ')} 좌석에 취함·중독 리마인더가 있습니다. 능력이 없으면 이 판정은 맞지 않습니다`,
      quote: 'A drunk or poisoned player has no ability',
      sourceUrl: `${WIKI}States`,
      confidence: 'medium',
    });
  };
  const win = (team: Team, reason: WinReason, basis: GrimoireSeat[] = []) => {
    (team === 'GOOD' ? goodBy : evilBy).push(reason.ruleKey);
    reasons.push(reason);
    flagImpaired(basis);
  };

  const today = dayLogOf(state);
  const lastExecution =
    ev.kind === 'EXECUTION'
      ? [...today.executions].reverse().find(e => e.seatId === ev.seatId)
      : undefined;
  const eventSeat = 'seatId' in ev ? state.seats.find(s => s.id === ev.seatId) : undefined;

  // ---------- 1. 사건 규칙 ----------

  // 성자: 처형으로 "죽으면" 성자 팀 패배(W/Saint). 살아남은 처형은 해당 없음
  if (lastExecution?.died && lastExecution.characterAtExecution === 'saint' && eventSeat) {
    const saintTeam = teamOf(eventSeat) ?? 'GOOD';
    win(
      opposite(saintTeam),
      {
        ruleKey: 'saint',
        text: `${nameOf('saint', '성자')}(${eventSeat.name})가 처형으로 죽었습니다 → ${saintTeam === 'GOOD' ? '선' : '악'} 팀 패배`,
        quote: 'If you die by execution, your team loses.',
        sourceUrl: `${WIKI}Saint`,
        confidence: 'high',
      },
      [eventSeat]
    );
  }

  // 사악한 쌍둥이: 선한 쌍둥이가 처형되면 악 승리. 살아남은 처형도 세는지는 위키가 말하지 않아 확신도 중간
  const evilTwins = seatsWith('eviltwin');
  const twinMarked = markedBy('eviltwin', '쌍둥이');
  const twinPair = [...evilTwins, ...twinMarked.filter(s => !evilTwins.includes(s))];
  if (lastExecution && eventSeat && twinPair.includes(eventSeat) && teamOf(eventSeat) === 'GOOD') {
    const twinAlive = evilTwins.some(s => alive(s) || s.id === eventSeat.id);
    if (twinAlive) {
      win(
        'EVIL',
        {
          ruleKey: 'eviltwin',
          text: `선한 쌍둥이(${eventSeat.name})가 처형되었습니다 → 악 승리 후보${lastExecution.died ? '' : ' (살아남은 처형도 세는지는 이야기꾼 판단)'}`,
          quote: 'If the good player is executed, evil wins.',
          sourceUrl: `${WIKI}Evil_Twin`,
          confidence: 'medium',
        },
        evilTwins
      );
    }
  }

  // 레비아탄: 선한 사람 처형 2번째 → 악 승리(살아남은 처형도 센다). 처형 당시 선악은 기록이 없어 지금 선악으로 센다
  const leviathans = aliveWith('leviathan');
  if (lastExecution && leviathans.length > 0) {
    const goodExecutions = state.dayLogs
      .flatMap(l => l.executions)
      .filter(e => {
        const s = state.seats.find(x => x.id === e.seatId);
        return !!s && teamOf(s) === 'GOOD';
      }).length;
    if (goodExecutions >= LEVIATHAN_GOOD_EXECUTIONS) {
      win(
        'EVIL',
        {
          ruleKey: 'leviathan',
          text: `${nameOf('leviathan', '레비아탄')} 생존 중 선한 플레이어 처형이 ${goodExecutions}번째입니다 → 악 승리 후보 (처형 당시 선악으로 다시 확인하세요)`,
          quote: 'If more than 1 good player is executed, evil wins.',
          sourceUrl: `${WIKI}Leviathan`,
          confidence: 'medium',
        },
        leviathans
      );
    }
  }

  // ---------- 2. 악마 집합(실제 캐릭터 기준 — 선한 악마도 악마다) ----------

  const atheistGame = seatsWith('atheist').length > 0;
  const demonSeats = state.seats.filter(
    s => present(s) && roles.get(s.roleKey ?? '')?.team === 'DEMON'
  );
  // 릴 몬스타: "악마입니다" 리마인더를 받은 돌보미가 악마다(좌석 캐릭터가 아니다)
  const babysitters = markedBy('lilmonsta', '악마입니다');
  const hadDemon =
    demonSeats.length > 0 ||
    babysitters.length > 0 ||
    state.seats.some(s =>
      s.roleHistory.some(h => [h.from, h.to].some(k => roles.get(k ?? '')?.team === 'DEMON'))
    );

  let aliveDemons = [...demonSeats.filter(alive), ...babysitters.filter(alive)];
  // 좀버얼이 죽어 있으면 첫 죽음(겉으로만 사망)인지 알 수 없다 → 악 판정에는 살아 있는 것으로, 선 후보는 막는다
  const zombuulDead = demonSeats.filter(s => s.roleKey === 'zombuul' && s.dead);
  if (zombuulDead.length > 0) {
    aliveDemons = [...aliveDemons, ...zombuulDead];
    blockedBy.push({
      ruleKey: 'zombuul',
      text: `${nameOf('zombuul', '좀버얼')}이 처음 죽은 것이면 실제로는 살아 있어 게임이 계속됩니다. 두 번째 죽음이면 선 승리입니다`,
    });
  }
  // 거무리: 숙주가 죽으면 거무리도 죽는다(W/Lleech). 이야기꾼이 아직 사망 처리를 안 했어도 죽은 것으로 본다
  const lleechHostDead = markedBy('lleech', '중독').some(s => s.dead);
  const lleechAlive = aliveWith('lleech');
  if (lleechHostDead && lleechAlive.length > 0) {
    aliveDemons = aliveDemons.filter(s => s.roleKey !== 'lleech');
    reasons.push({
      ruleKey: 'lleech',
      text: `${nameOf('lleech', '거무리')}의 숙주가 죽었습니다 → 거무리도 죽습니다(좌석에 사망을 기록하세요)`,
      quote: 'If the host dies, the Lleech dies too.',
      sourceUrl: `${WIKI}Lleech`,
      confidence: 'high',
    });
    flagImpaired(lleechAlive);
  }

  // ---------- 3. 승계 ----------

  let succession = false;
  const deadDemon =
    eventSeat && eventSeat.dead && roles.get(eventSeat.roleKey ?? '')?.team === 'DEMON'
      ? eventSeat
      : null;
  const scarlet = aliveWith('scarletwoman');
  if (scarlet.length > 0 && aliveDemons.length === 0 && hadDemon) {
    // "죽기 직전" 인원: 사건으로 죽은 악마면 그 한 명을 더한다. 사건이 없으면(새벽 일괄) 같은 단계에 죽은 사람을 모두 더한다(최대치)
    const nonTravellerNow = aliveNonTraveller(state.seats, roles);
    const lastDemonDeath = demonSeats.find(s => s.dead && s.death)?.death;
    const before = deadDemon
      ? nonTravellerNow + 1
      : nonTravellerNow +
        state.seats.filter(
          s =>
            present(s) &&
            s.dead &&
            !isTravellerSeat(s, roles) &&
            !!lastDemonDeath &&
            s.death?.day === lastDemonDeath.day &&
            s.death?.phase === lastDemonDeath.phase
        ).length;
    if (before >= SCARLET_WOMAN_MIN_ALIVE) {
      succession = true;
      decisions.add('SCARLET_WOMAN');
      reasons.push({
        ruleKey: 'scarletwoman',
        text: `악마가 죽기 직전 생존 ${before}명(여행자 제외) — ${nameOf('scarletwoman', '탕녀')}(${scarlet.map(s => s.name).join(', ')})가 악마가 됩니다`,
        quote:
          'If there are 5 or more players alive & the Demon dies, you become the Demon. (Travellers don’t count.)',
        sourceUrl: `${WIKI}Scarlet_Woman`,
        confidence: deadDemon ? 'high' : 'medium',
      });
      flagImpaired(scarlet);
    }
  }
  // 임프 자결: 밤에 죽은 임프는 살아 있는 하수인(은둔자 포함)에게 넘어갈 수 있다. 누구에게 갈지는 이야기꾼이 정한다
  const impSelfKill =
    !!deadDemon &&
    deadDemon.roleKey === 'imp' &&
    (ev.kind === 'DEATH' ? ev.cause === 'NIGHT' : false);
  if (impSelfKill && !succession && aliveDemons.length === 0) {
    const heirs = state.seats.filter(
      s => alive(s) && (roles.get(s.roleKey ?? '')?.team === 'MINION' || s.roleKey === 'recluse')
    );
    if (heirs.length > 0) {
      succession = true;
      decisions.add('IMP_STARPASS');
      reasons.push({
        ruleKey: 'imp',
        text: `${nameOf('imp', '임프')}가 스스로 죽였다면 살아 있는 하수인(${heirs.map(s => s.name).join(', ')})이 임프가 됩니다`,
        quote: 'If you kill yourself this way, a Minion becomes the Imp.',
        sourceUrl: `${WIKI}Imp`,
        confidence: 'high',
      });
    }
  }

  // ---------- 4·5. 선 후보 / 악 후보 ----------

  if (atheistGame) {
    reasons.push({
      ruleKey: 'atheist',
      text: `${nameOf('atheist', '무신론자')} 게임: 악마가 없을 수 있어 '악마 사망=선 승리'는 판정하지 않습니다. 이야기꾼이 처형되면 선 승리입니다`,
      quote: 'If the Storyteller is executed, good wins.',
      sourceUrl: `${WIKI}Atheist`,
      confidence: 'high',
    });
  } else if (hadDemon && aliveDemons.length === 0 && !succession) {
    win('GOOD', {
      ruleKey: 'demon_dead',
      text: '살아 있는 악마가 없습니다 → 선 승리 후보',
      quote: 'Good wins if all Demons are dead.',
      sourceUrl: GLOSSARY,
      confidence: 'high',
    });
  } else if (!hadDemon && seatsWith('summoner').length > 0) {
    reasons.push({
      ruleKey: 'summoner',
      text: `${nameOf('summoner', '소환사')}가 아직 악마를 소환하지 않았습니다. 소환할 수 없게 되면(사망 등) 선 승리입니다`,
      quote: 'On the 3rd night, choose a player: they become an evil Demon of your choice.',
      sourceUrl: `${WIKI}Summoner`,
      confidence: 'high',
    });
  }

  const aliveForEvil = aliveNonTraveller(state.seats, roles) + zombuulDead.length;
  if (aliveForEvil <= 2 && (aliveDemons.length > 0 || atheistGame)) {
    win('EVIL', {
      ruleKey: 'two_alive',
      text: `생존자가 ${aliveForEvil}명(여행자 제외)이고 악마가 살아 있습니다 → 악 승리 후보`,
      quote: 'Evil wins when there are only two alive players, not including Travellers.',
      sourceUrl: GLOSSARY,
      confidence: 'high',
    });
  }

  // ---------- 7. 해 질 녘 규칙(오늘 처형 0건 판정. 추방은 처형이 아니다) ----------

  if (ev.kind === 'DUSK' && state.phase === 'DAY') {
    const noExecution = today.executions.length === 0;
    const mayors = aliveWith('mayor');
    if (mayors.length > 0 && noExecution && aliveAll(state.seats) === 3) {
      const team = teamOf(mayors[0]) ?? 'GOOD';
      win(
        team,
        {
          ruleKey: 'mayor',
          text: `생존 3명(여행자 포함) + 오늘 처형 없음 → ${nameOf('mayor', '시장')} 팀(${team === 'GOOD' ? '선' : '악'}) 승리 후보`,
          quote: 'If only 3 players live & no execution occurs, your team wins.',
          sourceUrl: `${WIKI}Mayor`,
          confidence: 'high',
        },
        mayors
      );
    }
    const vortox = aliveWith('vortox');
    if (vortox.length > 0 && noExecution) {
      win(
        'EVIL',
        {
          ruleKey: 'vortox',
          text: `${nameOf('vortox', '보르톡스')} 생존 중 오늘 처형이 없었습니다 → 악 승리 후보(여행자 추방은 처형이 아닙니다)`,
          quote: 'Each day, if no-one is executed, evil wins.',
          sourceUrl: `${WIKI}Vortox`,
          confidence: 'medium',
        },
        vortox
      );
    }
    if (leviathans.length > 0 && state.day >= LEVIATHAN_LAST_DAY) {
      win(
        'EVIL',
        {
          ruleKey: 'leviathan_day5',
          text: `${state.day}일째 낮이 끝났는데 ${nameOf('leviathan', '레비아탄')}이 살아 있습니다 → 악 승리 후보`,
          quote: 'If day 5 has ended, evil wins.',
          sourceUrl: `${WIKI}Leviathan`,
          confidence: 'high',
        },
        leviathans
      );
    }
  }

  // ---------- 8. 막기·변형 ----------

  // 사악한 쌍둥이 둘 다 생존이면 선은 이길 수 없다
  if (goodBy.length > 0 && evilTwins.some(alive) && twinMarked.some(alive)) {
    blockedBy.push({
      ruleKey: 'eviltwin',
      text: '사악한 쌍둥이와 그 쌍둥이가 둘 다 살아 있어 선은 이길 수 없습니다',
    });
    goodBy.length = 0;
  }
  // 좀버얼 첫 죽음 가능성이 있으면 선 승리는 이야기꾼 확인이 필요하다
  if (zombuulDead.length > 0) goodBy.length = 0;

  // 주모자: 악마가 "처형으로" 죽어 게임이 끝날 상황이면 하루 더 간다
  const masterminds = aliveWith('mastermind');
  if (goodBy.includes('demon_dead') && lastExecution?.died && deadDemon && masterminds.length > 0) {
    goodBy.length = 0;
    evilBy.length = 0;
    decisions.add('MASTERMIND_DAY');
    reasons.push({
      ruleKey: 'mastermind',
      text: `${nameOf('mastermind', '주모자')}가 살아 있습니다 → 하루 더 진행합니다(악마 사망은 아직 알리지 않음). 그날 선한 사람이 처형되면 악 승리, 아니면 선 승리`,
      quote: 'If the Demon dies by execution (ending the game), play for 1 more day.',
      sourceUrl: `${WIKI}Mastermind`,
      confidence: 'high',
    });
    flagImpaired(masterminds);
  }

  // ---------- 6. 동시 충족이면 선 ----------

  let winner: Team | undefined;
  if (goodBy.length > 0) winner = 'GOOD';
  else if (evilBy.length > 0) winner = 'EVIL';
  if (goodBy.length > 0 && evilBy.length > 0) {
    reasons.push({
      ruleKey: 'both',
      text: '양쪽 승리 조건이 동시에 맞습니다 → 선 승리',
      quote: 'If both teams would win at the same time, good wins.',
      sourceUrl: `${WIKI}Mastermind`,
      confidence: 'high',
    });
  }

  // ---------- 9. 배교자 반전(죽어도 적용, 취함·중독이면 미적용) ----------

  const winnerBeforeHeretic = winner;
  const heretics = seatsWith('heretic');
  if (winner && heretics.length > 0) {
    winner = opposite(winner);
    reasons.push({
      ruleKey: 'heretic',
      text: `${nameOf('heretic', '배교자')}(${heretics.map(s => s.name).join(', ')})가 있어 결과가 뒤집힙니다: ${winnerBeforeHeretic === 'GOOD' ? '선' : '악'} → ${winner === 'GOOD' ? '선' : '악'}`,
      quote: 'Whoever wins, loses & whoever loses, wins, even if you are dead.',
      sourceUrl: `${WIKI}Heretic`,
      confidence: 'high',
    });
    flagImpaired(heretics);
  }

  const decisionList = [...decisions];
  const status: WinVerdict['status'] = winner
    ? decisionList.length > 0 || blockedBy.length > 0
      ? 'NEEDS_DECISION'
      : 'END_CANDIDATE'
    : decisionList.length > 0 || blockedBy.length > 0 || reasons.some(r => r.ruleKey === 'lleech')
      ? 'NEEDS_DECISION'
      : 'CONTINUE';

  return { status, winner, winnerBeforeHeretic, reasons, blockedBy, decisions: decisionList };
}

/** 악마 승계 원인(악마 넘기기 창에서 고른다) */
export type SuccessionCause = 'SCARLET_WOMAN' | 'IMP_STARPASS' | 'FANG_GU' | 'OTHER';

/**
 * 악마 승계 원인별 권장 후보. 탕녀=살아 있는 탕녀, 임프 자결=살아 있는 하수인·은둔자, 팡 구=살아 있는 외지인(악이 된다), 기타=아무나.
 * 다른 사람을 고를 수는 있지만 화면이 경고한다.
 */
export function successionCandidates(
  state: GrimoireState,
  demonSeatId: string,
  cause: SuccessionCause,
  roles: Map<string, GrimoireRole> = roleMap(state.data)
): GrimoireSeat[] {
  const pool = state.seats.filter(s => s.id !== demonSeatId && alive(s));
  const team = (s: GrimoireSeat) => roles.get(s.roleKey ?? '')?.team;
  if (cause === 'SCARLET_WOMAN') return pool.filter(s => s.roleKey === 'scarletwoman');
  if (cause === 'IMP_STARPASS')
    return pool.filter(s => team(s) === 'MINION' || s.roleKey === 'recluse');
  if (cause === 'FANG_GU') return pool.filter(s => team(s) === 'OUTSIDER');
  return pool;
}
