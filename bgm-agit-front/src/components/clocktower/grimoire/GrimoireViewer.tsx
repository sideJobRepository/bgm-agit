import { useMemo, useState } from 'react';
import styled from 'styled-components';
import type { GrimoireRole, GrimoireState } from '../../../types/clocktower.ts';
import { CT_TYPE_COLOR_DARK } from '../../../config/clocktower.ts';
import {
  Btn,
  Circle,
  CircleCenter,
  Mark,
  SeatBadge,
  SeatMarks,
  SeatName,
  SeatSpot,
  Token,
  TokenArt,
  TokenWrap,
  type TokenShape,
} from './grimoire.styles.ts';
import { aliveAll, isEvilSeat, phaseLabel, reminderSourceRole, roleMap, totalPlayers } from './grimoireRules.ts';
import { circleMargins, reminderAutoOffset, reminderTokenSize, seatPoint, seatTokenSize, useElementWidth } from './circleLayout.ts';
import ReminderToken, { CurvedText } from './ReminderToken.tsx';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';

/**
 * 읽기 전용 마도서. 임시저장한 판을 펼쳐 보거나, 끝난 기록의 마지막 마도서를 다시 볼 때 쓴다.
 * 진행 화면과 같은 모양(양피지 토큰·자리 번호·휜 이름·리마인더·사망 수의)을 같은 배치 계산(circleLayout)으로 그린다.
 * 마도서 밖(기록 상세 등)에서도 열리므로 어두운 테마 색 변수를 스스로 갖는 전체 화면 창이다.
 */
