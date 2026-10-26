import { useState } from 'react';
import styled from 'styled-components';
import type { GrimoireBagEntry, GrimoireRole, GrimoireState } from '../../../types/clocktower.ts';
import { CT_TYPE_COLOR_DARK, CT_TYPE_LABEL } from '../../../config/clocktower.ts';
import { toast } from '../../../utils/toast';
import { Btn, Chip, Hint, Row, SelectBox, Warn } from './grimoire.styles.ts';
import { BASE_TEAMS, PERCEPTION, expectedCounts, runsEvilInfo } from './grimoireRules.ts';
import {
  BLUFF_COUNT,
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

type Step = 1 | 2 | 3;
type StepState = 'done' | 'current' | 'locked';

/**
 * 셋업 단계 안내: 1 캐릭터 주머니 → 2 악마의 속임수 → 3 캐릭터를 무작위로 나눠 주고 휴대폰으로 보내기(자리는 그대로).
 * 이야기꾼이 지금 무엇을 할 차례인지 보이게 단계마다 완료·지금·잠김을 붙이고, 앞 단계가 끝나야 다음 단계를 연다.
 * 아직 아무도 앉지 않았을 때만 뜬다(나눈 뒤에는 기존 진행판 그대로).
 */
export default function SetupWizard({
  state,
  roles,
  sending,
  onBag,
  onBluffs,
  onDeal,
}: {
  state: GrimoireState;
  roles: Map<string, GrimoireRole>;
  sending: boolean;
  onBag: (bag: GrimoireBagEntry[]) => void;
  onBluffs: (keys: string[]) => void;
  onDeal: () => void;
}) {
  const bag = state.bag ?? [];
  const targets = bagTargets(state.seats, roles);
  const expected = expectedCounts(targets.length);
  const counts = bagCounts(bag, roles);
  const problems = bagProblems(bag, targets.length, roles);
  const used = usedKeys(bag);
  const bluffs = (state.bluffs ?? []).filter(k => !used.has(k));
  // 7명 미만이면 첫날 밤 악 팀 정보가 없어 악마의 속임수를 줄 일이 없다
  const needBluffs = runsEvilInfo(state, roles);

  const step1Done = problems.length === 0;
  const step2Done = !needBluffs || bluffs.length === BLUFF_COUNT;
  const firstOpen: Step = !step1Done ? 1 : !step2Done ? 2 : 3;
  const [open, setOpen] = useState<Step | null>(null);
  const shown = open ?? firstOpen;

  const stepState = (n: Step): StepState => {
    const done = n === 1 ? step1Done : n === 2 ? step1Done && step2Done : false;
    if (done) return 'done';
    return n === firstOpen ? 'current' : 'locked';
  };

  const members = state.seats.filter(s => s.memberId != null && targets.includes(s));
  const guests = targets.filter(s => s.memberId == null);
  const setupRoles = bag.map(e => roles.get(e.key)).filter((r): r is GrimoireRole => !!r?.setup);

  const toggleRole = (r: GrimoireRole) => {
    const has = bag.some(e => e.key === r.key);
    onBag(has ? bag.filter(e => e.key !== r.key) : [...bag, { key: r.key, believedKey: null }]);
  };

  const fillRandom = () => {
    const result = fillBagRandom(bag, state.data, roles, targets.length);
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
        {([1, 2, 3] as Step[]).map(n => (
          <StepPill key={n} type="button" $state={stepState(n)} $open={shown === n}
            disabled={stepState(n) === 'locked'} onClick={() => setOpen(n)}>
            <b>{stepState(n) === 'done' ? '✓' : n}</b>
            {n === 1 ? '캐릭터 주머니' : n === 2 ? '악마의 속임수' : '캐릭터 나눠 주기'}
          </StepPill>
        ))}
      </Steps>

      {shown === 1 && (
        <Body>
          <Hint>
            여행자를 뺀 {targets.length}자리에 나눌 캐릭터를 고릅니다. 아직 누구에게 갈지는 정해지지 않습니다 —
            3단계에서 무작위로 나눠 줍니다. 직접 고르거나 [무작위로 채우기]로 모자란 만큼 채우세요.
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
          {!expected && <Hint>공식 분배표는 5~15명입니다. 그 밖의 인원은 직접 골라 수만 맞추면 됩니다.</Hint>}

          {BASE_TEAMS.map(t => {
            const list = bagChoices(state.data).filter(r => r.team === t);
            if (list.length === 0) return null;
            return (
              <TeamBlock key={t}>
                <TeamName style={{ color: CT_TYPE_COLOR_DARK[t] }}>{CT_TYPE_LABEL[t]}</TeamName>
                <Row>
                  {list.map(r => {
                    const inBag = bag.some(e => e.key === r.key);
                    // 다른 칸이 믿는 캐릭터로 쓰는 중이면 넣을 수 없다(겹치면 정체가 드러난다)
                    const takenAsBelief = !inBag && used.has(r.key);
                    return (
                      <Chip key={r.key} type="button" $color={CT_TYPE_COLOR_DARK[t]} $active={inBag}
                        disabled={takenAsBelief} title={takenAsBelief ? '다른 캐릭터가 믿는 캐릭터로 쓰고 있습니다' : (r.ability ?? undefined)}
                        onClick={() => toggleRole(r)}>
                        {r.name}
                      </Chip>
                    );
                  })}
                </Row>
              </TeamBlock>
            );
          })}

          {bag.filter(e => PERCEPTION[e.key]).map(e => (
            <TeamBlock key={`b-${e.key}`}>
              <TeamName>
                {roles.get(e.key)?.name} — {PERCEPTION[e.key].label}. 본인에게는 이 캐릭터로 보입니다
              </TeamName>
              <SelectBox
                value={e.believedKey ?? ''}
                onChange={ev =>
                  onBag(bag.map(x => (x === e ? { ...x, believedKey: ev.target.value || null } : x)))
                }
              >
                <option value="">믿는 캐릭터 고르기</option>
                {believedOptions(e, bag, state.data).map(r => (
                  <option key={r.key} value={r.key}>
                    {r.name}
                  </option>
                ))}
              </SelectBox>
            </TeamBlock>
          ))}

          {setupRoles.length > 0 && (
            <Warn>
              셋업을 바꾸는 캐릭터가 있습니다. 능력대로 진영 수를 직접 조정하세요(분배표와 달라도 넘어갈 수 있습니다).
              {setupRoles.map(r => (
                <div key={r.key}>
                  <b>{r.name}</b> — {r.ability}
                </div>
              ))}
            </Warn>
          )}
          {problems.length > 0 && <Warn>{problems.map(p => <div key={p}>{p}</div>)}</Warn>}
          <Next>
            <Btn type="button" $tone="primary" disabled={!step1Done} onClick={() => setOpen(2)}>
              다음: 악마의 속임수
            </Btn>
          </Next>
        </Body>
      )}

      {shown === 2 && (
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
          <Row>
            {bluffChoices(bag, state.data).map(r => (
              <Chip key={r.key} type="button" $color={r.team ? CT_TYPE_COLOR_DARK[r.team] : undefined}
                $active={bluffs.includes(r.key)} title={r.ability ?? undefined} onClick={() => toggleBluff(r.key)}>
                {r.name}
              </Chip>
            ))}
          </Row>
          <Next>
            <Btn type="button" onClick={() => setOpen(1)}>
              이전
            </Btn>
            <Btn type="button" $tone="primary" disabled={!step2Done} onClick={() => setOpen(3)}>
              다음: 캐릭터 나눠 주기
            </Btn>
          </Next>
        </Body>
      )}

      {shown === 3 && (
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
          <Next>
            <Btn type="button" onClick={() => setOpen(2)}>
              이전
            </Btn>
            <Btn type="button" $tone="primary" disabled={!step1Done || !step2Done || sending} onClick={onDeal}>
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
