'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Rule() {
  const [showIntro, setShowIntro] = useState(true);

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
        {/* 실제 컨텐츠 */}
      </Wrapper>
    </>
  );
}
const IntroOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
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
  gap: 36px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;
