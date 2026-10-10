import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { cardStyle } from '../styles/mixins.ts';

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
  border-radius: ${({ theme }) => theme.radius.lg};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
  }
`;

export const Left = styled.div<WithTheme>`
  width: 36%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.md};

  img {
    width: 100%;
    object-fit: fill;
    border-radius: ${({ theme }) => theme.radius.lg};
    display: block;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: auto;
    padding-bottom: 0;

    img {
      height: 100px;
    }
  }
`;

export const LogoTextBox = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
  padding: ${({ theme }) => theme.space.lg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-weight: 800;
  letter-spacing: -0.02em;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.lg};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onPrimary};
  height: 30%;
  align-items: center;
  justify-content: center;

  h2 {
    margin: 0 auto;
    font-size: inherit;
    font-weight: inherit;
  }

  @media ${({ theme }) => theme.device.mobile} {
    height: auto;
    padding: ${({ theme }) => theme.space.md};
    font-size: 13px;
  }
`;

export const LogoBox = styled.div<WithTheme>`
  ${cardStyle}
  display: grid;
  height: 70%;
  color: ${({ theme }) => theme.colors.textBody};
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: ${({ theme }) => theme.space.lg} ${({ theme }) => theme.space.md};
  justify-items: center;
  align-items: center;
  margin-top: auto;
  padding: ${({ theme }) => theme.space.lg} ${({ theme }) => theme.space.sm};
`;

export const GridItem = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  svg {
    font-size: 24px;
    color: ${({ theme }) => theme.colors.primary};
  }
  span {
    font-weight: 700;
    margin-top: ${({ theme }) => theme.space.sm};
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textBody};
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.device.mobile} {
    svg {
      font-size: 20px;
    }

    span {
      margin-top: 6px;
      font-size: 12px;
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
  background-color: ${({ theme }) => theme.colors.surfaceSunken};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  margin-top: ${({ theme }) => theme.space.lg};

  @media ${({ theme }) => theme.device.mobile} {
    margin: 10px 0 0;
  }
`;

export const ContentBox = styled.div<WithTheme>`
  display: flex;
  padding: 40px 48px;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.sm};
  justify-content: center;

  @media ${({ theme }) => theme.device.mobile} {
    padding: ${({ theme }) => theme.space.xl} 20px;
  }
`;

// 이 페이지의 골드 포인트는 이 아이브로 하나뿐
export const Line1 = styled.p<WithTheme>`
  align-self: flex-start;
  margin: 0;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background-color: ${({ theme }) => theme.colors.accentSoft};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.accentText};
  letter-spacing: -0.01em;
`;

export const Line2 = styled.div<WithTheme>`
  margin-top: ${({ theme }) => theme.space.lg};
  margin-left: 10%;

  h2 {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.35;
    color: ${({ theme }) => theme.colors.textStrong};
    word-break: keep-all;
  }

  @media ${({ theme }) => theme.device.tablet} {
    margin-left: 0;
    h2 {
      font-size: 22px;
    }
  }
`;

export const Line3 = styled.div<WithTheme>`
  margin-top: ${({ theme }) => theme.space.lg};
  margin-left: 26%;
  font-weight: 500;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.7;
  font-family: ${({ theme }) => theme.fonts.body};
  word-break: keep-all;

  @media ${({ theme }) => theme.device.tablet} {
    margin-left: 0;
    font-size: 15px;
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
  background-color: ${({ bgColor, theme }) => bgColor ?? theme.colors.surfaceSunken};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin: 60px 0;
  border-radius: ${({ theme }) => theme.radius.lg};

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    height: 500px;
    margin: 32px 0;
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
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.lg};

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
  color: ${({ theme }) => theme.colors.onPrimary};
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
      border-radius: ${({ theme }) => theme.radius.sm};
      background-color: ${({ theme }) => theme.colors.labelGb};

      span {
        font-size: 14px;
      }
    }
    img {
      height: 80%;
      width: auto;
      max-width: 100%;
      object-fit: cover;
      border-radius: ${({ theme }) => theme.radius.lg};
      box-shadow: ${({ theme }) => theme.shadow.md};
      cursor: pointer;
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 70%;
    justify-content: center;
    padding-right: 0;
    margin-bottom: ${({ theme }) => theme.space.xl};
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
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${({ headerColor, theme }) => headerColor ?? theme.colors.textStrong};
    margin-bottom: 20px;
    padding: 0 ${({ theme }) => theme.space.lg};
    word-break: keep-all;
  }
  div {
    ${cardStyle}
    background-color: ${({ bgColor, theme }) => bgColor ?? theme.colors.surface};
    padding: 20px ${({ theme }) => theme.space.xl};
    p {
      font-size: 17px;
      line-height: 1.7;
      color: ${({ textColor, theme }) => textColor ?? theme.colors.textBody};
      font-weight: 500;
      word-break: keep-all;
    }
  }
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 30%;
    align-items: center;
    padding: 0;

    h2 {
      font-size: 18px;
      margin-bottom: 10px;
    }

    div {
      width: 100%;
      padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.lg};
      p {
        text-align: center;
        font-size: 14px;
        line-height: 1.6;
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
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: ${({ theme }) => theme.colors.onPrimary};
    margin-bottom: 20px;
    word-break: keep-all;
  }
  div {
    width: 100%;
    padding: ${({ theme }) => theme.space.lg};
    p {
      text-align: center;
      font-size: 17px;
      font-weight: 500;
      line-height: 1.7;
      color: ${({ theme }) => theme.colors.onPrimary};
      word-break: keep-all;
    }
  }
  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    height: 30%;
    align-items: center;
    padding-right: 0;

    h2 {
      font-size: 18px;
      margin-bottom: 10px;
    }

    div {
      padding: ${({ theme }) => theme.space.sm} ${({ theme }) => theme.space.lg};
      p {
        font-size: 14px;
        line-height: 1.6;
      }
    }
  }
`;
