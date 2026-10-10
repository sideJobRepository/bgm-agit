import { motion } from 'framer-motion';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export const Wrapper = styled.div<WithTheme>`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xxl};
  font-family: ${({ theme }) => theme.fonts.body};

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }

  @media ${({ theme }) => theme.device.mobile} {
    gap: ${({ theme }) => theme.space.lg};
  }
`;

export const Hero = styled.section<WithTheme>`
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.primary};

  @media ${({ theme }) => theme.device.mobile} {
    height: 140px;
  }
`;

export const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(2px);
    transform: scale(1);
  }
`;

export const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
`;

export const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
`;

export const HeroContent = styled.div<WithTheme>`
  position: relative;
  z-index: 2;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.space.sm};
  padding: 0 ${({ theme }) => theme.space.lg};

  text-align: center;
  color: ${({ theme }) => theme.colors.onPrimary};

  h1 {
    margin: 0;
    font-size: 40px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: 26px;
    }
  }

  span {
    font-size: 16px;
    font-weight: 500;
    opacity: 0.9;
    word-break: keep-all;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 14px;
    }
  }
`;

// 표가 넓을 때는 이 상자 안에서만 가로로 스크롤한다
export const TableBox = styled.div<WithTheme>`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 0 ${({ theme }) => theme.space.lg};
  }
`;
