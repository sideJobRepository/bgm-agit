import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { theme } from '../../styles/theme.ts';

// 갈색 바탕 위 글자·구분선. 예전처럼 흰색
const MUTED_TEXT = theme.colors.white;
const DIVIDER = theme.colors.white;

export const Wrapper = styled.div<WithTheme>`
  display: flex;
  width: 1500px;
  padding: 40px 20px;
  min-width: 1023px;
  height: 100%;
  gap: 32px;
  color: ${MUTED_TEXT};
  font-size: ${({ theme }) => theme.sizes.small};
  line-height: 1.7;

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    width: 100%;
    padding: 28px 16px calc(28px + env(safe-area-inset-bottom));
    flex-direction: column;
    gap: 0;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const Left = styled.section<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 50%;
  gap: 2px;
  align-items: flex-start;
  justify-content: center;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100%;
    margin-bottom: 20px;
  }

  /* 첫 줄(찾아오시는 길)은 밝게 */
  div {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    color: ${({ theme }) => theme.colors.onPrimary};
    font-weight: ${({ theme }) => theme.weight.semiBold};

    span {
      display: flex;
    }

    img {
      width: 30px;
      height: 30px;
      margin-left: 12px;
      border-radius: ${({ theme }) => theme.radius.sm};
      cursor: pointer;

      @media ${({ theme }) => theme.device.tablet} {
        margin-left: 10px;
        width: 28px;
        height: 28px;
      }
    }
  }
`;

export const Right = styled.section<WithTheme>`
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 50%;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100%;
    height: 100%;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid ${DIVIDER};
  }
`;

export const BusinessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: right;
  line-height: 1.6;

  @media ${({ theme }) => theme.device.tablet} {
    text-align: center;
  }
`;

export const PolicyLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px 16px;
  margin-top: 12px;
  font-weight: 700;

  a {
    display: inline-flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.onPrimary};
    text-underline-offset: 3px;
    border-radius: ${({ theme }) => theme.radius.sm};

    &:hover {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid ${({ theme }) => theme.colors.onPrimary};
      outline-offset: 2px;
    }
  }

  @media ${({ theme }) => theme.device.tablet} {
    justify-content: center;

    a {
      min-height: 44px;
    }
  }
`;
