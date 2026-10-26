import { useState } from 'react';
import styled from 'styled-components';
import type { GrimoireBagEntry, GrimoireRole, GrimoireState } from '../../../types/clocktower.ts';
import { CT_TYPE_COLOR_DARK, CT_TYPE_LABEL } from '../../../config/clocktower.ts';
import { toast } from '../../../utils/toast';
import { Btn, CountTable, Hint, PickGrid, PickItem, Row, Warn } from './grimoire.styles.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';
import { BASE_TEAMS, MAX_BASE_PLAYERS, PERCEPTION, expectedCounts, runsEvilInfo } from './grimoireRules.ts';
import {
  BLUFF_COUNT,
  SETUP_MODIFIERS,
  adjustedCounts,
  bagChoices,
  bagCounts,
  bagProblems,
  bagTargets,
  believedOptions,
  bluffChoices,
  fillBagRandom,
  pickBluffsFromBag,
  usedKeys,
} from './bagRules.ts';

type Step = 1 | 2 | 3 | 4;
const STEP_LABEL: Record<Step, string> = { 1: '인원', 2: '캐릭터 주머니', 3: '악마의 속임수', 4: '캐릭터 나눠 주기' };
const MIN_PLAYERS = 5;

/**
 * 주정뱅이 등을 주머니에 넣으면 이야기꾼에게 "그 사람이 받을 캐릭터"를 고르게 한다.
 * 플레이어는 주정뱅이 토큰을 뽑아도 여기서 고른 정상 캐릭터를 뽑은 것으로 받는다(휴대폰·알림톡도 이 캐릭터).
 * 진짜 캐릭터(주정뱅이)는 마도서에만 남는다.
 */
