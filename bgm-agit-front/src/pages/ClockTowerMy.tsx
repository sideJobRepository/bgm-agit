import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { userState } from '../recoil/state/userState.ts';
import api from '../utils/axiosInstance.ts';
import LoginMoadl from '../components/LoginMoadl.tsx';
import { CT_TYPE_COLOR_DARK, CT_TYPE_LABEL } from '../config/clocktower.ts';
import RoleArt from '../components/clocktower/grimoire/RoleArt.tsx';
import { Btn, GrimoireRoot, Hint, Mark, Muted } from '../components/clocktower/grimoire/grimoire.styles.ts';
import type { MyClocktowerSeat } from '../types/clocktower.ts';

const POLL_MS = 15_000;

type Active = Extract<MyClocktowerSeat, { active: true }>;

/**
 * 플레이어 휴대폰 "내 캐릭터". 이야기꾼이 [휴대폰으로 배정 보내기]를 누르면 로그인한 본인 자리만 내려온다.
 * 캐릭터 카드는 늘 가려 두고 누르고 있는 동안만 보여준다(옆 사람이 화면을 보지 않게).
 */
export default function ClockTowerMy() {
  const user = useRecoilValue(userState);
  const [params] = useSearchParams();
  const qrGameId = Number(params.get('game'));
  const [loginOpen, setLoginOpen] = useState(false);
  const [mine, setMine] = useState<MyClocktowerSeat | null>(null);
  const [failed, setFailed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  // 이미 확인 보고를 보낸 (세션, 버전). 누를 때마다 보내지 않게
  const reported = useRef<string | null>(null);

  const load = useCallback(() => {
    api
      .get<MyClocktowerSeat>('/bgm-agit/clocktower-sessions/mine')
      .then(res => {
        setMine(res.data);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    const t = window.setInterval(load, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user, load]);

  // 화면을 내리거나 다른 앱으로 가면 가린다
  useEffect(() => {
    const hide = () => setRevealed(false);
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('blur', hide);
    return () => {
      document.removeEventListener('visibilitychange', hide);
      window.removeEventListener('blur', hide);
    };
  }, []);

  const active = mine && mine.active ? (mine as Active) : null;

  const show = () => {
    setRevealed(true);
    if (!active || active.version <= active.viewedVersion) return;
    const key = `${active.sessionId}:${active.version}`;
    if (reported.current === key) return;
    reported.current = key;
    api
      .post('/bgm-agit/clocktower-sessions/mine/viewed', { sessionId: active.sessionId, version: active.version })
      .then(() =>
        setMine(prev =>
          prev && prev.active && prev.sessionId === active.sessionId
            ? { ...prev, viewedVersion: Math.max(prev.viewedVersion, active.version) }
            : prev
        )
      )
      .catch(() => {
        reported.current = null;
      });
  };
  const hide = () => setRevealed(false);

  const scriptGameId = active?.gameId ?? (Number.isFinite(qrGameId) && qrGameId > 0 ? qrGameId : null);
  const scriptLink = scriptGameId != null && (
    <ScriptLink>
      <Link to={`/clockTowerGameDetail?id=${scriptGameId}`}>오늘 스크립트 캐릭터 목록 보기</Link>
    </ScriptLink>
  );

  if (!user) {
    return (
      <GrimoireRoot $immersive={false}>
        <Body>
          <Title>내 캐릭터</Title>
          <Muted>로그인하면 이야기꾼이 보낸 내 캐릭터를 볼 수 있습니다.</Muted>
          <Btn type="button" $tone="primary" onClick={() => setLoginOpen(true)} style={{ minHeight: 48 }}>
            로그인 / 회원가입
          </Btn>
          <Hint>가입하지 않았다면 회원가입 후 이야기꾼에게 닉네임을 알려 주세요.</Hint>
          {scriptLink}
        </Body>
        {loginOpen && <LoginMoadl onClose={() => setLoginOpen(false)} />}
      </GrimoireRoot>
    );
  }

  const role = active?.role ?? null;
  const color = role?.team ? CT_TYPE_COLOR_DARK[role.team] : 'var(--ct-muted)';
  const changed = !!active && active.version > active.viewedVersion;

  return (
    <GrimoireRoot $immersive={false}>
      <Body>
        <Title>내 캐릭터</Title>
        {!mine && !failed && <Muted>불러오는 중…</Muted>}
        {failed && !mine && <Muted>불러오지 못했습니다. 잠시 뒤 다시 시도합니다.</Muted>}
        {mine && !active && (
          <>
            <Muted>진행 중인 게임이 없습니다.</Muted>
            <Hint>이야기꾼이 배정을 보내면 여기에 나타납니다(15초마다 확인).</Hint>
          </>
        )}
        {active && (
          <>
            <Meta>
              {active.gameName} · {active.seatNo}번 자리
            </Meta>
            {changed && (
              <Changed>
                {active.viewedVersion === 0
                  ? '캐릭터가 도착했습니다 — 눌러서 확인'
                  : '캐릭터(정보)가 바뀌었습니다 — 눌러서 확인'}
              </Changed>
            )}
            <Card
              role="button"
              tabIndex={0}
              aria-label="누르고 있는 동안 내 캐릭터 보기"
              $color={revealed ? color : 'var(--ct-line)'}
              $alert={changed}
              onPointerDown={e => {
                e.preventDefault();
                show();
              }}
              onPointerUp={hide}
              onPointerCancel={hide}
              onPointerLeave={hide}
              onContextMenu={e => e.preventDefault()}
              onKeyDown={e => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  show();
                }
              }}
              onKeyUp={hide}
              onBlur={hide}
            >
              {revealed ? (
                <>
                  {role ? (
                    <>
                      {role.image ? (
                        <RoleArt urls={[role.image]} alt="" size={150} />
                      ) : null}
                      <RoleName>{role.name}</RoleName>
                      <Row>
                        {role.team && (
                          <TeamName style={{ color }}>{role.teamName ?? CT_TYPE_LABEL[role.team]}</TeamName>
                        )}
                        {active.evil != null && (
                          <Mark $tone={active.evil ? 'evil' : 'good'}>{active.evil ? '악' : '선'}</Mark>
                        )}
                      </Row>
                      {role.ability && <Ability>{role.ability}</Ability>}
                    </>
                  ) : (
                    <Muted>아직 캐릭터가 정해지지 않았습니다.</Muted>
                  )}
                  {active.info && (
                    <Info>
                      <strong>{active.info.title}</strong>
                      {active.info.lines.map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </Info>
                  )}
                </>
              ) : (
                <Covered>
                  <span aria-hidden>🔒</span>
                  <strong>누르고 있는 동안만 보입니다</strong>
                  <small>손을 떼면 다시 가려집니다</small>
                </Covered>
              )}
            </Card>
          </>
        )}
        <Hint>낮에는 화면을 켜 두지 마세요. 확인은 밤에, 다른 사람이 보지 않게</Hint>
        {scriptLink}
      </Body>
    </GrimoireRoot>
  );
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 8px 0 24px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--ct-text);
`;

const Meta = styled.div`
  font-size: 15px;
  color: var(--ct-muted);
`;

const Changed = styled.div`
  padding: 10px 12px;
  border: 1px solid var(--ct-accent);
  border-radius: 10px;
  background: var(--ct-warn-bg);
  color: var(--ct-warn-text);
  font-weight: 700;
  text-align: center;
`;

const Card = styled.div<{ $color: string; $alert: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 52dvh;
  padding: 24px 18px;
  border: 3px solid ${({ $alert, $color }) => ($alert ? 'var(--ct-accent)' : $color)};
  border-radius: 18px;
  background: var(--ct-surface);
  color: var(--ct-text);
  text-align: center;
  cursor: pointer;
  /* 길게 눌러도 문맥 메뉴·텍스트 선택·확대가 뜨지 않게 */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: none;
`;

const Covered = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--ct-muted);

  span {
    font-size: 44px;
  }

  strong {
    font-size: 18px;
    color: var(--ct-text);
  }
`;

const RoleName = styled.div`
  font-size: 32px;
  font-weight: 800;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TeamName = styled.span`
  font-size: 17px;
  font-weight: 700;
`;

const Ability = styled.p`
  margin: 4px 0 0;
  font-size: 17px;
  line-height: 1.6;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  margin-top: 8px;
  padding: 12px;
  border: 1px solid var(--ct-evil);
  border-radius: 12px;
  background: var(--ct-surface-2);
  font-size: 16px;
  text-align: left;

  strong {
    color: var(--ct-evil);
  }
`;

const ScriptLink = styled.div`
  text-align: center;
  font-size: 15px;
`;
