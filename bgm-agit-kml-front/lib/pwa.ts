// 홈 화면 설치(PWA). 모바일에서만 켠다 — manifest 링크를 layout 에 박아 두면 데스크톱 크롬
// 주소창에도 설치 버튼이 떠서, 모바일일 때만 붙인다.
// 하단 설치 배너(InstallBanner)는 2026-10-26 없앴다(사용자 결정). 설치는 브라우저 메뉴·브라우저 기본 안내로 한다.
// 서버 렌더 때도 import 되므로 navigator 는 함수 안에서만 읽는다.

export function isIos() {
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    // iPadOS 는 UA 가 맥이라 터치 지점 수로 가린다
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function isMobile() {
  return isIos() || /Android/i.test(navigator.userAgent);
}

// 카톡·네이버 등 인앱 브라우저에서는 홈 화면 추가 메뉴가 없어 안내해도 따라 할 수 없다
export function isInAppBrowser() {
  return /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent);
}

export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

// 여러 번 불려도 한 번만 붙인다
let started = false;

export function setupPwa() {
  // dev 에서는 켜지 않는다 — HMR 요청까지 서비스워커를 거치면 헷갈린다
  if (started || process.env.NODE_ENV !== 'production' || !isMobile()) return;
  started = true;

  // basePath(/record)가 앞에 붙는지 확신할 수 없어 경로를 못 박아 둔다
  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/record/manifest.webmanifest';
    document.head.appendChild(link);
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/record/sw.js', { scope: '/record' }).catch(() => {});
  }
}
