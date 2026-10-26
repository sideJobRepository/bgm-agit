import type { GrimoireRole, NightTab } from '../../../types/clocktower.ts';

/**
 * 밤 진행 카드에서 캐릭터 차례마다 띄울 버튼 표(2026-10-26 밤에 깨우는 114개 전수 점검).
 * 예전엔 리마인더가 있는지·능력 문구에 '선택'이 있는지로 버튼을 추측해서 오판이 많았다
 * (거리의 악사가 사람 고르기로 뜸, 임프에게도 숫자 0~5·예/아니오가 뜸).
 * 원칙: 그 차례에 이야기꾼이 실제로 할 일에 필요한 버튼만 둔다. 근거는 vnamu 시계탑 퀴즈 문항 번호(#번호).
 */

/** 정보 카드 단축 버튼. text 는 InfoCards CARDS 문장만 쓴다 */
export interface StepCard {
  text: string;
  // 'self'(이 캐릭터)·'demon'(게임의 악마 캐릭터)·'outsiders'(게임의 외지인 전부)·캐릭터 키
  roleKeys?: string[];
  // 'actor'(이 캐릭터 자리)·'demon'(악마 자리)·'marionette'·'lunatic'·'picked'(고른 사람)
  seat?: 'actor' | 'demon' | 'marionette' | 'lunatic' | 'picked';
}

export interface StepUi {
  // [보여주기: 능력을 사용하시겠습니까?] + [사용 안 함] — 고르지 않아도 되는 능력
  ask?: boolean;
  // 사람을 고르지 않고 본인이 예/아니오로 정하는 능력(거리의 악사). 예 = 본인에게 reminder, 아니오 = 떼기
  toggle?: { question: string; reminder: string };
  // 대상 고르기. player = 플레이어가 고른다([플레이어를 고르세요] 카드), storyteller = 이야기꾼이 정한다
  pick?: 'player' | 'storyteller';
  // 고를 인원(안내·참고 답용)
  count?: number;
  // [보여주기: 캐릭터를 고르세요]
  charCard?: boolean;
  // 고른 사람에게 붙일 리마인더(사전 문구 그대로)
  reminders?: string[];
  // 본인 토큰의 기록 리마인더(하나만 유지 — 하루가 지날 때 넘긴다)
  selfCounter?: string[];
  // 능력을 쓰면 본인에게 붙일 표시
  selfMark?: string;
  // 사망 처리. target = 고른 사람, marked = markText 리마인더가 있는 사람, self = 본인
  kill?: 'target' | 'marked' | 'self';
  markText?: string;
  // 고른 죽은 사람 되살리기
  revive?: boolean;
  // 고른 사람으로 참고 답 계산
  answer?: 'fortuneteller' | 'seamstress' | 'ravenkeeper' | 'dreamer' | 'villageidiot';
  // 숫자 0~5 / 예·아니오 / 직접 선택지 — 정보를 숫자·예/아니오로 주는 캐릭터만
  numbers?: 'number' | 'yesno' | string[];
  cards?: StepCard[];
  // 밤 문구에 없는 처리 순서·주의
  note?: string;
}

/** first = 첫날 밤 차례, other = 그 외 밤 차례. 그 밤에 깨우지 않으면 null */
type RoleUi = { first: StepUi | null; other: StepUi | null };

const SELF_IS: StepCard = { text: '당신의 캐릭터입니다', roleKeys: ['self'] };
const CHOSE_YOU: StepCard = { text: '이 캐릭터가 당신을 선택했습니다', roleKeys: ['self'] };
const YOUR_ROLE: StepCard = { text: '당신의 캐릭터입니다' };
const GOOD: StepCard = { text: '당신은 선한 팀입니다' };
const EVIL: StepCard = { text: '당신은 악한 팀입니다' };
const KILL_ONE: StepUi = { pick: 'player', reminders: ['사망'], kill: 'target' };

