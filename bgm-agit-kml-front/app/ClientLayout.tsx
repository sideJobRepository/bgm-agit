"use client";

import React from "react";
import styled from "styled-components";
import ClientProviders from "./providers";
import Sidebar from "./components/Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {


  console.log('ClientLayout styled ===', styled);
  return (
    <ClientProviders>
      <Wrapper>
        <Inner>
        <LeftArea>
          <Sidebar />
        </LeftArea>
        <MainArea>{children}</MainArea>
        </Inner>
      </Wrapper>
    </ClientProviders>
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
  height: 100%;
  flex: 1;
`;


const LeftArea = styled.header`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 280px;
    background-color: ${({ theme }) => theme.colors.whiteColor};
    z-index: 3;

    @media ${({ theme }) => theme.device.tablet} {
        width: 100%;
        height: 64px;
    }
`;

const MainArea = styled.main`
    display: flex;
    z-index: 0;
    flex: 1;
    height: 100%;
    margin-left: 280px; //leftArea의 넓이 값
    overflow-y: auto;
    overflow-x: auto;

    @media ${({ theme }) => theme.device.tablet} {
        margin-left: 0;
        margin-top: 64px;
    }
`;
