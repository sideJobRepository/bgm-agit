'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';
import Link from 'next/link';
import { ArrowRight, HandPointing } from 'phosphor-react';
import { useMediaQuery } from 'react-responsive';
import { useRouter } from 'next/navigation';

const INITIAL_CARDS = [
  {
    id: 1,
    title: 'Tournament Play',
    content:
      '대회에서의 한 판 한 판은 단순한 결과가 아닌, 경쟁과 전략이 쌓인 기록입니다.\n' +
      '경기 결과를 입력하고 공식 데이터를 남겨, 나의 플레이 흐름과 성과를 체계적으로 관리해보세요.',
    push: '/write?tournamentStatus=Y',
    color: '#D9625E',
    img: '/1.png',
  },
  {
    id: 2,
    title: '시작은 BGM 아지트부터',
    content:
      'BGM 아지트는 보드게임을 사랑하는 가지각색의 사람들이 모여, 따뜻한 즐거움을 제공하는 아늑한 공간입니다.\n' +
      '잠깐의 시간으로 끝나지 않고 여러분의 일상이 될 수 있는, 최고의 친구들과 취미를 만들어보세요.',
    color: '#4A90E2',
    link: process.env.NEXT_PUBLIC_FRONT_BGM_URL,
    img: '/2.png',
  },
  {
    id: 3,
    title: '기록이 쌓이는 공간',
    content:
      '하루의 기록이 모여 하나의 흐름이 되고, 그 흐름이 당신의 플레이를 완성합니다.\n' +
      '일간과 월간 기록을 통해 나의 변화와 성장을 한눈에 확인하고, 쌓여가는 데이터 속에서 나만의 플레이 패턴을 발견해보세요.\n' +
      '작은 기록 하나가 더 나은 선택과 전략으로 이어지는 순간을 경험할 수 있습니다.',
    push: '/day-record',
    color: '#6DAE81',
    img: '/3.png',
  },
  // { id: 4, title: 'GREEN', color: '#6DAE81' },
  // { id: 5, title: 'ORANGE', color: '#E38B29' },
  // { id: 6, title: 'NAVY', color: '#415B9C' },
  // { id: 7, title: 'PURPLE', color: '#8E6FB5' },
];

export default function Home() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [cards, setCards] = useState(INITIAL_CARDS);
  const [dir, setDir] = useState(1); // 1 = next, -1 = prev

  //힌트
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const isMobile = useMediaQuery({ maxWidth: 844 });

  const next = () => {
    setDir(1);
    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first]; // 앞에서 빼서 뒤로
    });
  };

  const prev = () => {
    setDir(-1);
    setCards((prev) => {
      const last = prev[prev.length - 1];
      const rest = prev.slice(0, prev.length - 1);
      return [last, ...rest]; // 뒤에서 빼서 앞으로
    });
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  return (
    <Wrapper>
      <Title>
        <h1>
          Welcome to
          <img src={withBasePath('/logo.png')} alt="로고" />
        </h1>
        <h5>
          BGM 아지트의 보드게임 기록을 위한 전용 공간입니다.
          <br />
          여러분의 보드게임 이야기가 이곳에 쌓여갑니다.
        </h5>
      </Title>
      <Slider>
        {cards.slice(0, 3).map((card, i) => (
          <Card
            key={card.id}
            custom={{ i, dir }}
            variants={variants(isMobile)}
            initial="initial"
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
              setShowSwipeHint(false);

              const swipe = info.offset.x;

              if (swipe < -40) next();
              else if (swipe > 40) prev();
            }}
          >
            {showSwipeHint && i === 1 && (
              <SwipeHint initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <SwipeFinger
                  animate={{ x: [-28, 28, -28] }}
                  transition={{
                    duration: 1.4,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                >
                  <HandPointing weight="bold" />
                </SwipeFinger>
                <SwipeMessage
                  animate={{ x: [-28, 28, -28] }}
                  transition={{
                    duration: 1.4,
                    ease: 'easeInOut',
                    repeat: Infinity,
                  }}
                >
                  <span>카드를 좌우로 넘겨보세요.</span>
                </SwipeMessage>
              </SwipeHint>
            )}
            <ContentSection>
              <h4>{card.title}</h4>
              <span>{card?.content}</span>
              <a
                href={card?.link || '#'}
                target={card?.link ? '_blank' : undefined}
                rel={card?.link ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (!card?.link) {
                    e.preventDefault();
                    router.push(card.push!);
                  }
                }}
              >
                Read more
                <ArrowRight weight="bold" />
              </a>
            </ContentSection>
            <ImageSection>
              <img src={withBasePath(`/main/${card?.img}`)} alt="로고" />
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
  padding: 12px 0;

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
  max-width: 800px;
  align-self: center;
  text-align: center;
  gap: 12px;
  margin-bottom: 24px;

  h1 {
    display: flex;
    gap: 4px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;

    img {
      width: 400px;
    }

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
      img {
        width: 240px;
      }
    }
  }

  h5 {
    font-size: ${({ theme }) => theme.desktop.sizes.h5Size};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.grayColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h5Size};
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
  touch-action: pan-y;
`;

const NavLeft = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 20%;
  height: 100%;
  cursor: pointer;
  z-index: 10;

  @media ${({ theme }) => theme.device.mobile} {
    width: 10%;
  }
`;

const NavRight = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 20%;
  height: 100%;
  cursor: pointer;
  z-index: 10;

  @media ${({ theme }) => theme.device.mobile} {
    width: 10%;
  }
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

  h4 {
    font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    font-weight: 800;
    word-break: keep-all;
    white-space: normal;
    color: ${({ theme }) => theme.colors.softColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
    }
  }

  span {
    margin: auto;
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    word-break: keep-all;
    white-space: pre-line;
    color: ${({ theme }) => theme.colors.basicColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
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
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
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
  initial: ({ i }: { i: number }) => {
    if (i === 1) {
      // 가운데 카드는 그대로
      return {
        x: 0,
        opacity: 1,
        scale: 1,
        zIndex: 3,
      };
    }

    return {
      x: 0, // 처음엔 겹치게
      opacity: 0,
      scale: 0.92,
      zIndex: 2,
    };
  },

  animate: ({ i }: { i: number }) => {
    const sideX = isMobile ? '20%' : '40%';

    if (i === 1) {
      return {
        x: 0,
        opacity: 1,
        scale: 1,
        zIndex: 3,
      };
    }

    return {
      x: i === 0 ? `-${sideX}` : sideX, // 양쪽으로 퍼지게
      opacity: 0.65,
      scale: 0.92,
      zIndex: 2,
    };
  },

  exit: ({ dir }: { dir: number }) => ({
    y: -24,
    opacity: 0,
    scale: 0.96,
  }),
});

const SwipeHint = styled(motion.div)`
  position: absolute;
  inset: 0;
  z-index: 6;
  gap: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  pointer-events: none;
`;

const SwipeFinger = styled(motion.div)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;

  svg {
    width: 26px;
    height: 26px;
    color: ${({ theme }) => theme.colors.whiteColor};
  }
`;

const SwipeMessage = styled(motion.div)`
  border-radius: 4px;
  padding: 6px 8px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.whiteColor};
`;
