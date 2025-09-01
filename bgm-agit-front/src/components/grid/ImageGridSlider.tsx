import styled from 'styled-components';
import { useEffect, useState } from 'react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { FaUsers } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';
import ImageLightbox from '../ImageLightbox.tsx';
import { useNavigate } from 'react-router-dom';

interface GridItem {
  image: string;
  imageId: number;
  labelGb: number;
  label: string;
  group: null | string;
  link: null | string;
}

interface Props {
  items: GridItem[];
  labelGb: number;
  visibleCount: number;
  interval?: number;
}

export default function ImageGridSlider({ items, visibleCount, labelGb, interval = 7000 }: Props) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  //이미지 전체
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const handleImageClick = (clickedIndex: number) => {
    setLightboxIndex(clickedIndex);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setIndex(prev => (prev + 1 > items?.length - visibleCount ? 0 : prev + 1));
    },
    onSwipedRight: () => {
      setIndex(prev => (prev === 0 ? items?.length - visibleCount : prev - 1));
    },
    trackMouse: true,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1 > items?.length - visibleCount ? 0 : prev + 1));
    }, interval);
    return () => clearInterval(timer);
  }, [items?.length, visibleCount, interval]);

  return (
    <Wrapper {...swipeHandlers}>
      {items && (
        <>
          <Slider $visibleCount={visibleCount} $itemCount={items.length} $index={index}>
            {items.map((item, idx) => (
              <Slide
                key={idx}
                $visibleCount={visibleCount}
                ratio={labelGb === 3 || labelGb === 1}
                radius={labelGb === 4}
              >
                {labelGb !== 1 && labelGb !== 4 && (
                  <div>
                    <p>{item.label}</p>
                    {labelGb === 3 && (
                      <>
                        <FaUsers /> <span> {item.group}</span>
                      </>
                    )}
                  </div>
                )}
                <img
                  src={item.image}
                  alt={`img-${idx}`}
                  draggable={false}
                  onClick={() => {
                    if (item.link !== null && item.link !== 'kakao') {
                      navigate(item.link);
                    } else if (item.link === 'kakao') {
                      //카카오 링크 이동 마작 강의
                      window.open('https://open.kakao.com/o/snQNUPre', '_blank');
                    } else {
                      handleImageClick(idx);
                    }
                  }}
                />
              </Slide>
            ))}
          </Slider>
          <ImageLightbox
            images={items.map(item => item.image)}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(-1)}
            onIndexChange={setLightboxIndex}
          />
        </>
      )}
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
  justify-content: flex-start;
  height: 100%;
  gap: 20px;
  transition: transform 0.6s ease-in-out;

  width: ${({ $itemCount, $visibleCount }) =>
    `calc((100% - ${($visibleCount - 1) * 20}px) * ${$itemCount / $visibleCount} + ${($itemCount - 1) * 20}px)`};

  transform: ${({ $index, $itemCount }) =>
    `translateX(calc(-${$index} * (100% + 20px) / ${$itemCount}))`};
`;

const Slide = styled.div.withConfig({
  shouldForwardProp: prop => !['ratio', 'radius', '$visibleCount'].includes(prop),
})<WithTheme & { $visibleCount: number; radius: boolean; ratio: boolean }>`
  width: calc(
    (100% - ${props => (props.$visibleCount - 1) * 20}px) / ${props => props.$visibleCount}
  );
  height: 100%;
  aspect-ratio: ${({ ratio }) => (ratio ? '16 / 9' : '1 / 1')};
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

    p {
      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }

    svg {
      margin: 0 4px 0 8px;

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.xsmall};
      }
    }

    span {
      font-size: ${({ theme }) => theme.sizes.small};

      @media ${({ theme }) => theme.device.mobile} {
        font-size: ${({ theme }) => theme.sizes.xxsmall};
      }
    }
  }

  img {
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.white};
    object-fit: cover;
    border-radius: ${({ radius }) => (radius ? '999px' : '12px')};
    display: block;
    cursor: pointer;
  }
`;
