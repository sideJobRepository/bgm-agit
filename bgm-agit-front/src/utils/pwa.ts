// 홈 화면 설치(PWA). 모바일에서만 켠다 — manifest 링크를 index.html 에 박아 두면 데스크톱 크롬
// 주소창에도 설치 버튼이 떠서, 모바일일 때만 붙인다.
// 하단 설치 배너(InstallBanner)는 2026-10-26 없앴다(사용자 결정). 설치는 브라우저 메뉴·브라우저 기본 안내로 한다.

const ua = navigator.userAgent;

export const isIos =
  /iPhone|iPad|iPod/i.test(ua) ||
  // iPadOS 는 UA 가 맥이라 터치 지점 수로 가린다
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const isMobile = isIos || /Android/i.test(ua);

// 카톡·네이버 등 인앱 브라우저에서는 홈 화면 추가 메뉴가 없어 안내해도 따라 할 수 없다
export const isInAppBrowser = /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(ua);

export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function setupPwa() {
  // dev 서버에서는 켜지 않는다 — HMR 요청까지 서비스워커를 거치면 헷갈린다
  if (!import.meta.env.PROD || !isMobile) return;

  const link = document.createElement('link');
  link.rel = 'manifest';
  link.href = '/manifest.webmanifest';
  document.head.appendChild(link);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}
