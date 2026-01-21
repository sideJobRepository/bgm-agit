'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { withBasePath } from '@/lib/path';
import { CaretLeft, CaretRight } from 'phosphor-react';
import PdfViewer from '@/app/components/PdfViewer';
import { useFetchRule } from '@/services/rule.service';
import { useRuleStore } from '@/store/rule';

export default function Rule() {
  const [showIntro, setShowIntro] = useState(true);

  const [isFirstRender, setIsFirstRender] = useState(true);

  const fetchRule = useFetchRule();
  const ruleData = useRuleStore((state) => state.rule);

  console.log("fetchRule", ruleData)

  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const currentStatus = pageIndex === 1 ? 'Y' : 'N';

  const currentRule = ruleData?.find(
    (item) => item.tournamentStatus === currentStatus
  );

  useEffect(() => {
    fetchRule();
  }, []);

  return (
    <>
      {showIntro && (
        <IntroOverlay
          initial={{
            clipPath: 'polygon(0 0, 0 0, 0 0, 0 0)',
          }}
          animate={{
            clipPath: 'polygon(0 0, 120% 0, 120% 120%, 0 120%)',
          }}
          transition={{
            duration: 1.1,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      )}

      <Wrapper>
        <SlideViewport>
          {pageIndex === 1 && (
            <NavLeftButton onClick={() => {
              setDirection(-1);
              setPageIndex(0);
            }}>
              <CaretLeft weight="bold"/>
              마작 규칙 안내 보기
            </NavLeftButton>)}
          {pageIndex === 0 && (
            <NavRightButton onClick={() => {
              setDirection(1);
              setPageIndex(1);
            }}>
              대회 운영 규정 보기
              <CaretRight weight="bold"/>
            </NavRightButton>
          )}
          <MotionBox
            key={pageIndex}
            initial={{ x: `${direction * 100}%`, opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: `${direction * -100}%`, opacity: 0 }}
            transition={{
              delay: isFirstRender ? 1.1 : 0,
              duration: 0.45,
              ease: [0.4, 0, 0.2, 1],
            }}
            onAnimationComplete={() => {
              if (isFirstRender) setIsFirstRender(false);
            }}
          >
          <Title>
              <h1>{pageIndex === 0 ? '마작 규칙 안내' : '대회 운영 규정'}</h1>

            <span>
              {pageIndex === 0
                ? '마작의 기본 규칙과 진행 방식을 정리한 공식 가이드입니다.'
                : '대회 진행을 위한 운영 기준과 참가 규정을 안내합니다.'}
            </span>
            </Title>
            <PdfContainer>
                <PdfViewer
                  pageIndex={pageIndex}
                  fileUrl={currentRule?.file?.fileUrl}
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
    height: calc(100vh - 76px);
  margin: 0 auto;
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
  flex-direction: column;
  width: 90%;
  align-self: center;
  text-align: center;
  gap: 8px;
    padding: 24px 0;

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
    color: ${({ theme }) => theme.colors.lineColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.desktop.sizes.md};
    }
  }
`;

const SlideViewport = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
  position: relative;
  width: 100%;
    padding-top: 12px;
`;

const MotionBox = styled(motion.div)`
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
`

const PdfContainer = styled.div`
  width: 90%;
    display: flex;
    padding: 24px 0;
    flex: 1;
`;


const NavRightButton = styled.button`
    display: flex;
    width: 160px;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-bottom: 12px;
    margin-left: auto;
    border: none;
    padding: 6px 0;
    border-radius: 4px;
    cursor: pointer;
    background-color: transparent;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    color: ${({ theme }) => theme.colors.lineColor};;

  svg {
      width: 12px;
      height: 12px;
  }
`;

const NavLeftButton = styled.button`
    display: flex;
    width: 160px;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-bottom: 12px;
    margin-right: auto;
    border: none;
    padding: 6px 0;
    border-radius: 4px;
    cursor: pointer;
    background-color: transparent;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    color: ${({ theme }) => theme.colors.lineColor};;

  svg {
      width: 12px;
      height: 12px;
  }
`;