export const ROLE_UI: Record<string, RoleUi> = {
  // ── 악마 ── 첫날 밤에는 아무도 죽이지 않는다
  alhadikhia: {
    first: null,
    other: {
      ask: true, pick: 'player', count: 3, reminders: ['1', '2', '3'], kill: 'target',
      note: '고르지 않아도 된다. 고르면 순서대로 1·2·3을 붙이고, 고른 사람이 누구인지 모두에게 알린다. 한 명씩 깨워 살지(끄덕임)·죽을지(저음)를 받는다. 셋 다 살기를 고르면 셋 다 죽는다',
    },
  },
  fanggu: {
    first: null,
    other: {
      pick: 'player', reminders: ['사망'], kill: 'target', selfMark: '첫번째',
      cards: [{ text: '당신의 캐릭터입니다', roleKeys: ['self'], seat: 'picked' }, { text: '당신은 악한 팀입니다', seat: 'picked' }],
      note: '처음으로 외지인을 고르면(게임당 1번) 그 외지인은 죽지 않는다. 고른 사람의 [사망 처리]를 누르지 말고, 팡 구 본인을 좌석 메뉴에서 죽인다. 외지인 토큰은 팡 구로 바꾼다(좌석 메뉴 캐릭터 바꾸기). 새 팡 구를 깨워 카드를 보여 준다',
    },
  },
  imp: {
    first: null,
    other: {
      ...KILL_ONE, cards: [SELF_IS],
      note: '반드시 1명을 고른다(#44). 죽은 사람도 고를 수 있다(#45). 자기를 골라 실제로 죽으면 살아 있는 하수인 1명이 임프가 되고, 새 임프에게 임프 토큰을 보여 준다(#30·#37). 수도승에게 보호받아 안 죽으면 넘어가지 않는다(#31)',
    },
  },
  kazali: {
    first: {
      pick: 'player', charCard: true,
      cards: [{ text: '당신의 캐릭터입니다', seat: 'picked' }, { text: '당신은 악한 팀입니다', seat: 'picked' }],
      note: '카잘리가 하수인이 될 사람과 그 하수인 캐릭터를 고른다(아무도 죽지 않는다). 대상마다 깨워 하수인 토큰과 악 진영을 알린다. 외지인 수를 바꿔도 된다',
    },
    other: KILL_ONE,
  },
  legion: {
    first: null,
    other: { pick: 'storyteller', reminders: ['사망'], kill: 'target', note: "죽을 사람은 이야기꾼이 정한다(아무도 안 죽어도 된다). '처형 대상'은 낮 투표 기록용이다" },
  },
  leviathan: {
    first: {
      selfCounter: ['첫 번째 낮', '두 번째 낮', '세 번째 낮', '네 번째 낮', '다섯 번째 낮'],
      note: "레비아탄이 게임에 있다고 모두에게 알린다. 본인 토큰에 '첫 번째 낮'을 둔다",
    },
    other: {
      selfCounter: ['첫 번째 낮', '두 번째 낮', '세 번째 낮', '네 번째 낮', '다섯 번째 낮'],
      note: "하루가 지날 때마다 기록을 넘긴다. 레비아탄은 밤에 죽이지 않는다. 선한 사람이 처형되면 '선한 플레이어 처형됨'을 붙인다(두 번째면 악 승리). 다섯 번째 낮이 끝나면 악 승리",
    },
  },
  // 릴 몬스타는 좌석 캐릭터가 아니라 '악마입니다' 리마인더로 돌보미를 찾는다(winCheck) — 붙일 버튼이 꼭 있어야 한다
  lilmonsta: {
    first: {
      pick: 'player', reminders: ['악마입니다'], cards: [{ text: '당신의 캐릭터입니다', roleKeys: ['self'], seat: 'picked' }],
      note: "하수인들을 함께 깨워 릴 몬스타를 맡을 1명을 고르게 하고 재운다. 고른 사람에게 '악마입니다'를 붙이고, 깨워서 릴 몬스타 토큰을 보여 준다",
    },
    other: {
      pick: 'player', reminders: ['악마입니다'], cards: [{ text: '당신의 캐릭터입니다', roleKeys: ['self'], seat: 'picked' }],
      note: "맡을 사람이 바뀌면 이전 사람의 '악마입니다'를 떼고 새 사람에게 붙인다. 그 뒤 죽을 사람은 이야기꾼이 따로 정한다(아무도 안 죽어도 된다). 고른 사람이 아니므로 마도서의 사망 버튼으로 처리한다",
    },
  },
  lleech: {
    first: { pick: 'player', reminders: ['중독'], note: '고른 사람이 숙주가 되어 중독된다(죽지 않는다). 숙주가 죽으면 거무리도 죽는다' },
    other: KILL_ONE,
  },
  lordoftyphon: {
    first: {
      cards: [YOUR_ROLE, EVIL],
      note: '티폰의 군주 양옆 이웃(반드시 하수인)을 깨워 하수인 토큰을 보여 주고 악 진영을 알린다. 사람을 고르지 않는다',
    },
    other: KILL_ONE,
  },
  nodashii: { first: null, other: { ...KILL_ONE, note: '양옆 가장 가까운 주민 2명의 중독은 셋업 때 이미 붙어 있다' } },
  ojo: {
    first: null,
    other: {
      charCard: true, pick: 'storyteller', reminders: ['사망'], kill: 'target',
      note: '오조가 캐릭터를 고른다. 그 캐릭터가 게임에 있으면 그 사람이 죽는다. 없으면 이야기꾼이 죽을 사람(여럿이어도 됨, 0명도 가능)을 정한다',
    },
  },
  po: {
    first: null,
    other: {
      ask: true, pick: 'player', count: 1, reminders: ['사망'], kill: 'target', selfCounter: ['공격 3번'],
      note: "아무도 안 고르면 본인에게 '공격 3번'을 둔다. 다음 밤에는 반드시 3명을 골라 고른 순서대로 처리하고 '공격 3번'을 뗀다(#70·#78). 구마사제에게 막혀 못 깨어난 밤은 '아무도 안 고름'이 아니다(#75)",
    },
  },
  pukka: {
    first: { pick: 'player', reminders: ['중독'], note: '고른 사람은 중독만 되고 이번 밤에는 죽지 않는다(#68)' },
    other: {
      pick: 'player', reminders: ['중독'], kill: 'marked', markText: '중독',
      note: "새로 고른 사람에게는 '중독'만 붙인다. 어젯밤 중독된 사람은 죽고 중독이 풀린다. 푸카가 못 깨어나도 그 사람은 죽는다(#76)",
    },
  },
  riot: {
    first: null,
    other: {
      selfCounter: ['첫 번째 낮', '두 번째 낮', '세 번째 낮'], cards: [SELF_IS],
      note: '하루가 지날 때마다 기록을 넘긴다. 폭도는 밤에 죽이지 않는다. 세 번째 밤이면 하수인들을 깨워 폭도 토큰을 보여 줄 수 있다',
    },
  },
  shabaloth: {
    first: null,
    other: {
      pick: 'player', count: 2, reminders: ['사망', '생존'], kill: 'target', revive: true,
      note: "먼저 되살릴지 이야기꾼이 정한다. 되살리면 어젯밤 샤발로스에게 죽은 사람 중 1명만 골라 [되살리기]하고 '생존'을 붙인다(#69). 그다음 샤발로스가 새로 2명을 고른다",
    },
  },
  vigormortis: {
    first: null,
    other: {
      pick: 'player', reminders: ['사망', '능력 가짐'], kill: 'target',
      note: "죽인 사람이 하수인이면 '능력 가짐'을 붙인다(능력 유지). 그 하수인과 가장 가까운 이웃 주민 1명에게 '중독'을 붙인다",
    },
  },
  vortox: { first: null, other: { ...KILL_ONE, note: '주민 능력 정보는 반드시 거짓으로 준다. 낮에 처형이 없으면 악이 이긴다' } },
  yaggababble: {
    first: { note: '야가바블에게 비밀 문구를 보여 준다(손글씨·쪽지 등). 아무도 죽이지 않는다' },
    other: {
      pick: 'storyteller', reminders: ['사망'], kill: 'target',
      note: '오늘 낮에 비밀 문구를 공개적으로 말한 횟수만큼 이야기꾼이 죽을 사람을 정한다(그보다 적게 죽여도 된다)',
    },
  },
  zombuul: {
    first: null,
    other: {
      ...KILL_ONE,
      note: "오늘 낮에 아무도 죽지 않았을 때만 깨운다. 좀버얼이 처형으로 '죽은' 날도 누군가 죽은 것으로 친다(#90). 처음 죽을 때는 죽은 것처럼 보일 뿐 살아 있다(#67)",
    },
  },

  // ── 하수인 ──
  assassin: {
    first: null,
    other: {
      ask: true, pick: 'player', count: 1, reminders: ['사망'], selfMark: '능력 없음', kill: 'target',
      note: '게임당 한 번. 보호·안전 능력과 상관없이 대상은 죽는다(판정이 이미 보호 무시로 계산, #64·#72). 손주를 죽여도 할머니는 안 죽음(#72). 암살자가 취함·중독이면 능력은 그대로 낭비(#81)',
    },
  },
  boffin: {
    first: {
      cards: [CHOSE_YOU],
      note: '과학자와 악마를 함께 깨워 이 카드(과학자 토큰)를 보여준 뒤, 게임에 없는 선한 캐릭터 1개를 보여준다(악마가 그 능력을 얻음, 둘 다 앎). 줄 캐릭터는 이야기꾼이 정한다',
    },
    other: null,
  },
  cerenovus: {
    first: {
      pick: 'player', count: 1, charCard: true, reminders: ['집착'], cards: [CHOSE_YOU],
      note: '세레노버스가 사람 1명과 선한 캐릭터 1개를 고른다. 세레노버스를 재우고 대상을 깨워 이 카드(세레노버스)를 보여준 뒤 집착할 캐릭터 토큰을 보여준다. 다음 날 집착하지 않으면 처형될 수 있다(#115)',
    },
    other: {
      pick: 'player', count: 1, charCard: true, reminders: ['집착'], cards: [CHOSE_YOU],
      note: '세레노버스가 사람 1명과 선한 캐릭터 1개를 고른다. 세레노버스를 재우고 대상을 깨워 이 카드를 보여준 뒤 집착할 캐릭터 토큰을 보여준다(#115). 죽은 사람도 고를 수 있다(#138)',
    },
  },
  devilsadvocate: {
    first: {
      pick: 'player', count: 1, reminders: ['처형에서 생존'],
      note: '생존한 플레이어만 고를 수 있다. 고른 사람이 내일 처형돼도 죽지 않는다(이유는 알려 주지 않음, #65)',
    },
    other: {
      pick: 'player', count: 1, reminders: ['처형에서 생존'],
      note: "생존한 플레이어만, 지난 밤과 다른 사람. 어제 붙인 '처형에서 생존'은 떼고 옮긴다(#65·#85)",
    },
  },
  eviltwin: {
    first: {
      cards: [{ text: '이 플레이어의 캐릭터는', roleKeys: ['self'], seat: 'actor' }],
      note: '쌍둥이 둘을 깨워 눈을 마주치게 하고 서로의 캐릭터를 보여준다 — 선한 쌍둥이에게는 이 카드(사악한 쌍둥이), 사악한 쌍둥이에게는 선한 쌍둥이의 캐릭터(#131)',
    },
    other: null,
  },
  fearmonger: {
    first: { pick: 'player', count: 1, reminders: ['공포'], note: '공포의 전령이 플레이어를 선택했음을 모두에게 알린다(누구인지는 알리지 않음)' },
    other: { pick: 'player', count: 1, reminders: ['공포'], note: "지난 밤과 다른 사람을 골랐을 때만 공개로 알린다(이전 '공포'는 떼고 옮긴다)" },
  },
  godfather: {
    first: { note: '게임에 있는 외지인 캐릭터 토큰을 모두 보여준다. 외지인이 없으면 없다고 알린다(#89). 맞는 정보 카드 문장이 없어 토큰을 직접 보여준다' },
    other: {
      pick: 'player', count: 1, reminders: ['사망'], kill: 'target',
      note: "오늘 낮에 외지인이 죽었을 때만 깨운다('오늘 사망' 표시 확인, #63). 보호 능력은 대부의 공격도 막는다",
    },
  },
  harpy: {
    first: {
      pick: 'player', count: 2, reminders: ['집착', '두번째'], cards: [CHOSE_YOU],
      note: "첫 번째로 고른 사람에게 '집착', 두 번째에게 '두번째'. 하피를 재우고 첫 번째 사람을 깨워 이 카드(하피)를 보여준 뒤 두 번째 사람을 가리킨다",
    },
    other: {
      pick: 'player', count: 2, reminders: ['집착', '두번째'], cards: [CHOSE_YOU],
      note: "첫 번째로 고른 사람에게 '집착', 두 번째에게 '두번째'(어제 표시는 떼고 옮긴다). 첫 번째 사람을 깨워 카드를 보여준 뒤 두 번째 사람을 가리킨다",
    },
  },
  marionette: {
    first: {
      cards: [{ text: '이 플레이어의 캐릭터는', roleKeys: ['self'], seat: 'marionette' }],
      note: '꼭두각시 본인이 아니라 악마를 깨워 이 카드(꼭두각시)를 보여주고 꼭두각시를 가리킨다',
    },
    other: null,
  },
  mezepheles: {
    first: { note: '메제펠레스에게 비밀 단어를 알려준다' },
    other: {
      pick: 'storyteller', count: 1, reminders: ['악으로 바뀜'], selfMark: '능력 없음', cards: [EVIL],
      note: '오늘 비밀 단어를 처음 말한 선한 플레이어가 있을 때만 깨운다. 그 사람을 깨워 이 카드를 보여주고 엄지를 내려 신호를 준다(게임당 한 번)',
    },
  },
  organgrinder: {
    first: { toggle: { question: '취하시겠습니까?', reminder: '취함' } },
    other: { toggle: { question: '취하시겠습니까?', reminder: '취함' } },
  },
  pithag: {
    first: null,
    other: {
      pick: 'player', count: 1, charCard: true, cards: [YOUR_ROLE],
      note: "반드시 사람 1명과 캐릭터 1개를 고른다. 게임에 없는 캐릭터면 마귀할멈을 재우고 대상을 깨워 '당신은' + 바뀐 캐릭터 토큰을 보여준다(#116). 이미 있는 캐릭터면 아무 일 없음(#139). 악마를 만들었으면 오늘 밤 사망은 이야기꾼 임의 — 좌석 메뉴로 처리(#140)",
    },
  },
  poisoner: {
    first: { pick: 'player', count: 1, reminders: ['중독'] },
    other: { pick: 'player', count: 1, reminders: ['중독'], note: "어제 붙인 '중독'은 떼고 새 대상에게 옮긴다" },
  },
  scarletwoman: {
    first: null,
    other: {
      selfMark: '악마입니다', cards: [{ text: '당신의 캐릭터입니다', roleKeys: ['demon'] }],
      note: "오늘 낮에 악마가 죽어 탕녀가 악마가 됐을 때만 깨운다(악마가 죽기 직전 생존자 5명 이상, #21). '당신은' + 악마 토큰을 보여준다",
    },
  },
  spy: {
    first: { note: '첩자에게 충분한 시간 동안 마도서를 보여준다(#20)' },
    other: { note: '첩자에게 충분한 시간 동안 마도서를 보여준다' },
  },
  summoner: {
    first: {
      selfCounter: ['첫 번째 밤', '두 번째 밤', '세 번째 밤'], cards: [{ text: '이 캐릭터들은 게임에 없습니다' }],
      note: '게임에 없는 선한 캐릭터 3개를 보여준다(악마 없이 시작하는 게임)',
    },
    other: {
      selfCounter: ['첫 번째 밤', '두 번째 밤', '세 번째 밤'], pick: 'player', count: 1, charCard: true, cards: [EVIL, YOUR_ROLE],
      note: "하루가 지날 때마다 기록 토큰을 넘긴다. 세 번째 밤에만 사람 1명과 악마 캐릭터를 고르고, 소환사를 재운 뒤 대상을 깨워 '당신은' + 악마 토큰을 보여주고 엄지를 내린다",
    },
  },
  vizier: { first: { note: '재상이 누구인지 모두에게 공개한다' }, other: null },
  widow: {
    first: {
      pick: 'player', count: 1, reminders: ['중독'],
      note: "먼저 마도서를 보여주고 1명을 중독시킨다. 미망인을 재운 뒤 이야기꾼이 정한 선한 플레이어 1명에게 '알아냄'을 붙이고, 그 사람을 깨워 미망인 토큰을 보여준다(맞는 카드 문장 없음)",
    },
    other: null,
  },
  witch: {
    first: { pick: 'player', count: 1, reminders: ['저주받음'], note: '고른 사람이 내일 지명하면 그 즉시 죽는다 — 낮에 처리(#114)' },
    other: { pick: 'player', count: 1, reminders: ['저주받음'], note: "어제 '저주받음'은 떼고 옮긴다. 생존자가 3명뿐이면 능력을 잃어 깨우지 않는다" },
  },
  wizard: {
    first: { note: "마법사의 소원에 따라 필요한 처리를 한다('?' 리마인더는 소원 내용에 맞춰 직접 붙인다)" },
    other: { note: '마법사의 소원에 따라 필요한 처리를 한다' },
  },
  wraith: {
    first: { note: '다른 악한 플레이어가 깨어날 때마다 악령도 함께 깨운다' },
    other: { note: '다른 악한 플레이어가 깨어날 때마다 악령도 함께 깨운다' },
  },
  xaan: {
    first: {
      selfCounter: ['첫 번째 밤', '두 번째 밤', '세 번째 밤'], selfMark: 'X',
      note: "X = 셋업 때 외지인 수. X가 1이면 오늘 밤 'X'를 붙인다(그 밤부터 해 질 녘까지 모든 마을 주민이 중독)",
    },
    other: {
      selfCounter: ['첫 번째 밤', '두 번째 밤', '세 번째 밤'], selfMark: 'X',
      note: "하루가 지날 때마다 기록 토큰을 넘기고, X번째 밤이면 'X'를 붙인다(모든 마을 주민 중독)",
    },
  },

  // ── 외지인 ──
  barber: {
    first: null,
    other: {
      ask: true, pick: 'player', count: 2, cards: [CHOSE_YOU, YOUR_ROLE],
      note: "이발사가 오늘 낮/밤에 죽었을 때(이발사에게 '오늘 밤에 이발')만 악마를 깨운다. 악마가 2명(다른 악마 제외)을 고르면 둘의 캐릭터를 맞바꾸고, 바뀐 두 사람을 차례로 깨워 새 캐릭터를 보여준다. 악마 자신을 골라도 된다(#111)",
    },
  },
  butler: {
    first: { pick: 'player', count: 1, reminders: ['주인'], note: '자기 자신은 고를 수 없다. 집사는 주인이 투표할 때만 투표할 수 있다(#14)' },
    other: { pick: 'player', count: 1, reminders: ['주인'], note: "자기 자신은 고를 수 없다. 이전 '주인' 리마인더는 새 대상으로 옮긴다" },
  },
  damsel: {
    first: {
      cards: [YOUR_ROLE],
      note: '하수인 정보 단계에서 하수인들에게 아가씨 토큰을 보여줬는지 확인(누가 아가씨인지는 알려주지 않음). 아가씨 본인은 사냥꾼에게 선택돼 게임에 없는 주민이 됐을 때만 깨워 새 캐릭터를 보여준다',
    },
    other: { cards: [YOUR_ROLE], note: '사냥꾼에게 선택돼 게임에 없는 주민이 됐을 때만 깨워 새 캐릭터를 보여준다. 아니면 깨우지 않는다' },
  },
  hatter: {
    first: null,
    other: {
      ask: true, charCard: true, cards: [YOUR_ROLE],
      note: "모자 장수가 오늘 죽었을 때(본인에게 '오늘 밤에 다과회')만. 하수인·악마를 깨워 각자 같은 종류(하수인↔하수인, 악마↔악마)의 캐릭터를 고를 수 있게 하고, 바꾼 사람에게 새 캐릭터를 보여준다",
    },
  },
  lunatic: {
    first: {
      cards: [
        { text: '당신의 하수인들입니다' },
        { text: '이 캐릭터들은 게임에 없습니다' },
        { text: '당신의 캐릭터입니다', roleKeys: ['demon'] },
        { text: '이 플레이어의 캐릭터는', roleKeys: ['lunatic'], seat: 'lunatic' },
      ],
      note: "7명 이상일 때만. 미치광이에게 하수인 수만큼 아무 플레이어를 '하수인'으로, 선한 캐릭터 3개를 블러프로 보여준다(#87). 첫날밤은 악마도 죽이지 않으므로 공격 고르기는 없다. 그다음 진짜 악마를 깨워 누가 미치광이인지 보여준다",
    },
    other: {
      pick: 'player', count: 1, reminders: ['선택됨'], cards: [{ text: '이 플레이어의 캐릭터는', roleKeys: ['lunatic'], seat: 'lunatic' }],
      note: '미치광이가 믿는 악마처럼 대상을 고르게 한다(가짜 악마가 여러 명을 고르면 그 수만큼). 미치광이의 공격으로는 아무도 죽지 않는다(#62). 이후 진짜 악마를 깨워 미치광이와 그가 고른 사람을 가리킨다(#88)',
    },
  },
  moonchild: {
    first: null,
    other: {
      kill: 'marked', markText: '사망',
      note: "달의 자손이 죽은 뒤 낮에 공개 지목한 사람('사망' 리마인더)이 지목 당시 선했다면 오늘 밤 죽는다. 이후 악으로 바뀌어도 지목 당시 기준(#60, #147). 지목 당시 악이었거나 지목이 없었다면 아무 일도 없다. 아무도 깨우지 않는다",
    },
  },
  ogre: {
    first: {
      pick: 'player', count: 1, reminders: ['친구'],
      note: '자기 자신 제외. 오우거는 고른 사람의 진영이 되지만 본인에게 알리지 않는다. 오우거가 취하거나 중독돼 있어도 진영 변화는 그대로 적용된다',
    },
    other: null,
  },
  plaguedoctor: {
    first: null,
    other: { selfMark: '이야기꾼 능력', note: '역병 의사가 죽었을 때 한 번만. 이야기꾼이 (게임에 없는) 하수인의 능력 하나를 얻는다. 이미 처리했으면 넘어간다' },
  },
  snitch: {
    first: { cards: [{ text: '이 캐릭터들은 게임에 없습니다' }], note: '밀고자 본인이 아니라 각 하수인을 깨워 게임에 없는 선한 캐릭터 3개를 추가로 보여준다' },
    other: null,
  },
  sweetheart: {
    first: null,
    other: {
      pick: 'storyteller', count: 1, reminders: ['취함'],
      note: '사랑꾼이 죽었을 때 한 번만, 이야기꾼이 정한 플레이어 1명이 게임 끝까지 취한다(#110). 아무도 깨우지 않는다',
    },
  },
  tinker: {
    first: null,
    other: { kill: 'self', note: '땜장이는 보호받지 않는 한 이야기꾼이 원할 때 언제든 죽을 수 있다(#59). 죽이지 않으면 아무것도 안 한다' },
  },

  // ── 여행자 ──
  apprentice: {
    first: {
      cards: [YOUR_ROLE], selfMark: '수습생입니다',
      note: '선한 수습생이면 주민, 악한 수습생이면 하수인 캐릭터를 이야기꾼이 정해 보여주고 토큰을 그 캐릭터로 바꾼다',
    },
    other: null,
  },
  barista: {
    first: {
      pick: 'storyteller', count: 1, reminders: ['맨정신 & 건강한', '2번 행동'], cards: [CHOSE_YOU], numbers: ['1', '2'],
      note: '이야기꾼이 대상과 효과를 정한다. 손가락 1개=내일 해 질 때까지 맨정신·건강(참 정보), 2개=내일 해 질 때까지 능력이 두 번 작동. 붙일 리마인더는 둘 중 하나',
    },
    other: {
      pick: 'storyteller', count: 1, reminders: ['맨정신 & 건강한', '2번 행동'], cards: [CHOSE_YOU], numbers: ['1', '2'],
      note: '이야기꾼이 대상과 효과를 정한다. 손가락 1개=내일 해 질 때까지 맨정신·건강(참 정보), 2개=내일 해 질 때까지 능력이 두 번 작동. 붙일 리마인더는 둘 중 하나',
    },
  },
  bonecollector: {
    first: null,
    other: {
      ask: true, pick: 'player', count: 1, reminders: ['능력 가짐'], selfMark: '능력 없음',
      note: '게임당 한 번, 죽은 플레이어 1명을 고르면 그 사람이 내일 해 질 때까지 능력을 되찾는다. 필요하면 그 사람을 깨워 능력을 쓰게 한다. 되살리는 것은 아니다',
    },
  },
  bureaucrat: {
    first: { pick: 'player', count: 1, reminders: ['3표'], note: '자기 자신 제외. 고른 사람의 내일 표가 3표로 센다' },
    other: { pick: 'player', count: 1, reminders: ['3표'], note: '자기 자신 제외' },
  },
  cacklejack: {
    first: null,
    other: {
      pick: 'storyteller', count: 1, cards: [YOUR_ROLE],
      note: "낮에 낄낄이가 지목한 사람('나 말고')을 제외한 플레이어 1명을 이야기꾼이 골라 캐릭터를 바꾸고, 깨워서 새 캐릭터를 보여준다",
    },
  },
  harlot: {
    first: null,
    other: {
      pick: 'player', count: 1, kill: 'target',
      cards: [CHOSE_YOU, { text: '이 플레이어의 캐릭터는', seat: 'picked' }],
      note: '살아 있는 사람을 고르게 하고, 대상을 깨워 매춘부 카드를 보여준다. 대상이 동의(끄덕임)하면 매춘부에게 대상의 캐릭터를 보여준다. 이야기꾼은 두 사람 모두 죽일 수도 있다(매춘부 본인 사망은 본인 토큰에서 처리)',
    },
  },
  thief: {
    first: { pick: 'player', count: 1, reminders: ['음수 표'], note: '자기 자신 제외. 고른 사람의 내일 표가 음수로 센다' },
    other: { pick: 'player', count: 1, reminders: ['음수 표'], note: '자기 자신 제외' },
  },

  // ── 마을주민 ──
  acrobat: {
    first: null,
    other: {
      pick: 'player', count: 1, reminders: ['선택됨'], kill: 'self',
      note: '고른 사람이 오늘 밤 취했거나 중독됐거나, 이 뒤 순서에서 취하거나 중독되면 기예꾼이 사망합니다. 사망 버튼은 밤의 다른 차례를 다 본 뒤에 누르세요.',
    },
  },
  alchemist: {
    first: { cards: [YOUR_ROLE], note: '연금술사가 갖게 된 하수인 능력의 캐릭터 토큰을 보여줍니다(그 하수인은 게임에 없음).' },
    other: null,
  },
  amnesiac: {
    first: { note: '기억상실자의 숨겨진 능력은 이야기꾼이 정합니다. 능력에 맞게 직접 처리하세요.' },
    other: { note: "기억상실자의 숨겨진 능력에 맞게 처리합니다. 추측 답은 '뜨겁다/차갑다' 식으로 말로 줍니다." },
  },
  balloonist: {
    first: { pick: 'storyteller', count: 1, reminders: ['알아냄'], note: '아무 플레이어 1명을 가리킵니다.' },
    other: { pick: 'storyteller', count: 1, reminders: ['알아냄'], note: "이전에 보여준 사람과 다른 캐릭터 유형의 플레이어를 가리킵니다('알아냄' 표시로 확인)." },
  },
  banshee: {
    first: null,
    other: { selfMark: '능력 가짐', note: "오늘 밤 악마가 밴시를 죽였을 때만 처리합니다. 밴시가 사망했음을 모두에게 알리고 '능력 가짐'을 붙입니다." },
  },
  bountyhunter: {
    first: { pick: 'storyteller', count: 1, reminders: ['알아냄'], note: '악한 플레이어 1명을 가리킵니다.' },
    other: { pick: 'storyteller', count: 1, reminders: ['알아냄'], note: "'알아냄' 표시된 사람이 오늘 낮이나 밤에 사망했을 때만, 새 악한 플레이어를 가리킵니다." },
  },
  chambermaid: {
    first: { pick: 'player', count: 2, numbers: 'number', note: '고른 2명 중 오늘 밤 자기 능력으로 깨어난 사람 수를 손가락으로 알려줍니다.' },
    other: {
      pick: 'player', count: 2, numbers: 'number',
      note: '고른 2명 중 오늘 밤 자기 능력으로 깨어난 사람 수를 알려줍니다. 구마사제에게 선택된 악마는 깨어나지 않습니다(#74).',
    },
  },
  chef: { first: { numbers: 'number' }, other: null },
  choirboy: {
    first: null,
    other: { cards: [{ text: '이 사람이 악마입니다', seat: 'demon' }], note: '오늘 밤 악마가 왕을 죽였을 때만 깨워 악마 플레이어를 가리킵니다.' },
  },
  clockmaker: { first: { numbers: 'number' }, other: null },
  courtier: {
    first: {
      ask: true, charCard: true, pick: 'storyteller', count: 1, reminders: ['취함 3'], selfMark: '능력 없음',
      note: "고른 캐릭터를 가진 사람에게 '취함 3'을 붙이고, 낮이 지날 때마다 2→1로 줄입니다.",
    },
    other: {
      ask: true, charCard: true, pick: 'storyteller', count: 1, reminders: ['취함 3'], selfMark: '능력 없음',
      note: "게임당 한 번입니다. 이미 '능력 없음'이면 깨우지 않아도 됩니다.",
    },
  },
  cultleader: {
    first: { cards: [GOOD, EVIL], note: '사교 교주의 소속은 이웃 중 한 명의 소속을 따릅니다. 바뀌었을 때만 정보 토큰을 보여주고 엄지로 신호합니다.' },
    other: { cards: [GOOD, EVIL], note: '이웃 소속에 따라 바뀌었을 때만 정보 토큰을 보여줍니다.' },
  },
  dreamer: {
    first: { pick: 'player', count: 1, answer: 'dreamer', note: '고른 사람의 실제 캐릭터와 반대 진영 캐릭터 토큰을 하나씩 보여줍니다.' },
    other: { pick: 'player', count: 1, answer: 'dreamer', note: '고른 사람의 실제 캐릭터와 반대 진영 캐릭터 토큰을 하나씩 보여줍니다.' },
  },
  empath: { first: { numbers: 'number' }, other: { numbers: 'number' } },
  engineer: {
    first: {
      ask: true, charCard: true, selfMark: '능력 없음', cards: [YOUR_ROLE],
      note: '기계공이 고른 하수인 또는 악마 캐릭터로 대상들을 바꾸고, 대상을 차례로 깨워 바뀐 캐릭터를 보여줍니다.',
    },
    other: {
      ask: true, charCard: true, selfMark: '능력 없음', cards: [YOUR_ROLE],
      note: '게임당 한 번입니다. 대상을 차례로 깨워 바뀐 캐릭터를 보여줍니다.',
    },
  },
  exorcist: {
    first: null,
    other: {
      pick: 'player', count: 1, reminders: ['선택됨'], cards: [{ text: '이 캐릭터가 당신을 선택했습니다', roleKeys: ['self'], seat: 'actor' }],
      note: '어젯밤과 같은 사람은 못 고릅니다. 악마를 골랐으면 악마를 깨워 카드와 구마사제를 보여주고, 그 악마는 오늘 밤 능력으로 깨어나지 않습니다(#49, #74). 푸카의 어젯밤 중독자는 그래도 죽습니다(#76).',
    },
  },
  farmer: {
    first: null,
    other: {
      pick: 'storyteller', count: 1, cards: [SELF_IS],
      note: '농부가 오늘 밤 사망했을 때만, 살아 있는 선한 플레이어 1명을 깨워 농부 토큰을 보여줍니다(그 사람이 새 농부).',
    },
  },
  flowergirl: {
    first: null,
    other: { numbers: 'yesno', note: "오늘 낮에 악마가 투표했는지 고개를 끄덕이거나 젓습니다(낮 동안 기록한 '악마가 투표함/투표하지 않음' 참고)." },
  },
  fortuneteller: {
    first: { pick: 'player', count: 2, answer: 'fortuneteller', numbers: 'yesno' },
    other: { pick: 'player', count: 2, answer: 'fortuneteller', numbers: 'yesno' },
  },
  gambler: {
    first: null,
    other: { pick: 'player', count: 1, charCard: true, kill: 'self', note: '고른 사람의 캐릭터 추측이 틀리면 도박사가 사망합니다(#51).' },
  },
  general: {
    first: { numbers: ['선한 팀', '악한 팀', '둘 다 아님'] },
    other: { numbers: ['선한 팀', '악한 팀', '둘 다 아님'] },
  },
  gossip: {
    first: null,
    other: {
      pick: 'storyteller', count: 1, kill: 'target',
      note: '오늘 낮 험담꾼의 공개 발언이 사실이고 험담꾼이 살아 있으며 이 시점에 취하지 않았을 때만 이야기꾼이 1명을 죽입니다(#52, #79, #80).',
    },
  },
  grandmother: {
    first: { cards: [{ text: '이 사람이 당신의 손주입니다' }], note: '손주 플레이어를 가리키고 손주의 캐릭터 토큰을 보여줍니다.' },
    other: {
      kill: 'self',
      note: '오늘 밤 악마의 능력으로 손주가 죽었을 때만 할머니도 사망합니다. 암살자 같은 하수인에게 죽었으면 할머니는 살아 있습니다(#71, #72).',
    },
  },
  highpriestess: {
    first: { pick: 'storyteller', count: 1, note: '이야기꾼이 생각하기에 대사제가 가장 이야기해 봐야 할 플레이어를 가리킵니다.' },
    other: { pick: 'storyteller', count: 1, note: '대사제가 가장 이야기해 봐야 할 플레이어를 가리킵니다.' },
  },
  huntsman: {
    first: {
      ask: true, pick: 'player', count: 1, selfMark: '능력 없음', cards: [YOUR_ROLE],
      note: '게임당 한 번입니다. 아가씨를 골랐다면 아가씨를 깨워 게임에 없는 마을주민 캐릭터를 보여줍니다.',
    },
    other: {
      ask: true, pick: 'player', count: 1, selfMark: '능력 없음', cards: [YOUR_ROLE],
      note: '게임당 한 번입니다. 아가씨를 골랐다면 아가씨를 깨워 바뀐 캐릭터를 보여줍니다.',
    },
  },
  innkeeper: {
    first: null,
    other: {
      pick: 'player', count: 2, reminders: ['안전함', '취함'],
      note: "고른 2명 모두 '안전함'(오늘 밤 사망 불가), 그중 1명에게 '취함'을 붙입니다(#78, #94).",
    },
  },
  investigator: {
    first: { cards: [{ text: '이 중 한 명이 이 캐릭터입니다' }], note: "'하수인'·'오인' 표시된 두 사람을 가리키고 하수인 캐릭터를 보여줍니다." },
    other: null,
  },
  juggler: {
    first: null,
    other: { numbers: 'number', note: "첫째 낮에 추측한 것 중 맞힌 수를 손가락으로 알려줍니다(둘째 날 밤에만, 낮에 붙인 '정답' 개수 참고)." },
  },
  king: {
    first: {
      cards: [{ text: '이 플레이어의 캐릭터는', roleKeys: ['self'], seat: 'actor' }],
      note: '왕이 아니라 악마를 깨운다. 악마에게 왕 토큰을 보여 주고 왕 자리를 가리킨다',
    },
    other: {
      cards: [{ text: '이 플레이어의 캐릭터는' }],
      note: '사망자 수가 생존자 수 이상일 때만 깨운다. 이야기꾼이 생존자 1명을 정해 그 캐릭터 토큰만 보여 준다(누구인지는 가리키지 않는다)',
    },
  },
  knight: { first: { note: "셋업 때 '알아냄'을 붙인 2명(둘 다 악마가 아님)을 가리킨다" }, other: null },
  librarian: { first: { note: '외지인이 없으면 손가락 0으로 신호한다' }, other: null },
  lycanthrope: {
    first: null,
    other: {
      pick: 'player', count: 1, reminders: ['사망'], kill: 'target',
      note: "생존자만 고를 수 있다. 선한 플레이어를 고르면 사망('거짓 발바닥' 제외). 이렇게 죽였다면 오늘 밤 악마는 아무도 죽이지 못한다",
    },
  },
  magician: {
    first: { note: '마술사를 따로 깨우지 않는다. 하수인 정보 단계에서는 마술사와 악마를, 악마 정보 단계에서는 마술사와 하수인들을 함께 가리킨다' },
    other: null,
  },
  mathematician: {
    first: {
      numbers: 'number',
      note: "이번 밤 동안 다른 캐릭터의 능력 때문에 비정상으로 작동한 능력의 수('오류' 표시). 중독돼도 정보가 맞았다면 세지 않는다(#99)",
    },
    other: {
      numbers: 'number',
      note: "지난 새벽 이후(낮 포함) 다른 캐릭터의 능력 때문에 비정상으로 작동한 능력의 수('오류' 표시). 자기 능력 때문에 중독된 것은 세지 않는다(#145)",
    },
  },
  monk: {
    first: null,
    other: {
      pick: 'player', count: 1, reminders: ['안전함'],
      note: '자기 자신은 고를 수 없다. 고른 사람은 오늘 밤 악마에게서 안전하다(악마가 자기 자신을 노린 경우도 막는다 #31)',
    },
  },
  nightwatchman: {
    first: {
      ask: true, pick: 'player', count: 1, selfMark: '능력 없음', cards: [{ text: '이 플레이어의 캐릭터는', roleKeys: ['self'], seat: 'actor' }],
      note: '게임당 한 번. 야경꾼을 재운 뒤 대상을 깨워 야경꾼 토큰을 보여 주고 야경꾼 자리를 가리킨다',
    },
    other: {
      ask: true, pick: 'player', count: 1, selfMark: '능력 없음', cards: [{ text: '이 플레이어의 캐릭터는', roleKeys: ['self'], seat: 'actor' }],
      note: '게임당 한 번(이미 썼다면 깨우지 않는다). 대상을 깨워 야경꾼 토큰을 보여 주고 야경꾼 자리를 가리킨다',
    },
  },
  noble: { first: { note: "셋업 때 '알아냄'을 붙인 3명(그중 정확히 1명이 악)을 가리킨다" }, other: null },
  oracle: { first: null, other: { numbers: 'number', note: '사망한 플레이어 중 악한 사람의 수(#102)' } },
  philosopher: {
    first: {
      ask: true, charCard: true, pick: 'storyteller', reminders: ['취함'],
      note: "게임당 한 번. 고른 선한 캐릭터가 게임에 있으면 그 캐릭터인 사람을 골라 '취함'을 붙이고, 철학자 토큰을 그 캐릭터 토큰으로 바꾼다(#105)",
    },
    other: {
      ask: true, charCard: true, pick: 'storyteller', reminders: ['취함'],
      note: "게임당 한 번(이미 썼다면 깨우지 않는다). 고른 캐릭터가 게임에 있으면 그 사람에게 '취함'을 붙이고 토큰을 바꾼다. 철학자가 죽으면 '취함'을 뗀다(#129)",
    },
  },
  pixie: {
    first: {
      note: "셋업 때 '집착'을 붙인 게임 속 마을 주민 토큰을 보여 준다. 그 캐릭터라고 주장하며 집착하다가 그 사람이 죽으면 '능력 가짐'을 붙인다(밤 진행과는 별개)",
    },
    other: null,
  },
  poppygrower: {
    first: {
      cards: [{ text: '이 캐릭터들은 게임에 없습니다' }],
      note: '하수인 정보와 악마 정보 단계를 건너뛴다. 악마에게는 게임에 없는 선한 캐릭터 3개만 보여 준다',
    },
    other: {
      cards: [{ text: '이 사람이 악마입니다', seat: 'demon' }, { text: '당신의 하수인들입니다' }],
      selfMark: '악한 팀 깨어남',
      note: '양귀비 재배꾼이 오늘 밤이나 낮에 죽었을 때만. 하수인들을 깨워 악마를 알려 주고, 하수인들을 재운 뒤 악마를 깨워 하수인들을 가리킨다',
    },
  },
  preacher: {
    first: {
      pick: 'player', count: 1, reminders: ['능력 없음'], cards: [CHOSE_YOU],
      note: "하수인을 골랐을 때만 '능력 없음'을 붙이고, 전도사를 재운 뒤 대상을 깨워 카드를 보여 준다",
    },
    other: {
      pick: 'player', count: 1, reminders: ['능력 없음'], cards: [CHOSE_YOU],
      note: "하수인을 골랐을 때만 '능력 없음'을 붙이고, 대상을 깨워 카드를 보여 준다",
    },
  },
  princess: {
    first: null,
    other: {
      pick: 'storyteller', count: 1, reminders: ['죽이지 않음'],
      note: "공주를 깨우지 않는다. 첫째 낮에 공주가 지목한 사람이 처형됐다면 악마에게 '죽이지 않음'을 붙인다. 악마는 평소대로 깨우지만 아무도 죽지 않는다",
    },
  },
  professor: {
    first: null,
    other: {
      ask: true, pick: 'player', count: 1, revive: true, reminders: ['생존'], selfMark: '능력 없음',
      note: '게임당 한 번. 죽은 사람만 고를 수 있고 마을 주민이면 되살아난다(#54)',
    },
  },
  ravenkeeper: {
    first: null,
    other: {
      pick: 'player', count: 1, answer: 'ravenkeeper',
      note: '오늘 밤 죽었을 때만 깨운다. 중독·취함 상태라면 아무 캐릭터나 보여 줄 수 있다(#19, #32)',
    },
  },
  sage: {
    first: null,
    other: {
      pick: 'storyteller', count: 2,
      note: '악마에게 죽은 밤에만 깨운다. 2명을 가리키며 그중 1명은 반드시 악마다. 악마 캐릭터 토큰은 보여 주지 않는다(#108)',
    },
  },
  sailor: {
    first: {
      pick: 'player', count: 1, reminders: ['취함'],
      note: '생존자만 고를 수 있다. 선원 본인과 대상 중 한 명이 취하며, 누구로 할지는 이야기꾼이 정한다(선원이 취하면 본인에게 붙인다). 취하지 않은 선원은 죽지 않는다(#47, #73)',
    },
    other: { pick: 'player', count: 1, reminders: ['취함'], note: "생존자만 고를 수 있다. 선원 또는 대상 중 한 명에게 '취함'을 붙인다(#47, #73)" },
  },
  seamstress: {
    first: {
      ask: true, pick: 'player', count: 2, answer: 'seamstress', numbers: 'yesno', selfMark: '능력 없음',
      note: '게임당 한 번. 고른 두 사람이 같은 팀인지 끄덕이거나 젓는다(#104)',
    },
    other: {
      ask: true, pick: 'player', count: 2, answer: 'seamstress', numbers: 'yesno', selfMark: '능력 없음',
      note: '게임당 한 번(이미 썼다면 깨우지 않는다)',
    },
  },
  shugenja: {
    first: { numbers: ['시계 방향', '반시계 방향'], note: '가장 가까운 악한 사람이 있는 방향을 알려 준다. 양쪽 거리가 같으면 이야기꾼이 정한다' },
    other: null,
  },
  snakecharmer: {
    first: {
      pick: 'player', count: 1, reminders: ['중독'],
      cards: [{ text: '당신의 캐릭터입니다', roleKeys: ['demon'] }, EVIL, SELF_IS, GOOD],
      note: "악마를 골랐을 때만: 뱀 조련사에게 악마 토큰과 악한 팀을 보여 주고 두 토큰을 맞바꾼다. 이전 악마(이제 뱀 조련사)를 깨워 뱀 조련사 토큰과 선한 팀을 보여 주고 '중독'을 붙인다(#98)",
    },
    other: {
      pick: 'player', count: 1, reminders: ['중독'],
      cards: [{ text: '당신의 캐릭터입니다', roleKeys: ['demon'] }, EVIL, SELF_IS, GOOD],
      note: "악마를 골랐을 때만 맞바꾸고, 이전 악마에게 '중독'을 붙인다. 맞바꿔 중독된 뱀 조련사가 악마를 골라도 아무 일 없다(#124)",
    },
  },
  steward: { first: { note: "셋업 때 '알아냄'을 붙인 선한 플레이어 1명을 가리킨다" }, other: null },
  towncrier: {
    first: null,
    other: {
      numbers: 'yesno',
      note: "오늘 낮에 하수인이 지목했으면 '예'. 낮 동안 하수인에게 '하수인이 지목함'/'하수인이 지목하지 않음'을 붙여 두고 그것으로 판단한다(#101, #127)",
    },
  },
  undertaker: { first: null, other: { note: '오늘 낮에 처형된 사람이 없으면 깨우지 않는다. 처형된 사람의 캐릭터는 자동 참고값을 따른다' } },
  villageidiot: {
    first: {
      pick: 'player', count: 1, answer: 'villageidiot', cards: [GOOD, EVIL],
      note: "마을 백치가 여럿이면 셋업 때 1명에게 '취함'을 붙인다. 각자 1명을 골라 그 사람의 팀을 엄지로 알려 준다",
    },
    other: { pick: 'player', count: 1, answer: 'villageidiot', cards: [GOOD, EVIL] },
  },
  washerwoman: { first: { note: '마을 주민 토큰과 그 사람·오인 대상은 자동 참고값을 따른다' }, other: null },
};

