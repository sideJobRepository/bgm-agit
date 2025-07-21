import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import logo from '/kakaomapLogo.png';

export default function Footer() {
  return (
    <Wrapper>
      <Left>
        <span>찾아오시는 길 : 찾아오시는 길 : 대전 서구 문정로 62 3층 </span>
        <img src={logo} alt="로고" />
      </Left>
      <Right>
        <span>금, 토 : 13:00 ~ 06:00 </span>
        <p>월, 화, 수, 목, 일 : 13:00 ~ 24:00 </p>
      </Right>
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
  display: flex;
  width: 1500px;
  padding: 0 20px;
  min-width: 1023px;
  height: 100px;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};

  @media ${({ theme }) => theme.device.tablet} {
    max-width: 100%;
    min-width: 100%;
    padding: 0 16px;
    flex-direction: column;
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const Left = styled.section<WithTheme>`
  display: flex;
  height: 100%;
  width: 50%;
  align-items: center;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100%;
  }

  span {
    margin-top: 4px;
  }

  img {
    width: 30px;
    margin-left: 12px;
    cursor: pointer;

    @media ${({ theme }) => theme.device.mobile} {
      width: 24px;
      margin-left: 8px;
    }
  }
`;

const Right = styled.section<WithTheme>`
  margin: auto;
  text-align: right;
  width: 50%;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100%;
    height: 100%;
  }
`;
