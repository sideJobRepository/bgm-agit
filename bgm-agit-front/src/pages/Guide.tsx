import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';

export default function Guide() {
  return (
    <Wrapper>
      <TopBox>
        <img src={'/guide/guide.jpeg'} alt="상단 이미지" />
      </TopBox>

      <ContentBox>
        <SubContent $bg="#ffffff">
          <ImageBox>
            <img src={'/guide/rexx3.jpg'} alt="마작 테이블" />
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
          <ImageBox>
            <img src={'/guide/celanRoom.png'} alt="클린매너 사진" />
          </ImageBox>
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
        </SubContent>
        <SubContent $bg="#ffffff">
          <ImageBox>
            <img src={'/guide/guideTop.png'} alt="프리미엄 환경 사진" />
          </ImageBox>
          <TextBox $align="right" $bg="#F8F9FA">
            <strong>“프리미엄 환경”</strong>
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

const Wrapper = styled.div<WithTheme>`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  background-color: #f3f4ee;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const TopBox = styled.div`
  padding-bottom: 24px;
`;

const ContentBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px 0 48px 0;
  gap: 24px;
  //background-color: white;

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.h1Size};
    font-weight: 800;
    word-break: keep-all;
    text-align: center;
    overflow-wrap: break-word;
    line-height: 1.4;
    letter-spacing: 4px;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h1Size};
    }
  }

  strong {
    font-weight: 800;
    word-break: keep-all;
    overflow-wrap: break-word;
    text-align: center;
    line-height: 2;
    letter-spacing: 1px;
    color: ${({ theme }) => theme.colors.inputColor};
  }

  h5 {
    font-size: ${({ theme }) => theme.desktop.sizes.h5Size};
    font-weight: 800;
    word-break: keep-all;
    overflow-wrap: break-word;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.grayColor};
    text-align: center;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h5Size};
    }
  }
`;

const SubContent = styled.div<WithTheme & { $bg: string }>`
  display: flex;
  border-radius: 4px;
  padding: 24px;
  background-color: ${({ $bg }) => $bg};
  margin: 0 24px;
  gap: 24px;
  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    padding: 12px;
    margin: 0 8px;
  }
`;

const ImageBox = styled.div<WithTheme>`
  display: flex;
  width: 50%;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const TextBox = styled.div<WithTheme & { $align: string; $bg: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px;
  gap: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
  word-break: keep-all;
  overflow-wrap: break-word;
  text-align: ${({ $align }) => $align};
  line-height: 2;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inputColor};
  width: 50%;
  background-color: ${({ $bg }) => $bg};
  border-radius: 4px;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
    width: 100%;
    padding: 24px 12px;
  }

  strong {
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    line-height: 1.4;
    letter-spacing: 2px;
    text-align: ${({ $align }) => ($align === 'left' ? 'right' : 'left')};
    color: ${({ theme }) => theme.colors.blackColor};
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h3Size};
    }
  }
`;
