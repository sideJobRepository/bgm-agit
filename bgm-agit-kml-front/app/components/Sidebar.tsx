// app/components/Sidebar.tsx
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
    SignIn
} from "phosphor-react";

export default function Sidebar() {
    return (
        <SidebarWrapper>
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
    );
}

const SidebarWrapper = styled.aside`
    display: flex;
    flex-direction: column;
    width: 260px;
    height: 100dvh;
    border: 20px solid rgb(244 244 245);
    background: ${({ theme }) => theme.colors.whiteColor};
   
    ul {
        display: flex;
        flex-direction: column;
        padding: 0 24px;
        gap: 12px;
    }

`
const TopSeticon = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-bottom: 10px solid rgb(244 244 245);
    padding: 16px 12px;
    
    img {
        width: 140px;
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