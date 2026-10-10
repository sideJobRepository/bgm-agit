import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaPhone } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi';

export const Wrapper = styled.div<WithTheme>`
  height: 100px;
  width: 100%;
  padding: 0 20px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1700px;
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

export const Left = styled.div<WithTheme>`
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

export const Center = styled.nav<WithTheme>`
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  margin: 0 auto;

  ul {
    color: ${({ theme }) => theme.colors.menuColor};
    font-size: ${({ theme }) => theme.sizes.menu};
    font-weight: ${({ theme }) => theme.weight.bold};

    li {
      width: 160px;
      text-align: center;
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

  ul {
    color: ${({ theme }) => theme.colors.subMenuColor};
    font-size: ${({ theme }) => theme.sizes.large};
    font-weight: ${({ theme }) => theme.weight.semiBold};
    display: flex;
    gap: 40px;

    li {
      display: flex;
      align-items: center;
      justify-content: right;

      a {
        flex-wrap: nowrap;
      }

      svg {
        margin-right: 8px;
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

export const BgSubWrapper = styled.div<WithTheme & { $height: number }>`
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
    margin-top: 40px;
    flex-direction: column;
    list-style: none;
    gap: 0;
    font-size: ${({ theme }) => theme.sizes.large};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;

export const SubLi = styled.li<WithTheme & { $active: boolean }>`
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

export const Hamburger = styled(GiHamburgerMenu)<WithTheme>`
  display: none;
  cursor: pointer;

  @media ${({ theme }) => theme.device.tablet} {
    display: block;
  }
`;

export const MobileMenu = styled.div<WithTheme & { $open: boolean }>`
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

export const MobileSubLi = styled.li<WithTheme & { $active: boolean }>`
  font-size: ${({ theme }) => theme.sizes.small};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.activeMenuColor : theme.colors.subTextBoxColor};
  color: ${({ $active, theme }) => ($active ? theme.colors.white : 'subMenuColor')};
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

export const SubMainLi = styled.li<WithTheme>`
  justify-content: center !important;
  svg {
    margin-left: 0 !important;
    margin-right: 8px;
  }
`;
