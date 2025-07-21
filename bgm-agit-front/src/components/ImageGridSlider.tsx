import styled from 'styled-components';
import { useEffect, useState } from 'react';
import type { WithTheme } from '../styles/styled-props.ts';
import { FaUsers } from 'react-icons/fa';

interface GridItem {
  image: null | string;
  label: string;
  group: null | number;
}

interface Props {
  items: GridItem[];
  labelGb: number;
  visibleCount: number;
  interval?: number;
}

export default function ImageGridSlider({ items, visibleCount, labelGb, interval = 5000 }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1 > items.length - visibleCount ? 0 : prev + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [items.length, visibleCount, interval]);

  return (
    <Wrapper>
      <Slider $visibleCount={visibleCount} $itemCount={items.length} $index={index}>
        {items.map((item, idx) => (
          <Slide key={idx} $visibleCount={visibleCount}>
            {labelGb !== 1 && (
              <div>
                <p>{item.label}</p>
                {labelGb === 3 && (
                  <>
                    <FaUsers /> <span> {item.group}</span>
                  </>
                )}
              </div>
            )}
            <img src={item.image} alt={`img-${idx}`} />
          </Slide>
        ))}
      </Slider>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const Slider = styled.div<{
  $visibleCount: number;
  $itemCount: number;
  $index: number;
}>`
  display: flex;
  height: 100%;
  width: ${({ $itemCount, $visibleCount }) => `${($itemCount * 100) / $visibleCount}%`};
  transform: ${({ $index, $itemCount }) => `translateX(-${($index * 100) / $itemCount}%)`};
  transition: transform 0.6s ease-in-out;
  gap: 20px;
`;

const Slide = styled.div<WithTheme & { $visibleCount: number }>`
  width: ${({ $visibleCount }) => `${100 / $visibleCount}%`};
  aspect-ratio: 1 / 1;
  box-sizing: border-box;
  position: relative;
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.medium};

  div {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(66, 69, 72, 0.6);
    border-radius: 8px;
    padding: 6px 12px 4px 12px;
    top: 6px;
    left: 6px;

    svg {
      margin: 0 4px 2px 8px;
    }

    span {
      font-size: ${({ theme }) => theme.sizes.small};
    }
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    display: block;
    cursor: pointer;

    &:hover {
      opacity: 0.6;
    }
  }
`;
