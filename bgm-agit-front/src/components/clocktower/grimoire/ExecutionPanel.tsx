import { useMemo, useState } from 'react';
import type { Execution, GrimoireState } from '../../../types/clocktower.ts';
import {
  executionLimitWarning,
  executionSurvivalHints,
  exileNeeded,
  exiledToday,
  isTravellerSeat,
  roleMap,
  totalPlayers,
} from './grimoireRules.ts';
import { Btn, Chip, Hint, Overlay, Row, Sheet, SheetHead, SheetSection, TextInput, Warn } from './grimoire.styles.ts';

/**
 * 처형 결과 창. 처형과 사망은 다르다(RB p.16) — 살아남는 경우·이미 죽은 사람의 처형도 그날의 처형 1회로 기록한다.
 * 생존 제안은 근거와 함께 보여 주기만 하고 고르는 건 이야기꾼이다(기본: 사망).
 */
export function ExecutionPanel({
  state,
  seatId,
  defaultRoute = 'VOTE',
  onConfirm,
  onClose,
}: {
  state: GrimoireState;
  seatId: string;
  // '투표로'가 기본. 성결자·변종처럼 투표 없이 생긴 처형은 창에서 바꾼다
  defaultRoute?: Execution['route'];
  onConfirm: (opts: { died: boolean; survivedReason: string | null; route: Execution['route'] }) => void;
  onClose: () => void;
}) {
  const roles = useMemo(() => roleMap(state.data), [state.data]);
  const seat = state.seats.find(s => s.id === seatId);
  const hints = useMemo(() => executionSurvivalHints(state, seatId, roles), [state, seatId, roles]);
  const [died, setDied] = useState(true);
  const [reason, setReason] = useState('');
  const [route, setRoute] = useState<Execution['route']>(defaultRoute);
  if (!seat) return null;

  const limitWarning = executionLimitWarning(state, roles);
  const traveller = isTravellerSeat(seat, roles);
  const role = roles.get(seat.roleKey ?? '');

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>
            {seat.name}
            {role ? `(${role.name})` : ''} 처형 — {state.day}일째
          </h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>

        {limitWarning && <Warn>{limitWarning}</Warn>}
        {traveller && (
          <Warn>여행자는 보통 처형이 아니라 추방 대상입니다. 희생양처럼 능력으로 처형되는 경우에만 기록하세요.</Warn>
        )}
        {state.phase !== 'DAY' && <Hint>지금은 낮이 아닙니다. 밤에 생긴 처형(능력)이면 그대로 기록하세요.</Hint>}

        <SheetSection>
          <label>처형 방식</label>
          <Row>
            <Chip type="button" $active={route === 'VOTE'} onClick={() => setRoute('VOTE')}>
              투표로
            </Chip>
            <Chip type="button" $active={route === 'STORYTELLER'} onClick={() => setRoute('STORYTELLER')}>
              투표 없이(능력)
            </Chip>
          </Row>
        </SheetSection>

        {seat.dead ? (
          <Hint>이미 죽은 사람입니다. 죽음은 그대로 두고 오늘의 처형 1회로만 기록합니다(죽은 사람도 다시 처형될 수 있습니다).</Hint>
        ) : (
          <SheetSection>
            <label>결과</label>
            <Row>
              <Chip type="button" $color="var(--ct-evil)" $active={died} onClick={() => setDied(true)}>
                사망
              </Chip>
              <Chip type="button" $color="var(--ct-alive)" $active={!died} onClick={() => setDied(false)}>
                살아남음
              </Chip>
            </Row>
            {hints.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Hint>확인 필요: 아래 능력으로 살아남을 수 있습니다(취함·중독이면 효과 없음). 누르면 사유에 넣습니다.</Hint>
                {hints.map(h => (
                  <Row key={h.text} style={{ marginTop: 4 }}>
                    <Chip
                      type="button"
                      onClick={() => {
                        setDied(false);
                        setReason(h.text);
                      }}
                    >
                      {h.text}
                    </Chip>
                    <a href={h.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                      근거
                    </a>
                  </Row>
                ))}
              </div>
            )}
            {!died && (
              <TextInput
                style={{ marginTop: 8, width: '100%' }}
                value={reason}
                placeholder="살아남은 사유(예: 평화주의자)"
                onChange={e => setReason(e.target.value)}
              />
            )}
          </SheetSection>
        )}

        <Row style={{ marginTop: 8 }}>
          <Btn
            type="button"
            $tone="danger"
            onClick={() => onConfirm({ died: seat.dead ? false : died, survivedReason: reason.trim() || null, route })}
          >
            {seat.dead ? '처형 기록' : died ? '처형 · 사망' : '처형 · 생존'}
          </Btn>
          <Btn type="button" onClick={onClose}>
            취소
          </Btn>
        </Row>
      </Sheet>
    </Overlay>
  );
}

/**
 * 여행자 추방. 필요 표 = 전체 플레이어 절반 이상, 죽은 사람도 유령 투표 없이 지지할 수 있고 어떤 능력도 적용하지 않는다(G Exile, RB p.19).
 */
export function ExilePanel({
  state,
  seatId,
  onConfirm,
  onClose,
}: {
  state: GrimoireState;
  seatId: string;
  onConfirm: (opts: { supporters: number; survived: boolean }) => void;
  onClose: () => void;
}) {
  const seat = state.seats.find(s => s.id === seatId);
  const [supporters, setSupporters] = useState(0);
  const [survived, setSurvived] = useState(false);
  if (!seat) return null;

  const total = totalPlayers(state.seats);
  const needed = exileNeeded(state.seats);
  const passed = supporters >= needed;
  const already = exiledToday(state, seatId);

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>{seat.name} 추방 — {state.day}일째</h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>
        <Hint>
          전체 {total}명(사망 포함)의 절반 이상인 <b>{needed}명</b>이 지지하면 추방됩니다. 죽은 사람도 유령 투표 없이 지지할 수
          있고, 표를 바꾸는 능력은 적용하지 않습니다. 추방은 처형이 아닙니다.
        </Hint>
        {already && <Warn>이 여행자는 오늘 이미 추방 요청이 있었습니다. 같은 여행자는 하루 한 번만 요청할 수 있습니다.</Warn>}

        <SheetSection>
          <label>지지한 사람 수</label>
          <Row>
            <Btn type="button" onClick={() => setSupporters(n => Math.max(0, n - 1))}>
              −
            </Btn>
            <b style={{ minWidth: 40, textAlign: 'center', fontSize: 20 }}>{supporters}</b>
            <Btn type="button" onClick={() => setSupporters(n => Math.min(total, n + 1))}>
              +
            </Btn>
            <span>{passed ? '추방' : `${needed - supporters}명 더 필요`}</span>
          </Row>
        </SheetSection>

        {passed && !seat.dead && (
          <SheetSection>
            <label>결과</label>
            <Row>
              <Chip type="button" $color="var(--ct-evil)" $active={!survived} onClick={() => setSurvived(false)}>
                사망
              </Chip>
              <Chip type="button" $color="var(--ct-alive)" $active={survived} onClick={() => setSurvived(true)}>
                살아남음(이단아 등)
              </Chip>
            </Row>
          </SheetSection>
        )}

        <Row style={{ marginTop: 8 }}>
          <Btn
            type="button"
            $tone="danger"
            disabled={already}
            onClick={() => onConfirm({ supporters, survived })}
          >
            {passed ? '추방 기록' : '실패로 기록'}
          </Btn>
          <Btn type="button" onClick={onClose}>
            취소
          </Btn>
        </Row>
      </Sheet>
    </Overlay>
  );
}