export default function GrimoireViewer({
  state,
  title,
  onClose,
}: {
  state: GrimoireState;
  title?: string;
  onClose: () => void;
}) {
  const roles = useMemo(() => roleMap(state.data), [state.data]);
  const [circleEl, setCircleEl] = useState<HTMLDivElement | null>(null);
  const circleWidth = useElementWidth(circleEl);
  const seats = state.seats;
  const tokenSize = seatTokenSize(circleWidth, seats.length);
  const reminderSize = reminderTokenSize(tokenSize);
  const inner = tokenSize - 6;
  const bluffs = (state.bluffs ?? []).map(k => roles.get(k)?.name ?? k);

  return (
    <Root role="dialog" aria-label="마도서 보기">
      <Bar>
        <div>
          <strong>{title ?? state.data.gameName}</strong>
          <span>
            {phaseLabel(state)} · 생존 {aliveAll(seats)}/{totalPlayers(seats)}
          </span>
        </div>
        <Btn type="button" $tone="primary" onClick={onClose}>
          닫기
        </Btn>
      </Bar>
      <Circle
        ref={setCircleEl}
        style={{ width: 'min(100%, 760px, calc(100dvh - 110px))', ...circleMargins(tokenSize, circleWidth) }}
      >
        {seats.map((seat, i) => {
          const role = roles.get(seat.roleKey ?? '');
          // 진행 화면과 같이: 주정뱅이 등은 믿는 캐릭터를 토큰에, 진짜 캐릭터는 리마인더로
          const shown = roles.get(seat.believedRoleKey ?? '') ?? role;
          const color = role?.team ? CT_TYPE_COLOR_DARK[role.team] : 'var(--ct-muted)';
          const shape: TokenShape | undefined =
            role?.team === 'DEMON' ? 'double' : role?.team === 'MINION' ? 'dashed' : undefined;
          const images = tokenImageCandidates(shown, isEvilSeat(seat, roles), state.data.genericImages);
          const dead = seat.dead || seat.left;
          const p = seatPoint(i, seats.length);
          const list = [
            ...(seat.believedRoleKey && role
              ? [{ id: 'believed', text: `${role.name}입니다`, role: role as GrimoireRole | null, pos: null }]
              : []),
            ...seat.reminders.map(m => ({
              id: m.id,
              text: m.text,
              role: reminderSourceRole(m.source, state.data),
              pos: m.pos ?? null,
            })),
          ];
          const evil = isEvilSeat(seat, roles);
          return (
            <SeatSpot key={seat.id} as="div" style={{ left: `${p.x}%`, top: `${p.y}%`, width: tokenSize + 36, cursor: 'default' }}>
              <TokenWrap style={{ width: tokenSize, height: tokenSize }}>
                <Token
                  $color={color}
                  $shape={shape}
                  $dead={dead}
                  $empty={!role}
                  $art={images.length > 0}
                  $size={tokenSize}
                  style={{ fontSize: Math.max(12, Math.round(tokenSize * 0.17)) }}
                >
                  {images.length > 0 ? (
                    <>
                      <TokenArt>
                        <RoleArt urls={images} alt="" size={Math.round(inner * 0.74)} dead={dead} />
                      </TokenArt>
                      <CurvedText text={shown?.name ?? ''} size={inner} color={dead ? '#2e2a24' : '#2b2118'} fontScale={0.15} />
                    </>
                  ) : (
                    (shown?.name ?? '미정')
                  )}
                </Token>
                <SeatBadge $size={Math.max(18, Math.round(tokenSize * 0.24))}>{i + 1}</SeatBadge>
                {list.map((r, k) => {
                  const o = r.pos ?? reminderAutoOffset(i, seats.length, k, tokenSize, reminderSize);
                  return (
                    <span
                      key={r.id}
                      style={{
                        position: 'absolute',
                        left: tokenSize / 2 + o.dx * tokenSize - reminderSize / 2,
                        top: tokenSize / 2 + o.dy * tokenSize - reminderSize / 2,
                        zIndex: 3,
                      }}
                    >
                      <ReminderToken text={r.text} role={r.role} size={reminderSize} />
                    </span>
                  );
                })}
              </TokenWrap>
              <SeatName $dead={seat.dead} style={{ maxWidth: tokenSize + 36, fontSize: Math.max(13, Math.round(tokenSize * 0.15)) }}>
                {seat.name}
              </SeatName>
              <SeatMarks>
                {seat.left && <Mark>떠남</Mark>}
                {/* 선악이 캐릭터와 다르게 바뀐 자리(또는 여행자)만 */}
                {(seat.evil != null || role?.team === 'TRAVELLER') && evil != null && (
                  <Mark $tone={evil ? 'evil' : 'good'}>{evil ? '악' : '선'}</Mark>
                )}
                {seat.dead && <Mark $tone="vote">{seat.ghostVoteUsed ? '투표 끝' : '유령'}</Mark>}
              </SeatMarks>
            </SeatSpot>
          );
        })}
        <CircleCenter>
          <strong>{state.data.gameName}</strong>
          {bluffs.length > 0 && <span>악마의 속임수: {bluffs.join(', ')}</span>}
        </CircleCenter>
      </Circle>
    </Root>
  );
}

const Root = styled.div`
  --ct-bg: #14101c;
  --ct-surface: #1e1828;
  --ct-surface-2: #2a2236;
  --ct-line: #3a3048;
  --ct-text: #ede6f5;
  --ct-muted: #a79fb5;
  --ct-accent: #f2c94c;
  --ct-good: #8ab4ff;
  --ct-evil: #ff7070;
  --ct-ink: #14101c;
  --ct-warn-bg: rgba(242, 201, 76, 0.1);
  --ct-warn-text: #f5dfa0;

  position: fixed;
  inset: 0;
  z-index: 1000;
  overflow-y: auto;
  padding: 12px 16px 24px;
  background: radial-gradient(ellipse at 50% 30%, #221a30 0%, var(--ct-bg) 70%);
  color: var(--ct-text);
  color-scheme: dark;
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  > div {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }
  strong {
    font-size: 18px;
    color: var(--ct-accent);
  }
  span {
    font-size: 13px;
    color: var(--ct-muted);
  }
`;
