// 메뉴 관리에서 미사용으로 꺼 둔 메뉴는 메뉴에서만 빠지고 주소를 치면 그대로 들어가졌다.
// 서버가 내려주는 닫힌 주소(/main-menu/closed-links)에 해당하면 관리자 포함 모두 메인으로 보낸다.
// 권한으로 숨긴 메뉴(관리자 전용 등)도 같았다. 내 권한으로 못 보는 주소(/main-menu/denied-links)도 같은 방식으로 막는다.
// 메뉴를 다시 켜거나 권한을 바꾸면 목록이 바뀌므로 여기는 고칠 필요가 없다
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import api from '../../utils/axiosInstance';
import { tokenStore } from '../../utils/tokenStore';
import pages from '../../seo/pages.json';

// 메뉴에 없는 상세·내 기록 화면은 속한 메뉴를 따라 막는다
const PARENT_LINK: Record<string, string> = {
  '/murderGameDetail': '/murder-games',
  '/murderCoverBoard': '/murder-games',
  '/playRecordDetail': '/play-records',
  '/play-history': '/play-records',
  '/clockTowerGameDetail': '/clocktower-games',
  '/clocktower-roles': '/clocktower-games',
  '/clocktower-grimoire': '/clocktower-games',
  '/clockTowerRecordDetail': '/clocktower-records',
  '/clocktower-history': '/clocktower-records',
  '/freeDetail': '/free',
  '/noticeDetail': '/notice',
  '/inquiryDetail': '/inquiry',
  '/serviceRequestDetail': '/service-request',
};

interface Blocked {
  closed: string[];
  denied: string[];
  // 이 목록을 받을 때 로그인 상태였는지. 로그인·로그아웃으로 바뀌면 권한 목록이 달라지므로 다시 받는다.
  // 토큰 문자열은 재발급 때마다 바뀌어서 그걸로 비교하면 쓸데없이 다시 받는다
  loggedIn: boolean;
}

function menuLinkOf(pathname: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  if (path.startsWith('/review/')) return '/review';
  return PARENT_LINK[path] ?? path;
}

// useRequest 를 쓰지 않는다. 실패하면 /error 로 보내는데, 목록을 못 받았다고 화면을 막을 일은 아니다
const fetchLinks = (url: string) =>
  api
    .get<string[]>(url)
    .then(res => res.data ?? [])
    .catch(() => [] as string[]);

// 토큰은 요청 인터셉터가 재발급까지 마친 뒤 붙이므로, 응답이 온 시점의 토큰을 기록한다
const loadBlocked = (): Promise<Blocked> =>
  Promise.all([
    fetchLinks('/bgm-agit/main-menu/closed-links'),
    fetchLinks('/bgm-agit/main-menu/denied-links'),
  ]).then(([closed, denied]) => ({ closed, denied, loggedIn: !!tokenStore.get() }));

export default function ClosedMenuGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [lists, setLists] = useState<Blocked | null>(null);

  // 화면 이동마다 다시 그려지므로 그때 로그인 상태가 바뀌었는지 본다(로그인 모달·로그아웃은 새로고침이 없다).
  // 새 목록이 올 때까지는 옛 목록으로 판단한다. 비워 두면 보고 있던 화면이 내려갔다 다시 그려져 입력값이 날아간다
  const loggedIn = !!tokenStore.get();
  const stale = lists !== null && lists.loggedIn !== loggedIn;

  useEffect(() => {
    if (lists !== null && !stale) return;
    let cancelled = false;
    loadBlocked().then(latest => {
      if (!cancelled) setLists(latest);
    });
    return () => {
      cancelled = true;
    };
  }, [stale]);

  const link = menuLinkOf(pathname);
  const closed = !!lists?.closed.includes(link);
  const denied = !closed && !!lists?.denied.includes(link);

  // 목록은 앱이 뜰 때 한 번 받는다. 메뉴 관리에서 켜거나 권한을 바꾼 뒤 새로고침 없이 들어오면 옛 목록에 걸리므로
  // 막기 직전에 한 번 더 받아 보고, 그래도 막혀 있을 때만 돌려보낸다
  useEffect(() => {
    if (!closed && !denied) return;
    let cancelled = false;
    loadBlocked().then(latest => {
      if (cancelled) return;
      setLists(latest);
      if (latest.closed.includes(link)) {
        toast.info('준비 중인 메뉴입니다.');
      } else if (latest.denied.includes(link)) {
        toast.info(latest.loggedIn ? '접근 권한이 없는 메뉴입니다.' : '로그인이 필요한 메뉴입니다.');
      } else {
        return;
      }
      navigate('/', { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [closed, denied, link]);

  // 목록이 오기 전에는 공개 페이지만 먼저 그린다. 막힌 화면이 잠깐 보였다 사라지지 않게
  if (closed || denied) return null;
  if (lists === null && !(pathname in pages)) return null;
  return <>{children}</>;
}
