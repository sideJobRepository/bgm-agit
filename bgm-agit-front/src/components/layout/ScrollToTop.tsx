// src/components/ScrollToTop.tsx
// 새 화면으로 가면 맨 위로, 뒤로·앞으로 가기면 그 화면을 떠날 때의 스크롤 위치로 돌려준다.
// 예전엔 뒤로가기도 맨 위로 올려서, 목록에서 상세에 갔다 오면 보던 자리를 다시 찾아 내려가야 했다
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// 화면 기록(location.key)별 마지막 스크롤 위치. 새로고침하면 비지만 그땐 브라우저가 알아서 한다
const positions = new Map<string, number>();

// 목록은 데이터를 받아 그린 뒤에야 그만큼 길어진다. 그 사이 몇 번 다시 시도한다
const RESTORE_TRY_MS = 1500;

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPathname = useRef<string | null>(null);

  // 지금 화면에서 스크롤할 때마다 위치를 적어 둔다
  useEffect(() => {
    const key = location.key;
    const onScroll = () => positions.set(key, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.key]);

  useLayoutEffect(() => {
    const samePage = prevPathname.current === location.pathname;
    prevPathname.current = location.pathname;
    const saved = positions.get(location.key);
    if (navigationType !== 'POP' || saved == null) {
      // 같은 화면에서 쿼리만 바뀐 건(필터·검색) 예전처럼 그대로 둔다
      if (!samePage) window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    const started = Date.now();
    let frame = 0;
    const restore = () => {
      const reachable = document.documentElement.scrollHeight - window.innerHeight >= saved;
      window.scrollTo({ top: saved, left: 0 });
      if (!reachable && Date.now() - started < RESTORE_TRY_MS) frame = requestAnimationFrame(restore);
    };
    restore();
    return () => cancelAnimationFrame(frame);
    // 같은 화면 안에서 쿼리만 바뀌어도(?page=) key 가 바뀐다
  }, [location.key]);

  return null;
}
