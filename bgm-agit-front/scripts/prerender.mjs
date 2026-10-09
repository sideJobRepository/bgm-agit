// 운영 빌드 뒤 사이트맵 페이지마다 html 을 따로 만든다(dist/about/index.html 등).
// 예전엔 어느 주소든 같은 index.html(canonical 이 메인)이 나가서 구글이 하위 페이지를 전부 메인의 복사본으로 봤고,
// 본문도 JS 가 그려서 네이버 수집기에는 빈 페이지였다.
// 페이지마다 제목·설명·canonical 을 바꾸고 #root 안에 게임 목록 같은 본문을 미리 넣는다.
// React 는 createRoot 로 처음 그릴 때 #root 안을 비우고 새로 그리므로 화면 동작은 그대로다.
// nginx 가 try_files $uri $uri/index.html 로 이 파일을 찾아 준다.
// API 를 못 받으면 그 목록만 빼고 만든다(배포가 멈추지 않게).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const SITE = 'https://bgmagit.co.kr';
const API = process.env.VITE_API_URL || SITE;
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = JSON.parse(await readFile(new URL('../src/seo/pages.json', import.meta.url), 'utf8'));

const esc = s =>
  String(s ?? '').replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

async function get(path) {
  try {
    const res = await fetch(`${API}/bgm-agit${path}`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`[prerender] ${path} 를 못 받아 그 목록은 뺌: ${e.message}`);
    return null;
  }
}

const list = items => (items.length ? `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '');

// main-image 는 labelGb 별로 모든 게임·메뉴를 한 번에 준다
const images = Object.values((await get('/main-image')) ?? {}).flat();
const byLink = link => images.filter(i => i.link === link);
// 방·마작 대탁은 이미지가 아니라 BGM_AGIT_ROOM 에 있다 (숨김 방은 공개 조회에서 빠진다)
const roomsOf = async link => (await get(`/rooms?link=${encodeURIComponent(link)}`)) ?? [];
const roomList = rooms =>
  list(rooms.map(r => `${esc(r.name)}${r.guide ? ` (${esc(r.guide)})` : ''}`));
const rooms = await roomsOf('/detail/room');
const mahjongRooms = await roomsOf('/detail/mahjongRental');
const notices = (await get('/notice?page=0'))?.content ?? [];

const CATEGORY = { PARTY: '파티 게임', STRATEGY: '전략 게임', MURDER: '머더미스터리' };

const body = {
  '/detail/game': () => {
    const games = byLink('/detail/game');
    return Object.entries(CATEGORY)
      .map(([cat, name]) => {
        const names = games.filter(g => g.category === cat).map(g => esc(g.label));
        return names.length ? `<h2>${name}</h2>${list(names)}` : '';
      })
      .join('');
  },
  '/detail/room': () => roomList(rooms),
  '/detail/mahjongRental': () => roomList(mahjongRooms),
  '/detail/drink': () => list(byLink('/detail/drink').map(m => esc(m.label))),
  '/detail/food': () => list(byLink('/detail/food').map(m => esc(m.label))),
  '/notice': () => list(notices.map(n => esc(n.bgmAgitNoticeTitle))),
};

// 모든 페이지 아래에 붙는 가게 정보와 페이지 링크. 수집기가 링크를 따라 다른 페이지도 찾게 한다
const footer = `<h2>찾아오시는 길</h2>
<p>대전 서구 문정로 62 프라임빌딩 3층 (탄방역 4번 출구에서 3분) · 24시간 영업, 연중무휴 · 0507-1445-3503</p>
<nav>${list(Object.entries(pages).map(([path, p]) => `<a href="${path}">${esc(p.h1)}</a>`))}</nav>`;

function render(template, path, page) {
  const url = `${SITE}${path === '/' ? '/' : path}`;
  const content = `<main><h1>${esc(page.h1)}</h1><p>${esc(page.description)}</p>${body[path]?.() ?? ''}${footer}</main>`;
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
    .replace(/(<meta\s+name="title"\s+content=")[^"]*/, `$1${esc(page.title)}`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*/, `$1${esc(page.description)}`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*/, `$1${url}`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*/, `$1${url}`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*/, `$1${esc(page.title)}`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*/, `$1${esc(page.description)}`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*/, `$1${esc(page.title)}`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*/, `$1${esc(page.description)}`)
    .replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

const template = await readFile(`${dist}index.html`, 'utf8');
if (!template.includes('<div id="root"></div>')) {
  console.warn('[prerender] index.html 에서 #root 자리를 못 찾아 건너뜀');
} else {
  for (const [path, page] of Object.entries(pages)) {
    const dir = path === '/' ? dist : `${dist}${path.slice(1)}/`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}index.html`, render(template, path, page));
  }
  console.log(`[prerender] ${Object.keys(pages).length}개 페이지 html 생성`);
}
