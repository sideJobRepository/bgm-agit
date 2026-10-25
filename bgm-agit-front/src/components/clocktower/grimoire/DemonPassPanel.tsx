import { useMemo, useState } from 'react';
import type { GrimoireState } from '../../../types/clocktower.ts';
import { CT_TYPE_COLOR_DARK } from '../../../config/clocktower.ts';
import { showConfirmModal } from '../../confirmAlert.tsx';
import { demonDeathCheck, roleMap } from './grimoireRules.ts';
import { checkGameEnd, successionCandidates, type SuccessionCause, type Team } from './winCheck.ts';
import {
  Btn,
  Chip,
  Hint,
  Overlay,
  Row,
  Sheet,
  SheetHead,
  SheetSection,
  Warn,
} from './grimoire.styles.ts';

interface Props {
  state: GrimoireState;
  demonSeatId: string;
  onPass: (targetSeatId: string, cause: SuccessionCause) => void;
  onEndGame: (winner?: Team) => void;
  onClose: () => void;
}

const CAUSE_LABEL: Record<SuccessionCause, string> = {
  SCARLET_WOMAN: '탕녀',
  IMP_STARPASS: '임프 자결',
  FANG_GU: '팡 구 이동',
  OTHER: '기타(이야기꾼 지정)',
};

const CAUSE_HINT: Record<SuccessionCause, string> = {
  SCARLET_WOMAN: '생존 5명 이상(여행자 제외)에서 악마가 죽으면 탕녀가 악마가 됩니다.',
  IMP_STARPASS:
    '임프가 스스로 죽이면 살아 있는 하수인(은둔자 포함)이 임프가 됩니다. 누구인지는 이야기꾼이 정합니다.',
  FANG_GU:
    '팡 구가 처음 외지인을 공격하면 그 외지인이 악한 팡 구가 되고 원래 팡 구가 죽습니다. 넘겨받은 사람은 악이 됩니다.',
  OTHER:
    '다른 캐릭터 능력(마귀할멈 등)으로 악마가 바뀌는 경우입니다. 선악은 넘겨받는 사람 것을 그대로 둡니다.',
};

/**
 * 악마가 죽었을 때(또는 이야기꾼이 직접 열었을 때) 악마를 다른 플레이어에게 넘긴다.
 * 원인을 먼저 고르면 그 원인의 권장 후보를 보여 준다. 다른 사람을 고르면 경고한다.
 * 선 승리 안내는 승패 제안 엔진(checkGameEnd) 결과만 따른다 — 쌍둥이·주모자·좀버얼 등을 이 창이 따로 판단하지 않는다.
 */
