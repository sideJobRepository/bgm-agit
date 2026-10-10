import { Wrapper, Left, Right, BusinessInfo, PolicyLinks } from './Footer.styles.ts';
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
          <span>찾아오시는 길 : 대전 서구 문정로 62 3층 </span>
          <img
            src={logo}
            alt="로고"
            onClick={() => {
              kakaoMapGo();
            }}
          />
        </div>
        <span>연중무휴 24시간</span>
        <p>직원 상주 : 13:00 ~ 02:00</p>
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
