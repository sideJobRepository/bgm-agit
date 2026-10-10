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
  background-color: #f3f4ee;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

export const TopBox = styled.div`
  padding-bottom: 24px;
`;

export const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px 0 48px 0;
  gap: 24px;
  //background-color: white;

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.h1Size};
    font-weight: 800;
    word-break: keep-all;
    text-align: center;
    overflow-wrap: break-word;
    line-height: 1.4;
    letter-spacing: 4px;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h1Size};
    }
  }

  strong {
    font-weight: 800;
    word-break: keep-all;
    overflow-wrap: break-word;
    text-align: center;
    line-height: 2;
    letter-spacing: 1px;
    color: ${({ theme }) => theme.colors.inputColor};
  }

  h5 {
    font-size: ${({ theme }) => theme.desktop.sizes.h5Size};
    font-weight: 800;
    word-break: keep-all;
    overflow-wrap: break-word;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.grayColor};
    text-align: center;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h5Size};
    }
  }
`;

export const SubContent = styled.div<WithTheme & { $bg: string }>`
  display: flex;
  border-radius: 4px;
  padding: 24px;
  background-color: ${({ $bg }) => $bg};
  margin: 0 24px;
  gap: 24px;
  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 12px;
    margin: 0 8px;
  }
`;

export const ImageBox = styled.div<WithTheme>`
  display: flex;
  width: 50%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const TextBox = styled.div<WithTheme & { $align: string; $bg: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  gap: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
  word-break: keep-all;
  overflow-wrap: break-word;
  text-align: ${({ $align }) => $align};
  line-height: 2;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inputColor};
  width: 50%;
  background-color: ${({ $bg }) => $bg};
  border-radius: 4px;
  font-family: ${theme.fonts.display};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
    width: 100%;
    padding: 24px 12px;
  }

  strong {
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    line-height: 1.4;
    letter-spacing: 2px;
    text-align: ${({ $align }) => ($align === 'left' ? 'right' : 'left')};
    color: ${({ theme }) => theme.colors.blackColor};
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h3Size};
    }
  }
`;