export default function DemonPassPanel({ state, demonSeatId, onPass, onEndGame, onClose }: Props) {
  const roles = useMemo(() => roleMap(state.data), [state.data]);
  const check = demonDeathCheck(state, demonSeatId);
  const demonKey = check?.demon.key;
  const swAvailable =
    !!check &&
    check.demonSeat.dead &&
    state.seats.some(s => s.roleKey === 'scarletwoman' && !s.dead && !s.left);
  const defaultCause: SuccessionCause =
    swAvailable && check?.scarletWoman
      ? 'SCARLET_WOMAN'
      : demonKey === 'imp'
        ? 'IMP_STARPASS'
        : demonKey === 'fanggu'
          ? 'FANG_GU'
          : 'OTHER';
  const [cause, setCause] = useState<SuccessionCause>(defaultCause);
  if (!check) return null;
  const { demonSeat, demon, aliveBefore, otherDemonsAlive } = check;

  // 악마가 살아 있으면 탕녀는 해당 없음. 임프·팡 구는 그 악마일 때만 보인다
  const causes: SuccessionCause[] = [
    ...(swAvailable ? (['SCARLET_WOMAN'] as const) : []),
    ...(demon.key === 'imp' ? (['IMP_STARPASS'] as const) : []),
    ...(demon.key === 'fanggu' ? (['FANG_GU'] as const) : []),
    'OTHER',
  ];
  const activeCause = causes.includes(cause) ? cause : 'OTHER';
  const recommended = successionCandidates(state, demonSeat.id, activeCause, roles);
  const recommendedIds = new Set(recommended.map(s => s.id));
  const pool = state.seats.filter(s => s.id !== demonSeat.id && !s.dead && !s.left);

  const verdict =
    demonSeat.dead && state.settings.suggestionsEnabled
      ? checkGameEnd(state, {
          kind: 'DEATH',
          seatId: demonSeat.id,
          cause: demonSeat.death?.cause ?? 'OTHER',
        })
      : null;

  const pick = (seatId: string) => {
    if (recommendedIds.has(seatId) || activeCause === 'OTHER') {
      onPass(seatId, activeCause);
      return;
    }
    const name = state.seats.find(s => s.id === seatId)?.name;
    showConfirmModal({
      message: `${name}님은 '${CAUSE_LABEL[activeCause]}' 규칙의 후보가 아닙니다. 그래도 ${demon.name}(으)로 지정할까요?`,
      onConfirm: () => onPass(seatId, activeCause),
    });
  };

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>
            {demonSeat.dead ? `${demon.name}(${demonSeat.name}) 사망` : `${demon.name} 넘기기`}
          </h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>

        {demonSeat.dead && (
          <Hint>
            악마가 죽기 직전 생존 {aliveBefore}명(여행자 제외)
            {otherDemonsAlive > 0 && ` · 살아 있는 다른 악마 ${otherDemonsAlive}명`}
          </Hint>
        )}

        <SheetSection>
          <label>넘기는 원인</label>
          <Row>
            {causes.map(c => (
              <Chip key={c} type="button" $active={activeCause === c} onClick={() => setCause(c)}>
                {CAUSE_LABEL[c]}
              </Chip>
            ))}
          </Row>
          <Hint style={{ marginTop: 6 }}>{CAUSE_HINT[activeCause]}</Hint>
          {activeCause === 'SCARLET_WOMAN' && !check.scarletWoman && (
            <Warn>악마가 죽기 직전 생존자가 5명 미만이라 탕녀 능력이 발동하지 않습니다.</Warn>
          )}
          {activeCause !== 'OTHER' && recommended.length === 0 && (
            <Warn>이 원인으로 넘겨받을 수 있는 살아 있는 사람이 없습니다.</Warn>
          )}
        </SheetSection>

        <SheetSection>
          <label>{demon.name}(으)로 지정할 사람</label>
          <Row>
            {[...recommended, ...pool.filter(s => !recommendedIds.has(s.id))].map(s => {
              const role = roles.get(s.roleKey ?? '');
              const isRecommended = recommendedIds.has(s.id) && activeCause !== 'OTHER';
              return (
                <Chip
                  key={s.id}
                  type="button"
                  $color={role?.team ? CT_TYPE_COLOR_DARK[role.team] : undefined}
                  $active={isRecommended}
                  onClick={() => pick(s.id)}
                >
                  {s.name}
                  {role ? ` · ${role.name}` : ''}
                </Chip>
              );
            })}
          </Row>
          <Hint style={{ marginTop: 6 }}>
            지정하면 그 사람 캐릭터가 {demon.name}(으)로 바뀌고, 원래 캐릭터가 리마인더로 남습니다.
            그날 밤 [본인에게 보여주기]로 알려 주세요.
          </Hint>
        </SheetSection>

        {verdict?.winner && (
          <Warn>
            확인 필요: {verdict.winner === 'GOOD' ? '선한 팀' : '악한 팀'} 승리일 수 있습니다 —{' '}
            {verdict.reasons.map(r => r.text).join(' / ')}
            <Row style={{ marginTop: 8 }}>
              <Btn type="button" $tone="primary" onClick={() => onEndGame(verdict.winner)}>
                게임 종료로
              </Btn>
            </Row>
          </Warn>
        )}

        <Btn type="button" onClick={onClose} style={{ marginTop: 8 }}>
          넘기지 않음
        </Btn>
      </Sheet>
    </Overlay>
  );
}
