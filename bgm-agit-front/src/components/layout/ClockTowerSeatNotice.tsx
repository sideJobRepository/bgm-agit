import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import api from '../../utils/axiosInstance.ts';
import { userState } from '../../recoil/state/userState.ts';
import type { MyClocktowerSeat } from '../../types/clocktower.ts';
import type { WithTheme } from '../../styles/styled-props.ts';
import { cardStyle } from '../../styles/mixins.ts';

const POLL_MS = 30_000;
// 이 화면들에서는 띄우지 않는다(내 캐릭터 화면 자체, 이야기꾼 마도서)
const HIDDEN_PATHS = ['/clocktower-my', '/clocktower-grimoire'];

/**
 * 시계탑 게임에 배정된 회원에게 사이트 어디서든 [내 캐릭터 확인]을 띄운다.
 * QR 을 찍게 하는 것보다 사이트(홈 화면 앱)를 열기만 하면 보이는 쪽이 손님에게 쉽다(사용자 결정 2026-10-26).
 * 캐릭터는 여기서 보여주지 않는다 — 누구나 볼 수 있는 화면 구석이라 정체가 드러난다. 누르면 /clocktower-my 로 간다.
 * 아직 안 본 캐릭터(새 배정·바뀐 캐릭터)가 있을 때만 띄운다. 확인한 뒤에도 게임 내내 떠 있으니 거슬렸다(사용자 요청 2026-10-26).
 */
export default function ClockTowerSeatNotice() {
  const user = useRecoilValue(userState);
  const { pathname } = useLocation();
  const [mine, setMine] = useState<MyClocktowerSeat | null>(null);
  const hidden = HIDDEN_PATHS.some(p => pathname.startsWith(p));

  useEffect(() => {
    if (!user || hidden) return;
    let cancelled = false;
    const load = () => {
      if (document.visibilityState !== 'visible') return;
      api
        .get<MyClocktowerSeat>('/bgm-agit/clocktower-sessions/mine')
        .then(res => !cancelled && setMine(res.data))
        // 안내일 뿐이라 실패해도 조용히 넘어간다
        .catch(() => {});
    };
    load();
    const t = window.setInterval(load, POLL_MS);
    document.addEventListener('visibilitychange', load);
    return () => {
      cancelled = true;
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', load);
    };
  }, [user, hidden, pathname]);

  if (!user || hidden || !mine || !mine.active) return null;
  const fresh = mine.version > mine.viewedVersion;
  if (!fresh) return null;

  return (
    <Bar to="/clocktower-my" $fresh={fresh} aria-label="시계탑 내 캐릭터 확인">
      <Text>
        <strong>{fresh ? '시계탑 캐릭터가 도착했습니다' : '시계탑 게임 진행 중'}</strong>
        <span>
          {mine.gameName ?? '시계탑'} · {mine.seatNo}번 자리
        </span>
      </Text>
      <Go $fresh={fresh}>내 캐릭터 확인</Go>
    </Bar>
  );
}

const Bar = styled(Link)<WithTheme & { $fresh: boolean }>`
  position: fixed;
  left: 50%;
  bottom: calc(16px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  width: min(calc(100% - 24px), 420px);
  padding: 10px 10px 10px 16px;
  ${cardStyle}
  border: 2px solid ${({ $fresh }) => ($fresh ? '#f2c94c' : '#3a3048')};
  background: #1e1828;
  color: #ede6f5;
  text-decoration: none;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  /* 설치 배너와 같은 층(모달 3 이상보다 아래). 뒤에 그려서 겹치면 이게 위에 온다 */
  z-index: 2;
`;

const Text = styled.span`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  strong {
    font-size: 15px;
    font-weight: 800;
  }
  span {
    font-size: 13px;
    color: #a79fb5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Go = styled.span<{ $fresh: boolean }>`
  flex: none;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${({ $fresh }) => ($fresh ? '#f2c94c' : '#2a2236')};
  color: ${({ $fresh }) => ($fresh ? '#14101c' : '#ede6f5')};
  font-size: 14px;
  font-weight: 800;
`;