/**
 * 표에 없는 캐릭터(자작 캐릭터 등)는 예전 추측 방식에 준하되 보수적으로:
 * 능력 문구에 '고르/선택'이 있거나 리마인더가 있으면 사람 고르기 + 사전 리마인더, 그 외 밤 악마만 [사망 처리]. 숫자는 띄우지 않는다.
 */
function guessUi(role: GrimoireRole, tab: NightTab): StepUi {
  if (!role.team) return {}; // 해 질 녘·하수인/악마 정보·새벽 같은 특수 단계
  const text = (tab === 'first' ? role.firstNightText : role.otherNightText) ?? '';
  const reminders = [...new Set(role.reminders)];
  if (role.team === 'DEMON' && tab === 'other') return { pick: 'player', reminders, kill: 'target' };
  if (reminders.length > 0 || /고르|고릅|골라|선택/.test(text)) return { pick: 'player', reminders };
  return {};
}

/** 이 캐릭터 차례에 띄울 버튼. 그 밤에 깨우지 않는 캐릭터(표의 null)는 빈 구성 */
export function stepUi(role: GrimoireRole, tab: NightTab): StepUi {
  const ui = ROLE_UI[role.key];
  if (!ui) return guessUi(role, tab);
  return (tab === 'first' ? ui.first : ui.other) ?? {};
}
