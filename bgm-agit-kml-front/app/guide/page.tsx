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
          <img src={withBasePath('/dayHero.jpg')} alt="" />
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

        <HeroContent>
          <span>
            도박이 아닌 지적 유희, 대전 유일의 <br />
            프리미엄 마작 라운지
          </span>
        </HeroContent>
      </Hero>
      <ContentBox>
        <MainContent>
          <strong>“아직도 마작을 영화 속 어두운 뒷골목의 전유물로 생각하시나요?”</strong>
          <h5>
            마작은 전 세계 1억 명 이상이 즐기는 정교한 ‘두뇌 스포츠’입니다. <br /> 확률과 전략,
            그리고 심리전이 결합된 이 매력적인 게임을 이제 가장 쾌적한 환경에서 시작해보세요.
          </h5>
        </MainContent>
        <SubContent>
          <ImageBox>
            <img src={withBasePath('/guide/rexx3.jpg')} alt="마작 테이블" />
          </ImageBox>
          <TextBox>
            대전 유일의 REXX-3 도입:일본 정품 최첨단 전동 탁자 ‘REXX-3’ 완비. 소음은 줄이고 게임의
            몰입도는 높였습니다.
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
  height: 240px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 200px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    filter: blur(2px);
    transform: scale(1);
  }
`;

const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 0;
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;

  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.h2Size};
    font-weight: 800;
    word-break: keep-all;
    overflow-wrap: break-word;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h2Size};
    }
  }
`;

const ContentBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  overflow: hidden;
  padding: 12px 0;

  strong {
    font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
    font-weight: 800;
    word-break: keep-all;
    overflow-wrap: break-word;
    text-align: center;
    line-height: 2;
    color: ${({ theme }) => theme.colors.inputColor};
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h3Size};
    }
  }

  h5 {
    font-size: ${({ theme }) => theme.desktop.sizes.h5Size};
    font-weight: 800;
    word-break: keep-all;
    overflow-wrap: break-word;
    line-height: 1.4;
    color: ${({ theme }) => theme.colors.grayColor};
    text-align: left;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h5Size};
    }
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 12px;
  gap: 24px;
  background-color: ${({ theme }) => theme.colors.softColor};
`;

const SubContent = styled.div`
  display: flex;
  border-radius: 4px;
  padding: 12px;
  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }

  @media ${({ theme }) => theme.device.tablet} {
    flex-direction: column;
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
`;
