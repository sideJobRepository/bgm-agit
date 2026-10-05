// 메뉴 관리에서 미사용으로 꺼 둔 메뉴는 메뉴에서만 빠지고 주소를 치면 그대로 들어가졌다.
// 서버가 내려주는 닫힌 주소(/main-menu/closed-links)에 해당하면 관리자 포함 모두 메인으로 보낸다.
// 메뉴를 다시 켜면 목록에서 빠지므로 여기는 고칠 필요가 없다
import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import api from '../../utils/axiosInstance';
import pages from '../../seo/pages.json';

// 메뉴에 없는 상세·내 기록 화면은 속한 메뉴를 따라 막는다
const PARENT_LINK: Record<string, string> = {
  '/murderGameDetail': '/murder-games',
  '/playRecordDetail': '/play-records',
  '/play-history': '/play-records',
  '/clockTowerGameDetail': '/clocktower-games',
  '/clockTowerRecordDetail': '/clocktower-records',
  '/clocktower-history': '/clocktower-records',
  '/freeDetail': '/free',
  '/noticeDetail': '/notice',
  '/inquiryDetail': '/inquiry',
  '/serviceRequestDetail': '/service-request',
};

function menuLinkOf(pathname: string) {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  if (path.startsWith('/review/')) return '/review';
  return PARENT_LINK[path] ?? path;
}

export default function ClosedMenuGuard({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [closed, setClosed] = useState<string[] | null>(null);

  useEffect(() => {
    // useRequest 를 쓰지 않는다. 실패하면 /error 로 보내는데, 목록을 못 받았다고 화면을 막을 일은 아니다
    api
      .get<string[]>('/bgm-agit/main-menu/closed-links')
      .then(res => setClosed(res.data ?? []))
      .catch(() => setClosed([]));
  }, []);

  const blocked = !!closed?.includes(menuLinkOf(pathname));

  useEffect(() => {
    if (!blocked) return;
    toast.info('준비 중인 메뉴입니다.');
    navigate('/', { replace: true });
  }, [blocked]);

  // 목록이 오기 전에는 공개 페이지만 먼저 그린다. 닫힌 화면이 잠깐 보였다 사라지지 않게
  if (blocked) return null;
  if (closed === null && !(pathname in pages)) return null;
  return <>{children}</>;
}
