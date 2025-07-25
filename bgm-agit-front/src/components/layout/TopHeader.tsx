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
import { useRecoilValue } from 'recoil';
import { mainMenuState } from '../../recoil';
import { useFetchMainMenu } from '../../recoil/fetch.ts';

export default function TopHeader() {
  useFetchMainMenu();

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
          {menus.map((menu, i) => (
            <li key={i}>
              <a>{menu.name}</a>
            </li>
          ))}
        </ul>
        <SubMenuWrapper ref={subMenuRef} className={isSubOpen ? 'show' : ''}>
          {menus.map((menu, i) => (
            <ul key={i}>
              {menu.subMenu.map((sub, j) => (
                <SubLi
                  key={j}
                  $active={location.pathname === sub.link}
                  onClick={() => {
                    navigate(sub.link);
                    // setIsSubOpen(false);
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
          <li>
            <FaPhone />
            <a>1599-1444</a>
          </li>
          <li>
            <img src={kakao} alt="카카오" />
            로그인
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
                      navigate(sub.link);
                      // toggleMenu();
                    }}
                  >
                    <a>{sub.name}</a>
                  </MobileSubLi>
                </AnimatedSubLiWrapper>
              ))}
            </React.Fragment>
          ))}
          <SubMainLi onClick={() => (window.location.href = 'tel:15991444')}>
            <FaPhone />
            <a>1599-1444</a>
          </SubMainLi>
          <SubMainLi>
            <img src={kakao} alt="카카오" />
            로그인
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

  ul {
    color: ${({ theme }) => theme.colors.menuColor};
    font-size: ${({ theme }) => theme.sizes.menu};
    font-weight: ${({ theme }) => theme.weight.bold};

    li {
      width: 200px;
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
  z-index: 1000;

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
    gap: 10px;
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
  font-size: ${({ theme }) => theme.sizes.small};

  svg {
    margin-left: 0 !important;
    margin-right: 8px;
    transform: rotate(-240deg);
  }
`;
