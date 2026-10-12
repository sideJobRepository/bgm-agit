//pagindation
import { ReactComponent as PrevIcon } from '../assets/prev.svg?react';
import { ReactComponent as NextIcon } from '../assets/next.svg?react';
import { useMediaQuery } from 'react-responsive';
import { Nav, PageNumberBox, PageButton, Ellipsis } from './Pagination.styles.ts';
import { theme } from '../styles/theme.ts';

type Props = {
  current: number;
  totalPages: number;
  onChange: (next: number) => void;
};

// 모바일: 처음·끝 + 현재 ±1 만(1 … 2 3 4 … 21). 다 보여주면 한 줄에 안 들어가 번호가 줄바꿈되고
// 이전·다음 화살표가 위아래로 갈라졌다
function mobilePages(current: number, totalPages: number): (number | string)[] {
  const last = totalPages - 1;
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
  if (current <= 2) return [0, 1, 2, 3, '···', last];
  if (current >= last - 2) return [0, '···', last - 3, last - 2, last - 1, last];
  return [0, '···', current - 1, current, current + 1, '···', last];
}

export default function Pagination({ current, totalPages, onChange }: Props) {
  const isMobile = useMediaQuery({ query: theme.device.mobile });
  if (!totalPages || totalPages < 1) return null;

  const windowSize = 6;

  const pages = (): (number | string)[] => {
    if (!totalPages || totalPages <= 0) return [];
    if (isMobile) return mobilePages(current, totalPages);
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
      <PrevIcon
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

      <NextIcon
        type="button"
        aria-label="next page"
        className={current === totalPages - 1 ? 'active' : ''}
        onClick={() => current < totalPages - 1 && onChange(current + 1)}
      />
    </Nav>
  );
}
