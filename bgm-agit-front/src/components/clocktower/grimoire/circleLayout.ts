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
  // 원 중심 쪽 좌우 대각선부터 번갈아 바깥으로 돈다. 토큰 바로 아래(플레이어 이름 자리)로 가는 방향은 건너뛴다 —
  // 왼쪽·오른쪽 자리에서 중심 쪽 아래 대각선이 이름을 가렸다
  const free: number[] = [];
  for (let j = 0; free.length <= k && j < 16; j++) {
    const ang = toCenter + (j % 2 === 0 ? 1 : -1) * (0.85 + Math.floor(j / 2) * 0.8);
    if (Math.sin(ang) <= 0.45) free.push(ang);
  }
  // 자리가 모자라면(리마인더가 아주 많을 때) 한 바퀴 바깥에 겹쳐 둔다
  const ang = free[k] ?? toCenter + (k % 2 === 0 ? 1 : -1) * (0.85 + Math.floor(k / 2) * 0.8);
  const d = free[k] != null ? dist : dist + 0.55;
  return { dx: d * Math.cos(ang), dy: d * Math.sin(ang) };
}

/** 위·아래 자리의 토큰·이름이 원 밖으로 나와 위아래 요소와 겹치지 않게 둘 여백 */
export function circleMargins(tokenSize: number, circleWidth: number) {
  return {
    marginTop: Math.max(0, Math.round(tokenSize / 2 + 8 - circleWidth * 0.09)),
    marginBottom: Math.max(0, Math.round(tokenSize / 2 + 64 - circleWidth * 0.09)),
  };
}

/** 요소 크기를 따라간다(화면 회전·몰입 모드 전환 때 원 크기가 바뀐다) */
export function useElementSize(el: HTMLElement | null) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setSize({ width: Math.round(entry.contentRect.width), height: Math.round(entry.contentRect.height) })
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);
  return size;
}

/**
 * 화면을 꽉 채우는 배치(전체화면·마도서 보기). 원은 폭만큼만 커져 세로 화면에서 아래가 비었다 —
 * 남는 높이까지 쓰는 타원으로 둔다(좌석 자리는 % 라 상자가 길쭉하면 저절로 타원이 된다).
 * 토큰 크기는 짧은 쪽 길이로 정해 겹치지 않게 한다.
 */
export const FILL_STYLE = {
  width: '100%',
  maxWidth: 'none',
  height: 'calc(100dvh - 150px)',
  minHeight: 360,
  aspectRatio: 'auto',
  margin: '16px auto 0',
} as const;
