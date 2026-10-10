import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaPhone } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';
import { buttonStyle, cardStyle } from '../../styles/mixins.ts';

// 상단 고정 헤더 높이. Layout.styles.ts 의 HEADER_HEIGHT 와 같은 값이어야 한다
const HEADER_HEIGHT = '80px';

// 대메뉴 칸 너비. 서브메뉴 열(SubLi)도 같은 너비라 위아래 칸이 맞는다
const MENU_COLUMN_WIDTH = '148px';

// 모바일 메뉴 하위 항목 한 칸 높이
const SUB_ITEM_HEIGHT = 44;

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

  /* 헤더 밖으로 나간 로고 투명 여백이 아래 브레드크럼 클릭을 가로채지 않게 자른다 */
  overflow: hidden;

  /* 로고 png 는 위아래 투명 여백이 커서(글자가 위쪽 40% 지점에 있다) 헤더보다 크게 그리고
     margin-top 으로 글자를 헤더 세로 가운데에 맞춘다. 높이를 바꾸면 margin-top 도 같은 비율로 */
  img {
    margin-top: 24px;
    margin-left: -16px;
    height: 104px;
    width: auto;
    object-fit: contain;
    cursor: pointer;

    @media ${({ theme }) => theme.device.tablet} {
      margin-top: 20px;
      height: 88px;
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
    color: ${({ theme }) => theme.colors.menuColor};
    /* 예전(20px bold)과 개편(16px) 사이 */
    font-size: ${({ theme }) => theme.sizes.large};
    font-weight: ${({ theme }) => theme.weight.bold};

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
        background-color: ${({ theme }) => theme.colors.subTextBoxColor};
        color: ${({ theme }) => theme.colors.activeMenuColor};
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
      ${buttonStyle('ghost', 'md')}
      /* 예전처럼 채우지 않은 글자+아이콘 버튼 */
      color: ${({ theme }) => theme.colors.subMenuColor};
      font-size: ${({ theme }) => theme.sizes.medium};

      &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.subTextBoxColor};
      }

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

// 서브메뉴 뒤 베이지 판. 높이는 TopHeader 가 SubMenuWrapper 를 재서 넣는다
export const BgSubWrapper = styled.div<WithTheme & { $height: number }>`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: ${({ $height }) => `${$height}px`};
  ${cardStyle}
  background: ${({ theme }) => theme.colors.subBgColor};
  border-color: ${({ theme }) => theme.colors.subTextBoxColor};
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
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;

export const SubLi = styled.li<WithTheme & { $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  width: ${MENU_COLUMN_WIDTH};
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  text-align: center;
  cursor: pointer;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.activeMenuColor : 'transparent'};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.subMenuColor)};
  font-weight: ${({ $active, theme }) => ($active ? theme.weight.bold : theme.weight.semiBold)};
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.activeMenuColor : theme.colors.subTextBoxColor};
    color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.subMenuColor)};
  }
`;

export const Hamburger = styled(GiHamburgerMenu)<WithTheme>`
  display: none;
  box-sizing: content-box;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.subMenuColor};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.subTextBoxColor};
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
  background-color: ${({ theme }) => theme.colors.subBgColor};
  border-left: 1px solid ${({ theme }) => theme.colors.subTextBoxColor};
  box-shadow: ${({ theme }) => theme.shadow.lg};

  /* 미끄러지기만 한다. 투명도까지 같이 바꾸면 큰 그림자를 매 프레임 다시 그려 저사양 폰에서 끊긴다.
     닫힌 뒤엔 visibility 로 숨겨 그림자 끝이 화면 가장자리에 남지 않게 한다 */
  transform: ${({ $open }) => ($open ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)')};
  visibility: ${({ $open }) => ($open ? 'visible' : 'hidden')};
  pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
  will-change: transform;
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear ${({ $open }) => ($open ? '0s' : '0.32s')};

  ul {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    padding: 16px 12px 24px;
    gap: 4px;
    color: ${({ theme }) => theme.colors.subMenuColor};
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
        background-color: ${({ theme }) => theme.colors.subTextBoxColor};
      }

      img {
        height: 26px;
        margin-right: 8px;
      }

      svg {
        margin-left: auto;
        color: ${({ theme }) => theme.colors.subMenuColor};
      }
    }
  }

  @media ${({ theme }) => theme.device.desktop} {
    display: none;
  }
`;

export const MobileSubLi = styled.li<WithTheme & { $active: boolean }>`
  /* AnimatedSubLiWrapper 의 펼침 높이(SUB_ITEM_HEIGHT)와 같아야 접고 펼 때 멈칫하지 않는다 */
  min-height: ${SUB_ITEM_HEIGHT}px !important;
  padding-left: 28px !important;
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ $active, theme }) => ($active ? theme.weight.bold : theme.weight.semiBold)};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.activeMenuColor : theme.colors.subTextBoxColor};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : theme.colors.subMenuColor)};

  &:hover {
    background-color: ${({ $active, theme }) =>
      $active ? theme.colors.activeMenuColor : theme.colors.subTextBoxColor} !important;
  }
`;

// 펼침 높이를 실제 칸 높이에 맞춘다. 예전엔 60px 까지 늘였는데 칸은 44px 이라 접을 때 앞 1/4 동안 아무 변화가 없었다.
// 접힌 항목은 ul 의 gap(4px)을 음수 margin 으로 지워 펼치고 접을 때 칸이 밀리지 않게 한다
export const AnimatedSubLiWrapper = styled.div<WithTheme & { $visible: boolean }>`
  width: 100%;
  overflow: hidden;
  max-height: ${({ $visible }) => ($visible ? `${SUB_ITEM_HEIGHT}px` : '0')};
  margin-top: ${({ $visible }) => ($visible ? '0' : '-4px')};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  transition:
    max-height 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    margin-top 0.26s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease,
    visibility 0s linear ${({ $visible }) => ($visible ? '0s' : '0.26s')};
`;

// 문의하기 · 로그인/로그아웃 — 메뉴 아래 버튼 줄
export const SubMainLi = styled.li<WithTheme>`
  ${buttonStyle('secondary', 'md')}
  justify-content: center !important;
  /* 예전 모바일 메뉴의 문의하기·로그인 줄처럼 베이지 바탕 위 글자 */
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.subTextBoxColor};
  color: ${({ theme }) => theme.colors.subMenuColor};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.subTextBoxColor};
  }

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
