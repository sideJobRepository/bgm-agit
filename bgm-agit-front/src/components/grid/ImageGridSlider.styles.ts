import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { theme } from '../../styles/theme.ts';

const c = theme.colors;

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const Slider = styled.div<{
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

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Slide = styled.div.withConfig({
  shouldForwardProp: prop => !['ratio', 'radius', '$visibleCount'].includes(prop),
})<WithTheme & { $visibleCount: number; radius: boolean; ratio: boolean }>`
  width: calc(
    (100% - ${props => (props.$visibleCount - 1) * 20}px) / ${props => props.$visibleCount}
  );
  height: 100%;
  aspect-ratio: ${({ ratio }) => (ratio ? '16 / 9' : '1 / 1')};
  box-sizing: border-box;
  position: relative;
  color: ${c.onPrimary};
  font-size: 14px;

  /* 이미지 위 라벨 — 어두운 반투명 알약 */
  div {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: ${c.textStrong}B3;
    border-radius: ${theme.radius.pill};
    padding: 6px 12px;
    top: 10px;
    left: 10px;
    max-width: calc(100% - 20px);
    line-height: 1.3;
    pointer-events: none;

    p {
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @media ${theme.device.mobile} {
        font-size: 12px;
      }
    }

    svg {
      flex-shrink: 0;
      margin: 0 4px 0 8px;

      @media ${theme.device.mobile} {
        font-size: 12px;
      }
    }

    span {
      font-size: 13px;
      white-space: nowrap;

      @media ${theme.device.mobile} {
        font-size: 11px;
      }
    }
  }

  img {
    width: 100%;
    height: 100%;
    background-color: ${c.surfaceAlt};
    object-fit: cover;
    border-radius: ${({ radius }) => (radius ? theme.radius.pill : theme.radius.md)};
    border: ${({ radius }) => (radius ? `1px solid ${c.border}` : 'none')};
    display: block;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.92;
    }
  }
`;

export const NoSearchBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 160px;
  border: 1px dashed ${c.borderStrong};
  border-radius: ${theme.radius.md};
  background: ${c.surfaceSunken};
  color: ${c.textMuted};
  font-size: 16px;
  font-weight: 600;

  @media ${theme.device.mobile} {
    min-height: 120px;
    font-size: 14px;
  }
`;
