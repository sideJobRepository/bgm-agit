"use client";

import Link from "next/link";
import styled from "styled-components";
import {withBasePath} from "@/lib/path";
import {
    Bell,
    BookOpen,
    CalendarBlank,
    Crown,
    ChartLineUp,
    SlidersHorizontal,
    PencilSimple,
    SignIn,
    List,
    X
} from "phosphor-react";
import { useEffect, useState } from 'react';
import { motion } from "framer-motion";

export default function Sidebar() {

    //모바일 토글
    const [isOpen, setIsOpen] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 1280px)");
        const handleResize = () => setIsTablet(mediaQuery.matches);

        handleResize(); // 초기 체크
        mediaQuery.addEventListener("change", handleResize);

        return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);


    return (
      <>
          <MobileTop>
                  <Link href="/">
                      <img
                        src={withBasePath("/headerLogo.png")}
                        alt="로고" />
                  </Link>
              <ToggleButton onClick={() => setIsOpen(v => !v)}>
                  {isOpen ? (
                    <X  weight="bold" />
                  ) : (
                    <List weight="bold" />
                  )}
              </ToggleButton>
          </MobileTop>
          <SidebarWrapper initial={false}
                          animate={
                              mounted
                                ? isTablet
                                  ? isOpen
                                    ? { y: 0 }
                                    : { y: "-100%" }
                                  : { y: 0 } // 데스크탑이면 항상 보여야 하니까
                                : { y: "-100%" } // 최초 마운트 시에도 y:0 적용
                          }
                                 transition={{
                                   duration: 0.26,
                                   ease: "easeInOut",
                                 }}>
              <TopSeticon>
                  <Link href="/">
                      <img
                        src={withBasePath("/headerLogo.png")}
                        alt="로고"
                      />
                  </Link>
              </TopSeticon>
              <MiddleSeciton>
                  <ul>
                      <MenuLi>
                          <Link href="/">
                              <Bell weight="fill" />
                              공지사항
                          </Link>
                          <Link href="/convert">
                              <BookOpen weight="fill" />
                              마작/대회 룰
                          </Link>
                      </MenuLi>
                      <Divider/>
                      <MenuLi>
                          <Link href="/notice">
                              <CalendarBlank weight="fill" />
                              월간/일간기록
                          </Link>
                          <Link href="/convert">
                              <Crown weight="fill" />
                              역만기록
                          </Link>
                          <Link href="/notice">
                              <ChartLineUp weight="fill" />
                              연간기록
                          </Link>
                          <Link href="/notice">
                              <SlidersHorizontal weight="fill" />
                              사용자지정 기록
                          </Link>
                          <Link href="/notice">
                              <ChartLineUp weight="fill" />
                              대회 기록
                          </Link>
                      </MenuLi>
                  </ul>
              </MiddleSeciton>
              <BottomSeciton>
                  <ul>
                      <MenuLi>
                          <Link href="/convert">
                              <PencilSimple weight="fill" />
                              기록 입력
                          </Link>
                          <Link href="/notice">
                              <SignIn weight="fill" />
                              로그인
                          </Link>
                      </MenuLi>
                  </ul>
              </BottomSeciton>
          </SidebarWrapper>
      </>

    );
}

const MobileTop = styled.div`
  display: none;
  @media ${({ theme }) => theme.device.tablet} {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;  
      background: ${({ theme }) => theme.colors.whiteColor};
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    width: 100%;
      z-index: 2;
      
      img {
          width: 80px;
      }
  }
`;

const ToggleButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

    color: ${({ theme }) => theme.colors.blackColor};

  svg {
    display: block;
      width: 20px;
      height: 20px;
  }
`;

const SidebarWrapper = styled(motion.aside)`
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    border: 20px solid rgb(244 244 245);
    background: ${({ theme }) => theme.colors.whiteColor};

    @media ${({ theme }) => theme.device.tablet} {
        position: fixed;
        left: 0;
        right: 0;
        top: 64px;
        height: calc(100dvh - 64px);
        padding-top: 20px;
        z-index: 1;
    }

    ul {
        display: flex;
        flex-direction: column;
        padding: 0 24px;
        gap: 12px;
    }
`;

const TopSeticon = styled.div<{ $open: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-bottom: 10px solid rgb(244 244 245);
    padding: 16px 12px;
    
    img {
        width: 140px;
    }

    @media ${({ theme }) => theme.device.tablet} {
        display: none;
    }
`

const MiddleSeciton = styled.div`
    flex: 1;
    justify-content: center;
    display: flex;
    flex-direction: column;
`

const MenuLi = styled.li<{ $active: boolean }>`
  display: flex;
    flex-direction: column;
    gap: 20px;
  padding: 12px 16px;
  background-color: ${({ $active }) => ($active ? '#ffffff26' : 'transparent')};
  color: ${({ $active, theme }) => ($active ? '#ffffff' : theme.colors.menuColor)};
  border-radius: 99px;

  a {
    display: flex;
    position: relative;
    align-items: center;
    gap: 8px;
    width: 100%;
      color: ${({ theme }) => theme.colors.blackColor};
      font-weight: 500;
      font-size: ${({ theme }) => theme.desktop.sizes.menuSize};

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const BottomSeciton = styled.div`
    padding: 24px 0;
    border-top: 10px solid rgb(244 244 245);
    justify-content: center;
    display: flex;
    flex-direction: column;
`

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: rgb(244 244 245);
`;