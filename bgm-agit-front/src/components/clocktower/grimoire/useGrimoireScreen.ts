import { useCallback, useEffect, useRef } from 'react';
import { toast } from '../../../utils/toast';

// 마도서 바탕색. 마도서에 있는 동안 html 배경·브라우저 상단 색(theme-color)을 맞춘다
const DARK_BG = '#14101C';

type FullscreenDoc = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

export function fullscreenElement() {
  const d = document as FullscreenDoc;
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

// iPhone 은 요소 전체 화면이 없다(iPadOS 는 있다). 버튼을 숨기고 홈 화면 추가 안내로 대신한다
const IS_IPHONE = typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);

export function fullscreenSupported() {
  if (IS_IPHONE) return false;
  const d = document as FullscreenDoc;
  return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}

/** 클릭 핸들러 안에서 바로 불러야 한다(사용자 동작이 아니면 브라우저가 거절). 마도서 div 가 아니라 html 에 건다 — 모달이 그 밖에 있어도 보이게 */
// quiet = 열면서 자동으로 시도할 때(사용자 동작이 끊겨 거절될 수 있다) — 실패해도 안내하지 않는다
export function requestFullscreen(quiet = false) {
  const el = document.documentElement as FullscreenEl;
  const fail = () => {
    if (!quiet) toast.error('전체 화면을 열지 못했습니다. 브라우저 메뉴의 전체 화면을 써 주세요.');
  };
  try {
    const r = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.();
    Promise.resolve(r).catch(fail);
  } catch {
    fail();
  }
}

export function exitFullscreen() {
  if (!fullscreenElement()) return;
  const d = document as FullscreenDoc;
  try {
    const r = d.exitFullscreen ? d.exitFullscreen() : d.webkitExitFullscreen?.();
    Promise.resolve(r).catch(() => {});
  } catch {
    // 이미 빠져나온 경우 등 — 무시
  }
}

/**
 * 마도서 화면 틀. 사이트 머리·메뉴·푸터는 Layout 이 주소(/clocktower-grimoire)를 보고 늘 숨긴다 — 여기는 그 밖의 것만.
 * - 마도서에 있는 동안 html 배경·theme-color 를 어둡게, 떠나면 원래 값으로
 * - 브라우저 전체 화면은 [전체화면] 버튼으로만 켠다(사용자 동작이 있어야 허락된다). 이 화면이 켰으면 끌 때·떠날 때 같이 끈다
 */
export function useGrimoireScreen() {
  // 들어올 때 이미 전체 화면이었으면(브라우저 메뉴로 켬) 우리가 끄지 않는다
  const ownsFullscreen = useRef(false);

  useEffect(
    () => () => {
      if (ownsFullscreen.current) exitFullscreen();
    },
    []
  );

  useEffect(() => {
    const html = document.documentElement;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevBg = html.style.backgroundColor;
    const prevTheme = meta?.getAttribute('content') ?? null;
    html.style.backgroundColor = DARK_BG;
    meta?.setAttribute('content', DARK_BG);
    return () => {
      html.style.backgroundColor = prevBg;
      if (meta && prevTheme != null) meta.setAttribute('content', prevTheme);
    };
  }, []);

  const enterFullscreen = useCallback(() => {
    if (fullscreenElement()) return;
    if (fullscreenSupported()) {
      ownsFullscreen.current = true;
      requestFullscreen();
    } else if (IS_IPHONE) {
      toast.info('아이폰은 전체 화면을 지원하지 않습니다. 공유 → 홈 화면에 추가로 열면 주소창 없이 쓸 수 있습니다.');
    }
  }, []);

  const leaveFullscreen = useCallback(() => {
    if (ownsFullscreen.current) exitFullscreen();
    ownsFullscreen.current = false;
  }, []);

  return { enterFullscreen, leaveFullscreen };
}
