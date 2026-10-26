import { useMemo, useState } from 'react';
import type {
  ClockTowerCharacterType,
  DeathCause,
  GrimoireRole,
  GrimoireSeat,
  GrimoireState,
} from '../../../types/clocktower.ts';
import { CT_TYPE_COLOR_DARK, CT_TYPE_LABEL, isSeatableType } from '../../../config/clocktower.ts';
import { renderNightText } from '../../../utils/clocktowerText.tsx';
import {
  PERCEPTION,
  believedCandidates,
  deathLabel,
  exiledToday,
  isEvilSeat,
  reminderOptions,
  roleMap,
  shownRole,
} from './grimoireRules.ts';
import { newSeatId } from './useGrimoire.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';
import {
  Ability,
  Btn,
  Chip,
  Hint,
  Mark,
  Overlay,
  PickGrid,
  PickItem,
  Row,
  Sheet,
  SheetHead,
  SheetSection,
  TextInput,
} from './grimoire.styles.ts';

const SEAT_TEAMS: ClockTowerCharacterType[] = ['TOWNSFOLK', 'OUTSIDER', 'MINION', 'DEMON', 'TRAVELLER'];

interface Props {
  state: GrimoireState;
  seat: GrimoireSeat;
  index: number;
  // 처음 열 때 캐릭터 고르기 탭(진행 중 합류한 자리는 여행자)
  defaultTeam?: ClockTowerCharacterType;
  // silent=true 면 되돌리기 기록을 남기지 않는다(이름 입력처럼 글자마다 바뀌는 것)
  onPatch: (patch: Partial<GrimoireSeat>, silent?: boolean) => void;
  // 캐릭터 바꾸기. 게임 중이면 선악을 그대로 고정하고 이력을 남긴다(changeSeatRole)
  onChangeRole: (roleKey: string | null) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onShow: (role: GrimoireRole) => void;
  onPassDemon: () => void;
  // 처형은 결과 창(사망/생존)을 거친다. 죽은 사람도 처형 기록을 남길 수 있다
  onExecute: () => void;
  onDeath: (cause: Exclude<DeathCause, 'EXECUTION' | 'EXILE'>) => void;
  onRevive: () => void;
  onExile: () => void;
  onToggleLeft: () => void;
  onTravellerAlignment: (evil: boolean) => void;
  onClose: () => void;
}

