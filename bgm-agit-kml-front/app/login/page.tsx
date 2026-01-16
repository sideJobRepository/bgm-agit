'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';
import Link from 'next/link';
import { ArrowRight } from 'phosphor-react';
import { useMediaQuery } from 'react-responsive';
import modalLogo from '*.ico';
import kakao from '*.png';
import naver from '*.png';

export default function Home() {

  const [mounted, setMounted] = useState(false);



  const isMobile = useMediaQuery({ maxWidth: 844 });


  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  return (

    <Wrapper>
      <Title    initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}>
        <h1>Sign In to Continue</h1>
        <span>
          기록은 시작의 첫 걸음입니다.
        </span>
        <a></a>
      </Title>
      <LoginBox  initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 1.4, duration: 1.2, ease: 'easeOut' }}>
        <Top>
          <img src={withBasePath('/kmlMain.png')} alt="로고" />
        </Top>
        <Bottom>
          <Button $bgColor="#f3d911" $color="#2f250c">
            <img src={withBasePath('/kakao.png')} alt="카카오 로그인 로고" />
            카카오로 계속하기
          </Button>
          <Button $bgColor="#03a74d" $color="#ffffff">
            <img src={withBasePath('/naver.png')} alt="네이버 로그인 로고" />
            네이버로 계속하기
          </Button>
        </Bottom>
      </LoginBox>
    </Wrapper>
  );
}


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

const Title = styled(motion.div)`
  display: flex;
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

const LoginBox = styled(motion.div)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 80%;
    height: 420px;
    gap: 36px;
    max-width: 600px;
    padding: 24px 0;
    margin: auto;
    border: 8px solid #f3f3f3;
    background-color: #f3f3f3;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24)

`;

const Top = styled.section`
    display: flex;
    width: 100%;
    height: 70%;
    margin: 0;
    align-items: flex-start;
    justify-content: center;
    overflow: hidden;

    img {
        width: auto;
        height: 100%;
        object-fit: cover;
        object-position: top;
        display: block;
    }
`;
const Bottom = styled.section`
  width: 100%;
    height: 30%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Button = styled.button<{$color : string, $bgColor: string}>`
    display: flex;
    align-items: center;
    max-width: 310px;
    height: 52px;
    justify-content: center;
    width: 100%;
    gap: 16px;
    border: none;
    
    background-color: ${({ $bgColor }) => ($bgColor)};
    color: ${({ $color }) => ($color)};
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 500;
    cursor: pointer;

    img {
        width: 22px;
        height: 22px;
    }
`
