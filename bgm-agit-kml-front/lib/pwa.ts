// 홈 화면 설치(PWA). 모바일에서만 켠다 — manifest 링크를 layout 에 박아 두면 데스크톱 크롬
// 주소창에도 설치 버튼이 떠서, 모바일일 때만 붙인다.
// 브라우저 주소창 옆 설치 아이콘은 손님이 못 찾아서 하단 배너(InstallBanner)로 따로 띄운다.
// 서버 렌더 때도 import 되므로 navigator 는 함수 안에서만 읽는다.

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

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

let deferredPrompt: InstallPromptEvent | null = null;
let started = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

export function subscribeInstallPrompt(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function canPromptInstall() {
  return deferredPrompt !== null;
}

// 설치 창은 한 번만 띄울 수 있어 쓰고 나면 버린다
export async function promptInstall() {
  const e = deferredPrompt;
  if (!e) return false;
  deferredPrompt = null;
  notify();
  await e.prompt();
  const { outcome } = await e.userChoice;
  return outcome === 'accepted';
}

export function setupPwa() {
  // dev 에서는 켜지 않는다 — HMR 요청까지 서비스워커를 거치면 헷갈린다
  if (started || process.env.NODE_ENV !== 'production' || !isMobile()) return;
  started = true;

  // manifest 를 붙이기 전에 걸어야 이벤트를 놓치지 않는다
  window.addEventListener('beforeinstallprompt', (e) => {
    // 브라우저 기본 안내 대신 우리 배너의 버튼으로 띄운다
    e.preventDefault();
    deferredPrompt = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });

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
