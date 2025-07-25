import TopHeader from './TopHeader.tsx';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import type { WithTheme } from '../../styles/styled-props.ts';
import Footer from './Footer.tsx';
import Nav from './Nav.tsx';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/state/userState.ts';

export default function Layout() {
  const location = useLocation();
  const home = location.pathname === '/';

  //로그인 상태

  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!user) {
      setUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel('auth');

    channel.onmessage = event => {
      if (event.data === 'logout') {
        sessionStorage.clear();
        setUser(null);
      }

      if (event.data.type === 'login') {
        sessionStorage.setItem('user', JSON.stringify(event.data.user));
        setUser(event.data.user);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

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
  z-index: 1000;
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
  z-index: 1000;
`;
