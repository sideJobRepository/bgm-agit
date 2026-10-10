import { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { useSwipeable } from 'react-swipeable';
import ImageLightbox from '../ImageLightbox.tsx';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Slider, Slide, NoSearchBox } from './ImageGridSlider.styles.ts';

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
      {items ? (
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
      ) : (
        <NoSearchBox>사진을 준비중입니다.</NoSearchBox>
      )}
    </Wrapper>
  );
}
