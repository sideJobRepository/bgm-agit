//pagindation
import styled from 'styled-components';
import { CaretLeft, CaretRight } from 'phosphor-react';
import type { WithTheme } from '../../styles/styled-props.ts';

type Props = {
  current: number;
  totalPages: number;
  onChange: (next: number) => void;
};

export default function Pagination({ current, totalPages, onChange }: Props) {
  if (!totalPages || totalPages < 1) return null;

  const windowSize = 6;

  const pages = (): (number | string)[] => {
    if (!totalPages || totalPages <= 0) return [];
    // 0~(totalPages-1) 기반
    const last = totalPages - 1;

    // 전체가 7 이하면 다 보여줌
    if (totalPages <= windowSize + 1) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }

    // current가 앞쪽(0~5) 근처면 처음 6개
    if (current <= windowSize - 1) {
      return [...Array.from({ length: windowSize }, (_, i) => i), '···', last];
    }

    // current가 뒤쪽(last-5 ~ last) 근처면 1 + … + 끝 6개
    if (current >= last - (windowSize - 1)) {
      const start = last - (windowSize - 1);
      return [0, '···', ...Array.from({ length: windowSize }, (_, i) => start + i)];
    }

    // 가운데 구간: 1 + … + (current-2..current+2) + … + last
    const left = Math.max(0, current - 2);
    const right = Math.min(last, current + 2);

    return (
      [0, '···', left, left + 1, current, right - 1, right, '···', last]
        // 중복/역전 방지를 위한 필터 (혹시나 겹쳤을 때)
        .filter((v, i, arr) => typeof v === 'string' || arr.indexOf(v) === i)
        .filter(v => typeof v === 'string' || (v >= 0 && v <= last))
    );
  };

  return (
    <Nav aria-label="pagination">
      <CaretLeft
        type="button"
        className={current === 0 ? 'active' : ''}
        aria-label="previous page"
        onClick={() => current > 0 && onChange(current - 1)}
      />

      <PageNumberBox>
        {pages().map((p, i) =>
          typeof p === 'number' ? (
            <PageButton
              key={i}
              type="button"
              aria-current={p === current ? 'page' : undefined}
              className={p === current ? 'active' : ''}
              onClick={() => onChange(p)}
            >
              {p + 1}
            </PageButton>
          ) : (
            <Ellipsis key={i}>···</Ellipsis>
          )
        )}
      </PageNumberBox>

      <CaretRight
        type="button"
        aria-label="next page"
        className={current === totalPages - 1 ? 'active' : ''}
        onClick={() => current < totalPages - 1 && onChange(current + 1)}
      />
    </Nav>
  );
}

const Nav = styled.nav<WithTheme>`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;

  svg {
    width: 12px;
    height: 12px;
    color: ${({ theme }) => theme.colors.subColor};
    cursor: pointer;

    &.active {
      color: ${({ theme }) => theme.colors.white};
    }
  }
`;

const PageNumberBox = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button<WithTheme>`
  background-color: ${({ theme }) => theme.colors.white};
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.subColor};
  padding: 4px 8px;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};

  &.active {
    background-color: ${({ theme }) => theme.colors.blackColor};
    color: ${({ theme }) => theme.colors.white};
    border-radius: 4px;
  }

  &:hover:not(.active) {
    opacity: 0.8;
  }
`;

const Ellipsis = styled.span<WithTheme>`
  color: ${({ theme }) => theme.colors.subColor};
  user-select: none;
`;
