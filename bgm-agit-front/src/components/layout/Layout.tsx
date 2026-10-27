import TopHeader from './TopHeader.tsx';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer.tsx';
import Nav from './Nav.tsx';
import ClockTowerSeatNotice from './ClockTowerSeatNotice.tsx';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState } from '../../recoil';
import Loading from '../Loading.tsx';
import { useEffect, Suspense } from 'react';
import { userState } from '../../recoil/state/userState.ts';
import { getRefreshedUser, restoreAuthSession } from '../../utils/axiosInstance';
import type { CustomUser } from '../../types/user.ts';
import { Wrapper, Inner, TopArea, NavArea, MainArea, FooterBox } from './Layout.styles.ts';

export default function Layout() {
  const location = useLocation();
  const home = location.pathname === '/';

  const isLoading = useRecoilValue(loadingState);
  // 시계탑 마도서는 게임 진행 도구라 사이트 머리·메뉴·푸터를 그리지 않는다(나가기는 마도서 툴바의 [← 나가기]).
  // 화면 상태가 아니라 주소로 정한다 — 첫 프레임부터 머리가 없고 떠날 때 되돌릴 것도 없다. 인증 복구는 그대로 여기서 돈다
  const immersive = location.pathname.startsWith('/clocktower-grimoire');

  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
      }
    };
    const expiredHandler = () => {
      setUser(null);
    };
    window.addEventListener('auth:refreshed', handler as EventListener);
    window.addEventListener('auth:expired', expiredHandler);
    return () => {
      window.removeEventListener('auth:refreshed', handler as EventListener);
      window.removeEventListener('auth:expired', expiredHandler);
    };
  }, [setUser]);

  useEffect(() => {
    // 이미 다른 요청이 재발급을 끝냈으면 이벤트를 놓쳤을 수 있으니 결과를 직접 반영한다
    void restoreAuthSession().then(() => {
      const user = getRefreshedUser();
      if (user) setUser(prev => prev ?? (user as CustomUser));
    });
  }, [setUser]);

  return (
    <Wrapper>
      <Inner>
        {!immersive && (
          <>
            <TopArea>
              <TopHeader />
            </TopArea>
            <NavArea $home={home}>
              <Nav />
            </NavArea>
          </>
        )}
        <MainArea $immersive={immersive}>
          {isLoading && <Loading />}
          {/* 화면 조각을 받는 동안 머리·메뉴·푸터는 그대로 둔다 */}
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </MainArea>
        {!immersive && (
          <FooterBox>
            <Footer />
          </FooterBox>
        )}
      </Inner>
      {/* 시계탑 게임에 배정된 회원에게 어느 화면에서든 [내 캐릭터 확인] */}
      {!immersive && <ClockTowerSeatNotice />}
    </Wrapper>
  );
}
