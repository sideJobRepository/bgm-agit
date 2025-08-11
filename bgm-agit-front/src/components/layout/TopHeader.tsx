import styled from 'styled-components';
import logo from '/headerLogo.png';
import kakao from '/kakao.png';
import { useEffect, useRef, useState } from 'react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaPhone } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { mainMenuState } from '../../recoil';
import { useFetchMainMenu } from '../../recoil/fetch.ts';
import { userState } from '../../recoil/state/userState.ts';
//import { toast } from 'react-toastify';
import type { SubMenu } from '../../types/menu.ts';
import api from '../../utils/axiosInstance';
import { tokenStore } from '../../utils/tokenStore';

export default function TopHeader() {
  useFetchMainMenu();

  const user = useRecoilValue(userState);
  const resetUser = useSetRecoilState(userState);

  const menus = useRecoilValue(mainMenuState);

  const navigate = useNavigate();

  const location = useLocation();

  const [isSubOpen, setIsSubOpen] = useState(false);

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
    if ([9, 13, 17].includes(item.bgmAgitMainMenuId)) {
      window.open(item.link, '_blank');
    } else {
      navigate(item.link);
    }
  }

  //가게 전화
  function callClick() {
    window.location.href = 'tel:050714453503';
  }

  //카카오 로그인
  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const KAKAO_REDIRECT_URL = import.meta.env.VITE_KAKAO_REDIRECT_URL;
  const KAKAO_LOGOUT_URL = import.meta.env.VITE_KAKAO_LOGOUT_URL;

  const loginWithKakao = async () => {
    if (user) {
      const channel = new BroadcastChannel('auth');
      channel.postMessage('logout');
      channel.close();

      try {
        // 서버가 지원하는 엔드포인트 사용 (둘 중 하나)
        // await api.post('/bgm-agit/logout', null, { withCredentials: true });
        await api.delete('/bgm-agit/refresh', { withCredentials: true }); // ← Refresh 쿠키 제거
      } catch (err) {
        console.error('서버 리프레시 토큰 삭제 실패:', err);
      }

      tokenStore.clear(); // ← 메모리 Access Token 제거
      resetUser(null);
      setIsOpen(false);

      // 카카오 로그아웃까지 필요하면 리다이렉트
      window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${KAKAO_CLIENT_ID}&logout_redirect_uri=${KAKAO_LOGOUT_URL}`;

      // 리다이렉트하면 토스트 안 보이니 보통 생략
      // toast.success('로그아웃 되었습니다.');
    } else {
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URL}&response_type=code`;
      window.location.href = kakaoAuthUrl;
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
          <li
            onClick={() => {
              callClick();
            }}
          >
            <FaPhone />
            <a>문의하기</a>
          </li>
          <li onClick={loginWithKakao}>
            <img src={kakao} alt="카카오" />
            {user ? '로그아웃' : '로그인'}
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
            <FaPhone />
            <a>문의하기</a>
          </SubMainLi>
          <SubMainLi onClick={loginWithKakao}>
            <img src={kakao} alt="카카오" />
            {user ? '로그아웃' : '로그인'}
          </SubMainLi>
        </ul>
      </MobileMenu>
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
  height: 100px;
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1500px;
  min-width: 1023px;

  ul {
    display: flex;
    height: 100%;
    cursor: pointer;
    transition: border 0.6s;
    align-items: center;
  }

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    padding: 0 16px;
  }
`;

const Left = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: flex-start;

  img {
    margin-top: 16px;
    height: 100px;
    width: auto;
    object-fit: cover;
    cursor: pointer;

    @media ${({ theme }) => theme.device.tablet} {
      margin-left: -16px;
    }
  }
`;

const Center = styled.nav<WithTheme>`
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  margin-left: auto;

  ul {
    color: ${({ theme }) => theme.colors.menuColor};
    font-size: ${({ theme }) => theme.sizes.menu};
    font-weight: ${({ theme }) => theme.weight.bold};

    li {
      width: 170px;
      text-align: center;
    }
  }

  @media ${({ theme }) => theme.device.tablet} {
    display: none;
  }
`;

const Right = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: right;
  margin-left: auto;

  ul {
    color: ${({ theme }) => theme.colors.subMenuColor};
    font-size: ${({ theme }) => theme.sizes.large};
    font-weight: ${({ theme }) => theme.weight.semiBold};

    li {
      display: flex;
      align-items: center;
      width: 120px;
      justify-content: right;

      svg {
        margin-right: 8px;
        transform: rotate(-240deg);
      }

      img {
        height: 26px;
        margin-right: 8px;
      }
    }
  }

  @media ${({ theme }) => theme.device.tablet} {
    display: none;
  }
`;

const BgSubWrapper = styled.div<WithTheme & { $height: number }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  background-color: ${({ theme }) => theme.colors.subBgColor};

  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

  &.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const SubMenuWrapper = styled.nav<WithTheme>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  z-index: 3;

  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

  &.show {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  ul {
    display: flex;
    margin-top: 40px;
    flex-direction: column;
    list-style: none;
    gap: 0;
    font-size: ${({ theme }) => theme.sizes.large};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;

const SubLi = styled.li<WithTheme & { $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: 200px;
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.activeMenuColor : 'transparent'};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : 'subMenuColor')};
  &:hover {
    background-color: ${({ $active, theme }) => !$active && theme.colors.subTextBoxColor};
  }
`;

const Hamburger = styled(GiHamburgerMenu)<WithTheme>`
  display: none;
  cursor: pointer;

  @media ${({ theme }) => theme.device.tablet} {
    display: block;
  }
`;

const MobileMenu = styled.div<WithTheme & { $open: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 50%;
  max-width: 300px;
  height: calc(100vh - 100px);
  background-color: ${({ theme }) => theme.colors.subBgColor};

  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;

  ul {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 20px;
    gap: 6px;
    color: ${({ theme }) => theme.colors.subMenuColor};
    font-size: ${({ theme }) => theme.sizes.large};
    font-weight: ${({ theme }) => theme.weight.bold};
    padding: 0 20px;

    li {
      width: 100%;
      height: 50px;
      align-items: center;
      display: flex;
      justify-content: left;
      padding: 0 20px;

      img {
        height: 26px;
        margin-right: 8px;
      }

      svg {
        margin-left: auto;
      }
    }
  }

  @media ${({ theme }) => theme.device.desktop} {
    display: none;
  }
`;

const MobileSubLi = styled.li<WithTheme & { $active: boolean }>`
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.activeMenuColor : theme.colors.subTextBoxColor};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : 'subMenuColor')};
`;

const AnimatedSubLiWrapper = styled.div<WithTheme & { $visible: boolean }>`
  width: 100%;
  overflow: hidden;
  max-height: ${({ $visible }) => ($visible ? '60px' : '0')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '-10px')});
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease,
    transform 0.3s ease;
`;

const SubMainLi = styled.li<WithTheme>`
  justify-content: center !important;
  svg {
    margin-left: 0 !important;
    margin-right: 8px;
    transform: rotate(-240deg);
  }
`;
