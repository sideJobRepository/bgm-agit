import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import type { GrimoireRole, GrimoireState } from '../../../types/clocktower.ts';
import { CT_TYPE_COLOR_DARK } from '../../../config/clocktower.ts';
import {
  Btn,
  Circle,
  CircleCenter,
  Mark,
  Overlay,
  SeatBadge,
  SeatMarks,
  SeatName,
  SeatSpot,
  Sheet,
  SheetHead,
  Token,
  TokenArt,
  TokenWrap,
  type TokenShape,
} from './grimoire.styles.ts';
import { aliveAll, isEvilSeat, phaseLabel, reminderSourceRole, roleMap, totalPlayers } from './grimoireRules.ts';
import { FILL_STYLE, reminderAutoOffset, reminderTokenSize, seatPoint, seatTokenSize, useElementSize } from './circleLayout.ts';
import ReminderToken, { CurvedText } from './ReminderToken.tsx';
import RoleArt from './RoleArt.tsx';
import NightLogList from './NightLogList.tsx';
import { tokenImageCandidates } from './tokenImage.ts';
import { exitFullscreen, fullscreenElement, fullscreenSupported, requestFullscreen } from './useGrimoireScreen.ts';

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
  const box = useElementSize(circleEl);
  // 화면을 꽉 채운 타원이라 짧은 쪽 길이로 토큰 크기를 정한다
  const circleWidth = Math.min(box.width, box.height) || box.width;
  const seats = state.seats;
  const tokenSize = seatTokenSize(circleWidth, seats.length);
  const reminderSize = reminderTokenSize(tokenSize);
  const inner = tokenSize - 6;
  const bluffs = (state.bluffs ?? []).map(k => roles.get(k)?.name ?? k);
  const logs = state.nightLogs ?? [];
  const [logOpen, setLogOpen] = useState(false);

  // 열 때 브라우저 전체 화면을 켜 주소창·탭 줄을 걷는다. 이 창이 켰으면 닫을 때 끈다
  const [isFull, setIsFull] = useState(() => !!fullscreenElement());
  const enteredFull = useRef(false);
  useEffect(() => {
    const onChange = () => setIsFull(!!fullscreenElement());
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    if (fullscreenSupported() && !fullscreenElement()) {
      enteredFull.current = true;
      requestFullscreen(true);
    }
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
      if (enteredFull.current) exitFullscreen();
    };
  }, []);

  return (
    <Root role="dialog" aria-label="마도서 보기">
      <Bar>
        <div>
          <strong>{title ?? state.data.gameName}</strong>
          <span>
            {phaseLabel(state)} · 생존 {aliveAll(seats)}/{totalPlayers(seats)}
          </span>
        </div>
        {/* 밤마다 보여 준 정보(복기용). 기록 기능 전 저장본에는 없다 */}
        {logs.length > 0 && (
          <Btn type="button" onClick={() => setLogOpen(true)}>
            정보 기록 {logs.length}
          </Btn>
        )}
        {fullscreenSupported() && !isFull && (
          <Btn
            type="button"
            onClick={() => {
              enteredFull.current = true;
              requestFullscreen();
            }}
          >
            전체 화면
          </Btn>
        )}
        <Btn type="button" $tone="primary" onClick={onClose}>
          닫기
        </Btn>
      </Bar>
      <Circle
        ref={setCircleEl}
        style={FILL_STYLE}
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
      {logOpen && (
        <Overlay onClick={() => setLogOpen(false)}>
          <Sheet onClick={e => e.stopPropagation()}>
            <SheetHead>
              <h3>정보 기록</h3>
              <Btn type="button" onClick={() => setLogOpen(false)}>
                닫기
              </Btn>
            </SheetHead>
            <NightLogList logs={logs} />
          </Sheet>
        </Overlay>
      )}
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
