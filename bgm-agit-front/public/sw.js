// 홈 화면 설치용 서비스워커. 아무것도 캐시하지 않는다.
// - API(/bgm-agit/)는 예약 가용 현황·결제 상태라 옛 값이 보이면 안 된다
// - 화면 주소도 캐시본(index.html)으로 돌려주지 않는다. 그러면 prerender 가 만든 페이지별 html 과
//   nginx 의 404 판정을 건너뛴다. 항상 네트워크로 보내고, 끊겼을 때만 안내 화면을 그린다
// - /assets/ 는 nginx 가 1년 immutable 로 내보내 브라우저 캐시가 이미 맡고 있다
// /record, /murder 는 별도 앱이라 손대지 않는다(/record 는 자기 서비스워커가 따로 있다)

const SKIP_PREFIXES = ['/record', '/murder', '/bgm-agit'];

const OFFLINE_HTML = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>BGM 아지트</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
font-family:sans-serif;background:#fff;color:#222;text-align:center;padding:16px}
button{margin-top:16px;padding:10px 20px;border:0;border-radius:8px;background:#4B186A;color:#fff;font-size:16px}</style>
</head><body><div><p>인터넷에 연결되어 있지 않습니다.</p><p>연결을 확인한 뒤 다시 시도해 주세요.</p>
<button onclick="location.reload()">다시 시도</button></div></body></html>`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 서비스워커를 거치는 동안 화면 요청이 늦어지지 않게 미리 출발시킨다
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode !== 'navigate') return;
  const path = new URL(req.url).pathname;
  if (SKIP_PREFIXES.some((p) => path === p || path.startsWith(p + '/'))) return;

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
