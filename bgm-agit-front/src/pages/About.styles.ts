import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';

export interface SectionProps {
  bgColor?: string;
  textColor?: string;
  headerColor?: string;
}

export const TopSection = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  flex-direction: column;
`;

export const Top = styled.section<WithTheme>`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const ImageBox = styled.div<WithTheme>`
  width: 100%;
  display: flex;
  border-radius: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
  }
`;

export const Left = styled.div<WithTheme>`
  width: 36%;
  padding: 10px;
  display: flex;
  flex-direction: column;

  img {
    width: 100%;
    object-fit: fill;
    border-radius: 12px;
    display: block;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 200px;
    padding-bottom: 0;

    img {
      height: 100px;
    }
  }
`;

export const LogoTextBox = styled.div<WithTheme>`
  display: flex;
  padding: 12px;
  font-family: ${theme.fonts.display};
  font-weight: ${({ theme }) => theme.weight.bold};
  background-color: ${({ theme }) => theme.colors.purpleColor};
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.white};
  height: 30%;
  align-items: center;

  h2 {
    margin: 0 auto;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xxsmall};
  }
`;

export const LogoBox = styled.div<WithTheme>`
  display: grid;
  height: 70%;
  color: ${({ theme }) => theme.colors.subColor};
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 10px 12px;
  justify-items: center;
  align-items: center;
  margin-top: auto;
  padding: 10px 0;
`;

export const GridItem = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;

  svg {
    font-size: ${({ theme }) => theme.sizes.xlarge};
  }
  span {
    font-weight: ${({ theme }) => theme.weight.bold};
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

export const Right = styled.div<WithTheme>`
  width: 64%;
  padding: 10px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

export const Bottom = styled.section<WithTheme>`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.softColor};
  border-radius: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    margin-top: 10px;
  }
`;

export const ContentBox = styled.div<WithTheme>`
  display: flex;
  padding: 20px;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
`;

export const Line1 = styled.p<WithTheme>`
  font-family: ${theme.fonts.display};
  font-size: ${({ theme }) => theme.sizes.xlarge};
  font-weight: ${({ theme }) => theme.weight.bold};
  color: ${({ theme }) => theme.colors.blueColor};
  margin-left: 0;
  @media ${({ theme }) => theme.device.tablet} {
    font-size: ${({ theme }) => theme.sizes.large};
  }
`;

export const Line2 = styled.div<WithTheme>`
  margin-top: 20px;
  margin-left: 10%;

  h2 {
    //font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.extra};
    font-weight: ${({ theme }) => theme.weight.bold};
    line-height: 1.4;
    text-shadow: 4px 4px 2px rgba(0, 0, 0, 0.2);
  }

  @media ${({ theme }) => theme.device.tablet} {
    margin-left: 0;
    h2 {
      font-size: ${({ theme }) => theme.sizes.bigLarge};
    }
  }
`;

export const Line3 = styled.div<WithTheme>`
  margin-top: 20px;
  margin-left: 26%;
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-size: ${({ theme }) => theme.sizes.bigLarge};
  color: ${({ theme }) => theme.colors.subColor};
  line-height: 1.6;
  font-family: ${theme.fonts.display};

  @media ${({ theme }) => theme.device.tablet} {
    margin-left: 0;
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;

export const ContentSetion = styled.section.withConfig({
  shouldForwardProp: prop => !['bgColor', 'textColor'].includes(prop),
})<WithTheme & SectionProps>`
  display: flex;
  width: 100%;
  height: 600px;
  align-items: center;
  padding: 30px 10px;
  background-color: ${({ bgColor }) => bgColor};
  margin: 60px 0;
  border-radius: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    height: 500px;
  }
`;

export const ReservationSetion = styled.section<WithTheme>`
  display: flex;
  width: 100%;
  justify-content: center;
  height: 600px;
  align-items: center;
  padding: 30px 10px;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.blueColor};
  border-radius: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    height: 500px;
  }
`;

export const ContentImage = styled.div<WithTheme & SectionProps>`
  display: flex;
  width: 50%;
  height: 100%;
  padding-right: 80px;
  justify-content: right;
  color: ${({ theme }) => theme.colors.white};
  section {
    display: flex;
    align-items: center;
    height: 100%;
    position: relative;
    div {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 6px;
      left: 6px;
      padding: 6px 12px 4px 12px;
      border-radius: 8px;
      background-color: rgba(66, 69, 72, 0.6);

      span {
        font-size: ${({ theme }) => theme.sizes.small};
      }
    }
    img {
      height: 80%;
      width: auto;
      object-fit: cover;
      cursor: pointer;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 70%;
    justify-content: center;
    padding-right: 0;
    background-color: ${({ bgColor }) => bgColor};
    border-radius: 12px;
    margin-bottom: 30px;
    section {
      img {
        height: 100%;
      }
    }
  }
`;

export const ReservationImageBox = styled.div<WithTheme>`
  width: 100%;
  height: 50%;
  margin-bottom: 50px;
  padding: 0 10px;

  @media ${({ theme }) => theme.device.mobile} {
    height: 60%;
    margin-bottom: 30px;
  }
`;

export const TextBox = styled.div.withConfig({
  shouldForwardProp: prop => !['bgColor', 'textColor', 'headerColor'].includes(prop),
})<WithTheme & SectionProps>`
  display: flex;
  width: 50%;
  height: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-right: 10px;

  h2 {
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    color: ${({ headerColor }) => headerColor};
    margin-bottom: 20px;
    padding: 0 16px;
  }
  div {
    background-color: ${({ bgColor }) => bgColor};
    padding: 16px;
    border-radius: 12px;
    p {
      font-size: ${({ theme }) => theme.sizes.menu};
      line-height: 1.6;
      color: ${({ textColor }) => textColor};
      font-weight: ${({ theme }) => theme.weight.semiBold};
    }
  }
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 30%;
    align-items: center;
    padding: 0;

    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
      margin-bottom: 10px;
    }

    div {
      width: 100%;
      p {
        text-align: center;
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }
  }
`;

export const ReservationTextBox = styled.div<WithTheme>`
  display: flex;
  width: 100%;
  height: 30%;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h2 {
    font-family: ${theme.fonts.display};
    font-size: ${({ theme }) => theme.sizes.xxlarge};
    font-weight: ${({ theme }) => theme.weight.bold};
    color: ${({ theme }) => theme.colors.white};
    margin-bottom: 20px;
  }
  div {
    width: 100%;
    padding: 16px;
    p {
      text-align: center;
      font-size: ${({ theme }) => theme.sizes.menu};
      font-weight: ${({ theme }) => theme.weight.semiBold};
      line-height: 1.6;
      color: ${({ theme }) => theme.colors.white};
    }
  }
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 30%;
    align-items: center;
    padding-right: 0;

    h2 {
      font-size: ${({ theme }) => theme.sizes.medium};
      margin-bottom: 10px;
    }

    div {
      p {
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }
  }
`;
