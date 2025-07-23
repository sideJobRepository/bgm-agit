import TopHeader from './TopHeader.jsx';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import type { WithTheme } from '../styles/styled-props.ts';
import Footer from './Footer.tsx';

export default function Layout() {
  return (
    <Wrapper>
      <Inner>
        <TopArea>
          <TopHeader />
        </TopArea>
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

const MainArea = styled.main<WithTheme>`
  flex: 1;
  padding: 20px;
  display: flex;
  margin-top: 100px;
  height: 100%;
  overflow-y: auto;
  overflow-x: auto;
`;

const FooterBox = styled.footer<WithTheme>`
  display: flex;
  background-color: ${({ theme }) => theme.colors.bottomBg};
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.5;
  justify-content: center;
`;
