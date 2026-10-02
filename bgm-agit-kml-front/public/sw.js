// 홈 화면 설치용 서비스워커. 아무것도 캐시하지 않는다.
// 기록·랭킹은 전부 서버 데이터라 캐시본을 보여주면 방금 입력한 기록이 안 보이는 화면이 된다.
// 화면 요청은 항상 네트워크로 보내고, 끊겼을 때만 안내 화면을 그린다.
// /_next/static 은 Next 가 immutable 로 내보내 브라우저 캐시가 이미 맡고 있다.
//
// 범위는 '/record' 다. 파일 위치(/record/sw.js) 기준 기본 범위는 '/record/' 라서 앱 첫 화면인
// '/record'(끝 슬래시 없음)가 빠진다. 그래서 next.config 에서 Service-Worker-Allowed 헤더로 넓혔다.

const OFFLINE_HTML = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>BGM 아지트 BML</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
font-family:sans-serif;background:#fff;color:#222;text-align:center;padding:16px}
button{margin-top:16px;padding:10px 20px;border:0;border-radius:8px;background:#5B2BC4;color:#fff;font-size:16px}</style>
</head><body><div><p>인터넷에 연결되어 있지 않습니다.</p><p>연결을 확인한 뒤 다시 시도해 주세요.</p>
<button onclick="location.reload()">다시 시도</button></div></body></html>`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode !== 'navigate') return;
  const path = new URL(req.url).pathname;
  // '/record' 범위는 문자열 접두어라 '/recordxxx' 도 걸린다. 우리 앱 주소만 맡는다
  if (path !== '/record' && !path.startsWith('/record/')) return;

  event.respondWith(
    (async () => {
      try {
        const preloaded = await event.preloadResponse;
        return preloaded || (await fetch(req));
      } catch {
        return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })(),
  );
});
