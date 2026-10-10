import { Wrapper, TopBox, ContentBox, SubContent, ImageBox, TextBox } from './Guide.styles.ts';

export default function Guide() {
  return (
    <Wrapper>
      <TopBox>
        <img src={'/guides/guide.jpeg'} alt="상단 이미지" />
      </TopBox>

      <ContentBox>
        <SubContent $bg="#ffffff">
          <ImageBox>
            <img src={'/guides/rexx3.jpg'} alt="마작 테이블" />
          </ImageBox>
          <TextBox $align="right" $bg="#F8F9FA">
            <strong>“대전 유일의 REXX-3 도입”</strong>
            <br />
            <span>
              일본 정품 전동 마작 탁자 REXX-3를 정식 도입했습니다.
              <br />
              정밀한 자동 패 세팅과 저소음 설계로 쾌적한 환경을 구현하여,
              <br />
              불필요한 소음을 줄이고 오직 게임의 전략과 몰입에만 집중할 수 있도록 합니다.
            </span>
          </TextBox>
        </SubContent>
        <SubContent $bg="#F8F9FA">
          <TextBox $align="left" $bg="#ffffff">
            <strong>“철저한 ‘클린 매너’ 원칙”</strong>
            <br />
            <span>
              BGM 아지트는 비흡연, 비도박, 비욕설을 기본 원칙으로 운영됩니다.
              <br />
              불필요한 요소를 배제하고, 오직 게임과 전략에만 집중할 수 있는
              <br />
              건전하고 품격 있는 커뮤니티를 지향합니다.
            </span>
          </TextBox>
          <ImageBox>
            <img src={'/guides/celanRoom.png'} alt="클린매너 사진" />
          </ImageBox>
        </SubContent>
        <SubContent $bg="#ffffff">
          <ImageBox>
            <img src={'/guides/guideTop.png'} alt="프리미엄 환경 사진" />
          </ImageBox>
          <TextBox $align="right" $bg="#F8F9FA">
            <strong>“최적의 프리미엄 환경”</strong>
            <br />
            <span>
              쾌적한 공기 질 관리 시스템과 세련된 공간 설계를 통해
              <br />
              머무는 시간 자체가 편안한 플레이 환경을 제공합니다.
              <br />
              대전 마작 라운지의 새로운 기준을 제시합니다.
            </span>
          </TextBox>
        </SubContent>
      </ContentBox>
    </Wrapper>
  );
}
