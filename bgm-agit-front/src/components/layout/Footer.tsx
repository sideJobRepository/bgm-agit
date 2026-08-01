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
        <BusinessInfo>
          <span>상호: 보드게임카페BGM(비지엠)아지트</span>
          <span>대표자: 박범후</span>
          <span>사업자등록번호: 896-17-02241</span>
          <span>주소: 대전광역시 서구 문정로 62, 3층 일부호(탄방동, 프라임빌딩)</span>
          <span>연락처: 0507-1445-3503</span>
        </BusinessInfo>
        <PolicyLinks>
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            이용약관
          </a>
          <a href="/refund-policy" target="_blank" rel="noopener noreferrer">
            취소 및 환불 정책
          </a>
          <a href="/privacy" target="_blank" rel="noopener noreferrer">
            개인정보 처리방침
          </a>
        </PolicyLinks>
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

const BusinessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
  line-height: 1.5;

  @media ${({ theme }) => theme.device.tablet} {
    text-align: center;
  }
`;

const PolicyLinks = styled.div`
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
