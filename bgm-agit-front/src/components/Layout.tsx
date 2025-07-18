import TopHeader from './TopHeader.jsx';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import type { WithTheme } from '../styles/styled-props.ts';

export default function Layout() {
  return (
    <Wrapper>
      <Inner>
        <TopArea>
          <TopHeader />
        </TopArea>
        <MainArea>
          <Outlet />
          <Footer>
            <FooterBox></FooterBox>
          </Footer>
        </MainArea>
      </Inner>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100vh;
  overflow-y: hidden;

  button {
    &:hover {
      opacity: 0.8;
    }
  }
`;
const Inner = styled.div`
  height: 100%;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  overflow-x: hidden;
`;
const TopArea = styled.div<WithTheme>`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.topBg};
  z-index: 1000;
  }
`;

const MainArea = styled.main`
  position: relative;
  height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: auto;
`;

const Footer = styled.footer<WithTheme>`
  display: flex;
  font-size: ${({ theme }) => theme.sizes.medium};
  line-height: 1.5;
  justify-content: center;
  min-width: 1023px;
  @media ${({ theme }) => theme.device.mobile} {
    min-width: 100%;
  }
`;

const FooterBox = styled.div<WithTheme>`
  display: flex;
  max-width: 1500px;
  gap: 32px;
  padding: 20px;
  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    gap: 20px;
    max-width: 100%;
  }
`;
