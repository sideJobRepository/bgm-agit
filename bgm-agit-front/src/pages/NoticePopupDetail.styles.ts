import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const PopupWrapper = styled.div<WithTheme>`
  width: 800px;
  position: relative;
  height: calc(100vh - 120px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  border-radius: 8px 8px 0 0;

  @media ${({ theme }) => theme.device.tablet} {
    width: calc(100vw - 40px);
  }
`;

export const ButtonBox = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 8px;
  gap: 4px;
`;

export const Button = styled.button<WithTheme & { color: string }>`
  padding: 6px 16px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const TitleBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.basicColor};

  div {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.basicColor};

    h3 {
      color: ${({ theme }) => theme.colors.bronzeColor};
      font-size: ${({ theme }) => theme.sizes.menu};
      font-weight: ${({ theme }) => theme.weight.bold};

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.large};
      }
    }
    span {
      margin-left: auto;
      color: ${({ theme }) => theme.colors.subColor};
      font-size: ${({ theme }) => theme.sizes.medium};

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.small};
      }
    }
  }

  h2 {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 20px 10px;
    color: ${({ theme }) => theme.colors.subColor};
    font-size: ${({ theme }) => theme.sizes.xlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    font-family: ${theme.fonts.display};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.sizes.menu};
    }
  }
`;

export const ContentBox = styled.div<WithTheme>`
  width: 100%;
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.bronzeColor};
  margin-bottom: 20px;
  flex: 1;

  iframe {
    width: 100%;
    height: auto; /* 고정 height 제거 */
    aspect-ratio: 16 / 9; /* 16:9 비율 유지 */
    max-width: 100%;
    border: none;
    display: block;
  }

  figure.media {
    margin: 20px 0;
    max-height: unset;
    overflow: visible;
  }
`;

export const StyledFileUl = styled.ul<WithTheme>`
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  color: ${({ theme }) => theme.colors.bronzeColor};
  padding: 10px;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.basicColor};

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.sizes.xsmall};

    a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      background-color: ${({ theme }) => theme.colors.basicColor};
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        opacity: 0.7;
      }
    }

    svg {
      cursor: pointer;
    }
  }
`;

export const PopupBox = styled.div<WithTheme>`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.topBg};
  z-index: 3;
  border-radius: 0 0 8px 8px;
`;
