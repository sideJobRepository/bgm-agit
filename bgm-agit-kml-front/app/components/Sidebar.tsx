'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';
import {
  Bell,
  BookOpen,
  CalendarBlank,
  Crown,
  ChartLineUp,
  SlidersHorizontal,
  PencilSimple,
  SignIn,
  SignOut,
  List,
  X,
  Gear,
  GraduationCap,
  Compass,
  Student,
  Handshake,
  ChatsCircle,
  CaretUp,
  CaretDown,
} from 'phosphor-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { useFetchMainMenu } from '@/services/menu.service';
import { useKmlMenuStore } from '@/store/menu';
import { useUserStore } from '@/store/user';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/axiosInstance';
import { tokenStore } from '@/services/tokenStore';
import { alertDialog, confirmDialog } from '@/utils/alert';

export default function Sidebar() {
  //navigation
  const pathname = usePathname();
  const router = useRouter();

  useFetchMainMenu();
  const menuData = useKmlMenuStore((state) => state.menu);
  console.log('menu', menuData);

  //subMenu
  const [openSubMenuId, setOpenSubMenuId] = useState<string | null>(null);

  const user = useUserStore((state) => state.user);

  //모바일 토글
  const [isOpen, setIsOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  //아이콘
  const iconMap = {
    Bell,
    BookOpen,
    CalendarBlank,
    Crown,
    ChartLineUp,
    SlidersHorizontal,
    PencilSimple,
    SignIn,
    List,
    X,
    Gear,
    GraduationCap,
    Compass,
    Student,
    Handshake,
    ChatsCircle,
  };

  const resetUser = useUserStore((state) => state.clearUser);

  const logout = async () => {
    const result = await confirmDialog('로그아웃 하시겠습니까?', 'warning');

    if (result.isConfirmed) {
      const channel = new BroadcastChannel('auth');
      channel.postMessage('logout');
      channel.close();

      try {
        await api.delete('/bgm-agit/refresh', { withCredentials: true });
      } catch (err) {
        console.error('서버 리프레시 토큰 삭제 실패:', err);
      }

      await alertDialog('로그아웃 되었습니다.', 'success');

      tokenStore.clear();
      resetUser();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1280px)');
    const handleResize = () => setIsTablet(mediaQuery.matches);

    handleResize(); // 초기 체크
    mediaQuery.addEventListener('change', handleResize);

    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  useEffect(() => {
    // 모바일시 메뉴 이동시 메뉴 닫히게
    if (isOpen) setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/login') {
      if (user) {
        router.replace('/');
      }
    }
  }, [pathname, user]);

  return (
    <>
      <MobileTop>
        <Link href="/">
          <img src={withBasePath('/logo.png')} alt="로고" />
        </Link>
        <ToggleButton onClick={() => setIsOpen((v) => !v)}>
          {isOpen ? <X weight="bold" /> : <List weight="bold" />}
        </ToggleButton>
      </MobileTop>
      <SidebarWrapper
        initial={false}
        animate={
          mounted
            ? isTablet
              ? isOpen
                ? { y: 0 }
                : { y: '-100%' }
              : { y: 0 } // 데스크탑이면 항상 보여야 하니까
            : { y: '-100%' } // 최초 마운트 시에도 y:0 적용
        }
        transition={{
          duration: 0.26,
          ease: 'easeInOut',
        }}
      >
        <TopSeticon>
          <Link href="/">
            <img src={withBasePath('/logo.png')} alt="로고" />
          </Link>
        </TopSeticon>
        <MiddleSeciton>
          <MainUl>
            {menuData
              ?.filter((menu) => menu.menuOrders < 3)
              ?.map((menu) => {
                const IconComponent = iconMap[menu.icon as keyof typeof iconMap];

                return (
                  <MenuLi key={menu.id} $active={pathname === menu.menuLink}>
                    <Link href={menu?.menuLink}>
                      {IconComponent && <IconComponent weight="fill" />}
                      {menu.menuName}
                    </Link>
                  </MenuLi>
                );
              })}
            <Divider />
            {menuData
              ?.filter((menu) => menu.menuOrders > 2)
              ?.map((menu) => {
                const IconComponent = iconMap[menu.icon as keyof typeof iconMap];

                return (
                  <MenuLi key={menu.id} $active={pathname === menu.menuLink}>
                    {/*<Link href={menu.menuLink}>*/}
                    {/*  {IconComponent && <IconComponent weight="fill" />}*/}
                    {/*  {menu.menuName}*/}
                    {/*</Link>*/}

                    {menu.menuLink !== '/sub' ? (
                      <Link href={menu?.menuLink}>
                        {IconComponent && <IconComponent weight="fill" />}
                        {menu.menuName}
                      </Link>
                    ) : (
                      <>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenSubMenuId(openSubMenuId === menu.id ? null : menu.id);
                          }}
                        >
                          {IconComponent && <IconComponent weight="fill" />}
                          {menu.menuName}
                          {openSubMenuId === menu.id ? (
                            <CaretUp weight="bold" />
                          ) : (
                            <CaretDown weight="bold" />
                          )}
                        </a>
                        <AnimatePresence initial={false}>
                          {openSubMenuId === menu.id && (
                            <SubUl
                              key="submenu"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                            >
                              {menu.subMenus?.map((sub: any) => {
                                const SubIcon = iconMap[sub.icon as keyof typeof iconMap];
                                return (
                                  <MenuLi key={sub.id} $active={pathname === sub.menuLink}>
                                    <Link href={sub.menuLink}>
                                      {SubIcon && <SubIcon weight="fill" />}
                                      {sub.menuName}
                                    </Link>
                                  </MenuLi>
                                );
                              })}
                            </SubUl>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </MenuLi>
                );
              })}
          </MainUl>
        </MiddleSeciton>
        <BottomSeciton>
          <MainUl>
            <MenuLi $active={false}>
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  if (!user) {
                    const result = await confirmDialog(
                      '로그인 후 이용 가능합니다.\n 로그인 페이지로 이동하시겠습니까?',
                      'warning'
                    );
                    if (result.isConfirmed) {
                      router.push('/login');
                    }
                  } else {
                    router.push('/write');
                  }
                }}
              >
                <PencilSimple weight="fill" />
                기록 입력
              </a>
            </MenuLi>
            <MenuLi $active={pathname === '/login'}>
              {user ? (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  <SignOut weight="fill" />
                  로그아웃
                </a>
              ) : (
                <Link href="/login">
                  <SignIn weight="fill" />
                  로그인
                </Link>
              )}
            </MenuLi>
          </MainUl>
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
    border-bottom: 10px solid rgb(244 244 245);

    a {
      display: flex;

      img {
        width: 124px;
      }
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
  overflow-y: auto;

  @media ${({ theme }) => theme.device.tablet} {
    position: fixed;
    left: 0;
    right: 0;
    top: 64px;
    height: calc(100dvh - 64px);
    padding-top: 20px;
    z-index: 1;
  }
`;

const MainUl = styled.ul`
  display: flex;
  flex-direction: column;
  padding: 0 24px;
  gap: 12px;
`;

const SubUl = styled(motion.ul)`
  display: flex;
  flex-direction: column;
  // padding: 0 24px;
  gap: 12px;
  overflow: hidden;

  a {
    font-size: ${({ theme }) => theme.desktop.sizes.md};

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const TopSeticon = styled.div`
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
`;

const MiddleSeciton = styled.div`
  flex: 1;
  justify-content: center;
  display: flex;
  flex-direction: column;
  padding: 16px 0;
`;

const MenuLi = styled.li<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 16px;
  background-color: ${({ $active }) => ($active ? '#000000' : 'transparent')};
  color: ${({ $active, theme }) => ($active ? '#ffffff' : theme.colors.blackColor)};
  border-radius: 99px;

  a {
    display: flex;
    position: relative;
    align-items: center;
    gap: 8px;
    width: 100%;
    font-weight: 500;
    font-size: ${({ theme }) => theme.desktop.sizes.xl};

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
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: rgb(244 244 245);
`;
