// 화면 안에서 페이지를 옮길 때 탭 제목·설명·canonical 을 그 페이지 것으로 바꾼다.
// 첫 진입 html 은 빌드 때 scripts/prerender.mjs 가 같은 pages.json 으로 만든다.
// 이게 없으면 /about 으로 들어와 /detail/game 으로 옮겨도 제목과 canonical 이 /about 것으로 남는다
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import pages from '../../seo/pages.json';

type Page = { title: string; description: string };
const PAGES: Record<string, Page> = pages;

function setAttr(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value);
}

export default function PageMeta() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    // 목록에 없는 상세 화면(/noticeDetail?id= 등)은 메인 제목을 쓰고 canonical 만 자기 주소로
    const page = PAGES[path] ?? PAGES['/'];
    const url = `${window.location.origin}${path}${PAGES[path] ? '' : search}`;

    document.title = page.title;
    setAttr('meta[name="description"]', 'content', page.description);
    setAttr('link[rel="canonical"]', 'href', url);
    setAttr('meta[property="og:url"]', 'content', url);
    setAttr('meta[property="og:title"]', 'content', page.title);
    setAttr('meta[property="og:description"]', 'content', page.description);
  }, [pathname, search]);

  return null;
}
