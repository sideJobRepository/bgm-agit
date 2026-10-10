import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaPhone } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import { buttonStyle, cardStyle } from '../../styles/mixins.ts';

// 상단 고정 헤더 높이. Layout.styles.ts 의 HEADER_HEIGHT 와 같은 값이어야 한다
const HEADER_HEIGHT = '72px';

// 대메뉴 칸 너비. 서브메뉴 열(SubLi)도 같은 너비라 위아래 칸이 맞는다
const MENU_COLUMN_WIDTH = '160px';

export const Wrapper = styled.div<WithTheme>`
  height: ${HEADER_HEIGHT};
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1700px;
  min-width: 1023px;
  font-family: ${({ theme }) => theme.fonts.body};

  ul {
    display: flex;
    height: 100%;
    cursor: pointer;
    align-items: center;
  }

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    padding: 0 8px 0 16px;
  }
`;

export const Left = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: flex-start;
  flex-shrink: 0;

  img {
    margin-top: 8px;
    height: 64px;
    width: auto;
    object-fit: contain;
    cursor: pointer;

    @media ${({ theme }) => theme.device.tablet} {
      margin-left: -8px;
      height: 56px;
    }
  }
`;

export const Center = styled.nav<WithTheme>`
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  margin: 0 auto;

  ul {
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: ${({ theme }) => theme.weight.semiBold};

    li {
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${MENU_COLUMN_WIDTH};

      a {
        display: inline-flex;
        align-items: center;
        padding: 10px 16px;
        border-radius: ${({ theme }) => theme.radius.pill};
        letter-spacing: -0.01em;
        white-space: nowrap;
        transition:
          background 0.15s ease,
          color 0.15s ease;
      }

      &:hover a,
      &.active a {
        background-color: ${({ theme }) => theme.colors.primarySoft};
        color: ${({ theme }) => theme.colors.primary};
        font-weight: ${({ theme }) => theme.weight.bold};
      }
    }
  }

  @media ${({ theme }) => theme.device.tablet} {
    display: none;
  }
`;

export const Right = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: right;
  flex-shrink: 0;

  ul {
    display: flex;
    gap: 12px;

    li {
      ${buttonStyle('secondary', 'md')}

      a {
        flex-wrap: nowrap;
      }

      svg {
        flex-shrink: 0;
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

export const PhoneIcon = styled(FaPhone)`
  transform: rotate(-240deg);
`;

// 서브메뉴 뒤 흰 판. 높이는 TopHeader 가 SubMenuWrapper 를 재서 넣는다
export const BgSubWrapper = styled.div<WithTheme & { $height: number }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  ${cardStyle}
  border-top: 0;
  border-radius: 0 0 ${({ theme }) => theme.radius.lg} ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.md};

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

export const SubMenuWrapper = styled.nav<WithTheme>`
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
    height: auto;
    margin-top: 24px;
    flex-direction: column;
    align-items: stretch;
    list-style: none;
    gap: 4px;
    font-size: ${({ theme }) => theme.sizes.small};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;

export const SubLi = styled.li<WithTheme & { $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  width: ${MENU_COLUMN_WIDTH};
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  text-align: center;
  cursor: pointer;
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primarySoft : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textBody)};
  font-weight: ${({ $active, theme }) => ($active ? theme.weight.bold : theme.weight.semiBold)};
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primarySoft : theme.colors.surfaceAlt};
    color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textStrong)};
  }
`;

export const Hamburger = styled(GiHamburgerMenu)<WithTheme>`
  display: none;
  box-sizing: content-box;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.textStrong};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceAlt};
  }

  @media ${({ theme }) => theme.device.tablet} {
    display: block;
  }
`;

export const MobileMenu = styled.div<WithTheme & { $open: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: min(80%, 320px);
  height: calc(100vh - ${HEADER_HEIGHT});
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow.lg};

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
    height: auto;
    padding: 16px 12px 24px;
    gap: 4px;
    color: ${({ theme }) => theme.colors.textStrong};
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: ${({ theme }) => theme.weight.bold};

    li {
      width: 100%;
      min-height: 48px;
      align-items: center;
      display: flex;
      justify-content: left;
      padding: 0 16px;
      border-radius: ${({ theme }) => theme.radius.md};
      transition: background 0.15s ease;

      &:hover {
        background-color: ${({ theme }) => theme.colors.surfaceAlt};
      }

      img {
        height: 26px;
        margin-right: 8px;
      }

      svg {
        margin-left: auto;
        color: ${({ theme }) => theme.colors.textSubtle};
      }
    }
  }

  @media ${({ theme }) => theme.device.desktop} {
    display: none;
  }
`;

export const MobileSubLi = styled.li<WithTheme & { $active: boolean }>`
  min-height: 44px !important;
  padding-left: 28px !important;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ $active, theme }) => ($active ? theme.weight.bold : theme.weight.semiBold)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primarySoft : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textBody)};

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.primarySoft : theme.colors.surfaceAlt} !important;
  }
`;

export const AnimatedSubLiWrapper = styled.div<WithTheme & { $visible: boolean }>`
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

// 문의하기 · 로그인/로그아웃 — 메뉴 아래 버튼 줄
export const SubMainLi = styled.li<WithTheme>`
  ${buttonStyle('secondary', 'md')}
  justify-content: center !important;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.textStrong};

  margin-top: 12px;

  & + & {
    margin-top: 4px;
  }

  svg {
    margin-left: 0 !important;
    margin-right: 6px;
    color: inherit !important;
  }
`;
