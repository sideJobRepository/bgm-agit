import TopHeader from './TopHeader.tsx';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer.tsx';
import Nav from './Nav.tsx';
import InstallBanner from './InstallBanner.tsx';
import ClockTowerSeatNotice from './ClockTowerSeatNotice.tsx';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState } from '../../recoil';
import Loading from '../Loading.tsx';
import { useEffect, Suspense } from 'react';
import { userState } from '../../recoil/state/userState.ts';
import { getRefreshedUser, restoreAuthSession } from '../../utils/axiosInstance';
import type { CustomUser } from '../../types/user.ts';
import { layoutModeState } from '../../recoil/state/layoutState.ts';
import { Wrapper, Inner, TopArea, NavArea, MainArea, FooterBox } from './Layout.styles.ts';

export default function Layout() {
  const location = useLocation();
  const home = location.pathname === '/';

  const isLoading = useRecoilValue(loadingState);
  // 시계탑 진행판 몰입 모드: 머리·메뉴·푸터·설치 배너를 그리지 않는다(인증 복구는 그대로 여기서 돈다)
  // 진행판 주소에서만 적용한다 — 정리(cleanup)가 빠져 상태가 남아도 다른 화면 머리가 사라지지 않게
  const immersive =
    useRecoilValue(layoutModeState) === 'immersive' && location.pathname.startsWith('/clocktower-grimoire');

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
      {!immersive && <InstallBanner />}
      {/* 시계탑 게임에 배정된 회원에게 어느 화면에서든 [내 캐릭터 확인] */}
      {!immersive && <ClockTowerSeatNotice />}
    </Wrapper>
  );
}
