import { useState } from 'react';
import type { GrimoireSeat, GrimoireState } from '../../../types/clocktower.ts';
import type { ShowContent } from './ShowPanels.tsx';
import { roleMap } from './grimoireRules.ts';
import { deathChoiceResult, dayKillResult, freeInfo, slayerResult, type AttackResult, type Verdict } from './nightChoice.ts';
import { Btn, Chip, Hint, Row, SheetSection, TextInput } from './grimoire.styles.ts';

const VERDICT_LABEL: Record<Verdict, string> = { DIES: '죽습니다', SAFE: '죽지 않습니다', MAYBE: '이야기꾼 판단', NONE: '아무 일 없음' };

/**
 * 낮(또는 죽었을 때) 아무 때나 쓰는 능력. 종류별로 화면이 다르다.
 * - target: 공개적으로 사람을 고름 → 판정 → 사망 처리(처단자·사이코패스·총잡이·갱단원)
 * - deathPick: 죽은 뒤 공개적으로 고름(달의 자손·얼뜨기) — 죽은 자리에서만
 * - yesno: 이야기꾼에게 예/아니오 질문(화가)
 * - facts: 두 정보, 하나는 거짓(백치천재)
 * - statement: 공개 발언·추측·조언을 적어 두고 결과만 표시(험담꾼·낚시꾼·곡예사·알사히르·기억상실자·고블린)
 */
type Kind = 'target' | 'deathPick' | 'yesno' | 'facts' | 'statement';
interface DayDef {
  kind: Kind;
  once?: boolean; // 게임당 한 번 — 쓰면 '능력 없음'(사전 리마인더)을 붙인다
  hint: string;
  // statement 종류에서 [사실이었음] 같은 결과 버튼 → 붙일 리마인더(그 캐릭터의 사전 리마인더 문구)
  outcomes?: { label: string; reminder?: string; note: string }[];
}

const DAY: Record<string, DayDef> = {
  slayer: { kind: 'target', once: true, hint: '공개적으로 고른 사람이 악마면 죽습니다.' },
  psychopath: { kind: 'target', hint: '지목 전에 공개적으로 고른 사람이 죽습니다.' },
  gunslinger: { kind: 'target', hint: '첫 투표 집계 뒤, 투표한 사람 중 1명을 고르면 죽습니다.' },
  gangster: { kind: 'target', hint: '살아 있는 이웃 1명(본인·다른 이웃 동의 시)을 죽입니다.' },
  moonchild: { kind: 'deathPick', hint: '죽은 걸 알게 되면 살아 있는 1명을 공개적으로 고릅니다. 선하면 오늘 밤 죽습니다.' },
  klutz: { kind: 'deathPick', hint: '죽은 걸 알게 되면 살아 있는 1명을 공개적으로 고릅니다. 악하면 선한 팀이 집니다.' },
  artist: { kind: 'yesno', once: true, hint: '개인적으로 예/아니오 질문 하나를 합니다. 정답을 알려 줍니다(보르톡스면 거짓).' },
  savant: { kind: 'facts', hint: '개인적으로 와서 정보 두 개를 받습니다 — 하나는 참, 하나는 거짓.' },
  fisherman: { kind: 'statement', once: true, hint: '이야기꾼을 찾아와 팀이 이길 조언을 듣습니다.', outcomes: [{ label: '조언함', note: '조언' }] },
  gossip: {
    kind: 'statement',
    hint: '공개 발언이 사실이면 오늘 밤 1명이 죽습니다(험담꾼이 밤까지 살아 있고 맑아야).',
    outcomes: [
      { label: '사실이었음 → 오늘 밤 1명 사망', note: '발언 사실 — 오늘 밤 1명 사망' },
      { label: '거짓이었음', note: '발언 거짓' },
    ],
  },
  juggler: { kind: 'statement', hint: '첫 낮에 최대 5명의 캐릭터를 공개적으로 추측합니다. 밤에 맞힌 수를 알려 줍니다.', outcomes: [{ label: '추측 기록', note: '추측' }] },
  alsaahir: {
    kind: 'statement',
    hint: '누가 하수인·악마인지 공개적으로 추측합니다. 모두 맞히면 선한 팀이 이깁니다.',
    outcomes: [
      { label: '모두 맞힘 → 선 승리', note: '추측 성공 — 선 승리' },
      { label: '틀림', note: '추측 실패' },
    ],
  },
  amnesiac: { kind: 'statement', hint: '자기 능력을 개인적으로 추측합니다. 얼마나 가까운지 알려 줍니다.', outcomes: [{ label: '추측 기록', note: '능력 추측' }] },
  goblin: { kind: 'statement', hint: '지목받았을 때 고블린이라고 주장하고 그날 처형되면 악이 이깁니다.', outcomes: [{ label: '주장함', reminder: '주장함', note: '고블린이라고 주장' }] },
};

