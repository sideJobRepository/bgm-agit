"use client";

import { useState } from "react";
import styled from "styled-components";

/**
 * 카드 데이터 (색 + 내용이 함께 움직임)
 */
const INITIAL_CARDS = [
  { id: 1, title: "CARD 1", color: "#F6F7F9" }, // 회색
  { id: 2, title: "CARD 2", color: "#EEF3FF" }, // 파랑
  { id: 3, title: "CARD 3", color: "#FDF2F2" }, // 빨강
];

export default function Home() {
  const [cards, setCards] = useState(INITIAL_CARDS);

  /** ▶ 우측 클릭 → 왼쪽으로 밀림 */
  const next = () => {
    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  /** ◀ 좌측 클릭 → 오른쪽으로 밀림 */
  const prev = () => {
    setCards((prev) => {
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, -1)];
    });
  };

  return (
    <Wrapper>

      <Slider>
        {cards.map((card, index) => (
          <Card
            key={card.id}
            $pos={index === 0 ? "left" : index === 1 ? "center" : "right"}
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

/* ================== styles ================== */

const Wrapper = styled.div`
    max-width: 1500px;
    min-width: 1280px;
    min-height: 600px;
    height: 100%;
    margin: 0 auto;
    @media ${({ theme }) => theme.device.mobile} {
        max-width: 100%;
        min-width: 100%;
        min-height: unset;
    }
`;

const Slider = styled.div`
    position: relative;
    width: 720px;
    height: 420px;
`;

const Card = styled.div<{ $pos: "left" | "center" | "right" }>`
    position: absolute;
    inset: 0;
    border-radius: 20px;
    transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 32px;
    font-weight: 700;

    ${({ $pos }) =>
            $pos === "center" &&
            `
      transform: translateX(0) scale(1);
      z-index: 3;
      box-shadow: 0 30px 60px rgba(0,0,0,0.15);
      opacity: 1;
    `}

    ${({ $pos }) =>
            $pos === "left" &&
            `
      transform: translateX(-120px) scale(0.92);
      z-index: 2;
      opacity: 0.7;
    `}

    ${({ $pos }) =>
            $pos === "right" &&
            `
      transform: translateX(120px) scale(0.92);
      z-index: 2;
      opacity: 0.7;
    `}
`;

const NavLeft = styled.div`
    position: absolute;
    left: -80px;
    top: 0;
    width: 80px;
    height: 100%;
    cursor: pointer;
    z-index: 10;
`;

const NavRight = styled.div`
    position: absolute;
    right: -80px;
    top: 0;
    width: 80px;
    height: 100%;
    cursor: pointer;
    z-index: 10;
`;
