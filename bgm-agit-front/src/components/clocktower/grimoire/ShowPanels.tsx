import styled from 'styled-components';
import { QRCodeSVG } from 'qrcode.react';
import type { GrimoireRole, GrimoireState } from '../../../types/clocktower.ts';
import { CT_TYPE_COLOR_DARK, CT_TYPE_LABEL } from '../../../config/clocktower.ts';
import { Btn, Hint, Overlay, Row, Sheet, SheetHead } from './grimoire.styles.ts';
import { MIN_PLAYERS_FOR_EVIL_INFO, evilInfoCount, roleMap, runsEvilInfo } from './grimoireRules.ts';
import RoleArt from './RoleArt.tsx';
import { tokenImageCandidates } from './tokenImage.ts';

export interface ShowContent {
  title: string;
  roles: GrimoireRole[];
  message?: string;
}

/**
 * 플레이어에게 태블릿을 돌려 보여주는 전체 화면 카드. 아무 데나 누르면 닫힌다.
 * 이야기꾼 화면의 다른 정보(좌석·리마인더)는 덮어서 안 보이게 한다.
 */
export function ShowCard({ content, onClose }: { content: ShowContent; onClose: () => void }) {
  return (
    <FullScreen onClick={onClose}>
      <ShowTitle>{content.title}</ShowTitle>
      <ShowRoles>
        {content.roles.map(r => (
          <ShowRole key={r.key} $color={r.team ? CT_TYPE_COLOR_DARK[r.team] : 'var(--ct-muted)'}>
            {/* 캐릭터 기본 진영 그림(선악이 바뀐 것은 그림으로 알려 주지 않는다) */}
            <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={content.roles.length === 1 ? 160 : 96} />
            <strong>{r.name}</strong>
            {r.team && <span>{CT_TYPE_LABEL[r.team]}</span>}
            {content.roles.length === 1 && r.ability && <p>{r.ability}</p>}
          </ShowRole>
        ))}
      </ShowRoles>
      {content.message && <ShowMessage>{content.message}</ShowMessage>}
      <ShowHint>화면을 누르면 닫힙니다</ShowHint>
    </FullScreen>
  );
}

/** 악마의 속임수 3장: 게임에 없는 선한 캐릭터. 첫날 밤 악마에게 보여준다 */
export function BluffPanel({
  state,
  onReroll,
  onShow,
  onClose,
}: {
  state: GrimoireState;
  onReroll: () => void;
  onShow: (content: ShowContent) => void;
  onClose: () => void;
}) {
  const roles = roleMap(state.data);
  const bluffs = (state.bluffs ?? []).map(k => roles.get(k)).filter((r): r is GrimoireRole => !!r);
  // 주정뱅이 등이 믿는 캐릭터도 게임에 있는 것으로 본다
  const inPlay = new Set(state.seats.flatMap(s => [s.roleKey ?? '', s.believedRoleKey ?? '']));
  const stale = bluffs.some(b => inPlay.has(b.key));
  // 악마의 속임수는 첫날 밤 악마 정보 단계에서 준다. 그 단계를 건너뛰는 인원이면 줄 일이 없다
  const evilInfo = runsEvilInfo(state, roles);

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>악마의 속임수 (악마에게 보여줄 캐릭터)</h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>
        <Hint>
          게임에 없는 마을주민 2 + 외부인 1을 뽑습니다(외부인이 모자라면 마을주민). 캐릭터 배정을 끝낸 뒤에 뽑으세요.
        </Hint>
        {!evilInfo && (
          <Hint style={{ color: 'var(--ct-evil)' }}>
            {evilInfoCount(state, roles)}명이라 첫날 밤 하수인·악마 정보 단계가 없습니다({MIN_PLAYERS_FOR_EVIL_INFO}명 미만).
            보통 악마에게 악마의 속임수를 주지 않습니다.
          </Hint>
        )}
        <Row style={{ margin: '12px 0' }}>
          {bluffs.length === 0 ? (
            <Hint>아직 뽑지 않았습니다.</Hint>
          ) : (
            bluffs.map(r => (
              <ShowRole key={r.key} $color={r.team ? CT_TYPE_COLOR_DARK[r.team] : 'var(--ct-muted)'} $small>
                <RoleArt urls={tokenImageCandidates(r, null)} alt="" size={56} />
                <strong>{r.name}</strong>
              </ShowRole>
            ))
          )}
        </Row>
        {stale && <Hint style={{ color: 'var(--ct-evil)' }}>악마의 속임수 중에 지금 게임에 있는 캐릭터가 있습니다. 다시 뽑으세요.</Hint>}
        <Row>
          <Btn type="button" onClick={onReroll}>
            {bluffs.length ? '다시 뽑기' : '뽑기'}
          </Btn>
          <Btn
            type="button"
            $tone="primary"
            disabled={!bluffs.length}
            onClick={() => onShow({ title: '이 캐릭터들은 게임에 없습니다', roles: bluffs })}
          >
            악마에게 보여주기
          </Btn>
        </Row>
      </Sheet>
    </Overlay>
  );
}

