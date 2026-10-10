import logo from '/headerLogo.png';
import { useEffect, useRef, useState } from 'react';
import { FiLogIn, FiLogOut } from 'react-icons/fi';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { mainMenuState } from '../../recoil';
import { useFetchMainMenu } from '../../recoil/fetch.ts';
import { userState } from '../../recoil/state/userState.ts';
import type { SubMenu } from '../../types/menu.ts';
import api from '../../utils/axiosInstance';
import { tokenStore } from '../../utils/tokenStore';
import LoginMoadl from '../LoginMoadl.tsx';
import MyPageModal from '../MyPageModal.tsx';
import { Wrapper, Left, Center, Right, PhoneIcon, BgSubWrapper, SubMenuWrapper, SubLi, Hamburger, MobileMenu, MobileSubLi, AnimatedSubLiWrapper, SubMainLi } from './TopHeader.styles.ts';

export default function TopHeader() {
  useFetchMainMenu();

  const user = useRecoilValue(userState);
  const resetUser = useSetRecoilState(userState);

  const menus = useRecoilValue(mainMenuState);

  console.log('menus', menus);

  const navigate = useNavigate();

  const location = useLocation();

  const [isSubOpen, setIsSubOpen] = useState(false);

  //로그인 모달
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  //내정보 모달
  const [isMyPageModalOpen, setIsMyPageModalOpen] = useState(false);

  //서브메뉴 높이 측정
  const subMenuRef = useRef<HTMLDivElement>(null);
  const [subMenuHeight, setSubMenuHeight] = useState(0);

  //모바일 메뉴
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  //모바일 서브 메뉴
  const [isMobileSubOpen, setIsMobileSubOpen] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(prev => !prev);

  //메뉴 이동 이벤트
  function subMoveEnvent(item: SubMenu) {
    //오픈 채팅방 링크로 이동
    if ([9, 17, 19, 27].includes(item.bgmAgitMainMenuId)) {
      window.open(item.link, '_blank');
    } else if ([20].includes(item.bgmAgitMainMenuId)) {
      //내정보 팝업
      setIsMyPageModalOpen(true);
    } else {
      navigate(item.link);
    }
  }

  //가게 전화
  function callClick() {
    window.location.href = 'tel:050714453503';
  }

  //카카오 로그인
  // const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  // const KAKAO_REDIRECT_URL = import.meta.env.VITE_KAKAO_REDIRECT_URL;
  // const KAKAO_LOGOUT_URL = import.meta.env.VITE_KAKAO_LOGOUT_URL;

  const loginEvent = async () => {
    if (user) {
      const channel = new BroadcastChannel('auth');
      channel.postMessage('logout');
      channel.close();

      try {
        // 서버가 지원하는 엔드포인트 사용 (둘 중 하나)
        // await api.post('/bgm-agit/logout', null, { withCredentials: true });
        await api.delete('/bgm-agit/refresh?source=main', { withCredentials: true }); // ← Refresh 쿠키 제거
      } catch (err) {
        console.error('서버 리프레시 토큰 삭제 실패:', err);
      }

      tokenStore.clear(); // 메모리 Access Token 제거
      resetUser(null);
      setIsOpen(false);

      window.location.href = `/`;
    } else {
      setIsLoginModalOpen(true);
    }
  };

  //메뉴바 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isSubOpen && subMenuRef.current) {
      setSubMenuHeight(subMenuRef.current.offsetHeight + 40);
    }
  }, [isSubOpen]);

  return (
    <Wrapper onMouseLeave={() => setIsSubOpen(false)}>
      <BgSubWrapper $height={subMenuHeight} className={isSubOpen ? 'show' : ''} />
      <Left onClick={() => {}}>
        <img
          src={logo}
          alt="로고"
          onClick={() => {
            navigate('/');
            setIsSubOpen(false);
          }}
        />
      </Left>
      <Center onMouseEnter={() => setIsSubOpen(true)}>
        <ul>
          {menus?.map((menu, i) => {
            if (menu.bgmAgitMainMenuId === 14 && !user) return null; // user가 없는데 id가 14면 안 보이게
            return (
              <li key={i}>
                <a>{menu.name}</a>
              </li>
            );
          })}
        </ul>
        <SubMenuWrapper ref={subMenuRef} className={isSubOpen ? 'show' : ''}>
          {menus.map((menu, i) => (
            <ul key={i}>
              {menu.subMenu.map((sub, j) => (
                <SubLi
                  key={j}
                  $active={location.pathname === sub.link}
                  onClick={() => {
                    setIsSubOpen(false);
                    setTimeout(() => {
                      subMoveEnvent(sub);
                    }, 300);
                  }}
                >
                  <a>{sub.name}</a>
                </SubLi>
              ))}
            </ul>
          ))}
        </SubMenuWrapper>
      </Center>
      <Right>
        <ul>
          {/*<li*/}
          {/*  onClick={() => {*/}
          {/*    callClick();*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <PhoneIcon />*/}
          {/*  <a>0507-1445-3503</a>*/}
          {/*</li>*/}
          <li onClick={() => loginEvent()}>
            {user ? (
              <>
                <FiLogIn /> 로그아웃
              </>
            ) : (
              <>
                <FiLogOut /> 로그인
              </>
            )}
          </li>
        </ul>
      </Right>
      <div ref={hamburgerRef}>
        <Hamburger size={24} onClick={toggleMenu} />
      </div>
      <MobileMenu ref={menuRef} $open={isOpen} className={isSubOpen ? 'show' : ''}>
        <ul>
          {menus.map((menu, i) => (
            <React.Fragment key={i}>
              <li
                onClick={() => {
                  if (isMobileSubOpen === menu.name) {
                    setIsMobileSubOpen(null);
                  } else {
                    setIsMobileSubOpen(menu.name);
                  }
                }}
              >
                <a>{menu.name}</a>
                {isMobileSubOpen === menu.name ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </li>
              {menu.subMenu.map((sub, j) => (
                <AnimatedSubLiWrapper key={j} $visible={isMobileSubOpen === menu.name}>
                  <MobileSubLi
                    $active={location.pathname === sub.link}
                    onClick={() => {
                      toggleMenu();
                      setTimeout(() => {
                        subMoveEnvent(sub);
                      }, 300);
                    }}
                  >
                    <a>{sub.name}</a>
                  </MobileSubLi>
                </AnimatedSubLiWrapper>
              ))}
            </React.Fragment>
          ))}
          <SubMainLi
            onClick={() => {
              callClick();
            }}
          >
            <PhoneIcon />
            <a>문의하기</a>
          </SubMainLi>
          <SubMainLi onClick={() => loginEvent()}>
            {user ? (
              <>
                <FiLogOut /> 로그아웃
              </>
            ) : (
              <>
                <FiLogIn /> 로그인
              </>
            )}
          </SubMainLi>
        </ul>
      </MobileMenu>
      {isLoginModalOpen && <LoginMoadl onClose={() => setIsLoginModalOpen(false)} />}
      {isMyPageModalOpen && <MyPageModal onClose={() => setIsMyPageModalOpen(false)} />}
    </Wrapper>
  );
}
