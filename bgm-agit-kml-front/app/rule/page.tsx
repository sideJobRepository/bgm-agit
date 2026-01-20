'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/path';
import { CaretLeft, CaretRight } from 'phosphor-react';
import PdfViewer from '@/app/components/PdfViewer';

export default function Rule() {
  const [showIntro, setShowIntro] = useState(true);

  const [isFirstRender, setIsFirstRender] = useState(true);


  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // useEffect(() => {
  //   const timer = setTimeout(() => setShowIntro(false), 1200);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <>
      {showIntro && (
        <IntroOverlay
          initial={{ clipPath: 'circle(0% at 0% 0%)' }}
          animate={{ clipPath: 'circle(150% at 0% 0%)' }}
          transition={{
            duration: 1.1,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      )}

      <Wrapper>
        <SlideViewport>
          <MotionBox
            key={pageIndex}
            initial={{ x: `${direction * 100}%`, opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: `${direction * -100}%`, opacity: 0 }}
            transition={{
              delay: isFirstRender ? 1.1 : 0,   // ⭐ 여기
              duration: 0.45,
              ease: [0.4, 0, 0.2, 1],
            }}
            onAnimationComplete={() => {
              if (isFirstRender) setIsFirstRender(false);
            }}
          >

          <Title>
            {pageIndex === 1 && (
              <NavLeftButton onClick={() => {
              setDirection(-1);
              setPageIndex(0);
            }}>
              <CaretLeft weight="bold"/>
            </NavLeftButton>)}
              <h1>{pageIndex === 0 ? '마작 규칙 안내' : '대회 운영 규정'}</h1>

            <span>
  {pageIndex === 0
    ? '마작의 기본 규칙과 진행 방식을 정리한 공식 가이드입니다.'
    : '대회 진행을 위한 운영 기준과 참가 규정을 안내합니다.'}
</span>
            {pageIndex === 0 && (
              <NavRightButton onClick={() => {
                setDirection(1);
                setPageIndex(1);
              }}>
                <CaretRight weight="bold"/>
                </NavRightButton>
            )}
            </Title>
            <PdfContainer>
              <PdfViewer
                url={
                  pageIndex === 0
                    ? withBasePath('/testPdf.pdf')
                    : withBasePath('/testPdf2.pdf')
                }
              />
            </PdfContainer>
          </MotionBox>
        </SlideViewport>
      </Wrapper>
    </>
  );
}
const IntroOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 1;
  pointer-events: none;
`;

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: auto;
  flex-direction: column;
    z-index: 2;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Title = styled.div`
  display: flex;
    position: relative;
  flex-direction: column;
  width: 90%;
  max-width: 800px;
  align-self: center;
  text-align: center;
  gap: 8px;
  margin-bottom: 24px;

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
      color: ${({ theme }) => theme.colors.whiteColor};
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.grayColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.desktop.sizes.md};
    }
  }
`;

const SlideViewport = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const MotionBox = styled(motion.div)`
    display: flex;
    flex-direction: column;
    align-items: center;
`

const PdfContainer = styled.div`
  width: 90vw;
`;


const NavRightButton = styled.button`
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
  border: none;
    padding: 6px;
    border-radius: 999px;
  cursor: pointer;

  svg {
      width: 24px;
      height: 24px;
      color: white;
  }
`;

const NavLeftButton = styled.button`
    position: absolute;
    left: 8px;
    display: flex;
    align-items: center;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
  border: none;
    padding: 6px;
    border-radius: 999px;
  cursor: pointer;

  svg {
      width: 24px;
      height: 24px;
      color: white;
  }
`;