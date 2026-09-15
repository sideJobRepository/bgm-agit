/**
 * 인앱브라우저(앱 안에 박힌 웹뷰) 감지·탈출 유틸.
 *
 * 카드 결제는 카드사 앱으로 전환됐다가 successUrl 로 돌아와야 완료되는데,
 * 인앱 웹뷰는 앱 전환 중 파기·리로드되면서 토스 결제창 세션이 통째로 사라진다.
 * (네이버지도 인앱 → KB Pay 인증 완료 → 돌아오니 미결제. 국민·하나 동일 제보)
 * 그래서 결제 진입 자체를 막고 기본 브라우저로 유도한다.
 */

export type InAppBrowser = {
  isInApp: boolean;
  name: string | null;
  isAndroid: boolean;
  isIOS: boolean;
};

/** UA 패턴 → 사람이 읽는 앱 이름. 위에서부터 먼저 걸리는 것을 쓴다. */
const IN_APP_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /naver/i, name: '네이버 앱' },
  { pattern: /kakaotalk/i, name: '카카오톡' },
  { pattern: /instagram/i, name: '인스타그램' },
  { pattern: /fban|fbav|fb_iab/i, name: '페이스북' },
  { pattern: /line\//i, name: '라인' },
  { pattern: /daumapps/i, name: '다음 앱' },
  { pattern: /everytimeapp/i, name: '에브리타임' },
];

/** 안드로이드 웹뷰 일반 신호: '; wv' (크롬 웹뷰가 붙이는 토큰) */
const ANDROID_WEBVIEW_PATTERN = /;\s*wv\b/i;

function getUserAgent(): string {
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent || '';
}

export function detectInAppBrowser(): InAppBrowser {
  const ua = getUserAgent();
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  if (!ua) {
    return { isInApp: false, name: null, isAndroid, isIOS };
  }

  // whale(네이버 웨일)은 UA 에 naver 가 없지만, 혹시 모를 오탐을 막으려 명시적으로 제외한다.
  // 웨일은 정상 브라우저라 결제가 정상 동작한다.
  if (/whale/i.test(ua)) {
    return { isInApp: false, name: null, isAndroid, isIOS };
  }

  const matched = IN_APP_PATTERNS.find(item => item.pattern.test(ua));
  if (matched) {
    return { isInApp: true, name: matched.name, isAndroid, isIOS };
  }

  if (isAndroid && ANDROID_WEBVIEW_PATTERN.test(ua)) {
    return { isInApp: true, name: '인앱 브라우저', isAndroid, isIOS };
  }

  return { isInApp: false, name: null, isAndroid, isIOS };
}

/**
 * 기본 브라우저로 현재 페이지를 다시 연다.
 * 안드로이드만 강제 이동이 가능하고, iOS 는 스킴 차단이라 호출해도 아무 일도 일어나지 않는다
 * (iOS 는 copyCurrentUrl() 로 주소 복사를 안내할 것).
 */
export function openInExternalBrowser(): void {
  if (typeof window === 'undefined') return;

  const { isAndroid, name } = detectInAppBrowser();
  const { host, pathname, search, href } = window.location;

  if (!isAndroid) return;

  // 카카오톡은 전용 스킴이 있어 intent:// 보다 확실하게 동작한다.
  if (name === '카카오톡') {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(href)}`;
    return;
  }

  window.location.href = `intent://${host}${pathname}${search}#Intent;scheme=https;package=com.android.chrome;end`;
}

/** 현재 주소를 클립보드에 복사한다. 권한 거부·비보안 컨텍스트 등으로 실패하면 false. */
export async function copyCurrentUrl(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const url = window.location.href;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (error) {
    console.error(error);
  }

  // clipboard API 가 막힌 구형 웹뷰 폴백
  try {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch (error) {
    console.error(error);
    return false;
  }
}
