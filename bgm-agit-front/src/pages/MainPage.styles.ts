import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export const TopSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
  }
`;

export const LeftSection = styled.section<WithTheme>`
  width: 36%;
  margin-right: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 180px;
    margin-right: 0;
  }
`;

export const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  height: 64%;
  font-weight: ${({ theme }) => theme.weight.bold};

  div {
    display: flex;
    line-height: 1;
    align-items: center;
    p {
      font-family: ${theme.fonts.display};
      color: ${({ theme }) => theme.colors.blueColor};
      font-size: ${({ theme }) => theme.sizes.bigLarge};
    }

    a {
      font-weight: ${({ theme }) => theme.weight.semiBold};
      margin-left: auto;
      margin-right: 20px;
      color: ${({ theme }) => theme.colors.navColor};
      cursor: pointer;
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }

  h2 {
    //font-family: ${theme.fonts.display};
    margin: auto 0;
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    text-shadow: 4px 4px 2px rgba(0, 0, 0, 0.2);
  }

  @media ${({ theme }) => theme.device.mobile} {
    height: 60%;
    div {
      p {
        font-size: ${({ theme }) => theme.sizes.medium};
      }

      a {
        margin-right: 0;
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
  }
`;

export const LogoBox = styled.div<WithTheme>`
  display: grid;
  height: 36%;
  background-color: ${({ theme }) => theme.colors.greenColor};
  color: ${({ theme }) => theme.colors.white};
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  justify-items: center;
  align-items: center;

  @media ${({ theme }) => theme.device.mobile} {
    height: 40%;
    margin-bottom: 16px;
  }
`;

export const GridItem = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    font-size: ${({ theme }) => theme.sizes.xlarge};
  }
  span {
    font-weight: ${({ theme }) => theme.weight.semiBold};
    margin-top: 10px;
    font-size: ${({ theme }) => theme.sizes.small};
  }

  @media ${({ theme }) => theme.device.mobile} {
    svg {
      font-size: ${({ theme }) => theme.sizes.medium};
    }

    span {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
  }
`;

export const RightSection = styled.section<WithTheme>`
  width: 64%;
  //height: 100%;
  padding: 0 10px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    //height: 40%;
    padding: 0;
  }
`;

export const GameFoodSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  //padding: 30px 10px;
  margin: 30px 0;
  @media ${({ theme }) => theme.device.mobile} {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
`;

export const ReservationNoticeSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  //padding: 30px 10px;
  margin: 30px 0;
  @media ${({ theme }) => theme.device.mobile} {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
`;

export const GameSection = styled.section<WithTheme>`
  width: 50%;
  padding: 20px;
  border-radius: 12px 0 0 12px;
  color: ${({ theme }) => theme.colors.greenColor};
  background-color: ${({ theme }) => theme.colors.softColor};
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    border-radius: 12px;
  }
`;

export const FoodSection = styled.section<WithTheme>`
  width: 50%;
  padding: 20px;
  border-radius: 0 12px 12px 0;
  color: ${({ theme }) => theme.colors.bronzeColor};
  background-color: ${({ theme }) => theme.colors.basicColor};
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }
`;

export const ReservationSection = styled.section<WithTheme>`
  width: 50%;
  padding: 20px;
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.blueColor};
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }
`;

export const NoticeSection = styled.section<WithTheme>`
  width: 50%;
  padding: 20px;
  border-radius: 0 12px 12px 0;
  color: ${({ theme }) => theme.colors.subColor};

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 100%;
  }
`;

export const TitleBox = styled.div<WithTheme>`
  width: 100%;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  line-height: 1;
  h2 {
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.xlarge};
  }

  p {
    margin-left: 12px;
    font-size: ${({ theme }) => theme.sizes.medium};
    font-weight: ${({ theme }) => theme.weight.bold};
  }

  @media ${({ theme }) => theme.device.mobile} {
    gap: 6px;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;

    h2 {
      font-size: ${({ theme }) => theme.sizes.large};
    }
    p {
      margin-top: 3px;
      margin-left: 0;
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }
`;

export const SliderBox = styled.div<WithTheme>`
  width: 100%;
`;

export const ABox = styled.div<WithTheme>`
  display: flex;
  margin-bottom: 10px;
  a {
    font-weight: ${({ theme }) => theme.weight.semiBold};
    margin-left: auto;
    margin-right: 2px;
    color: ${({ theme }) => theme.colors.navColor};
    font-size: ${({ theme }) => theme.sizes.small};
    cursor: pointer;
  }

  @media ${({ theme }) => theme.device.mobile} {
    a {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;
