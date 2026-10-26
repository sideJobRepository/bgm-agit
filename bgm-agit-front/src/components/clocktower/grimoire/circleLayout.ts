import { useEffect, useState } from 'react';

/**
 * 원형 마도서 배치 계산. 진행 화면(ClockTowerGrimoire)과 읽기 전용 화면(GrimoireViewer)이 같이 쓴다 —
 * 따로 계산하면 저장해 둔 리마인더 위치가 두 화면에서 다르게 보인다.
 */

/**
 * 좌석 토큰 크기. 원 지름과 인원에 맞춘다 — 고정 76px 이면 태블릿처럼 원이 클 때 토큰이 작아 보였다.
 * 지름의 15% 를 넘지 않고, 이웃 좌석 간격(원둘레 / 인원)의 62% 안이라 서로 겹치지 않는다.
 */
export function seatTokenSize(circleWidth: number, total: number) {
  if (!circleWidth) return 76;
  const spacing = (2 * Math.PI * 0.41 * circleWidth) / Math.max(total, 1);
  return Math.round(Math.max(52, Math.min(circleWidth * 0.15, spacing * 0.62, 140)));
}

/** 리마인더는 좌석 토큰보다 조금 작게(포켓 그리모어 비율) */
export function reminderTokenSize(tokenSize: number) {
  return Math.max(36, Math.round(tokenSize * 0.64));
}

/** 원형 기본 자리(원 안 %, 위에서 시계 방향) */
export function seatPoint(i: number, total: number) {
  const angle = (2 * Math.PI * i) / total;
  const radius = 41;
  return { x: 50 + radius * Math.sin(angle), y: 50 - radius * Math.cos(angle) };
}

/**
 * 리마인더 자동 자리(토큰 중심 기준, 토큰 지름 단위). 토큰 가장자리에 걸쳐 원 중심 쪽 좌우 대각선으로 번갈아 붙인다.
 * 중심 정면은 위쪽 자리의 캐릭터·플레이어 이름을 가려서 비워 둔다. k = 몇 번째 리마인더
 */
export function reminderAutoOffset(seatIndex: number, total: number, k: number, tokenSize: number, reminderSize: number) {
  const at = seatPoint(seatIndex, total);
  const toCenter = Math.atan2(50 - at.y, 50 - at.x);
  const dist = 0.5 + (reminderSize / tokenSize) * 0.42;
  const side = k % 2 === 0 ? 1 : -1;
  const ang = toCenter + side * (0.85 + Math.floor(k / 2) * 0.8);
  return { dx: dist * Math.cos(ang), dy: dist * Math.sin(ang) };
}

/** 위·아래 자리의 토큰·이름이 원 밖으로 나와 위아래 요소와 겹치지 않게 둘 여백 */
export function circleMargins(tokenSize: number, circleWidth: number) {
  return {
    marginTop: Math.max(0, Math.round(tokenSize / 2 + 8 - circleWidth * 0.09)),
    marginBottom: Math.max(0, Math.round(tokenSize / 2 + 64 - circleWidth * 0.09)),
  };
}

/** 요소 폭을 따라간다(화면 회전·몰입 모드 전환 때 원 크기가 바뀐다) */
export function useElementWidth(el: HTMLElement | null) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return width;
}
