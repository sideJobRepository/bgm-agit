import { Lightbox } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Props {
  images: string[];
  index: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export default function ImageLightbox({ images, index, onClose, onIndexChange }: Props) {
  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={images.map(src => ({ src }))}
      on={{
        view: ({ index }) => onIndexChange?.(index),
      }}
      render={{
        buttonPrev: index > 0 ? undefined : () => null,
        buttonNext: index < images.length - 1 ? undefined : () => null,
        slide: ({ slide }) => (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
            onTouchStart={e => e.stopPropagation()}
            onTouchMove={e => e.stopPropagation()}
            onTouchEnd={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onPointerMove={e => e.stopPropagation()}
            onPointerUp={e => e.stopPropagation()}
            draggable={false}
          >
            <img
              src={slide.src}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          </div>
        ),
      }}
    />
  );
}
