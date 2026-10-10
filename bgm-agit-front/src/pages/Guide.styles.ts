import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { cardStyle } from '../styles/mixins.ts';

export const Wrapper = styled.div<WithTheme>`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  /* 예전 이용안내 바탕(옅은 올리브 회색). 맞는 토큰이 없어 예전 값을 그대로 쓴다 */
  background-color: #f3f4ee;
  font-family: ${({ theme }) => theme.fonts.body};

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

export const TopBox = styled.div`
  padding-bottom: 24px;

  img {
    display: block;
    width: 100%;
    height: auto;
  }
`;

export const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.space.xl} 0 48px 0;
  gap: ${({ theme }) => theme.space.xl};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.h1Size};
    font-weight: 800;
    word-break: keep-all;
    text-align: center;
    overflow-wrap: break-word;
    line-height: 1.4;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.text};
    @media ${({ theme }) => theme.device.mobile} {
      font-size: 28px;
    }
  }

  strong {
    font-weight: 800;
    word-break: keep-all;
    overflow-wrap: break-word;
    text-align: center;
    line-height: 1.4;
    letter-spacing: -0.02em;
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
      font-size: 15px;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${({ theme }) => theme.space.lg} 0 ${({ theme }) => theme.space.xxl};
    gap: ${({ theme }) => theme.space.lg};
  }
`;

// $bg 는 예전 화면에서 흰색/회색을 번갈아 넣던 값이다. 예전처럼 블록마다 그 바탕을 쓴다
export const SubContent = styled.div<WithTheme & { $bg: string }>`
  ${cardStyle}
  background-color: ${({ $bg }) => $bg};
  border-color: ${({ $bg }) => $bg};
  display: flex;
  padding: ${({ theme }) => theme.space.xl};
  margin: 0 ${({ theme }) => theme.space.xl};
  gap: ${({ theme }) => theme.space.xl};

  span {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.7;
    color: ${({ theme }) => theme.colors.inputColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 15px;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: ${({ theme }) => theme.space.md};
    margin: 0 ${({ theme }) => theme.space.lg};
    gap: ${({ theme }) => theme.space.md};
  }
`;

export const ImageBox = styled.div<WithTheme>`
  display: flex;
  width: 50%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radius.md};
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const TextBox = styled.div<WithTheme & { $align: string; $bg: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.space.xxl};
  gap: ${({ theme }) => theme.space.xs};
  font-size: 16px;
  word-break: keep-all;
  overflow-wrap: break-word;
  text-align: ${({ $align }) => $align};
  line-height: 1.7;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.inputColor};
  width: 50%;
  background-color: ${({ $bg }) => $bg};
  border-radius: ${({ theme }) => theme.radius.md};
  font-family: ${({ theme }) => theme.fonts.display};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: 15px;
    width: 100%;
    padding: ${({ theme }) => theme.space.xl} ${({ theme }) => theme.space.lg};
  }

  strong {
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    line-height: 1.4;
    letter-spacing: -0.02em;
    text-align: ${({ $align }) => ($align === 'left' ? 'right' : 'left')};
    color: ${({ theme }) => theme.colors.blackColor};
    @media ${({ theme }) => theme.device.mobile} {
      font-size: 20px;
    }
  }
`;
