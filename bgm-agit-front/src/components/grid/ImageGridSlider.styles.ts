import styled from 'styled-components';
import type { WithTheme } from '../../styles/styled-props.ts';
import { theme } from '../../styles/theme.ts';

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

export const NoSearchBox = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: ${({ theme }) => theme.sizes.menu};
  font-weight: ${({ theme }) => theme.weight.semiBold};
  font-family: ${theme.fonts.display};
  color: ${({ theme }) => theme.colors.menuColor};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;
