import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';

export const Wrapper = styled.div<WithTheme>`
  display: flex;
  width: 1500px;
  padding: 20px;
  min-width: 1023px;
  height: 100%;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    padding: 16px;
    flex-direction: column;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

export const Left = styled.section<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 50%;
  align-items: flex-start;
  justify-content: center;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100%;
    margin-bottom: 20px;
  }

  div {
    display: flex;

    span {
      display: flex;
      margin-top: 4px;
    }

    img {
      width: 30px;
      margin-left: 12px;
      cursor: pointer;

      @media ${({ theme }) => theme.device.tablet} {
        margin-left: 10px;
        width: 24px;
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
    border-top: 1px solid ${({ theme }) => theme.colors.white};
  }
`;

export const BusinessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
  line-height: 1.5;

  @media ${({ theme }) => theme.device.tablet} {
    text-align: center;
  }
`;

export const PolicyLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
  font-weight: 700;

  a {
    color: inherit;
  }

  @media ${({ theme }) => theme.device.tablet} {
    justify-content: center;
  }
`;
