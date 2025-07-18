import styled from 'styled-components';
import logo from '/headerLogo.png';
import { useEffect, useRef, useState } from 'react';
import type { WithTheme } from '../styles/styled-props.ts';
import { FaPhone } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import React from 'react';

export default function TopHeader() {
  type SubMenu = { name: string };
  type MenuItem = { name: string; subMenu: SubMenu[] };

  //메인 메뉴, 서브 메뉴 추후에 서버에서 받아올 예정
  const menu: MenuItem[] = [
    { name: '소개', subMenu: [{ name: 'BGM아지트 소개' }, { name: '보유게임' }] },
    { name: '예약하기', subMenu: [{ name: '룸' }, { name: '대탁' }, { name: '마작강의 예약' }] },
    { name: '메뉴', subMenu: [{ name: '음료' }, { name: '식사' }, { name: '스낵' }] },
    { name: '커뮤니티', subMenu: [{ name: '공지사항' }, { name: '게시판' }] },
  ];

  const [menus, setMenus] = useState<MenuItem[]>(menu);

  const [isSubOpen, setIsSubOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  //서브메뉴 높이 측정
  const subMenuRef = useRef<HTMLDivElement>(null);
  const [subMenuHeight, setSubMenuHeight] = useState(0);

  //모바일 메뉴
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  //모바일 서브 메뉴
  const [isMobileSubOpen, setIsMobileSubOpen] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(prev => !prev);

  //메뉴바 닫기
  useEffect(() => {
    const handleClickOutside = e => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
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
        <img src={logo} alt="로고" />
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
                  $active={activeIndex === sub.name}
                  onClick={() => {
                    setActiveIndex(sub.name);
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
            <a>회원가입</a>
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
                    onClick={() => setActiveIndex(sub.name)}
                    $active={activeIndex === sub.name}
                  >
                    <a>{sub.name}</a>
                  </MobileSubLi>
                </AnimatedSubLiWrapper>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </MobileMenu>
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
  height: 100%;
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

  img {
    margin-left: -20px;
    height: 100px;
    width: auto;
    margin-top: 20px;
    cursor: pointer;
  }

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    padding: 0 16px;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
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
  background-color: ${({ theme }) => theme.colors.topBg};

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

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 40px;
    right: 40px;
    height: 0;
    border-top: 1px solid ${({ theme }) => theme.colors.menuColor};
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
    gap: 20px;
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
  background-color: ${({ $active, theme }) => ($active ? theme.colors.purpleColor : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : 'subMenuColor')};

  &:hover {
    background-color: ${({ theme }) => theme.colors.purpleColor};
    color: ${({ theme }) => theme.colors.white};
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
  height: calc(100vh - 100px);
  background-color: ${({ theme }) => theme.colors.topBg};

  transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 30px;
    right: 30px;
    height: 0;
    border-top: 1px solid ${({ theme }) => theme.colors.menuColor};
  }

  ul {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 20px;
    gap: 10px;
    color: ${({ theme }) => theme.colors.menuColor};
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
  font-size: ${({ theme }) => theme.sizes.medium};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.purpleColor : 'transparent')};
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
