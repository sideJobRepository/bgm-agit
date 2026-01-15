"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";

const INITIAL_CARDS = [
  { id: 1, title: "CARD 1", color: "#F6F7F9" },
  { id: 2, title: "CARD 2", color: "#EEF3FF" },
  { id: 3, title: "CARD 3", color: "#FDF2F2" },
];

export default function Home() {
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [dir, setDir] = useState(1); // 1 = next, -1 = prev

  const next = () => {
    setDir(1);
    setCards(([a, b, c]) => [b, c, a]);
  };

  const prev = () => {
    setDir(-1);
    setCards(([a, b, c]) => [c, a, b]);
  };

  return (
    <Wrapper>
      <Title>
        <h1>Welcome to BGM KML</h1>
        <h5>BGM 아지트의 보드게임 기록을 위한 전용 공간입니다.</h5>
      </Title>
      <Slider>
        {cards.map((card, i) => (
          <Card
            key={card.id}
            custom={{ i, dir }}
            variants={variants}
            initial={false}
            animate="animate"
            transition={{
              duration: 0.45,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{ background: card.color }}
          >
            {card.title}
          </Card>
        ))}

        <NavLeft onClick={prev} />
        <NavRight onClick={next} />
      </Slider>
    </Wrapper>
  );
}

/* ================= styles ================= */

export const Wrapper = styled.div`
    display: flex;
    max-width: 1500px;
    min-width: 1280px;
    min-height: 600px;
    height: 100%;
    margin: auto;
    flex-direction: column;
    gap: 24px;
    
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
    background-color: blue;

    h1 {
        font-size: ${({ theme }) => theme.desktop.sizes.h1Size};
        font-weight: 800;
    }
    
    h3 {
        font-size: ${({ theme }) => theme.desktop.sizes.h3Size};
        font-weight: 600;
    }
    
`

const Slider = styled.div`
    width: 90%;
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

    width: 70%;
    max-width: 860px;
    height: 100%;

    border-radius: 24px;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 32px;
    font-weight: 700;
`;

const NavLeft = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    width: 15%;
    height: 100%;
    cursor: pointer;
    z-index: 10;
`;

const NavRight = styled.div`
    position: absolute;
    right: 0;
    top: 0;
    width: 15%;
    height: 100%;
    cursor: pointer;
    z-index: 10;
`;

/* ================= animation ================= */

const variants = {
  initial: ({ dir }: { dir: number }) => ({
    // 들어올 때 살짝 위에서 내려오게 (원하면 -20~-40 조절)
    y: -24,
    opacity: 0,
    scale: 0.96,
  }),

  animate: ({ i }: { i: number }) => {
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
        x: "-20%",
        y: 0,
        scale: 0.92,
        opacity: 0.65,
        zIndex: 2,
      };
    }

    // right
    return {
      x: "20%",
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
};

