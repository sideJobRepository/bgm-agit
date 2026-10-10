import { motion } from 'framer-motion';
import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const Wrapper = styled.div<WithTheme>`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  gap: 36px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

export const Hero = styled.section<WithTheme>`
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;

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
  background: rgba(0, 0, 0, 0.2);
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
  gap: 10px;

  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    letter-spacing: -0.02em;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.9;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

export const TableBox = styled.div`
  width: 100%;
  overflow: hidden;

  /* 목록 썸네일 */
  td img {
    display: block;
    max-width: 100%;
    margin: 0 auto;
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radius.sm};
    object-fit: cover;
  }
`;

export const TitleCell = styled.div<WithTheme>`
  && {
    display: flex;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    align-items: center;
    gap: 8px;
  }

  .title {
    display: block;
    flex: 1 1 auto;
    width: 0;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .reply {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