/** 좌석 메뉴: 캐릭터 지정·사망·유령 투표·선악·리마인더·이름·자리 이동 */
export default function SeatPanel({
  state,
  seat,
  index,
  defaultTeam,
  onPatch,
  onChangeRole,
  onMove,
  onRemove,
  onShow,
  onPassDemon,
  onExecute,
  onDeath,
  onRevive,
  onExile,
  onToggleLeft,
  onTravellerAlignment,
  onClose,
}: Props) {
  const roles = useMemo(() => roleMap(state.data), [state.data]);
  const role = seat.roleKey ? roles.get(seat.roleKey) : undefined;
  const [team, setTeam] = useState<ClockTowerCharacterType>(
    role?.team && isSeatableType(role.team) ? role.team : (defaultTeam ?? 'TOWNSFOLK')
  );
  const [picking, setPicking] = useState(!seat.roleKey);
  const [custom, setCustom] = useState('');

  const taken = useMemo(
    () => new Set(state.seats.filter(s => s.id !== seat.id).map(s => s.roleKey ?? '')),
    [state.seats, seat.id]
  );
  const options = useMemo(() => reminderOptions(state), [state]);
  const evil = isEvilSeat(seat, roles);
  const perception = seat.roleKey ? PERCEPTION[seat.roleKey] : undefined;
  const believed = seat.believedRoleKey ? roles.get(seat.believedRoleKey) : undefined;
  const beliefOptions = useMemo(() => believedCandidates(seat.roleKey, state.data), [seat.roleKey, state.data]);
  // 본인에게 보여줄 캐릭터. 주정뱅이 등은 믿는 캐릭터, 아직 안 정했으면 null(실제 캐릭터를 보여주면 정체가 드러난다)
  const shown = shownRole(seat, roles);
  const traveller = role?.team === 'TRAVELLER';
  const exiledNow = exiledToday(state, seat.id);

  const pickRole = (r: GrimoireRole) => {
    onChangeRole(r.key);
    setPicking(false);
  };

  const addReminder = (text: string, source?: string | null) => {
    if (!text.trim()) return;
    onPatch({ reminders: [...seat.reminders, { id: newSeatId(), text: text.trim(), source: source ?? null }] });
  };

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>
            {index + 1}번 · {seat.name}
          </h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>

        <SheetSection>
          <label>캐릭터</label>
          {role && !picking ? (
            <>
              <Row>
                <Chip type="button" $color={role.team ? CT_TYPE_COLOR_DARK[role.team] : undefined} $active>
                  {role.name}
                </Chip>
                {role.team && <small>{CT_TYPE_LABEL[role.team]}</small>}
                <Btn type="button" onClick={() => setPicking(true)}>
                  바꾸기
                </Btn>
                <Btn type="button" $tone="primary" onClick={() => shown && onShow(shown)} disabled={!shown}>
                  본인에게 보여주기
                </Btn>
                {role.team === 'DEMON' && (
                  <Btn type="button" onClick={onPassDemon}>
                    악마 넘기기
                  </Btn>
                )}
              </Row>
              {role.ability && <Ability>{renderNightText(role.ability)}</Ability>}
              {perception && (
                <div style={{ marginTop: 10 }}>
                  <label>
                    믿는 캐릭터 — {perception.label}
                    {believed ? ` · 지금: ${believed.name}` : ''}
                  </label>
                  {!believed && (
                    <Hint style={{ color: 'var(--ct-evil)', margin: '4px 0' }}>
                      믿는 캐릭터를 정해야 [본인에게 보여주기]를 할 수 있습니다. 실제 캐릭터를 보여주면 정체가 드러납니다.
                    </Hint>
                  )}
                  <PickGrid>
                    {beliefOptions.map(r => (
                      <PickItem
                        key={r.key}
                        type="button"
                        $color={r.team ? CT_TYPE_COLOR_DARK[r.team] : 'var(--ct-muted)'}
                        $active={seat.believedRoleKey === r.key}
                        $taken={taken.has(r.key)}
                        onClick={() => onPatch({ believedRoleKey: r.key })}
                      >
                        <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={28} />
                        {r.name}
                      </PickItem>
                    ))}
                  </PickGrid>
                  {beliefOptions.length === 0 && <Hint>스크립트에 고를 수 있는 캐릭터가 없습니다.</Hint>}
                </div>
              )}
            </>
          ) : (
            <>
              <Row style={{ marginBottom: 8 }}>
                {SEAT_TEAMS.map(t => (
                  <Chip key={t} type="button" $color={CT_TYPE_COLOR_DARK[t]} $active={team === t} onClick={() => setTeam(t)}>
                    {CT_TYPE_LABEL[t]}
                  </Chip>
                ))}
              </Row>
              <PickGrid>
                {state.data.roles
                  .filter(r => r.team === team)
                  .map(r => (
                    <PickItem
                      key={r.key}
                      type="button"
                      $color={CT_TYPE_COLOR_DARK[team]}
                      $active={seat.roleKey === r.key}
                      $taken={taken.has(r.key)}
                      onClick={() => pickRole(r)}
                    >
                      <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={28} />
                      {r.name}
                    </PickItem>
                  ))}
              </PickGrid>
              <Hint style={{ marginTop: 6 }}>흐리게 보이는 캐릭터는 이미 다른 자리에 있습니다(중복 지정도 됩니다).</Hint>
              {seat.roleKey && (
                <Row style={{ marginTop: 8 }}>
                  <Btn type="button" onClick={() => onChangeRole(null)}>
                    캐릭터 비우기
                  </Btn>
                  <Btn type="button" onClick={() => setPicking(false)}>
                    취소
                  </Btn>
                </Row>
              )}
            </>
          )}
        </SheetSection>

        <SheetSection>
          <label>
            상태 · {seat.left ? '떠남' : seat.dead ? (seat.death ? deathLabel(seat.death) : '사망') : '생존'}
          </label>
          {!seat.dead ? (
            <Row>
              {/* 처형은 결과 창에서 사망/생존을 고른다(처형돼도 살아남는 경우가 있다) */}
              <Btn type="button" $tone="danger" onClick={onExecute}>
                처형
              </Btn>
              <Btn type="button" onClick={() => onDeath('NIGHT')}>
                밤에 사망
              </Btn>
              <Btn type="button" onClick={() => onDeath('ABILITY')}>
                능력으로 사망
              </Btn>
              <Btn type="button" onClick={() => onDeath('OTHER')}>
                기타 사망
              </Btn>
            </Row>
          ) : (
            <Row>
              <Chip
                type="button"
                $color="var(--ct-muted)"
                $active={seat.ghostVoteUsed}
                onClick={() => onPatch({ ghostVoteUsed: !seat.ghostVoteUsed })}
              >
                {seat.ghostVoteUsed ? '유령 투표 사용함' : '유령 투표 남음'}
              </Chip>
              {/* 죽은 사람도 처형될 수 있고 그날의 처형 1회로 센다(RB p.16) */}
              <Btn type="button" onClick={onExecute}>
                처형 기록
              </Btn>
              <Btn type="button" onClick={onRevive}>
                되살리기
              </Btn>
            </Row>
          )}
          {traveller && (
            <Row style={{ marginTop: 8 }}>
              <Btn type="button" $tone="danger" onClick={onExile} disabled={exiledNow || seat.left}>
                추방
              </Btn>
              <Btn type="button" onClick={onToggleLeft}>
                {seat.left ? '떠남 취소' : '떠남(게임에서 나감)'}
              </Btn>
              {exiledNow && <Hint>오늘 이미 추방 요청이 있었습니다(같은 여행자는 하루 한 번).</Hint>}
            </Row>
          )}
        </SheetSection>

        <SheetSection>
          {traveller ? (
            <>
              {/* 여행자 선악은 캐릭터로 정해지지 않는다. 이야기꾼이 정한다(G Traveller) */}
              <label>선악 (여행자는 꼭 정하세요)</label>
              {seat.evil == null && (
                <Hint style={{ color: 'var(--ct-evil)', margin: '4px 0' }}>
                  아직 선악을 정하지 않았습니다. 악으로 정하면 악마가 누구인지 알려 줍니다(하수인은 알려 주지 않고 악마의 속임수도
                  없습니다).
                </Hint>
              )}
              <Row>
                <Chip
                  type="button"
                  $color="var(--ct-good)"
                  $active={seat.evil === false}
                  onClick={() => onTravellerAlignment(false)}
                >
                  선
                </Chip>
                <Chip type="button" $color="var(--ct-evil)" $active={seat.evil === true} onClick={() => onTravellerAlignment(true)}>
                  악
                </Chip>
              </Row>
            </>
          ) : (
            <>
              <label>선악 (진영이 바뀐 경우만 바꾸세요)</label>
              <Row>
                <Chip type="button" $active={seat.evil == null} onClick={() => onPatch({ evil: null })}>
                  캐릭터대로{evil != null ? ` (${evil ? '악' : '선'})` : ''}
                </Chip>
                <Chip type="button" $color="var(--ct-good)" $active={seat.evil === false} onClick={() => onPatch({ evil: false })}>
                  선
                </Chip>
                <Chip type="button" $color="var(--ct-evil)" $active={seat.evil === true} onClick={() => onPatch({ evil: true })}>
                  악
                </Chip>
              </Row>
            </>
          )}
        </SheetSection>

        <SheetSection>
          <label>리마인더 붙이기 — 눌러서 이 자리에 붙임 (문구 · 쓰는 캐릭터). 붙은 건 다시 누르면 뗍니다</label>
          {seat.reminders.length > 0 && (
            <Row style={{ marginBottom: 8 }}>
              {seat.reminders.map(m => (
                <Chip
                  key={m.id}
                  type="button"
                  onClick={() => onPatch({ reminders: seat.reminders.filter(x => x.id !== m.id) })}
                  title="눌러서 떼기"
                >
                  {m.text}
                  {m.source ? ` · ${m.source}` : ''} ✕
                </Chip>
              ))}
            </Row>
          )}
          <Row>
            {options.map(o => (
              <Mark
                key={`${o.source}|${o.text}`}
                as="button"
                type="button"
                style={{ cursor: 'pointer', fontSize: 13, padding: '4px 10px' }}
                onClick={() => addReminder(o.text, o.source)}
              >
                {o.text} · {o.source}
              </Mark>
            ))}
          </Row>
          <Row style={{ marginTop: 8 }}>
            <TextInput
              value={custom}
              placeholder="직접 적기"
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  addReminder(custom);
                  setCustom('');
                }
              }}
            />
            <Btn
              type="button"
              onClick={() => {
                addReminder(custom);
                setCustom('');
              }}
            >
              붙이기
            </Btn>
          </Row>
        </SheetSection>

        <SheetSection>
          <label>플레이어</label>
          <Row>
            <TextInput value={seat.name} onChange={e => onPatch({ name: e.target.value }, true)} />
            <Btn type="button" onClick={() => onMove(-1)}>
              ◀ 앞자리로
            </Btn>
            <Btn type="button" onClick={() => onMove(1)}>
              뒷자리로 ▶
            </Btn>
            <Btn type="button" $tone="danger" onClick={onRemove}>
              자리 빼기
            </Btn>
          </Row>
        </SheetSection>
      </Sheet>
    </Overlay>
  );
}
