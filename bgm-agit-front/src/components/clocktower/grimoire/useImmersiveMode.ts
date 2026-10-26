import { useCallback, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { layoutModeState } from '../../../recoil/state/layoutState.ts';
import { toast } from '../../../utils/toast';

// 마지막 선택(몰입 켬/끔)만 기억한다. 진행 상태와 무관한 화면 취향이라 마도서 키와 따로 둔다
const PREF_KEY = 'clocktowerGrimoireImmersive';
// 마도서 바탕색. 마도서에 있는 동안 html 배경·브라우저 상단 색(theme-color)을 맞춘다
const DARK_BG = '#14101C';

type FullscreenDoc = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FullscreenEl = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };

function readPref() {
  try {
    return localStorage.getItem(PREF_KEY) === 'Y';
  } catch {
    return false;
  }
}

function writePref(on: boolean) {
  try {
    localStorage.setItem(PREF_KEY, on ? 'Y' : 'N');
  } catch {
    // 사파리 개인정보 보호 모드 등 — 기억만 못 할 뿐 동작은 그대로
  }
}

function fullscreenElement() {
  const d = document as FullscreenDoc;
  return d.fullscreenElement ?? d.webkitFullscreenElement ?? null;
}

// iPhone 은 요소 전체 화면이 없다(iPadOS 는 있다). 버튼을 숨기고 홈 화면 추가 안내로 대신한다
const IS_IPHONE = typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);

function fullscreenSupported() {
  if (IS_IPHONE) return false;
  const d = document as FullscreenDoc;
  return !!(d.fullscreenEnabled || d.webkitFullscreenEnabled);
}

/** 클릭 핸들러 안에서 바로 불러야 한다(사용자 동작이 아니면 브라우저가 거절). 마도서 div 가 아니라 html 에 건다 — 모달이 그 밖에 있어도 보이게 */
function requestFullscreen() {
  const el = document.documentElement as FullscreenEl;
  try {
    const r = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.();
    Promise.resolve(r).catch(() => toast.error('전체 화면을 열지 못했습니다. 브라우저 메뉴의 전체 화면을 써 주세요.'));
  } catch {
    toast.error('전체 화면을 열지 못했습니다. 브라우저 메뉴의 전체 화면을 써 주세요.');
  }
}

function exitFullscreen() {
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
 * 마도서 몰입 모드(사이트 머리·메뉴·푸터 숨김) + 전체 화면.
 * - enabled 는 진행 중인 판을 보여 줄 때만 true(시작 화면·차단 화면은 사이트 틀 그대로)
 * - 마도서를 떠나면(언마운트) 반드시 normal 로 되돌리고 전체 화면도 끝낸다
 * - 마도서에 있는 동안 html 배경·theme-color 를 어둡게, 떠나면 원래 값으로
 */
export function useImmersiveMode(enabled: boolean) {
  const setLayoutMode = useSetRecoilState(layoutModeState);
  const [wanted, setWanted] = useState(readPref);
  const [fullscreen, setFullscreen] = useState(() => !!fullscreenElement());
  const [canFullscreen] = useState(fullscreenSupported);
  const immersive = enabled && wanted;

  useEffect(() => {
    setLayoutMode(immersive ? 'immersive' : 'normal');
  }, [immersive, setLayoutMode]);

  useEffect(
    () => () => {
      setLayoutMode('normal');
      exitFullscreen();
    },
    [setLayoutMode]
  );

  useEffect(() => {
    const sync = () => setFullscreen(!!fullscreenElement());
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

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

  const enter = useCallback(() => {
    setWanted(true);
    writePref(true);
    if (canFullscreen) requestFullscreen();
    else if (IS_IPHONE)
      toast.info('아이폰은 전체 화면을 지원하지 않습니다. 공유 → 홈 화면에 추가로 열면 주소창 없이 쓸 수 있습니다.');
  }, [canFullscreen]);

  const exit = useCallback(() => {
    setWanted(false);
    writePref(false);
    exitFullscreen();
  }, []);

  return { immersive, fullscreen, canFullscreen, enter, exit, requestFullscreen };
}