const BELIEF_PROMPT: Record<string, string> = {
  drunk: '주정뱅이가 받을 마을주민을 고르세요. 플레이어는 이 캐릭터를 뽑은 것으로 받고, 자기가 주정뱅이인 줄 모릅니다.',
  marionette: '꼭두각시가 받을 선한 캐릭터를 고르세요. 플레이어는 이 캐릭터를 뽑은 것으로 받고, 자기가 하수인인 줄 모릅니다.',
  lunatic: '미치광이가 받을 악마를 고르세요. 플레이어는 자기가 그 악마인 줄 압니다.',
};
const PLAYER_OPTIONS = Array.from({ length: MAX_BASE_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i);
type StepState = 'done' | 'current' | 'locked';

/**
 * 셋업 단계 안내: 1 인원 → 2 캐릭터 주머니 → 3 악마의 속임수 → 4 캐릭터를 무작위로 나눠 주고 휴대폰으로 보내기(자리는 그대로).
 * 인원을 먼저 정해야 진영별 추천 수(공식 분배표)를 보여 줄 수 있다(사용자 요청 2026-10-26).
 * 이야기꾼이 지금 무엇을 할 차례인지 보이게 단계마다 완료·지금·잠김을 붙이고, 앞 단계가 끝나야 다음 단계를 연다.
 * 아직 아무도 앉지 않았을 때만 뜬다(나눈 뒤에는 기존 마도서 그대로).
 */
export default function SetupWizard({
  state,
  roles,
  sending,
  onBag,
  onBluffs,
  onDeal,
  onPlayers,
}: {
  state: GrimoireState;
  roles: Map<string, GrimoireRole>;
  sending: boolean;
  onBag: (bag: GrimoireBagEntry[]) => void;
  onBluffs: (keys: string[]) => void;
  onDeal: () => void;
  onPlayers: (n: number) => void;
}) {
  const bag = state.bag ?? [];
  const targets = bagTargets(state.seats, roles);
  const players = state.setupPlayers ?? null;
  // 고르는 중인 인원. 처음엔 지금 자리 수(5~15 안으로)를 권한다
  const [draft, setDraft] = useState<number>(
    () => players ?? Math.min(MAX_BASE_PLAYERS, Math.max(MIN_PLAYERS, targets.length))
  );
  const draftCounts = expectedCounts(draft);
  // 남작 등 셋업 캐릭터가 주머니에 있으면 그만큼 바뀐 추천 수
  const expected = players != null ? (adjustedCounts(players, bag)?.counts ?? null) : null;
  const baseExpected = players != null ? expectedCounts(players) : null;
  const counts = bagCounts(bag, roles);
  const problems = players != null ? bagProblems(bag, players, roles) : [];
  // 나눠 주려면 자리 수가 인원과 같아야 한다
  const seatMismatch = players != null && targets.length !== players;
  const used = usedKeys(bag);
  const bluffs = (state.bluffs ?? []).filter(k => !used.has(k));
  // 7명 미만이면 첫날 밤 악 팀 정보가 없어 악마의 속임수를 줄 일이 없다
  const needBluffs = runsEvilInfo(state, roles);

  const step1Done = players != null;
  const step2Done = step1Done && problems.length === 0;
  const step3Done = !needBluffs || bluffs.length === BLUFF_COUNT;
  const firstOpen: Step = !step1Done ? 1 : !step2Done ? 2 : !step3Done ? 3 : 4;
  const [open, setOpen] = useState<Step | null>(null);
  const shown = open ?? firstOpen;

  const stepState = (n: Step): StepState => {
    const done = n === 1 ? step1Done : n === 2 ? step2Done : n === 3 ? step2Done && step3Done : false;
    if (done) return 'done';
    return n === firstOpen ? 'current' : 'locked';
  };

  const members = state.seats.filter(s => s.memberId != null && targets.includes(s));
  const guests = targets.filter(s => s.memberId == null);
  const setupRoles = bag.map(e => roles.get(e.key)).filter((r): r is GrimoireRole => !!r?.setup);

  const toggleRole = (r: GrimoireRole) => {
    const has = bag.some(e => e.key === r.key);
    onBag(has ? bag.filter(e => e.key !== r.key) : [...bag, { key: r.key, believedKey: null }]);
    if (!has && BELIEF_PROMPT[r.key]) toast.success(BELIEF_PROMPT[r.key]);
  };

  const fillRandom = () => {
    if (players == null) return;
    const result = fillBagRandom(bag, state.data, roles, players);
    if (!result.ok) toast.error(result.message);
    else onBag(result.bag);
  };

  const toggleBluff = (key: string) => {
    if (bluffs.includes(key)) onBluffs(bluffs.filter(k => k !== key));
    else if (bluffs.length >= BLUFF_COUNT) toast.error(`악마의 속임수는 ${BLUFF_COUNT}개입니다. 하나를 먼저 빼 주세요.`);
    else onBluffs([...bluffs, key]);
  };

  const names = (keys: string[]) => keys.map(k => roles.get(k)?.name ?? k).join(', ');

  return (
    <Wizard>
      <Steps>
        {([1, 2, 3, 4] as Step[]).map(n => (
          <StepPill key={n} type="button" $state={stepState(n)} $open={shown === n}
            disabled={stepState(n) === 'locked'} onClick={() => setOpen(n)}>
            <b>{stepState(n) === 'done' ? '✓' : n}</b>
            {STEP_LABEL[n]}
          </StepPill>
        ))}
      </Steps>

      {shown === 1 && (
        <Body>
          <Hint>
            여행자를 뺀 인원을 정하면 공식 분배표대로 진영별로 몇 명씩 넣을지 알려 줍니다. 지금 참가자 자리(여행자 제외)는{' '}
            {targets.length}개입니다.
          </Hint>
          <Row style={{ margin: '10px 0', gap: 12 }}>
            <Btn type="button" onClick={() => setDraft(d => Math.max(MIN_PLAYERS, d - 1))} disabled={draft <= MIN_PLAYERS}>
              −
            </Btn>
            <BigNumber>{draft}명</BigNumber>
            <Btn type="button" onClick={() => setDraft(d => Math.min(MAX_BASE_PLAYERS, d + 1))} disabled={draft >= MAX_BASE_PLAYERS}>
              +
            </Btn>
          </Row>
          {draftCounts && (
            <TeamBoxes>
              {BASE_TEAMS.map(t => (
                <TeamBox key={t} $color={CT_TYPE_COLOR_DARK[t]}>
                  <b>{draftCounts[t]}</b>
                  <span>{CT_TYPE_LABEL[t]}</span>
                </TeamBox>
              ))}
            </TeamBoxes>
          )}
          <CountTable style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>인원</th>
                {BASE_TEAMS.map(t => (
                  <th key={t}>{CT_TYPE_LABEL[t]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAYER_OPTIONS.map(n => {
                const c = expectedCounts(n);
                return (
                  <tr
                    key={n}
                    onClick={() => setDraft(n)}
                    style={{ cursor: 'pointer', background: n === draft ? 'rgba(242, 201, 76, 0.18)' : undefined }}
                  >
                    <td>{n}명</td>
                    {BASE_TEAMS.map(t => (
                      <td key={t}>{c?.[t]}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </CountTable>
          {draft !== targets.length && (
            <Warn>
              참가자 자리가 {targets.length}개라 {draft}명과 다릅니다. 나눠 주기 전까지 툴바 [자리 추가]로 넣거나 좌석 메뉴에서 빼서
              맞춰 주세요. 15명을 넘는 사람은 여행자입니다.
            </Warn>
          )}
          <Hint style={{ marginTop: 8 }}>남작·대부처럼 셋업을 바꾸는 캐릭터를 넣으면 다음 단계에서 그만큼 직접 조정하면 됩니다.</Hint>
          <Next>
            <Btn
              type="button"
              $tone="primary"
              onClick={() => {
                onPlayers(draft);
                setOpen(2);
              }}
            >
              {draft}명으로 정하고 다음
            </Btn>
          </Next>
        </Body>
      )}

      {shown === 2 && (
        <Body>
          <Hint>
            여행자를 뺀 {players}명에게 나눌 캐릭터를 고릅니다. 아직 누구에게 갈지는 정해지지 않습니다 —
            4단계에서 무작위로 나눠 줍니다. 직접 고르거나 [무작위로 채우기]로 모자란 만큼 채우세요.
          </Hint>
          <Row style={{ margin: '8px 0' }}>
            {BASE_TEAMS.map(t => (
              <Count key={t} $color={CT_TYPE_COLOR_DARK[t]} $bad={!!expected && counts[t] !== expected[t]}>
                {CT_TYPE_LABEL[t]} {counts[t]}
                {expected ? `/${expected[t]}` : ''}
              </Count>
            ))}
            <Btn type="button" onClick={fillRandom} disabled={!expected}>
              무작위로 채우기
            </Btn>
            <Btn type="button" $tone="ghost" onClick={() => onBag([])} disabled={bag.length === 0}>
              비우기
            </Btn>
          </Row>

          {BASE_TEAMS.map(t => {
            const list = bagChoices(state.data).filter(r => r.team === t);
            if (list.length === 0) return null;
            return (
              <TeamBlock key={t}>
                <TeamName style={{ color: CT_TYPE_COLOR_DARK[t] }}>{CT_TYPE_LABEL[t]}</TeamName>
                <PickGrid style={{ maxHeight: 'none' }}>
                  {list.map(r => {
                    const inBag = bag.some(e => e.key === r.key);
                    // 다른 칸이 믿는 캐릭터로 쓰는 중이면 넣을 수 없다(겹치면 정체가 드러난다)
                    const takenAsBelief = !inBag && used.has(r.key);
                    return (
                      <PickItem key={r.key} type="button" $color={CT_TYPE_COLOR_DARK[t]} $active={inBag} $taken={takenAsBelief}
                        disabled={takenAsBelief} title={takenAsBelief ? '다른 캐릭터가 믿는 캐릭터로 쓰고 있습니다' : (r.ability ?? undefined)}
                        onClick={() => toggleRole(r)}>
                        <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={30} />
                        {r.name}
                      </PickItem>
                    );
                  })}
                </PickGrid>
              </TeamBlock>
            );
          })}

          {bag.filter(e => PERCEPTION[e.key]).map(e => {
            const self = roles.get(e.key);
            const picked = roles.get(e.believedKey ?? '');
            return (
              <BeliefBox key={`b-${e.key}`} $missing={!picked}>
                <Row style={{ gap: 10 }}>
                  {self && <RoleArt urls={tokenImageCandidates(self, null)} alt="" size={44} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <TeamName style={{ marginBottom: 2 }}>
                      {self?.name}
                      {picked ? ` → 플레이어는 '${picked.name}'(으)로 받습니다` : ' — 받을 캐릭터를 골라 주세요'}
                    </TeamName>
                    <Hint>{BELIEF_PROMPT[e.key] ?? PERCEPTION[e.key].label}</Hint>
                  </div>
                </Row>
                <PickGrid style={{ maxHeight: 'none', marginTop: 8 }}>
                  {believedOptions(e, bag, state.data).map(r => (
                    <PickItem
                      key={r.key}
                      type="button"
                      $color={r.team ? CT_TYPE_COLOR_DARK[r.team] : 'var(--ct-muted)'}
                      $active={e.believedKey === r.key}
                      $taken={false}
                      title={r.ability ?? undefined}
                      onClick={() => onBag(bag.map(x => (x === e ? { ...x, believedKey: r.key } : x)))}
                    >
                      <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={30} />
                      {r.name}
                    </PickItem>
                  ))}
                </PickGrid>
              </BeliefBox>
            );
          })}

          {setupRoles.length > 0 && (
            <Warn>
              셋업을 바꾸는 캐릭터가 있어 추천 수를 바꿨습니다
              {baseExpected && expected
                ? ` (기본 마을주민 ${baseExpected.TOWNSFOLK}·외부인 ${baseExpected.OUTSIDER}·하수인 ${baseExpected.MINION} → ${expected.TOWNSFOLK}·${expected.OUTSIDER}·${expected.MINION})`
                : ''}
              . 분배표와 달라도 넘어갈 수 있습니다.
              {setupRoles.map(r => {
                const options = SETUP_MODIFIERS[r.key];
                const entry = bag.find(e => e.key === r.key);
                return (
                  <div key={r.key} style={{ marginTop: 6 }}>
                    <b>{r.name}</b> — {r.ability}
                    {options && options.length > 1 && entry && (
                      <Row style={{ marginTop: 4 }}>
                        {options.map((o, idx) => (
                          <Btn
                            key={o.label}
                            type="button"
                            $active={(entry.setupChoice ?? 0) === idx}
                            onClick={() => onBag(bag.map(x => (x === entry ? { ...x, setupChoice: idx } : x)))}
                          >
                            {o.label}
                          </Btn>
                        ))}
                      </Row>
                    )}
                    {!options && <div>자동으로 반영하지 못하는 캐릭터입니다. 진영 수를 직접 맞춰 주세요.</div>}
                  </div>
                );
              })}
            </Warn>
          )}
          {problems.length > 0 && <Warn>{problems.map(p => <div key={p}>{p}</div>)}</Warn>}
          <Next>
            <Btn type="button" onClick={() => setOpen(1)}>
              이전
            </Btn>
            <Btn type="button" $tone="primary" disabled={!step2Done} onClick={() => setOpen(3)}>
              다음: 악마의 속임수
            </Btn>
          </Next>
        </Body>
      )}

      {shown === 3 && (
        <Body>
          {needBluffs ? (
            <Hint>
              악마에게 알려 줄, 게임에 없는 선한 캐릭터 {BLUFF_COUNT}개입니다(보통 마을주민 2 + 외부인 1). 주머니에 넣은 캐릭터와
              믿는 캐릭터는 고를 수 없습니다.
            </Hint>
          ) : (
            <Hint>
              {state.seats.filter(s => !s.left).length}명이라 첫날 밤 악 팀 정보 단계가 없어 악마의 속임수를 쓰지 않습니다. 건너뛰어도
              됩니다.
            </Hint>
          )}
          <Row style={{ margin: '8px 0' }}>
            <Count $color="var(--ct-accent)" $bad={needBluffs && bluffs.length !== BLUFF_COUNT}>
              {bluffs.length ? names(bluffs) : '아직 없음'} ({bluffs.length}/{BLUFF_COUNT})
            </Count>
            <Btn type="button" onClick={() => onBluffs(pickBluffsFromBag(bag, state.data))}>
              무작위로 뽑기
            </Btn>
          </Row>
          <PickGrid style={{ maxHeight: 'none' }}>
            {bluffChoices(bag, state.data).map(r => (
              <PickItem key={r.key} type="button" $color={r.team ? CT_TYPE_COLOR_DARK[r.team] : 'var(--ct-muted)'}
                $active={bluffs.includes(r.key)} $taken={false} title={r.ability ?? undefined} onClick={() => toggleBluff(r.key)}>
                <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={30} />
                {r.name}
              </PickItem>
            ))}
          </PickGrid>
          <Next>
            <Btn type="button" onClick={() => setOpen(2)}>
              이전
            </Btn>
            <Btn type="button" $tone="primary" disabled={!step3Done} onClick={() => setOpen(4)}>
              다음: 캐릭터 나눠 주기
            </Btn>
          </Next>
        </Body>
      )}

      {shown === 4 && (
        <Body>
          <Hint>자리는 지금 순서 그대로 두고, 누르는 순간 주머니의 캐릭터를 무작위로 한 자리에 하나씩 나눠 줍니다. 그때 처음으로 누가 무엇인지 정해집니다.</Hint>
          <Summary>
            <li>
              주머니: {names(bag.map(e => e.key))}
            </li>
            {needBluffs && <li>악마의 속임수: {names(bluffs)}</li>}
            <li>
              {members.length > 0
                ? `회원 ${members.length}명은 휴대폰(알림톡·QR)으로 자기 캐릭터를 받습니다.`
                : '회원 자리가 없어 휴대폰으로는 보내지 않습니다.'}
              {needBluffs && members.length > 0 && ' 악마·하수인에게는 악 팀 정보(악마의 속임수 포함)도 같이 갑니다.'}
            </li>
            {guests.length > 0 && (
              <li>
                손님 {guests.length}자리({guests.map(s => s.name).join(', ')})는 나눠 준 뒤 좌석 메뉴의 [본인에게 보여주기]로 알려
                주세요.
              </li>
            )}
          </Summary>
          {seatMismatch && (
            <Warn>
              인원은 {players}명인데 참가자 자리(여행자 제외)가 {targets.length}개입니다. 툴바 [자리 추가]로 넣거나 좌석 메뉴에서
              빼서 맞춰 주세요.
            </Warn>
          )}
          <Next>
            <Btn type="button" onClick={() => setOpen(3)}>
              이전
            </Btn>
            <Btn type="button" $tone="primary" disabled={!step2Done || !step3Done || seatMismatch || sending} onClick={onDeal}>
              {sending
                ? '보내는 중…'
                : members.length > 0
                  ? '캐릭터 무작위로 나눠 주고 휴대폰으로 보내기'
                  : '캐릭터 무작위로 나눠 주기'}
            </Btn>
          </Next>
        </Body>
      )}
    </Wizard>
  );
}

const Wizard = styled.section`
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid var(--ct-accent);
  border-radius: 12px;
  background: var(--ct-surface);
`;

const Steps = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const StepPill = styled.button<{ $state: StepState; $open: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${({ $state }) => ($state === 'locked' ? 'var(--ct-line)' : 'var(--ct-accent)')};
  background: ${({ $open }) => ($open ? 'var(--ct-accent)' : 'transparent')};
  color: ${({ $open, $state }) =>
    $open ? 'var(--ct-ink)' : $state === 'locked' ? 'var(--ct-muted)' : 'var(--ct-text)'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }

  b {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid currentColor;
    font-size: 12px;
  }
`;

const Body = styled.div`
  margin-top: 12px;
`;

const TeamBlock = styled.div`
  margin-top: 12px;
`;

const TeamName = styled.div`
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ct-text);
`;

const Count = styled.span<{ $color: string; $bad: boolean }>`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid ${({ $bad, $color }) => ($bad ? 'var(--ct-evil)' : $color)};
  color: ${({ $color }) => $color};
  font-size: 13px;
  font-weight: 700;
`;

/** 주정뱅이 등이 받을 캐릭터 고르기. 아직 안 골랐으면 눈에 띄게 */
const BeliefBox = styled.div<{ $missing: boolean }>`
  margin-top: 14px;
  padding: 12px;
  border: 2px solid ${({ $missing }) => ($missing ? 'var(--ct-accent)' : 'var(--ct-line)')};
  border-radius: 12px;
  background: ${({ $missing }) => ($missing ? 'var(--ct-warn-bg)' : 'transparent')};
`;

const BigNumber = styled.span`
  min-width: 90px;
  font-size: 32px;
  font-weight: 800;
  text-align: center;
  color: var(--ct-accent);
`;

const TeamBoxes = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
`;

const TeamBox = styled.div<{ $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 4px;
  border: 2px solid ${({ $color }) => $color};
  border-radius: 12px;
  color: ${({ $color }) => $color};

  b {
    font-size: 30px;
    line-height: 1.1;
  }
  span {
    font-size: 13px;
    font-weight: 700;
  }
`;

const Summary = styled.ul`
  margin: 10px 0;
  padding-left: 18px;
  list-style: disc;
  font-size: 14px;
  line-height: 1.7;
  color: var(--ct-text);
`;

const Next = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
`;