/** 이 자리가 쓰는 낮 능력 캐릭터 키(믿는 캐릭터 포함 — 주정뱅이 처단자도 능력을 "쓴다") */
export function dayAbilityKey(seat: GrimoireSeat): string | null {
  const key = [seat.believedRoleKey, seat.roleKey].find(k => !!k && k in DAY) ?? null;
  if (!key) return null;
  // 달의 자손·얼뜨기는 죽어야 쓴다, 나머지는 살아 있어야 쓴다
  return DAY[key].kind === 'deathPick' ? (seat.dead ? key : null) : seat.dead ? null : key;
}

export interface DayAct {
  note: string;
  killId?: string; // 지금 사망 처리할 사람
  reminders?: { seatId: string; text: string }[]; // 붙일 리마인더(출처 = 이 캐릭터)
  markUsed?: boolean; // 게임당 한 번 능력 — 쓴 자리에 '능력 없음'
  show?: ShowContent; // 본인에게 보여줄 카드
}

export default function DayAbility({ state, seat, onAct }: { state: GrimoireState; seat: GrimoireSeat; onAct: (act: DayAct) => void }) {
  const key = dayAbilityKey(seat)!;
  const def = DAY[key];
  const roles = roleMap(state.data);
  const role = roles.get(key);
  const used = def.once && seat.reminders.some(m => m.source === role?.name && /능력 없음/.test(m.text));
  const [targetId, setTargetId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [facts, setFacts] = useState(['', '']);
  const ring = state.seats.map((s, i) => ({ s, no: i + 1 })).filter(x => !x.s.left && x.s.id !== seat.id);
  const target = ring.find(x => x.s.id === targetId);
  const free = freeInfo(state, roles, seat);
  const who = `${role?.name} ${seat.name}`;

  let result: AttackResult | null = null;
  if (target) {
    if (key === 'slayer') result = slayerResult(state, seat, target.s);
    else if (def.kind === 'target') result = dayKillResult(state, key, seat, target.s);
    else if (def.kind === 'deathPick') result = deathChoiceResult(state, key, seat, target.s);
  }

  return (
    <SheetSection style={{ border: '1px solid var(--ct-accent)', borderRadius: 10, padding: 12 }}>
      <label style={{ fontWeight: 700 }}>
        ⚔ 능력 쓰기 — {role?.name}
        {used ? ' (이미 사용)' : ''}
      </label>
      <Hint style={{ margin: '0 0 6px' }}>
        {def.hint}
        {(def.kind === 'target' || def.kind === 'deathPick') && ' 아래에서 고른 사람을 누르면 결과와 [능력 사용] 버튼이 나옵니다.'}
      </Hint>
      {free.length > 0 && (
        <Hint style={{ margin: '0 0 6px', color: 'var(--ct-evil)' }}>
          ⚠{' '}
          {def.kind === 'target' || def.kind === 'deathPick'
            ? '중독·취함(주정뱅이 포함)이라 능력을 써도 효과가 없습니다. 본인은 모르게 그냥 [능력 사용 · 아무 일 없음]으로 처리하세요.'
            : free.join(' ')}
        </Hint>
      )}

      {(def.kind === 'target' || def.kind === 'deathPick') && (
        <>
          <Row>
            {ring
              .filter(x => def.kind !== 'deathPick' || !x.s.dead)
              .map(({ s, no }) => (
                <Chip key={s.id} type="button" $active={targetId === s.id} onClick={() => setTargetId(s.id)} style={{ opacity: s.dead ? 0.55 : 1 }}>
                  {no}. {s.name}
                  {s.dead ? ' †' : ''}
                </Chip>
              ))}
          </Row>
          {target && result && (
            <>
              <Hint style={{ margin: '6px 0', color: result.verdict === 'DIES' ? 'var(--ct-evil)' : undefined }}>
                참고 판정 · {target.no}. {target.s.name}: <b>{key === 'klutz' && result.verdict === 'DIES' ? '선한 팀 패배' : VERDICT_LABEL[result.verdict]}</b> — {result.reasons.join(' ')}
              </Hint>
              <Row>
                {key === 'moonchild' ? (
                  <Btn
                    type="button"
                    $tone={result.verdict === 'DIES' ? 'danger' : undefined}
                    onClick={() =>
                      onAct({
                        note: `${who} → ${target.no}. ${target.s.name}${result?.verdict === 'DIES' ? ': 오늘 밤 사망' : ': 아무 일 없음'}`,
                        reminders: result?.verdict === 'DIES' ? [{ seatId: target.s.id, text: role?.reminders[0] ?? '사망' }] : [],
                      })
                    }
                  >
                    {result.verdict === 'DIES' ? `${target.no}번에 '사망' 붙이기(오늘 밤 처리)` : '고른 것 기록'}
                  </Btn>
                ) : key === 'klutz' ? (
                  <Btn type="button" onClick={() => onAct({ note: `${who} → ${target.no}. ${target.s.name}: ${result?.verdict === 'DIES' ? '악 — 선한 팀 패배' : '아무 일 없음'}` })}>
                    고른 것 기록
                  </Btn>
                ) : (
                  <>
                    {/* 판정은 참고 — 이야기꾼이 다르게 정할 수 있게 두 버튼을 항상 둔다 */}
                    <Btn
                      type="button"
                      $tone={result.verdict === 'NONE' || result.verdict === 'SAFE' ? undefined : 'danger'}
                      disabled={used}
                      onClick={() => onAct({ note: `${who} → ${target.no}. ${target.s.name} 사망`, killId: target.s.id, markUsed: def.once })}
                    >
                      능력 사용 · {target.no}. {target.s.name} {result.verdict === 'NONE' || result.verdict === 'SAFE' ? '그래도 사망 처리' : '사망 처리'}
                    </Btn>
                    <Btn type="button" disabled={used} onClick={() => onAct({ note: `${who} → ${target.no}. ${target.s.name}: 아무 일 없음`, markUsed: def.once })}>
                      능력 사용 · 아무 일 없음
                    </Btn>
                  </>
                )}
              </Row>
              {key === 'klutz' && result.verdict === 'DIES' && <Hint style={{ margin: '6px 0 0' }}>게임 종료는 [게임 종료]에서 악 승리로 확정하세요.</Hint>}
            </>
          )}
        </>
      )}

      {def.kind === 'yesno' && (
        <>
          <TextInput value={text} placeholder="질문(기록용)" onChange={e => setText(e.target.value)} />
          <Row style={{ marginTop: 6 }}>
            {['예', '아니오'].map(a => (
              <Btn
                key={a}
                type="button"
                disabled={used}
                onClick={() => onAct({ note: `${who}: "${text || '질문'}" → ${a}`, markUsed: true, show: { title: text, roles: [], big: a } })}
              >
                답: {a}
              </Btn>
            ))}
          </Row>
        </>
      )}

      {def.kind === 'facts' && (
        <>
          {[0, 1].map(i => (
            <TextInput
              key={i}
              style={{ marginBottom: 6 }}
              value={facts[i]}
              placeholder={i === 0 ? '정보 1' : '정보 2'}
              onChange={e => setFacts(f => f.map((v, k) => (k === i ? e.target.value : v)))}
            />
          ))}
          <Row>
            <Btn
              type="button"
              disabled={!facts[0].trim() || !facts[1].trim()}
              onClick={() =>
                onAct({
                  note: `${who}: ① ${facts[0]} ② ${facts[1]}`,
                  show: { title: '하나는 참, 하나는 거짓입니다', roles: [], message: `① ${facts[0]}\n② ${facts[1]}` },
                })
              }
            >
              보여주기
            </Btn>
          </Row>
        </>
      )}

      {def.kind === 'statement' && (
        <>
          <TextInput value={text} placeholder="발언·추측·조언 내용(기록용)" onChange={e => setText(e.target.value)} />
          <Row style={{ marginTop: 6 }}>
            {def.outcomes?.map(o => (
              <Btn
                key={o.label}
                type="button"
                disabled={used}
                onClick={() =>
                  onAct({
                    note: `${who}: ${text ? `"${text}" — ` : ''}${o.note}`,
                    markUsed: def.once,
                    reminders: o.reminder ? [{ seatId: seat.id, text: o.reminder }] : [],
                  })
                }
              >
                {o.label}
              </Btn>
            ))}
          </Row>
        </>
      )}
    </SheetSection>
  );
}
