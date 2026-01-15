'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';
import Link from 'next/link';
import { ArrowRight } from 'phosphor-react';
import { useMediaQuery } from 'react-responsive';

const INITIAL_CARDS = [
  { id: 1, title: 'RED', color: '#D9625E' },
  {
    id: 2,
    title: '시작은 BGM 아지트부터',
    content:
      'BGM 아지트는 보드게임을 사랑하는 가지각색의 사람들이 모여, 따뜻한 즐거움을 제공하는 아늑한 공간입니다.\n' +
      '잠깐의 시간으로 끝나지 않고 여러분의 일상이 될 수 있는, 최고의 친구들과 취미를 만들어보세요.',
    color: '#4A90E2',
  },
  { id: 3, title: 'YELLOW', color: '#EAC764' },
  { id: 4, title: 'GREEN', color: '#6DAE81' },
  { id: 5, title: 'ORANGE', color: '#E38B29' },
  { id: 6, title: 'NAVY', color: '#415B9C' },
  { id: 7, title: 'PURPLE', color: '#8E6FB5' },
];

export default function Home() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [dir, setDir] = useState(1); // 1 = next, -1 = prev

  const isMobile = useMediaQuery({ maxWidth: 844 });

  const next = () => {
    setDir(1);
    setCards(prev => {
      const [first, ...rest] = prev;
      return [...rest, first]; // 앞에서 빼서 뒤로
    });
  };

  const prev = () => {
    setDir(-1);
    setCards(prev => {
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest]; // 뒤에서 빼서 앞으로
    });
  };
  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/bgmMain.jpeg')} alt="" />
        </HeroBg>

        <HeroOverlay />

        <HeroContent>
          <h1>Welcome to BGM KML</h1>
          <span>
            BGM 아지트의 보드게임 기록을 위한 전용 공간입니다.
            <br />
            여러분의 보드게임 이야기가 이곳에 쌓여갑니다.
          </span>
        </HeroContent>
      </Hero>
      <Slider>
        {cards.slice(0, 3).map((card, i) => (
          <Card
            key={card.id}
            custom={{ i, dir }}
            variants={variants(isMobile)}
            initial={false}
            animate="animate"
            transition={{
              duration: 0.45,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ background: card.color }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              const swipe = info.offset.x;

              if (swipe < -80) next();
              else if (swipe > 80) prev();
            }}
          >
            <ContentSection>
              <h4>{card.title}</h4>
              <span>{card?.content}</span>
              <Link href="/">
                Read more
                <ArrowRight weight="bold" />
              </Link>
            </ContentSection>
            <ImageSection>
              <img src={withBasePath('/2.png')} alt="로고" />
            </ImageSection>
          </Card>
        ))}

        <NavLeft onClick={prev} />
        <NavRight onClick={next} />
      </Slider>
    </Wrapper>
  );
}

/* ================= styles ================= */

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

const Hero = styled.section`
  position: relative;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
  height: 160px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 120px;
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

const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
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

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.h1Size};
    font-weight: 800;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h1Size};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.desktop.sizes.md};
    }
  }
`;

const Slider = styled.div`
  width: 96%;
  max-width: 800px;
  height: 420px;
  margin: auto;
  position: relative;
  overflow: hidden;
`;

const Card = styled(motion.div)`
  position: absolute;
  inset: 0;
  margin: auto;

  width: 76%;
  max-width: 460px;
  height: 100%;

  border-radius: 24px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  font-size: 32px;
  font-weight: 700;
`;

const NavLeft = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 10%;
  height: 100%;
  cursor: pointer;
  z-index: 10;
`;

const NavRight = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 10%;
  height: 100%;
  cursor: pointer;
  z-index: 10;
`;

const ImageSection = styled.section`
  display: flex;
  width: 100%;
  height: 50%;
  padding: 0;
  margin: 0;
  align-items: flex-start;
  justify-content: end;
  overflow: hidden;

  img {
    width: auto;
    height: 150%;
    object-fit: cover;
    object-position: top;
    display: block;
  }
`;
const ContentSection = styled.section`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 50%;
  padding: 28px 16px 16px 16px;
  color: ${({ theme }) => theme.colors.whiteColor};

  h4 {
    font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    font-weight: 800;
    word-break: keep-all;
    white-space: normal;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    }
  }

  span {
    margin: auto;
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 600;
    word-break: keep-all;
    white-space: normal;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.desktop.sizes.md};
    }
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    line-height: 1;
    color: ${({ theme }) => theme.colors.border};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.desktop.sizes.xl};
    }

    svg {
      width: 14px;
      height: 14px;
      vertical-align: middle;
      position: relative;
      top: 0.5px;
    }
  }
`;

/* ================= animation ================= */

const variants = (isMobile: boolean) => ({
  initial: ({ dir }: { dir: number }) => ({
    // 들어올 때 살짝 위에서 내려오게 (원하면 -20~-40 조절)
    y: -24,
    opacity: 0,
    scale: 0.96,
  }),

  animate: ({ i }: { i: number }) => {
    const sideX = isMobile ? '20%' : '40%';
    // center
    if (i === 1) {
      return {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        zIndex: 3,
      };
    }

    // left
    if (i === 0) {
      return {
        x: `-${sideX}`,
        y: 0,
        scale: 0.92,
        opacity: 0.65,
        zIndex: 2,
      };
    }

    // right
    return {
      x: sideX,
      y: 0,
      scale: 0.92,
      opacity: 0.65,
      zIndex: 2,
    };
  },

  exit: ({ dir }: { dir: number }) => ({
    // 나갈 때도 살짝 위로/작게/희미하게
    y: -24,
    opacity: 0,
    scale: 0.96,
  }),
});
