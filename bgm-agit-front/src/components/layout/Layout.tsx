import TopHeader from './TopHeader.tsx';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import type { WithTheme } from '../../styles/styled-props.ts';
import Footer from './Footer.tsx';
import Nav from './Nav.tsx';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState } from '../../recoil';
import Loading from '../Loading.tsx';
import { useEffect } from 'react';
import { userState } from '../../recoil/state/userState.ts';

export default function Layout() {
  const location = useLocation();
  const home = location.pathname === '/';

  const isLoading = useRecoilValue(loadingState);

  const setUser = useSetRecoilState(userState);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
      }
    };
    window.addEventListener('auth:refreshed', handler as EventListener);
    return () => window.removeEventListener('auth:refreshed', handler as EventListener);
  }, [setUser]);

  return (
    <Wrapper>
      <Inner>
        <TopArea>
          <TopHeader />
        </TopArea>
        <NavArea $home={home}>
          <Nav />
        </NavArea>
        <MainArea>
          {isLoading && <Loading />}
          <Outlet />
        </MainArea>
        <FooterBox>
          <Footer />
        </FooterBox>
      </Inner>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TopArea = styled.header<WithTheme>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.topBg};
  z-index: 3;
`;

const NavArea = styled.nav<WithTheme & { $home: boolean }>`
  display: flex;
  height: ${({ $home }) => ($home ? '0' : '30px')};
  background-color: ${({ theme }) => theme.colors.softColor};
  margin-top: 100px;
`;

const MainArea = styled.main<WithTheme>`
  flex: 1;
  padding: 20px;
  display: flex;
  height: 100%;
  overflow-y: auto;
  overflow-x: auto;
  @media ${({ theme }) => theme.device.tablet} {
    padding: 20px 10px;
  }
`;

const FooterBox = styled.footer<WithTheme>`
  display: flex;
  background-color: ${({ theme }) => theme.colors.bottomBg};
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.5;
  justify-content: center;
  z-index: 2;
`;
