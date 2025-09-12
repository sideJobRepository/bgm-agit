import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import logo from '/kakaomapLogo.png';

export default function Footer() {
  function kakaoMapGo() {
    const address = '대전 서구 문정로 62';
    const url = `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  }

  return (
    <Wrapper>
      <Left>
        <div>
          <span>찾아오시는 길 : 찾아오시는 길 : 대전 서구 문정로 62 3층 </span>
          <img
            src={logo}
            alt="로고"
            onClick={() => {
              kakaoMapGo();
            }}
          />
        </div>
        <span>금, 토 : 13:00 ~ 06:00 </span>
        <p>월, 화, 수, 목, 일 : 13:00 ~ 02:00 </p>
      </Left>
      <Right>
        <p>
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            ※ 개인정보 처리방침 확인하기
          </a>
        </p>
      </Right>
    </Wrapper>
  );
}

const Wrapper = styled.div<WithTheme>`
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

const Left = styled.section<WithTheme>`
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

const Right = styled.section<WithTheme>`
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
