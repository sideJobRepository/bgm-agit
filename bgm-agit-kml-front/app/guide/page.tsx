'use client';
import { withBasePath } from '@/lib/path';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Check, Cpu, ShieldCheck, Wind } from 'phosphor-react';
import React from 'react';

export default function Guide() {
  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/guide/guideHero.png')} alt="상단 이미지" />
        </HeroBg>
        <FixedDarkOverlay />
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 1.2,
            ease: [0.65, 0, 0.35, 1],
          }}
        />
      </Hero>
      <ContentBox>
        <MainContent>
          <h1>
            도박이 아닌 지적 유희, 대전 유일의 <br />
            프리미엄 마작 라운지
          </h1>
          <h5>
            <strong>“아직도 마작을 영화 속 어두운 뒷골목의 전유물로 생각하시나요?” </strong>
            <br />
            마작은 전 세계 1억 명 이상이 즐기는 정교한 ‘두뇌 스포츠’입니다. <br /> 확률과 전략,
            그리고 심리전이 결합된 이 매력적인 게임을 이제 가장 쾌적한 환경에서 시작해보세요.
          </h5>
        </MainContent>
        <SubContent>
          <ImageBox>
            <img src={withBasePath('/guide/rexx3.jpg')} alt="마작 테이블" />
          </ImageBox>
          <TextBox>
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
        <SubContent>
          <ImageBox>
            <img src={withBasePath('/guide/celanRoom.png')} alt="클린매너 사진" />
          </ImageBox>
          <TextBox>
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
        <SubContent>
          <ImageBox>
            <img src={withBasePath('/guide/all.jpg')} alt="프리미엄 환경 사진" />
          </ImageBox>
          <TextBox>
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

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 520px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 320px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.02);
  z-index: 0;
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding-bottom: 48px;

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

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 64px 12px;
  gap: 24px;
  background-color: ${({ theme }) => theme.colors.softColor};
`;

const SubContent = styled.div`
  display: flex;
  border-radius: 4px;
  gap: 24px;
  padding: 12px 0;
  flex-direction: column;
  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const ImageBox = styled.div`
  display: flex;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 12px;
  gap: 4px;
  font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
  word-break: keep-all;
  overflow-wrap: break-word;
  text-align: center;
  line-height: 2;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inputColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
  }

  strong {
    font-size: ${({ theme }) => theme.desktop.sizes.h2Size};
    line-height: 1.4;
    letter-spacing: 2px;
    color: ${({ theme }) => theme.colors.blackColor};
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h2Size};
    }
  }
`;