/**
 * 플레이어용 QR. 각자 찍으면 내 캐릭터 화면(/clocktower-my)이 열린다 — 로그인한 본인 자리만 보이고,
 * 오늘 스크립트(게임 상세) 링크도 거기 있다. QR 자체에는 누가 무슨 캐릭터인지 담기지 않는다.
 */
export function ScriptQrPanel({ state, onClose }: { state: GrimoireState; onClose: () => void }) {
  const url = `${window.location.origin}/clocktower-my?game=${state.data.gameId}`;
  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={e => e.stopPropagation()}>
        <SheetHead>
          <h3>내 캐릭터 · 스크립트 QR</h3>
          <Btn type="button" onClick={onClose}>
            닫기
          </Btn>
        </SheetHead>
        <QrBox>
          <QRCodeSVG value={url} size={260} />
          <strong>{state.data.gameName}</strong>
          <Hint>휴대폰으로 찍으면 내 캐릭터와 오늘 스크립트를 볼 수 있습니다</Hint>
        </QrBox>
      </Sheet>
    </Overlay>
  );
}

const FullScreen = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px;
  background:
    radial-gradient(ellipse at 50% 35%, rgba(242, 201, 76, 0.08), transparent 60%),
    var(--ct-bg);
  color: var(--ct-text);
  text-align: center;
  cursor: pointer;
`;

const ShowTitle = styled.div`
  font-size: 32px;
  font-weight: 800;
`;

const ShowRoles = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
`;

const ShowRole = styled.div<{ $color: string; $small?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: ${({ $small }) => ($small ? '96px' : '200px')};
  max-width: 520px;
  padding: ${({ $small }) => ($small ? '10px 14px' : '24px 28px')};
  border: 3px solid ${({ $color }) => $color};
  border-radius: 16px;
  background: ${({ $small }) => ($small ? 'var(--ct-surface-2)' : 'var(--ct-surface)')};
  color: ${({ $small, $color }) => ($small ? $color : 'var(--ct-text)')};

  strong {
    font-size: ${({ $small }) => ($small ? '16px' : '40px')};
  }

  span {
    font-size: 18px;
    /* 진행판 진영 색은 어두운 바탕 대비를 통과한 값이라 밝기 보정이 필요 없다 */
    color: ${({ $color }) => $color};
  }

  p {
    margin-top: 8px;
    font-size: 20px;
    line-height: 1.6;
  }
`;

const ShowMessage = styled.div`
  font-size: 22px;
`;

const ShowHint = styled.div`
  font-size: 14px;
  opacity: 0.6;
`;

const QrBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 8px 0 4px;
  text-align: center;

  strong {
    font-size: 18px;
  }
`;
